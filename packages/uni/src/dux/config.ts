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
import { resolveSystemThemeSync } from '../runtime/theme.ts'
import { useThemeStore } from '../stores/theme.ts'

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

function isAutoTheme(theme: ResolvedDuxConfig['ui']['theme']) {
  return theme === 'auto'
}

function resolveFixedTheme(theme: ResolvedDuxConfig['ui']['theme']) {
  return theme === 'dark' ? 'dark' : 'light'
}

export function resolveDuxConfig(config: DuxConfig): ResolvedDuxConfig {
  const runtimeTheme = config.runtime?.themeRuntime
  const resolvedThemeMode = config.ui?.theme || 'auto'
  const runtimeThemeMode = resolvedThemeMode === 'auto' ? 'system' : resolvedThemeMode
  const resolvedTokens = resolveThemeTokens(config.ui?.tokens || {})
  const resolvedRadius = {
    ...defaultRadiusTokens,
    ...(config.ui?.radius || {}),
  }
  const resolvedSpacing = {
    ...defaultSpacingTokens,
    ...(config.ui?.spacing || {}),
  }

  const resolvedRuntime = resolvedThemeMode || runtimeTheme?.tokens
    ? {
        ...(config.runtime || {}),
        themeRuntime: {
          ...(runtimeTheme || {}),
          tokens: runtimeTheme?.tokens || resolvedTokens,
          mode: runtimeTheme?.mode || runtimeThemeMode,
          getTheme: runtimeTheme?.getTheme || ((context) => {
            if (runtimeThemeMode !== 'system') {
              return runtimeThemeMode
            }
            const pinia = context.pinia as Parameters<typeof useThemeStore>[0] | undefined
            if (!pinia) {
              return resolveSystemThemeSync()
            }
            return useThemeStore(pinia).resolvedTheme
          }),
          onSystemThemeChange: runtimeTheme?.onSystemThemeChange || ((theme, context) => {
            const pinia = context.pinia as Parameters<typeof useThemeStore>[0] | undefined
            if (!pinia) {
              return
            }
            const store = useThemeStore(pinia)
            if (runtimeThemeMode !== 'system') {
              store.setThemePreference(runtimeThemeMode)
            }
            store.setSystemTheme(theme)
          }),
        },
      }
    : config.runtime

  return {
    ...config,
    runtime: resolvedRuntime,
    router: {
      ...config.router,
      tabBarMode: config.router.tabBarMode || 'auto',
    },
    ui: {
      library: config.ui?.library || 'wot',
      theme: resolvedThemeMode,
      navigationStyle: config.ui?.navigationStyle || 'default',
      schemaComponents: normalizeSchemaComponents(config.ui?.schemaComponents),
      tokens: resolvedTokens,
      radius: resolvedRadius,
      spacing: resolvedSpacing,
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

  const useThemeVars = isAutoTheme(manifest.config.ui.theme)
  const fixedTheme = createUniTheme(manifest.config.ui.tokens)[resolveFixedTheme(manifest.config.ui.theme)]
  const borderStyle: 'black' | 'white' = useThemeVars ? 'black' : fixedTheme.tabBorderStyle === 'white' ? 'white' : 'black'

  return {
    color: useThemeVars ? '@tabFontColor' : fixedTheme.tabFontColor,
    selectedColor: useThemeVars ? '@tabSelectedColor' : fixedTheme.tabSelectedColor,
    backgroundColor: useThemeVars ? '@tabBgColor' : fixedTheme.tabBgColor,
    borderStyle,
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
  const useThemeVars = isAutoTheme(resolved.ui.theme)
  const fixedTheme = createUniTheme(resolved.ui.tokens)[resolveFixedTheme(resolved.ui.theme)]

  return {
    backgroundColor: useThemeVars ? '@bgColor' : fixedTheme.bgColor,
    backgroundColorBottom: useThemeVars ? '@bgColorBottom' : fixedTheme.bgColorBottom,
    backgroundColorTop: useThemeVars ? '@bgColorTop' : fixedTheme.bgColorTop,
    backgroundTextStyle: useThemeVars ? '@bgTxtStyle' : fixedTheme.bgTxtStyle,
    navigationBarBackgroundColor: useThemeVars ? '@navBgColor' : fixedTheme.navBgColor,
    navigationBarTextStyle: useThemeVars ? '@navTxtStyle' : fixedTheme.navTxtStyle,
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
