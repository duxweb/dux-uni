#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { createDuxRouterManifest, createUniGlobalStyle, createUniTabBar, createUniThemeJson, resolveDuxConfig } from '../src/dux/config.ts'
import { parseDuxConfigSync, scanDuxModulesSync, scanDuxOverlayComponentsSync, scanDuxPagesSync } from '../src/dux/scan.ts'

function printHelp() {
  console.log(`dux-uni

Usage:
  dux-uni sync
  dux-uni dev [platform]
  dux-uni build [platform]
  dux-uni about
  dux-uni module new <module-name>

Aliases:
  dux-uni app sync
  dux-uni app dev [platform]
  dux-uni app build [platform]
  dux-uni app about
`)
}

function normalizePagePath(path = '') {
  return path.replace(/^\/+/u, '')
}

function normalizeRouteRef(value = '') {
  if (!value) {
    return ''
  }
  return value.startsWith('pages/') || value.startsWith('/pages/')
    ? `/${normalizePagePath(value)}`
    : value
}

function isModuleIndexPage(page) {
  const path = `/${normalizePagePath(page.path || '')}`
  const moduleName = String(page.module || '')
  return !!moduleName && path === `/pages/${moduleName}/index`
}

function matchesPageRef(page, ref) {
  const normalizedRef = normalizeRouteRef(ref)
  const pagePath = `/${normalizePagePath(page.path || '')}`

  return page.name === normalizedRef
    || pagePath === normalizedRef
    || (page.module === normalizedRef && isModuleIndexPage(page))
}

function inferTabBarMode(rootDir, config) {
  if (config.router?.tabBarMode === 'custom' || config.router?.tabBarMode === 'native') {
    return config.router.tabBarMode
  }
  return 'native'
}

function inferTabBarRenderer(rootDir, config) {
  if (config.router?.tabBarRenderer === 'custom' || config.router?.tabBarRenderer === 'native') {
    return config.router.tabBarRenderer
  }

  const customTabbarFiles = [
    resolve(rootDir, 'src/modules/base/components/AppTabbar.vue'),
    resolve(rootDir, 'src/modules/base/components/AppTabbar.nvue'),
    resolve(rootDir, 'src/modules/base/components/AppTabbar.uvue'),
  ]

  return customTabbarFiles.some(file => existsSync(file)) ? 'custom' : 'native'
}

function createPageWrapperPlaceholder(style = {}) {
  const current = style && typeof style === 'object' && style.componentPlaceholder && typeof style.componentPlaceholder === 'object'
    ? { ...style.componentPlaceholder }
    : {}

  if (!('page-layout' in current)) {
    current['page-layout'] = 'view'
  }
  if (!('page-component' in current)) {
    current['page-component'] = 'view'
  }

  return current
}

function sortPages(config, pages) {
  const tabOrder = new Map()

  config.router.tabBar.forEach((ref, index) => {
    const page = pages.find(item => matchesPageRef(item, ref))
    if (page?.path) {
      tabOrder.set(`/${normalizePagePath(page.path)}`, index)
    }
  })

  const homePage = pages.find(page => matchesPageRef(page, config.router.home))

  return [...pages].sort((a, b) => {
    const aPath = `/${normalizePagePath(a.path || '')}`
    const bPath = `/${normalizePagePath(b.path || '')}`

    if (homePage?.path && aPath === `/${normalizePagePath(homePage.path)}`) return -1
    if (homePage?.path && bPath === `/${normalizePagePath(homePage.path)}`) return 1

    const aTabIndex = tabOrder.get(aPath)
    const bTabIndex = tabOrder.get(bPath)

    if (aTabIndex != null && bTabIndex != null) {
      return aTabIndex - bTabIndex
    }
    if (aTabIndex != null) return -1
    if (bTabIndex != null) return 1

    return String(a.path).localeCompare(String(b.path))
  })
}

function sortModules(modules) {
  return [...modules].sort((a, b) => {
    if (a.name === 'base') return -1
    if (b.name === 'base') return 1
    return a.name.localeCompare(b.name)
  })
}

function createPagesJson(config, routerManifest) {
  const resolvedConfig = resolveDuxConfig(config)
  const tabBar = createUniTabBar(resolvedConfig, routerManifest.pages)
  return {
    ...(resolvedConfig.ui.library === 'wot'
      ? {
          easycom: {
            autoscan: true,
            custom: {
              '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
            },
          },
        }
      : {}),
    globalStyle: createUniGlobalStyle(resolvedConfig),
    pages: routerManifest.pages.map(page => ({
      path: normalizePagePath(page.path),
      style: {
        ...(page.style || {}),
        navigationBarTitleText: page.title || resolvedConfig.app.title,
        navigationStyle: page.navigationStyle || resolvedConfig.ui.navigationStyle,
        componentPlaceholder: createPageWrapperPlaceholder(page.style || {}),
      },
    })),
    ...(tabBar ? { tabBar } : {}),
    ...(resolvedConfig.ui.theme === 'auto' ? { themeLocation: 'theme.json' } : {}),
    subPackages: [],
  }
}

function createRouterPagesModule(routerManifest) {
  return `import type { DuxPageMeta } from '@duxweb/uni'

export const duxPages: DuxPageMeta[] = ${JSON.stringify(routerManifest.pages, null, 2)}
`
}

function createDuxModulesModule(modules) {
  const imports = modules
    .map(module => `import { ${module.exportName} } from '../../modules/${module.name}/index.ts'`)
    .join('\n')
  const names = modules.map(module => module.exportName).join(', ')

  return `${imports}

export const duxModules = [${names}]
`
}

function createSchemaComponentImportName(name) {
  return name
    .replace(/(^\w|-\w)/g, item => item.replace('-', '').toUpperCase())
    .replace(/[^A-Za-z0-9_]/g, '') + 'SchemaComponent'
}

function resolveSchemaComponentEntries(config) {
  const resolvedConfig = resolveDuxConfig(config)
  const entries = []
  const seen = new Set()

  ;(resolvedConfig.ui.schemaComponents || []).forEach((item) => {
    if (!item?.name || seen.has(item.name)) {
      return
    }

    seen.add(item.name)
    entries.push({
      name: item.name,
      slots: [...new Set(item.slots || [])],
    })
  })

  if (!entries.length) {
    return []
  }

  if (resolvedConfig.ui.library !== 'wot') {
    throw new Error('ui.schemaComponents currently only supports the wot ui library')
  }

  entries.forEach(({ name, slots }) => {
    if (!/^wd-[a-z0-9-]+$/u.test(name)) {
      throw new Error(`Unsupported schema component "${name}". ui.schemaComponents currently only supports wd-* component names`)
    }

    slots.forEach((slot) => {
      if (!/^[a-z0-9-]+$/u.test(slot)) {
        throw new Error(`Unsupported slot "${slot}" for schema component "${name}". Only lowercase letters, numbers, and dashes are supported`)
      }
    })
  })

  return entries
}

function renderSchemaComponentProxy(input) {
  const { name, slots = [] } = input
  const componentName = createSchemaComponentImportName(name)
  const slotTemplates = slots.map(slot => `    <template #${slot}>
      <slot name="${slot}" />
    </template>`).join('\n')
  const slotBlock = slotTemplates ? `\n${slotTemplates}` : ''

  return `<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()
const forwardedAttrs = computed(() => Object.fromEntries(
  Object.entries(attrs).filter(([key, value]) => value !== undefined && key !== 'virtualHostStyle' && key !== 'virtualHostClass'),
))
</script>

<script lang="ts">
export default {
  name: '${componentName}Proxy',
  inheritAttrs: false,
}
</script>

<template>
  <${name} v-bind="forwardedAttrs">
    <slot />${slotBlock}
  </${name}>
</template>
`
}

function createSchemaComponentsModule(config) {
  const components = resolveSchemaComponentEntries(config)

  if (!components.length) {
    return `import { defineSchemaComponents } from '@duxweb/uni'

export const generatedSchemaComponents = defineSchemaComponents([])
`
  }

  const imports = components.map(({ name }) => {
    const importName = createSchemaComponentImportName(name)
    return `import ${importName} from './schema-components/${name}.vue'`
  }).join('\n')

  const registrations = components.map(({ name }) => {
    const importName = createSchemaComponentImportName(name)
    return `  {\n    name: '${name}',\n    component: ${importName},\n  },`
  }).join('\n')

  return `import { defineSchemaComponents } from '@duxweb/uni'
${imports}

export const generatedSchemaComponents = defineSchemaComponents([
${registrations}
])
`
}

function createRouterManifestModule() {
  return `import { createDuxRouterManifest, resolveDuxConfig } from '@duxweb/uni'
import { duxPages } from '@/runtime/generated/router-pages'
import duxConfig from '@/dux.config'

const dux = resolveDuxConfig(duxConfig)

export const routerManifest = createDuxRouterManifest(dux, duxPages)
`
}

function createOverlayRegistryModule(components) {
  if (!components.length) {
    return `<script setup lang="ts">
defineProps<{
  name?: string
}>()
</script>

<template>
  <view />
</template>
`
  }

  const imports = components.map(component => `import ${component.importName} from '${component.importPath}'`).join('\n')
  const template = components.map((component, index) => {
    const directive = index === 0 ? 'v-if' : 'v-else-if'
    return `  <${component.importName}
    ${directive}="name === '${component.key}'"
  />`
  }).join('\n')

  return `<script setup lang="ts">
import type { UniOverlayConfirmContext } from '@duxweb/uni'
import { UNI_OVERLAY_CONTEXT_KEY } from '@duxweb/uni'
import { provide } from 'vue'
${imports}

const props = defineProps<{
  name?: string
  context?: UniOverlayConfirmContext
}>()

if (props.context) {
  provide(UNI_OVERLAY_CONTEXT_KEY, props.context)
}
</script>

<template>
${template}
</template>
`
}

function createOverlayKeysModule(components) {
  if (!components.length) {
    return `export const overlayKeys = {} as const

export type OverlayKey = never
`
  }

  const entries = components.map(component => `  ${component.name.charAt(0).toLowerCase()}${component.name.slice(1)}: '${component.key}',`).join('\n')

  return `export const overlayKeys = {
${entries}
} as const

export type OverlayKey = typeof overlayKeys[keyof typeof overlayKeys]
`
}

function createRouterPageModule() {
  return `import type { DuxPageMeta } from '@duxweb/uni'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { routerManifest } from '@/runtime/router/manifest'
import { dux } from '@/dux'

function normalizePath(path = '') {
  if (!path) {
    return ''
  }
  return path.startsWith('/') ? path : \`/\${path}\`
}

async function resolvePageGuardResult(result: unknown) {
  if (typeof result === 'string') {
    await dux.navigator.reLaunch(result)
    return {
      blocked: true,
    }
  }
  if (result && typeof result === 'object' && 'redirectTo' in result) {
    const redirectTo = (result as { redirectTo?: string }).redirectTo
    if (redirectTo) {
      await dux.navigator.reLaunch(redirectTo)
      return {
        blocked: true,
      }
    }
  }
  if (result && typeof result === 'object' && 'component' in result) {
    console.warn('[duxweb/uni] middleware component fallback is no longer supported in page runtime. Falling back to redirect.')

    const redirectTo = dux.config.permission?.redirectTo
      || routerManifest.homePage?.path
      || '/pages/home/index'
    await dux.navigator.reLaunch(redirectTo)
    return {
      blocked: true,
    }
  }
  return {
    blocked: result === false,
  }
}

async function runPageMiddlewares(page: DuxPageMeta) {
  const stack = getCurrentPages()
  const previous = stack[stack.length - 2] as { route?: string } | undefined
  const fromPage = previous?.route
    ? dux.router.getPageByPath(normalizePath(previous.route))
    : undefined

  for (const middleware of dux.middlewares.resolve(page)) {
    const result = await Promise.resolve(middleware.handler({
      app: dux,
      to: page,
      from: fromPage,
      path: page.path,
      fullPath: page.path,
    }))

    const resolved = await resolvePageGuardResult(result)
    if (resolved.blocked) {
      return {
        allowed: false,
      }
    }
  }

  return {
    allowed: true,
  }
}

export function definePage<T extends DuxPageMeta>(meta: T): T {
  return meta
}

export function usePageRuntime(name: string) {
  const ready = ref(false)
  const initialized = ref(false)
  const running = ref(false)

  const apply = async () => {
    if (running.value) {
      return
    }
    running.value = true
    if (!initialized.value) {
      ready.value = false
    }

    try {
      await dux.ready
      const page = routerManifest.pagesByName[name]
      if (!page) {
        ready.value = true
        initialized.value = true
        return
      }

      const result = await runPageMiddlewares(page)
      if (!result.allowed) {
        return
      }

      ready.value = true
      initialized.value = true
    }
    finally {
      running.value = false
    }
  }

  onLoad(() => {
    void apply()
  })

  onShow(() => {
    void apply()
  })

  return {
    ready,
  }
}

/**
 * @deprecated Prefer \`usePageRuntime()\`.
 */
export function useDuxPage(name: string) {
  return usePageRuntime(name)
}
`
}

function renderPageModulePath(page) {
  const segments = normalizePagePath(page.path).split('/')
  if (segments[0] !== 'pages' || segments.length < 3) {
    throw new Error(`Unsupported page path: ${page.path}`)
  }
  const [, moduleName, ...rest] = segments
  return `@/modules/${moduleName}/pages/${rest.join('/')}.vue`
}

function resolveLayoutImport(page, layouts) {
  if (!page.layout) {
    return undefined
  }
  const importPath = layouts[page.layout]
  if (!importPath) {
    throw new Error(`Unknown layout "${page.layout}" for page "${page.name}"`)
  }
  return importPath
}

function renderPageTemplate(page, layouts) {
  const meta = JSON.stringify({
    ...page,
    path: normalizePagePath(page.path),
  }, null, 2)
    .replace(/"([^"\n]+)":/g, '$1:')

  const moduleImport = renderPageModulePath(page)
  const layoutImportPath = resolveLayoutImport(page, layouts)
  const layoutImport = layoutImportPath
    ? `import PageLayout from '${layoutImportPath}'\n`
    : ''
  const pageNode = layoutImportPath
    ? `  <PageLayout v-if="ready">\n    <PageComponent />\n  </PageLayout>`
    : `  <PageComponent v-if="ready" />`

  return `<script setup lang="ts">
import { definePage, usePageRuntime } from '@/runtime/router/page'
${layoutImport}import PageComponent from '${moduleImport}'

definePage(${meta})

const { ready } = usePageRuntime('${page.name}')
</script>

<template>
${pageNode}
</template>
`
}

async function syncProject(rootDir) {
  const srcDir = resolve(rootDir, 'src')
  const runtimeDir = resolve(srcDir, 'runtime')
  const runtimeGeneratedDir = resolve(runtimeDir, 'generated')
  const runtimeGeneratedSchemaDir = resolve(runtimeGeneratedDir, 'schema-components')
  const runtimeRouterDir = resolve(runtimeDir, 'router')
  const pagesDir = resolve(srcDir, 'pages')
  const configPath = resolve(srcDir, 'dux.config.ts')
  if (!existsSync(configPath)) {
    throw new Error(`Missing dux config: ${configPath}`)
  }
  const duxConfig = parseDuxConfigSync(configPath)
  duxConfig.router = {
    ...duxConfig.router,
    tabBarMode: inferTabBarMode(rootDir, duxConfig),
    tabBarRenderer: inferTabBarRenderer(rootDir, duxConfig),
  }

  const modules = sortModules(scanDuxModulesSync({
    cwd: rootDir,
  }))
  const layouts = modules.reduce((output, module) => {
    return {
      ...output,
      ...(module.layouts || {}),
    }
  }, {})
  const pages = scanDuxPagesSync({
    cwd: rootDir,
    patterns: ['src/modules/*/pages/**/*.{vue,nvue,uvue}'],
    extraPages: duxConfig.extraPages,
    modules,
  })
  const overlayComponents = scanDuxOverlayComponentsSync({
    cwd: rootDir,
  })
  const routerManifest = createDuxRouterManifest(duxConfig, sortPages(duxConfig, pages))

  rmSync(runtimeDir, { recursive: true, force: true })
  rmSync(pagesDir, { recursive: true, force: true })
  mkdirSync(runtimeGeneratedDir, { recursive: true })
  mkdirSync(runtimeGeneratedSchemaDir, { recursive: true })
  mkdirSync(runtimeRouterDir, { recursive: true })
  mkdirSync(pagesDir, { recursive: true })

  writeFileSync(
    resolve(srcDir, 'pages.json'),
    `${JSON.stringify(createPagesJson(duxConfig, routerManifest), null, 2)}\n`,
    'utf8',
  )

  const themeJsonPath = resolve(srcDir, 'theme.json')
  if (resolveDuxConfig(duxConfig).ui.theme === 'auto') {
    writeFileSync(
      themeJsonPath,
      `${JSON.stringify(createUniThemeJson(duxConfig), null, 2)}\n`,
      'utf8',
    )
  }
  else {
    rmSync(themeJsonPath, { force: true })
  }

  writeFileSync(
    resolve(runtimeGeneratedDir, 'router-pages.ts'),
    createRouterPagesModule(routerManifest),
    'utf8',
  )

  writeFileSync(
    resolve(runtimeGeneratedDir, 'modules.ts'),
    createDuxModulesModule(modules),
    'utf8',
  )

  writeFileSync(
    resolve(runtimeGeneratedDir, 'schema-components.ts'),
    createSchemaComponentsModule(duxConfig),
    'utf8',
  )

  writeFileSync(
    resolve(runtimeGeneratedDir, 'overlay-registry.vue'),
    createOverlayRegistryModule(overlayComponents),
    'utf8',
  )

  writeFileSync(
    resolve(runtimeGeneratedDir, 'overlay-keys.ts'),
    createOverlayKeysModule(overlayComponents),
    'utf8',
  )

  resolveSchemaComponentEntries(duxConfig).forEach((entry) => {
    writeFileSync(
      resolve(runtimeGeneratedSchemaDir, `${entry.name}.vue`),
      renderSchemaComponentProxy(entry),
      'utf8',
    )
  })

  writeFileSync(
    resolve(runtimeRouterDir, 'manifest.ts'),
    createRouterManifestModule(),
    'utf8',
  )

  writeFileSync(
    resolve(runtimeRouterDir, 'page.ts'),
    createRouterPageModule(),
    'utf8',
  )

  routerManifest.pages.forEach((page) => {
    const pageFile = resolve(srcDir, `${normalizePagePath(page.path)}.vue`)
    mkdirSync(dirname(pageFile), { recursive: true })
    writeFileSync(pageFile, renderPageTemplate(page, layouts), 'utf8')
  })
}

function createDevSyncWatcher(rootDir) {
  const watchTargets = [
    resolve(rootDir, 'src/modules'),
    resolve(rootDir, 'src/dux.config.ts'),
  ].filter(target => existsSync(target))

  let timer
  let poller
  let syncing = false
  let queued = false
  let lastSnapshot = createWatchSnapshot(watchTargets)

  function collectWatchEntries(target, output) {
    if (!existsSync(target)) {
      output.push(`${target}:missing`)
      return
    }

    const stats = statSync(target)

    if (!stats.isDirectory()) {
      output.push(`${target}:${stats.size}:${stats.mtimeMs}`)
      return
    }

    output.push(`${target}:dir:${stats.mtimeMs}`)

    readdirSync(target, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((entry) => {
        const next = resolve(target, entry.name)
        if (entry.isDirectory()) {
          collectWatchEntries(next, output)
          return
        }

        output.push(`${next}:${statSync(next).size}:${statSync(next).mtimeMs}`)
      })
  }

  function createWatchSnapshot(targets) {
    const output = []
    targets.forEach(target => collectWatchEntries(target, output))
    return output.join('\n')
  }

  const runSync = async () => {
    if (syncing) {
      queued = true
      return
    }

    syncing = true

    try {
      await syncProject(rootDir)
      console.log('[dux-uni] synced routes/modules')
    }
    catch (error) {
      console.error('[dux-uni] sync failed')
      console.error(error)
    }
    finally {
      syncing = false
      if (queued) {
        queued = false
        void runSync()
      }
    }
  }

  const scheduleSync = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      void runSync()
    }, 120)
  }

  poller = setInterval(() => {
    const nextSnapshot = createWatchSnapshot(watchTargets)
    if (nextSnapshot === lastSnapshot) {
      return
    }

    lastSnapshot = nextSnapshot
    scheduleSync()
  }, 500)

  const close = () => {
    clearInterval(poller)
    clearTimeout(timer)
  }

  process.once('exit', close)
  process.once('SIGINT', () => {
    close()
    process.exit(130)
  })
  process.once('SIGTERM', () => {
    close()
    process.exit(143)
  })

  return {
    close,
  }
}

function resolveMiniProgramProjectConfigPaths(rootDir, command, rawArgs) {
  const [platform] = rawArgs
  const resolvedPlatform = platform && !platform.startsWith('-') ? platform : 'mp-weixin'
  if (resolvedPlatform !== 'mp-weixin') {
    return
  }

  const source = resolve(rootDir, 'project.config.json')
  const target = resolve(rootDir, 'dist', command === 'build' ? 'build' : 'dev', 'mp-weixin', 'project.config.json')

  return {
    source,
    target,
  }
}

function createMiniProgramProjectConfigSync(rootDir, command, rawArgs) {
  const paths = resolveMiniProgramProjectConfigPaths(rootDir, command, rawArgs)
  if (!paths || !existsSync(paths.source)) {
    return undefined
  }

  let lastContent = ''

  const sync = () => {
    if (!existsSync(paths.source) || !existsSync(dirname(paths.target))) {
      return
    }

    const nextContent = readFileSync(paths.source, 'utf8')
    const currentContent = existsSync(paths.target)
      ? readFileSync(paths.target, 'utf8')
      : ''

    if (currentContent === nextContent && lastContent === nextContent) {
      return
    }

    copyFileSync(paths.source, paths.target)
    lastContent = nextContent
  }

  sync()

  const timer = setInterval(sync, 800)

  const close = () => {
    clearInterval(timer)
    sync()
  }

  process.once('exit', close)
  process.once('SIGINT', close)
  process.once('SIGTERM', close)

  return {
    close,
  }
}

function createModuleExportName(name) {
  const camelName = name
    .replace(/(^\w)|[-_/](\w)/g, (_, first, nested) => (first || nested).toUpperCase())
  return `${camelName.charAt(0).toLowerCase()}${camelName.slice(1)}Module`
}

function toTitleCase(name) {
  return name
    .split(/[-_/]/u)
    .filter(Boolean)
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ')
}

function ensureMissing(path) {
  if (existsSync(path)) {
    throw new Error(`Path already exists: ${path}`)
  }
}

async function generateModule(rootDir, moduleName) {
  if (!moduleName) {
    throw new Error('Usage: dux-uni module new <module-name>')
  }

  const moduleDir = resolve(rootDir, 'src/modules', moduleName)
  const pagesDir = resolve(moduleDir, 'pages')
  const componentsDir = resolve(moduleDir, 'components')
  const storeDir = resolve(moduleDir, 'store')
  const indexFile = resolve(moduleDir, 'index.ts')
  const pageFile = resolve(pagesDir, 'index.vue')
  const componentIndexFile = resolve(componentsDir, 'index.ts')
  const storeIndexFile = resolve(storeDir, 'index.ts')
  const exportName = createModuleExportName(moduleName)
  const title = toTitleCase(moduleName)

  ensureMissing(moduleDir)

  mkdirSync(pagesDir, { recursive: true })
  mkdirSync(componentsDir, { recursive: true })
  mkdirSync(storeDir, { recursive: true })

  writeFileSync(indexFile, `import { defineUniModule } from '@duxweb/uni'

export const ${exportName} = defineUniModule({
  name: '${moduleName}',
  defaultLayout: 'default',
})

export default ${exportName}
`, 'utf8')

  writeFileSync(pageFile, `<route lang="json">
{
  "title": "${title}",
  "auth": true
}
</route>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="flex flex-col gap-[8rpx]">
        <text class="text-text text-[32rpx] font-semibold">${title}</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          这是 ${moduleName} 模块的起始页面，请在这个模块目录内继续扩展业务。
        </text>
      </view>
    </view>
  </view>
</template>
`, 'utf8')

  writeFileSync(componentIndexFile, 'export {}\n', 'utf8')
  writeFileSync(storeIndexFile, 'export {}\n', 'utf8')

  await syncProject(rootDir)
  console.log(`Created module: ${moduleName}`)
}

function resolveUniArgs(command, rawArgs) {
  const args = []

  if (command === 'build') {
    args.push('build')
  }

  const [platform, ...rest] = rawArgs
  if (platform && !platform.startsWith('-')) {
    args.push('-p', platform)
  }
  else if (platform) {
    rest.unshift(platform)
  }

  args.push(...rest)
  return args
}

async function runUni(rootDir, command, rawArgs) {
  await syncProject(rootDir)
  const watcher = command === 'dev'
    ? createDevSyncWatcher(rootDir)
    : undefined
  const mpProjectConfigSync = createMiniProgramProjectConfigSync(rootDir, command, rawArgs)
  const uniBin = resolve(rootDir, 'node_modules/@dcloudio/vite-plugin-uni/bin/uni.js')

  const child = spawn(process.execPath, [uniBin, ...resolveUniArgs(command, rawArgs)], {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    watcher?.close()
    mpProjectConfigSync?.close()
    process.exit(code ?? 0)
  })
}

async function about(rootDir) {
  const uniBin = resolve(rootDir, 'node_modules/@dcloudio/vite-plugin-uni/bin/uni.js')
  const child = spawn(process.execPath, [uniBin, '--help'], {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

const [, , rawCommand = 'sync', ...rawRest] = process.argv
const rootDir = process.cwd()
let command = rawCommand
let rest = rawRest

if (command === 'app') {
  command = rest[0] || 'sync'
  rest = rest.slice(1)
}

if (command === 'help' || command === '--help' || command === '-h') {
  printHelp()
}
else if (command === 'sync') {
  await syncProject(rootDir)
}
else if (command === 'dev' || command === 'build') {
  await runUni(rootDir, command, rest)
}
else if (command === 'about') {
  await about(rootDir)
}
else if (command === 'module' && rest[0] === 'new') {
  await generateModule(rootDir, rest[1])
}
else {
  printHelp()
  throw new Error(`Unsupported command: ${[command, ...rest].join(' ')}`)
}
