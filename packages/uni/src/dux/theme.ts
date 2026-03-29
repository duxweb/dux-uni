import type { DuxRadiusTokens, DuxSpacingTokens, DuxThemeTokens } from './types.ts'

interface RgbColor {
  r: number
  g: number
  b: number
}

const DARK_CANVAS = '#09090b'
const DARK_SURFACE = '#18181b'
const DARK_BACKGROUND_TOP = '#27272a'

export const defaultThemeTokens: DuxThemeTokens = {
  primary: '#059669',
  info: '#0ea5e9',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: '#71717a',
  background: '#fafafa',
  backgroundMuted: '#f5f5f5',
  chrome: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f5f5f5',
  text: '#18181b',
  textSecondary: '#71717a',
  border: '#e4e4e7',
  navBackground: '#ffffff',
  navText: 'black',
  tabBackground: '#ffffff',
  tabColor: '#a1a1aa',
  tabSelectedColor: '#059669',
  pageGradientFrom: '#fafafa',
  pageGradientTo: '#f5f5f5',
}

export const defaultRadiusTokens: DuxRadiusTokens = {
  card: '24rpx',
  button: '18rpx',
  shell: '32rpx',
}

export const defaultSpacingTokens: DuxSpacingTokens = {
  page: '24rpx',
  section: '24rpx',
  gap: '16rpx',
  bottomInset: '56rpx',
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function parseColor(input: string): RgbColor | null {
  const color = String(input || '').trim()
  if (!color) {
    return null
  }

  if (color.startsWith('#')) {
    const value = color.slice(1)
    if (/^[0-9a-f]{3}$/iu.test(value)) {
      return {
        r: Number.parseInt(value[0] + value[0], 16),
        g: Number.parseInt(value[1] + value[1], 16),
        b: Number.parseInt(value[2] + value[2], 16),
      }
    }

    if (/^[0-9a-f]{6}$/iu.test(value)) {
      return {
        r: Number.parseInt(value.slice(0, 2), 16),
        g: Number.parseInt(value.slice(2, 4), 16),
        b: Number.parseInt(value.slice(4, 6), 16),
      }
    }
  }

  const rgbMatch = color.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+\s*)?\)$/iu)
  if (rgbMatch) {
    return {
      r: clampChannel(Number(rgbMatch[1])),
      g: clampChannel(Number(rgbMatch[2])),
      b: clampChannel(Number(rgbMatch[3])),
    }
  }

  return null
}

function toHex(input: RgbColor) {
  return `#${[input.r, input.g, input.b]
    .map(channel => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`
}

export function mixColor(base: string, target: string, weight: number) {
  const from = parseColor(base)
  const to = parseColor(target)

  if (!from || !to) {
    return base
  }

  return toHex({
    r: from.r * (1 - weight) + to.r * weight,
    g: from.g * (1 - weight) + to.g * weight,
    b: from.b * (1 - weight) + to.b * weight,
  })
}

export function resolveThemeTokens(tokens: Partial<DuxThemeTokens> = {}): DuxThemeTokens {
  const theme = {
    ...defaultThemeTokens,
    ...tokens,
  }

  const neutral = theme.neutral || defaultThemeTokens.neutral
  const chrome = theme.chrome || defaultThemeTokens.chrome

  return {
    ...theme,
    chrome,
    neutral,
    textSecondary: tokens.textSecondary || neutral,
    border: tokens.border || mixColor(neutral, '#ffffff', 0.72),
    navBackground: tokens.navBackground || chrome,
    tabBackground: tokens.tabBackground || chrome,
  }
}

export function createUniTheme(tokens: Partial<DuxThemeTokens> = {}) {
  const theme = resolveThemeTokens(tokens)
  const darkBackground = mixColor(DARK_CANVAS, theme.background, 0.06)
  const darkBackgroundTop = mixColor(DARK_BACKGROUND_TOP, theme.backgroundMuted, 0.06)
  const darkChrome = mixColor(DARK_CANVAS, theme.chrome, 0.09)
  const darkTabColor = mixColor(theme.neutral, '#ffffff', 0.4)

  return {
    light: {
      bgColor: theme.background,
      bgColorBottom: theme.background,
      bgColorTop: theme.backgroundMuted,
      bgTxtStyle: theme.navText === 'white' ? 'light' : 'dark',
      navBgColor: theme.navBackground,
      navTxtStyle: theme.navText,
      tabBgColor: theme.tabBackground,
      tabBorderStyle: 'black',
      tabFontColor: theme.tabColor,
      tabSelectedColor: theme.tabSelectedColor,
    },
    dark: {
      bgColor: darkBackground,
      bgColorBottom: darkBackground,
      bgColorTop: darkBackgroundTop,
      bgTxtStyle: 'light',
      navBgColor: darkChrome,
      navTxtStyle: 'white',
      tabBgColor: darkChrome,
      tabBorderStyle: 'white',
      tabFontColor: darkTabColor,
      tabSelectedColor: theme.tabSelectedColor,
    },
  }
}
