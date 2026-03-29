import type { UniPageMeta } from '../types'
import type {
  DuxConfig,
  DuxPageMeta,
  DuxSchemaComponentConfig,
  DuxSchemaComponentInput,
  ResolvedDuxConfig,
  UniPagesEntry,
  UniTabBarConfig,
} from './types.ts'
import { createDuxRouterManifestFromPages } from './router.ts'
import { createUniTheme, defaultRadiusTokens, defaultSpacingTokens, resolveThemeTokens } from './theme.ts'

function normalizePagePath(path: string) {
  return path.replace(/^\/+/, '')
}

function createPageWrapperPlaceholder(style?: Record<string, unknown>) {
  const current = style?.componentPlaceholder
  const placeholders = current && typeof current === 'object'
    ? { ...(current as Record<string, unknown>) }
    : {}

  if (!('page-layout' in placeholders)) {
    placeholders['page-layout'] = 'view'
  }
  if (!('page-component' in placeholders)) {
    placeholders['page-component'] = 'view'
  }

  return placeholders
}

function normalizeSchemaComponents(input: DuxSchemaComponentInput[] = []): DuxSchemaComponentConfig[] {
  return input.reduce<DuxSchemaComponentConfig[]>((output, item) => {
    if (!item) {
      return output
    }

    if (typeof item === 'string') {
      output.push({
        name: item,
        slots: [],
      })
      return output
    }

    output.push({
      name: item.name,
      slots: [...new Set(item.slots || [])],
    })
    return output
  }, [])
}

export function defineDuxConfig<T extends DuxConfig>(config: T): T {
  return config
}

export function resolveDuxConfig(config: DuxConfig): ResolvedDuxConfig {
  return {
    ...config,
    router: {
      ...config.router,
      tabBarMode: config.router.tabBarMode || 'auto',
    },
    ui: {
      library: config.ui?.library || 'wot',
      theme: config.ui?.theme || 'light',
      darkmode: config.ui?.darkmode ?? false,
      navigationStyle: config.ui?.navigationStyle || 'default',
      schemaComponents: normalizeSchemaComponents(config.ui?.schemaComponents),
      tokens: resolveThemeTokens(config.ui?.tokens || {}),
      radius: {
        ...defaultRadiusTokens,
        ...(config.ui?.radius || {}),
      },
      spacing: {
        ...defaultSpacingTokens,
        ...(config.ui?.spacing || {}),
      },
    },
  }
}

export function createDuxRouterManifest(config: DuxConfig, pages: Array<Record<string, unknown>>) {
  return createDuxRouterManifestFromPages(pages, config)
}

export function getDuxPages(config: DuxConfig, pages?: Array<Record<string, unknown>>) {
  if (pages) {
    return createDuxRouterManifest(config, pages).pages
  }
  return (config.extraPages || []) as DuxPageMeta[]
}

export function getDuxPageByName(config: DuxConfig, name: string, pages?: Array<Record<string, unknown>>) {
  return getDuxPages(config, pages).find(page => page.name === name)
}

export function createUniPagesEntries(config: DuxConfig, pages: Array<Record<string, unknown>>): UniPagesEntry[] {
  const manifest = createDuxRouterManifest(config, pages)
  const homePath = manifest.homePage?.path

  return manifest.pages.map((page) => ({
    path: normalizePagePath(page.path),
    type: page.path === homePath ? 'home' : 'page',
    layout: page.layout,
    style: {
      ...((page as { style?: Record<string, unknown> }).style || {}),
      navigationBarTitleText: page.title || config.app.title,
      navigationStyle: (page as { navigationStyle?: string }).navigationStyle || manifest.config.ui.navigationStyle,
      componentPlaceholder: createPageWrapperPlaceholder((page as { style?: Record<string, unknown> }).style),
    },
  }))
}

export function createUniTabBar(config: DuxConfig, pages: Array<Record<string, unknown>>): UniTabBarConfig | undefined {
  const manifest = createDuxRouterManifest(config, pages)
  const items = manifest.tabBarPages

  if (!items.length || manifest.config.router.tabBarMode !== 'native') {
    return undefined
  }

  return {
    color: manifest.config.ui.darkmode ? '@tabFontColor' : manifest.config.ui.tokens.tabColor,
    selectedColor: manifest.config.ui.darkmode ? '@tabSelectedColor' : manifest.config.ui.tokens.tabSelectedColor,
    backgroundColor: manifest.config.ui.darkmode ? '@tabBgColor' : manifest.config.ui.tokens.tabBackground,
    borderStyle: manifest.config.ui.theme === 'dark' ? 'white' : 'black',
    list: items.map((page) => ({
      pagePath: normalizePagePath(page.path),
      text: page.title || page.name,
      iconPath: page.tabBarIcon?.iconPath,
      selectedIconPath: page.tabBarIcon?.selectedIconPath,
    })),
  }
}

export function createUniGlobalStyle(config: DuxConfig) {
  const resolved = resolveDuxConfig(config)

  return {
    backgroundColor: resolved.ui.darkmode ? '@bgColor' : resolved.ui.tokens.background,
    backgroundColorBottom: resolved.ui.darkmode ? '@bgColorBottom' : resolved.ui.tokens.background,
    backgroundColorTop: resolved.ui.darkmode ? '@bgColorTop' : resolved.ui.tokens.backgroundMuted,
    backgroundTextStyle: resolved.ui.darkmode ? '@bgTxtStyle' : resolved.ui.tokens.navText === 'white' ? 'light' : 'dark',
    navigationBarBackgroundColor: resolved.ui.darkmode ? '@navBgColor' : resolved.ui.tokens.navBackground,
    navigationBarTextStyle: resolved.ui.darkmode ? '@navTxtStyle' : resolved.ui.tokens.navText,
    navigationBarTitleText: config.app.title,
    navigationStyle: resolved.ui.navigationStyle,
  }
}

export function createUniThemeJson(config: DuxConfig) {
  const resolved = resolveDuxConfig(config)
  return createUniTheme(resolved.ui.tokens)
}

export function getDuxTabBarPages(manifest: ReturnType<typeof createDuxRouterManifest>) {
  return manifest.tabBarPages
}
