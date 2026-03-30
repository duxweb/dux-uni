import type { UniAppConfig, UniModuleManifest, UniPageMeta, UniTabBarMode, UniTabBarRenderer } from '../types'

export interface DuxTabBarIcon {
  iconPath: string
  selectedIconPath: string
}

export interface DuxThemeTokens {
  primary: string
  info: string
  success: string
  warning: string
  danger: string
  neutral: string
  background: string
  backgroundMuted: string
  chrome: string
  surface: string
  surfaceMuted: string
  text: string
  textSecondary: string
  border: string
  navBackground: string
  navText: 'black' | 'white'
  tabBackground: string
  tabColor: string
  tabSelectedColor: string
  pageGradientFrom: string
  pageGradientTo: string
}

export interface DuxRadiusTokens {
  card: string
  button: string
  shell: string
}

export interface DuxSpacingTokens {
  page: string
  section: string
  gap: string
  bottomInset: string
}

export interface DuxUiConfig {
  library?: 'wot' | 'none'
  theme?: 'auto' | 'light' | 'dark'
  navigationStyle?: 'default' | 'custom'
  schemaComponents?: DuxSchemaComponentInput[]
  tokens?: Partial<DuxThemeTokens>
  radius?: Partial<DuxRadiusTokens>
  spacing?: Partial<DuxSpacingTokens>
}

export type DuxSchemaComponentInput = string | DuxSchemaComponentConfig

export interface DuxSchemaComponentConfig {
  name: string
  slots?: string[]
}

export interface DuxRouterConfig {
  home: string
  login: string
  tabBar: string[]
  tabBarMode?: UniTabBarMode
  tabBarRenderer?: UniTabBarRenderer
}

export interface DuxAppMeta {
  name: string
  title: string
  description?: string
}

export interface DuxPageMeta extends UniPageMeta {
  tabBarIcon?: DuxTabBarIcon
}

export interface DuxConfig {
  app: DuxAppMeta
  modules: UniModuleManifest[]
  router: DuxRouterConfig
  ui?: DuxUiConfig
  runtime?: Omit<UniAppConfig, 'pages' | 'modules' | 'moduleActions'>
  extraPages?: UniPageMeta[]
}

export interface ResolvedDuxConfig extends DuxConfig {
  ui: {
    library: 'wot' | 'none'
    theme: 'auto' | 'light' | 'dark'
    navigationStyle: 'default' | 'custom'
    schemaComponents: DuxSchemaComponentConfig[]
    tokens: DuxThemeTokens
    radius: DuxRadiusTokens
    spacing: DuxSpacingTokens
  }
}

export interface DuxRouterManifest {
  config: ResolvedDuxConfig
  pages: DuxPageMeta[]
  pagesByName: Record<string, DuxPageMeta>
  pagesByModule: Record<string, DuxPageMeta[]>
  homePage?: DuxPageMeta
  loginPage?: DuxPageMeta
  tabBarPages: DuxPageMeta[]
}

export interface UniPagesEntry {
  path: string
  type?: 'home' | 'page'
  layout?: string
  style?: Record<string, unknown>
}

export interface UniTabBarItem {
  pagePath: string
  text: string
  iconPath?: string
  selectedIconPath?: string
}

export interface UniTabBarConfig {
  color: string
  selectedColor: string
  backgroundColor: string
  borderStyle: 'black' | 'white'
  list: UniTabBarItem[]
}
