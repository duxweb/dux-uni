#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import prompts from 'prompts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageDir = resolve(__dirname, '..')
const templateDir = resolve(packageDir, 'template')
const packageJson = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'))
const templateMeta = packageJson.duxTemplate || {}

function printHelp() {
  console.log(`@duxweb/uni-create

Usage:
  npx @duxweb/uni-create <project-name> [options]
  npx @duxweb/uni-create . [options]

Options:
  --template <name>          Template name, default: template
  --ui <mode>                base | pro, default: ${templateMeta.defaultUi || 'pro'}
  --package-manager <name>   pnpm | npm | yarn | bun, default: pnpm
  --package-name <name>      Override package.json name
  --title <title>            Override app title
  --with-demo-module         Create an extra demo module
  --no-demo-module           Do not create the extra demo module
  --no-install               Skip dependency installation
  --no-git                   Skip git init
  --force                    Remove target directory if it already exists
  -h, --help                 Show help
`)
}

function parseArgs(argv) {
  const options = {
    target: undefined,
    template: templateMeta.templateName || 'template',
    ui: templateMeta.defaultUi || 'pro',
    uiProvided: false,
    packageManager: 'pnpm',
    packageManagerProvided: false,
    packageName: undefined,
    title: undefined,
    titleProvided: false,
    install: true,
    git: true,
    gitProvided: false,
    demoModule: false,
    demoModuleProvided: false,
    force: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (!arg.startsWith('-') && !options.target) {
      options.target = arg
      continue
    }

    if (arg === '-h' || arg === '--help') {
      options.help = true
      continue
    }

    if (arg === '--no-install') {
      options.install = false
      continue
    }

    if (arg === '--no-git') {
      options.git = false
      options.gitProvided = true
      continue
    }

    if (arg === '--force') {
      options.force = true
      continue
    }

    if (arg === '--template') {
      options.template = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--ui') {
      options.ui = argv[index + 1]
      options.uiProvided = true
      index += 1
      continue
    }

    if (arg === '--package-manager') {
      options.packageManager = argv[index + 1]
      options.packageManagerProvided = true
      index += 1
      continue
    }

    if (arg === '--package-name') {
      options.packageName = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--title') {
      options.title = argv[index + 1]
      options.titleProvided = true
      index += 1
      continue
    }

    if (arg === '--with-demo-module') {
      options.demoModule = true
      options.demoModuleProvided = true
      continue
    }

    if (arg === '--no-demo-module') {
      options.demoModule = false
      options.demoModuleProvided = true
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function isInteractiveSession() {
  return process.stdin.isTTY && process.stdout.isTTY
}

async function runPrompt(question) {
  const response = await prompts(question, {
    onCancel: () => {
      throw new Error('Prompt cancelled')
    },
  })
  return response.value
}

async function promptMissingOptions(options) {
  if (!isInteractiveSession()) {
    return options
  }

  if (!options.target) {
    options.target = await runPrompt({
      type: 'text',
      name: 'value',
      message: 'Project directory',
      initial: 'my-app',
      validate: value => String(value || '').trim() ? true : 'Project directory is required',
    })
  }

  const target = resolveTarget(options.target)
  const defaultTitle = toTitleCase(target.dirName)

  if (!options.uiProvided) {
    const enableUniPro = await runPrompt({
      type: 'toggle',
      name: 'value',
      message: 'Enable @duxweb/uni-pro (Wot UI integration)',
      initial: true,
      active: 'yes',
      inactive: 'no',
    })
    options.ui = enableUniPro ? 'pro' : 'base'
  }

  if (!options.titleProvided) {
    options.title = await runPrompt({
      type: 'text',
      name: 'value',
      message: 'App title',
      initial: defaultTitle,
      validate: value => String(value || '').trim() ? true : 'App title is required',
    })
  }

  if (!options.packageManagerProvided) {
    options.packageManager = await runPrompt({
      type: 'select',
      name: 'value',
      message: 'Package manager',
      initial: 0,
      choices: [
        { title: 'pnpm', value: 'pnpm' },
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'bun', value: 'bun' },
      ],
    })
  }

  if (!options.gitProvided) {
    options.git = await runPrompt({
      type: 'toggle',
      name: 'value',
      message: 'Initialize git repository',
      initial: true,
      active: 'yes',
      inactive: 'no',
    })
  }

  if (!options.demoModuleProvided) {
    options.demoModule = await runPrompt({
      type: 'toggle',
      name: 'value',
      message: 'Create an extra demo module',
      initial: false,
      active: 'yes',
      inactive: 'no',
    })
  }

  return options
}

function isDirectoryEmpty(dir) {
  if (!existsSync(dir)) {
    return true
  }
  return readdirSync(dir).length === 0
}

function toKebabCase(input) {
  return String(input || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function toTitleCase(input) {
  const text = toKebabCase(input).replace(/-/g, ' ').trim()
  if (!text) {
    return 'Dux Uni App'
  }
  return text
    .split(' ')
    .filter(Boolean)
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ')
}

function resolveTarget(input) {
  if (!input || input === '.') {
    const cwd = process.cwd()
    return {
      path: cwd,
      dirName: cwd.split('/').filter(Boolean).pop() || 'dux-uni-app',
    }
  }

  const path = resolve(process.cwd(), input)
  return {
    path,
    dirName: input.split('/').filter(Boolean).pop() || 'dux-uni-app',
  }
}

function replaceOnce(source, pattern, replacement) {
  return source.replace(pattern, replacement)
}

function renderReadme(options) {
  return `# ${options.title}

此项目由 \`@duxweb/uni-create\` 基于官方模板生成。

## 常用命令

\`\`\`bash
${options.packageManager} install
${options.packageManager} run sync:uni
${options.packageManager} run dev
${options.packageManager} run type-check
\`\`\`

## 目录约定

- \`src/modules/*\`：真实业务模块
- \`src/pages/*\`：自动生成页面包装层，不手改
- \`src/runtime/*\`：自动生成运行时产物，不手改
- \`src/dux.config.ts\`：应用级配置入口
- \`src/dux.ts\`：应用运行时单例入口
- \`UI 模式\`：${options.ui === 'base' ? 'base（仅 @duxweb/uni）' : 'pro（@duxweb/uni + @duxweb/uni-pro）'}
- \`演示模块\`：${options.demoModule ? '已创建 src/modules/demo，可直接继续扩展' : '未创建，保持模板最小骨架'}
`
}

function rewriteTemplateFiles(targetDir, options) {
  const appName = toKebabCase(options.packageName.replace(/^@[^/]+\//, '')) || 'dux-uni-app'
  const packageJsonPath = join(targetDir, 'package.json')
  const appConfigPath = join(targetDir, 'src/dux.config.ts')
  const duxPath = join(targetDir, 'src/dux.ts')
  const readmePath = join(targetDir, 'README.md')
  const tsconfigPath = join(targetDir, 'tsconfig.json')

  const projectPackage = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  projectPackage.name = options.packageName
  projectPackage.private = true
  projectPackage.version = '0.0.0'
  if (options.packageManager === 'pnpm') {
    projectPackage.packageManager = 'pnpm@10.31.0'
  }
  projectPackage.scripts = {
    ...projectPackage.scripts,
    'clean:vite': "node -e \"import('node:fs').then(fs => fs.rmSync('node_modules/.vite', { recursive: true, force: true }))\"",
    'sync:uni': 'dux-uni sync',
    dev: "node -e \"import('node:fs').then(fs => fs.rmSync('node_modules/.vite', { recursive: true, force: true }))\" && dux-uni dev",
    build: 'dux-uni build',
    about: 'dux-uni about',
    'module:new': 'dux-uni module new',
    'type-check': 'dux-uni sync && vue-tsc --noEmit',
  }
  projectPackage.dependencies = {
    ...(projectPackage.dependencies || {}),
    '@duxweb/uni': `^${templateMeta.uniVersion || '0.1.0'}`,
    ...(options.ui === 'pro' ? { '@duxweb/uni-pro': `^${templateMeta.uniProVersion || '0.1.0'}` } : {}),
  }
  projectPackage['simple-git-hooks'] = {
    ...(projectPackage['simple-git-hooks'] || {}),
    'pre-commit': 'npx lint-staged',
  }

  writeFileSync(packageJsonPath, `${JSON.stringify(projectPackage, null, 2)}\n`, 'utf8')

  let appConfig = readFileSync(appConfigPath, 'utf8')
  appConfig = replaceOnce(appConfig, /name:\s*'template'/u, `name: '${appName}'`)
  appConfig = replaceOnce(appConfig, /title:\s*'Dux Uni Template'/u, `title: '${options.title}'`)
  appConfig = replaceOnce(appConfig, /description:\s*'Dux Uni 模块化模板'/u, `description: '${options.title} 应用'`)
  appConfig = replaceOnce(appConfig, /@duxweb\/uni\/template\/session/gu, `@duxweb/uni/${appName}/session`)
  if (options.ui === 'base') {
    appConfig = replaceOnce(appConfig, /ui:\s*\{\n/u, `ui: {\n    library: 'none',\n`)
  }
  writeFileSync(appConfigPath, appConfig, 'utf8')

  let duxSource = readFileSync(duxPath, 'utf8')
  duxSource = replaceOnce(duxSource, /template-admin-token/gu, `${appName}-admin-token`)
  duxSource = replaceOnce(duxSource, /模板管理员/gu, `${options.title} 管理员`)
  writeFileSync(duxPath, duxSource, 'utf8')

  let tsconfig = readFileSync(tsconfigPath, 'utf8')
  tsconfig = tsconfig
    .replace(/\n\s*"@duxweb\/uni": \["\.\.\/\.\.\/packages\/uni\/src\/index\.ts"\],?/u, '')
    .replace(/\n\s*"@duxweb\/uni-pro": \["\.\.\/\.\.\/packages\/uni-pro\/src\/index\.ts"\],?/u, '')
    .replace(/\n\s*"@duxweb\/uni-pro\/\*": \["\.\.\/\.\.\/packages\/uni-pro\/src\/\*"\],?/u, '')
  writeFileSync(tsconfigPath, tsconfig, 'utf8')

  writeFileSync(readmePath, renderReadme(options), 'utf8')
}

function copyTemplateContents(sourceDir, targetDir) {
  readdirSync(sourceDir, {
    withFileTypes: true,
  }).forEach((entry) => {
    cpSync(join(sourceDir, entry.name), join(targetDir, entry.name), {
      recursive: true,
    })
  })
}

function createBaseUnoConfig() {
  return `import { presetUni } from '@uni-helper/unocss-preset-uni'
import { resolveDuxConfig } from '@duxweb/uni'
import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import duxConfig from './src/dux.config.ts'

const dux = resolveDuxConfig(duxConfig)

export default defineConfig({
  theme: {
    colors: {
      primary: dux.ui.tokens.primary,
      success: dux.ui.tokens.success,
      warning: dux.ui.tokens.warning,
      danger: dux.ui.tokens.danger,
      background: dux.ui.tokens.background,
      'background-muted': dux.ui.tokens.backgroundMuted,
      chrome: dux.ui.tokens.chrome,
      surface: dux.ui.tokens.surface,
      'surface-muted': dux.ui.tokens.surfaceMuted,
      text: dux.ui.tokens.text,
      'text-secondary': dux.ui.tokens.textSecondary,
      border: dux.ui.tokens.border,
    },
    borderRadius: {
      card: dux.ui.radius.card,
      button: dux.ui.radius.button,
      shell: dux.ui.radius.shell,
    },
    spacing: {
      page: dux.ui.spacing.page,
      section: dux.ui.spacing.section,
      gap: dux.ui.spacing.gap,
      'bottom-inset': dux.ui.spacing.bottomInset,
    },
  },
  presets: [
    presetUni(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
`
}

function createDemoModuleFiles(targetDir) {
  const moduleDir = join(targetDir, 'src/modules/demo')
  const pagesDir = join(moduleDir, 'pages')
  const componentsDir = join(moduleDir, 'components')
  const storeDir = join(moduleDir, 'store')

  mkdirSync(pagesDir, { recursive: true })
  mkdirSync(componentsDir, { recursive: true })
  mkdirSync(storeDir, { recursive: true })

  writeFileSync(join(moduleDir, 'index.ts'), `import { defineUniModule } from '@duxweb/uni'

export const demoModule = defineUniModule({
  name: 'demo',
  defaultLayout: 'default',
})

export default demoModule
`, 'utf8')

  writeFileSync(join(componentsDir, 'index.ts'), 'export {}\n', 'utf8')
  writeFileSync(join(storeDir, 'index.ts'), 'export {}\n', 'utf8')
  writeFileSync(join(pagesDir, 'index.vue'), `<route lang="json">
{
  "title": "演示模块",
  "auth": true
}
</route>

<script setup lang="ts">
import { usePageTitle, useRouter } from '@duxweb/uni'

const router = useRouter()

usePageTitle('演示模块')

async function backHome() {
  await router.home()
}
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="flex flex-col gap-[12rpx]">
        <text class="text-text text-[34rpx] font-semibold">演示模块</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          这是脚手架可选生成的 demo 模块。你可以直接在 src/modules/demo 内继续扩展列表、表单、弹层或实时能力。
        </text>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="flex flex-col gap-[12rpx]">
        <text class="text-text text-[28rpx] font-semibold">建议下一步</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">1. 在 pages 下补更多页面。</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">2. 在 store 下放模块状态。</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">3. 在 components 下放模块专属组件。</text>
      </view>
    </view>

    <button class="h-[84rpx] rounded-[18rpx] bg-[#0f766e] text-[26rpx] text-white" @click="backHome">
      返回首页
    </button>
  </view>
</template>
`, 'utf8')
}

function injectDemoEntryIntoHome(targetDir) {
  const homePagePath = join(targetDir, 'src/modules/home/pages/index.vue')
  let source = readFileSync(homePagePath, 'utf8')

  if (!source.includes("useRouter")) {
    source = source.replace(
      /import \{([^}]*)\} from '@duxweb\/uni'/u,
      (_, imports) => `import {${imports}, useRouter } from '@duxweb/uni'`,
    )
    source = source.replace(/,\s+useRoute\s+,/u, ', useRoute,')
    source = source.replace(/useRoute\s+, useRouter/u, 'useRoute, useRouter')
  }

  if (!source.includes('const router = useRouter()')) {
    source = source.replace(
      /const route = useRoute\(\)\n/u,
      'const route = useRoute()\nconst router = useRouter()\n',
    )
  }

  if (!source.includes('async function openDemoModule()')) {
    source = source.replace(
      /const routeQueryText = computed\(\(\) => JSON\.stringify\(route\.query \|\| \{\}, null, 2\)\)\n/u,
      `const routeQueryText = computed(() => JSON.stringify(route.query || {}, null, 2))

async function openDemoModule() {
  await router.push('/pages/demo/index')
}
`,
    )
  }

  if (!source.includes('打开演示模块')) {
    const templateCloseIndex = source.lastIndexOf('</template>')
    const rootCloseIndex = source.lastIndexOf('</view>', templateCloseIndex)

    if (templateCloseIndex === -1 || rootCloseIndex === -1) {
      throw new Error(`Unable to inject demo entry into home page: ${homePagePath}`)
    }

    source = `${source.slice(0, rootCloseIndex)}

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">演示模块入口</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          创建项目时已经额外生成 src/modules/demo，可直接作为你的第一个实验模块继续扩展。
        </text>
      </view>
      <button class="h-[84rpx] rounded-[18rpx] bg-[#0f766e] text-[26rpx] text-white" @click="openDemoModule">
        打开演示模块
      </button>
    </view>
  </view>
</template>
`
  }

  writeFileSync(homePagePath, source, 'utf8')
}

function createDemoModule(targetDir) {
  createDemoModuleFiles(targetDir)
  injectDemoEntryIntoHome(targetDir)
}

function applyBaseUiTemplate(targetDir) {
  const packageJsonPath = join(targetDir, 'package.json')
  const tsconfigPath = join(targetDir, 'tsconfig.json')
  const viteConfigPath = join(targetDir, 'vite.config.ts')
  const unoConfigPath = join(targetDir, 'uno.config.ts')
  const defaultLayoutPath = join(targetDir, 'src/modules/base/layouts/default.vue')
  const homeLayoutPath = join(targetDir, 'src/modules/base/layouts/home.vue')
  const homePagePath = join(targetDir, 'src/modules/home/pages/index.vue')
  const loginPagePath = join(targetDir, 'src/modules/auth/pages/login.vue')
  const accountPagePath = join(targetDir, 'src/modules/account/pages/index.vue')
  const forbiddenPagePath = join(targetDir, 'src/modules/system/pages/forbidden/index.vue')

  const projectPackage = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  delete projectPackage.dependencies['@duxweb/uni-pro']
  delete projectPackage.dependencies['wot-design-uni']
  writeFileSync(packageJsonPath, `${JSON.stringify(projectPackage, null, 2)}\n`, 'utf8')

  let viteConfig = readFileSync(viteConfigPath, 'utf8')
  viteConfig = viteConfig.replace("'@duxweb/uni', '@duxweb/uni-pro', 'lodash.merge', '@vueuse/shared'", "'@duxweb/uni', 'lodash.merge', '@vueuse/shared'")
  writeFileSync(viteConfigPath, viteConfig, 'utf8')

  writeFileSync(unoConfigPath, createBaseUnoConfig(), 'utf8')

  writeFileSync(defaultLayoutPath, `<script setup lang="ts">
import { resolveDuxConfig } from '@duxweb/uni'
import duxConfig from '@/dux.config'

const dux = resolveDuxConfig(duxConfig)
</script>

<template>
  <view
    class="relative min-h-screen overflow-hidden px-[28rpx] pt-[120rpx] pb-[40rpx]"
    :style="{
      background: \`linear-gradient(180deg, \${dux.ui.tokens.pageGradientFrom} 0%, \${dux.ui.tokens.pageGradientTo} 100%)\`,
    }"
  >
    <view class="absolute top-[60rpx] right-[-80rpx] h-[360rpx] w-[360rpx] rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.22),transparent)] blur-sm" />
    <view class="absolute bottom-[60rpx] left-[-60rpx] h-[260rpx] w-[260rpx] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.16),transparent)] blur-sm" />
    <view class="relative z-1">
      <slot />
    </view>
  </view>
</template>
`, 'utf8')

  writeFileSync(homeLayoutPath, `<script setup lang="ts">
import { resolveDuxConfig } from '@duxweb/uni'
import duxConfig from '@/dux.config'

const dux = resolveDuxConfig(duxConfig)
</script>

<template>
  <view class="min-h-screen bg-background">
    <view
      class="flex flex-col"
      :style="{
        padding: dux.ui.spacing.page,
        gap: dux.ui.spacing.section,
        paddingBottom: \`calc(env(safe-area-inset-bottom) + \${dux.ui.spacing.bottomInset})\`,
      }"
    >
      <slot />
    </view>
  </view>
</template>
`, 'utf8')

  writeFileSync(homePagePath, `<route lang="json">
{
  "title": "首页",
  "auth": true,
  "type": "home"
}
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth, useModules, useRoute } from '@duxweb/uni'

const auth = useAuth()
const route = useRoute()
const isLogin = computed(() => Boolean(auth.value?.token))
const moduleList = useModules()
const modules = computed(() => moduleList.value.map(item => item.name))
const profile = computed(() => auth.value?.user || {})
const routeQueryText = computed(() => JSON.stringify(route.query || {}, null, 2))
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="rounded-shell bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-[28rpx] py-[34rpx] text-white shadow-[0_18rpx_40rpx_rgba(15,118,110,0.18)]">
      <view class="flex flex-col gap-[10rpx]">
        <text class="text-[44rpx] font-bold leading-tight">Base 模板只保留 @duxweb/uni 运行时骨架</text>
        <text class="text-[24rpx] text-white/80 leading-relaxed">
          当前账号：{{ String(profile.name || '未登录') }}，状态：{{ isLogin ? '已登录' : '未登录' }}。
        </text>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">模板起点</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          当前模板不内置任何 UI 适配层，业务开发从 src/modules/* 开始扩展。
        </text>
      </view>
      <view class="grid grid-cols-1 gap-[16rpx]">
        <view class="rounded-card bg-surface-muted p-[20rpx]">
          <text class="text-text text-[26rpx] font-semibold block">运行时优先</text>
          <text class="text-text-secondary text-[22rpx] leading-relaxed mt-[6rpx]">
            路由、鉴权、查询、表单、Schema 全部由 @duxweb/uni 提供。
          </text>
        </view>
        <view class="rounded-card bg-surface-muted p-[20rpx]">
          <text class="text-text text-[26rpx] font-semibold block">UI 可自由选择</text>
          <text class="text-text-secondary text-[22rpx] leading-relaxed mt-[6rpx]">
            你可以后续再接自己的 UI 库，或单独安装 @duxweb/uni-pro。
          </text>
        </view>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">已装配模块</text>
      </view>
      <view class="flex flex-wrap gap-[12rpx]">
        <view
          v-for="item in modules"
          :key="item"
          class="rounded-[999rpx] bg-surface-muted px-[18rpx] py-[8rpx] text-[22rpx] text-text"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">当前路由</text>
      </view>
      <view class="flex flex-col gap-[12rpx]">
        <text class="text-text text-[24rpx]">{{ route.name || 'unknown' }}</text>
        <text class="text-text-secondary text-[22rpx] font-mono break-all">{{ route.fullPath || route.path }}</text>
        <text class="text-text-secondary text-[22rpx] font-mono break-all">{{ routeQueryText }}</text>
      </view>
    </view>
  </view>
</template>
`, 'utf8')

  writeFileSync(loginPagePath, `<route lang="json">
{
  "title": "登录",
  "guestOnly": true,
  "middleware": ["guest"],
  "style": {
    "navigationStyle": "custom"
  }
}
</route>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLogin } from '@duxweb/uni'

const username = ref('admin')
const password = ref('admin123')
const errorMessage = ref('')
const loginAction = useLogin({
  redirectTo: '/pages/home/index',
})
const loginLoading = computed(() => loginAction.isPending.value)

async function submit() {
  errorMessage.value = ''
  try {
    await loginAction.login({
      username: username.value,
      password: password.value,
    })
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  }
}
</script>

<template>
  <view class="flex flex-col gap-[32rpx]">
    <view class="flex flex-col gap-[14rpx] text-white">
      <text class="text-[48rpx] font-bold leading-tight">Base 模板登录</text>
      <text class="text-[26rpx] text-white/75 leading-relaxed">
        默认账号仅用于模板验证：账号 admin，密码 admin123。
      </text>
    </view>

    <view class="rounded-[36rpx] bg-white p-[32rpx] shadow-lg">
      <view class="mb-[24rpx] flex flex-col gap-[10rpx]">
        <text class="text-[#0f172a] text-[40rpx] font-bold">账号登录</text>
        <text class="text-[#667085] text-[24rpx]">这里只保留最基础的登录流，不绑定任何 UI 适配层。</text>
      </view>

      <view class="flex flex-col gap-[20rpx]">
        <view class="flex flex-col gap-[12rpx]">
          <input v-model="username" class="h-[88rpx] rounded-[20rpx] bg-[#f8fafc] px-[24rpx] text-[28rpx]" placeholder="请输入用户名" />
          <input v-model="password" password class="h-[88rpx] rounded-[20rpx] bg-[#f8fafc] px-[24rpx] text-[28rpx]" placeholder="请输入密码" />
        </view>

        <view v-if="errorMessage" class="rounded-[16rpx] bg-[#fee2e2] px-[20rpx] py-[18rpx] text-[24rpx] text-[#b91c1c]">
          {{ errorMessage }}
        </view>

        <button class="h-[88rpx] rounded-[20rpx] bg-[#0f766e] text-[28rpx] text-white" :disabled="loginLoading" @click="submit">
          {{ loginLoading ? '登录中...' : '进入模板' }}
        </button>
      </view>
    </view>
  </view>
</template>
`, 'utf8')

  writeFileSync(accountPagePath, `<route lang="json">
{
  "title": "账户",
  "auth": true
}
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth, useCheck, useLogout } from '@duxweb/uni'

const auth = useAuth()
const isLogin = computed(() => Boolean(auth.value?.token))
const permissions = computed(() => {
  const value = auth.value?.permissions
  return Array.isArray(value) ? value : []
})
const checkAction = useCheck()
const logoutAction = useLogout({
  redirectTo: '/pages/auth/login',
})
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">账户会话</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          Base 模板只保留最基础的登录态和权限展示。
        </text>
      </view>
      <view class="flex flex-col gap-[12rpx]">
        <view class="rounded-[20rpx] bg-surface-muted px-[20rpx] py-[18rpx] text-[24rpx] text-text">登录状态：{{ isLogin ? '已登录' : '未登录' }}</view>
        <view class="rounded-[20rpx] bg-surface-muted px-[20rpx] py-[18rpx] text-[24rpx] text-text">用户名称：{{ String(auth.value?.user?.name || '未设置') }}</view>
        <view class="rounded-[20rpx] bg-surface-muted px-[20rpx] py-[18rpx] text-[24rpx] text-text break-all">Token：{{ String(auth.value?.token || '无') }}</view>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">权限标记</text>
      </view>
      <view class="flex flex-wrap gap-[12rpx]">
        <view
          v-for="item in permissions"
          :key="item"
          class="rounded-[999rpx] bg-surface-muted px-[18rpx] py-[8rpx] text-[22rpx] text-text"
        >
          {{ item }}
        </view>
        <view v-if="!permissions.length" class="rounded-[999rpx] bg-surface-muted px-[18rpx] py-[8rpx] text-[22rpx] text-text-secondary">
          暂无权限
        </view>
      </view>
    </view>

    <view class="grid grid-cols-2 gap-[16rpx]">
      <button class="h-[84rpx] rounded-[18rpx] border border-[#cbd5e1] bg-white text-[26rpx] text-[#334155]" :disabled="checkAction.isPending.value" @click="checkAction.check({})">
        校验会话
      </button>
      <button class="h-[84rpx] rounded-[18rpx] bg-[#0f766e] text-[26rpx] text-white" :disabled="logoutAction.isPending.value" @click="logoutAction.logout({})">
        退出登录
      </button>
    </view>
  </view>
</template>
`, 'utf8')

  writeFileSync(forbiddenPagePath, `<route lang="json">
{
  "name": "system.forbidden",
  "title": "无权限"
}
</route>

<script setup lang="ts">
import { usePageTitle, useRouter } from '@duxweb/uni'

const router = useRouter()

usePageTitle('无权限')

async function backHome() {
  await router.home()
}
</script>

<template>
  <view class="rounded-[32rpx] bg-white px-[32rpx] py-[40rpx] flex flex-col gap-[16rpx]">
    <view class="w-[92rpx] h-[92rpx] rounded-[28rpx] bg-[#fee2e2] flex items-center justify-center">
      <text class="text-[40rpx] text-[#dc2626]">!</text>
    </view>
    <text class="text-[38rpx] font-bold text-[#0f172a]">没有访问权限</text>
    <text class="text-[26rpx] leading-[1.7] text-[#64748b]">
      这是模板内置的默认无权限页。实际业务可以继续扩展权限中间件或替换 fallback 组件。
    </text>
    <button class="h-[84rpx] rounded-[18rpx] bg-[#0f766e] text-[26rpx] text-white" @click="backHome">返回首页</button>
  </view>
</template>
`, 'utf8')
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`)
  }
}

function installDependencies(targetDir, packageManager) {
  if (packageManager === 'pnpm') {
    runCommand('pnpm', ['install'], targetDir)
    return
  }
  if (packageManager === 'npm') {
    runCommand('npm', ['install'], targetDir)
    return
  }
  if (packageManager === 'yarn') {
    runCommand('yarn', ['install'], targetDir)
    return
  }
  if (packageManager === 'bun') {
    runCommand('bun', ['install'], targetDir)
    return
  }
  throw new Error(`Unsupported package manager: ${packageManager}`)
}

function runScript(targetDir, packageManager, scriptName) {
  if (packageManager === 'pnpm') {
    runCommand('pnpm', [scriptName], targetDir)
    return
  }
  if (packageManager === 'npm') {
    runCommand('npm', ['run', scriptName], targetDir)
    return
  }
  if (packageManager === 'yarn') {
    runCommand('yarn', [scriptName], targetDir)
    return
  }
  if (packageManager === 'bun') {
    runCommand('bun', ['run', scriptName], targetDir)
    return
  }
  throw new Error(`Unsupported package manager: ${packageManager}`)
}

function initGit(targetDir) {
  runCommand('git', ['init'], targetDir)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  if (options.template !== 'template') {
    throw new Error(`Unknown template: ${options.template}`)
  }

  await promptMissingOptions(options)

  if (options.ui !== 'base' && options.ui !== 'pro') {
    throw new Error(`Unknown ui mode: ${options.ui}`)
  }

  const target = resolveTarget(options.target)
  const targetDir = target.path
  const packageName = options.packageName || toKebabCase(target.dirName) || 'dux-uni-app'
  const title = options.title || toTitleCase(target.dirName)
  const inCurrentDirectory = targetDir === process.cwd()

  if (!isDirectoryEmpty(targetDir)) {
    if (inCurrentDirectory) {
      throw new Error(`Current directory is not empty: ${targetDir}. Please create the project in a new directory.`)
    }
    if (!options.force) {
      throw new Error(`Target directory is not empty: ${targetDir}. Use --force to overwrite it.`)
    }
    rmSync(targetDir, { recursive: true, force: true })
  }

  mkdirSync(targetDir, { recursive: true })
  copyTemplateContents(templateDir, targetDir)

  rewriteTemplateFiles(targetDir, {
    packageName,
    title,
    packageManager: options.packageManager,
    ui: options.ui,
  })

  if (options.ui === 'base') {
    applyBaseUiTemplate(targetDir)
  }

  if (options.demoModule) {
    createDemoModule(targetDir)
  }

  if (options.git) {
    initGit(targetDir)
  }

  if (options.install) {
    installDependencies(targetDir, options.packageManager)
    runScript(targetDir, options.packageManager, 'sync:uni')
  }

  console.log(`
Created Dux Uni project:
  ${targetDir}

UI mode:
  ${options.ui}

Demo module:
  ${options.demoModule ? 'enabled' : 'disabled'}

Next steps:
  cd ${targetDir}
  ${options.install ? `${options.packageManager} run dev` : `${options.packageManager} install && ${options.packageManager} run sync:uni && ${options.packageManager} run dev`}
`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
