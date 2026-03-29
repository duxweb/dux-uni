import type { DuxRadiusTokens, DuxSpacingTokens, DuxThemeTokens } from '@duxweb/uni'
import { createUniTheme, defaultRadiusTokens, defaultSpacingTokens, defaultThemeTokens, mixColor, resolveThemeTokens } from '@duxweb/uni'

const LIGHT_CANVAS = '#ffffff'
const DARK_CANVAS = '#09090b'
const DARK_SURFACE = '#18181b'
const DARK_BACKGROUND_TOP = '#27272a'

function parseColor(input: string) {
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
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    }
  }

  return null
}

function toRgba(color: string, alpha: number) {
  const parsed = parseColor(color)

  if (!parsed) {
    return `rgba(15,23,42,${alpha})`
  }

  return `rgba(${parsed.r},${parsed.g},${parsed.b},${alpha})`
}

function createFixedScalePalette(color: string) {
  return {
    50: mixColor(color, '#ffffff', 0.92),
    100: mixColor(color, '#ffffff', 0.84),
    200: mixColor(color, '#ffffff', 0.72),
    300: mixColor(color, '#ffffff', 0.56),
    400: mixColor(color, '#ffffff', 0.28),
    500: color,
    600: mixColor(color, '#000000', 0.08),
    700: mixColor(color, '#000000', 0.16),
    800: mixColor(color, '#000000', 0.24),
    900: mixColor(color, '#000000', 0.34),
  }
}

function createColorSemanticValues(color: string, theme: 'light' | 'dark') {
  const lightenTarget = theme === 'dark' ? DARK_CANVAS : LIGHT_CANVAS
  const strengthenTarget = theme === 'dark' ? LIGHT_CANVAS : '#000000'

  return {
    DEFAULT: color,
    soft: mixColor(color, lightenTarget, theme === 'dark' ? 0.82 : 0.88),
    muted: mixColor(color, lightenTarget, theme === 'dark' ? 0.88 : 0.92),
    subtle: mixColor(color, lightenTarget, theme === 'dark' ? 0.92 : 0.95),
    faint: mixColor(color, lightenTarget, theme === 'dark' ? 0.95 : 0.97),
    active: mixColor(color, strengthenTarget, 0.12),
    strong: mixColor(color, strengthenTarget, 0.22),
    stronger: mixColor(color, strengthenTarget, 0.32),
    disabled: mixColor(color, lightenTarget, 0.64),
  }
}

function createNeutralSemanticValues(color: string, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    return {
      DEFAULT: mixColor(color, LIGHT_CANVAS, 0.18),
      soft: mixColor(color, DARK_CANVAS, 0.82),
      muted: mixColor(color, LIGHT_CANVAS, 0.08),
      subtle: mixColor(color, DARK_CANVAS, 0.52),
      faint: mixColor(color, DARK_CANVAS, 0.7),
      active: mixColor(color, LIGHT_CANVAS, 0.26),
      strong: mixColor(color, LIGHT_CANVAS, 0.34),
      stronger: mixColor(color, LIGHT_CANVAS, 0.48),
      disabled: mixColor(color, DARK_CANVAS, 0.42),
    }
  }

  return {
    DEFAULT: color,
    soft: mixColor(color, LIGHT_CANVAS, 0.92),
    muted: mixColor(color, LIGHT_CANVAS, 0.18),
    subtle: mixColor(color, LIGHT_CANVAS, 0.72),
    faint: mixColor(color, LIGHT_CANVAS, 0.84),
    active: mixColor(color, '#000000', 0.12),
    strong: mixColor(color, '#000000', 0.18),
    stronger: mixColor(color, '#000000', 0.28),
    disabled: mixColor(color, LIGHT_CANVAS, 0.46),
  }
}

function createBackgroundSemanticValues(base: string, muted: string, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    const darkBase = mixColor(DARK_CANVAS, base, 0.08)
    const darkMuted = mixColor(DARK_BACKGROUND_TOP, muted, 0.08)

    return {
      DEFAULT: darkBase,
      muted: darkMuted,
      soft: mixColor(darkMuted, LIGHT_CANVAS, 0.04),
      subtle: mixColor(darkMuted, LIGHT_CANVAS, 0.08),
      faint: mixColor(darkMuted, LIGHT_CANVAS, 0.12),
      active: mixColor(darkBase, LIGHT_CANVAS, 0.08),
      strong: mixColor(darkBase, LIGHT_CANVAS, 0.12),
      stronger: mixColor(darkBase, LIGHT_CANVAS, 0.18),
      disabled: mixColor(darkBase, LIGHT_CANVAS, 0.06),
    }
  }

  return {
    DEFAULT: base,
    muted,
    soft: mixColor(muted, LIGHT_CANVAS, 0.24),
    subtle: mixColor(muted, LIGHT_CANVAS, 0.4),
    faint: mixColor(muted, LIGHT_CANVAS, 0.56),
    active: mixColor(base, '#000000', 0.02),
    strong: mixColor(base, '#000000', 0.04),
    stronger: mixColor(base, '#000000', 0.08),
    disabled: mixColor(muted, LIGHT_CANVAS, 0.5),
  }
}

function createSurfaceSemanticValues(base: string, muted: string, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    const darkBase = mixColor(DARK_SURFACE, base, 0.08)
    const darkMuted = mixColor(darkBase, muted, 0.08)

    return {
      DEFAULT: darkBase,
      muted: darkMuted,
      soft: mixColor(darkMuted, LIGHT_CANVAS, 0.05),
      subtle: mixColor(darkMuted, LIGHT_CANVAS, 0.09),
      faint: mixColor(darkMuted, LIGHT_CANVAS, 0.14),
      active: mixColor(darkBase, LIGHT_CANVAS, 0.08),
      strong: mixColor(darkBase, LIGHT_CANVAS, 0.12),
      stronger: mixColor(darkBase, LIGHT_CANVAS, 0.18),
      disabled: mixColor(darkBase, LIGHT_CANVAS, 0.06),
    }
  }

  return {
    DEFAULT: base,
    muted,
    soft: mixColor(muted, LIGHT_CANVAS, 0.24),
    subtle: mixColor(muted, LIGHT_CANVAS, 0.4),
    faint: mixColor(muted, LIGHT_CANVAS, 0.56),
    active: mixColor(base, '#000000', 0.02),
    strong: mixColor(base, '#000000', 0.04),
    stronger: mixColor(base, '#000000', 0.08),
    disabled: mixColor(muted, LIGHT_CANVAS, 0.5),
  }
}

function createChromeSemanticValues(base: string, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    const darkBase = mixColor(DARK_CANVAS, base, 0.05)

    return {
      DEFAULT: darkBase,
      muted: mixColor(darkBase, LIGHT_CANVAS, 0.04),
      soft: mixColor(darkBase, LIGHT_CANVAS, 0.02),
      subtle: mixColor(darkBase, LIGHT_CANVAS, 0.08),
      faint: mixColor(darkBase, LIGHT_CANVAS, 0.12),
      active: mixColor(darkBase, LIGHT_CANVAS, 0.1),
      strong: mixColor(darkBase, LIGHT_CANVAS, 0.14),
      stronger: mixColor(darkBase, LIGHT_CANVAS, 0.2),
      disabled: mixColor(darkBase, LIGHT_CANVAS, 0.06),
    }
  }

  return {
    DEFAULT: base,
    muted: mixColor(base, '#000000', 0.02),
    soft: mixColor(base, '#000000', 0.01),
    subtle: mixColor(base, '#000000', 0.04),
    faint: mixColor(base, '#000000', 0.06),
    active: mixColor(base, '#000000', 0.02),
    strong: mixColor(base, '#000000', 0.04),
    stronger: mixColor(base, '#000000', 0.08),
    disabled: mixColor(base, LIGHT_CANVAS, 0.08),
  }
}

function createGlassSemanticValues(theme: 'light' | 'dark') {
  return theme === 'dark'
    ? {
        DEFAULT: 'rgba(255,255,255,0.14)',
        soft: 'rgba(255,255,255,0.1)',
        muted: 'rgba(255,255,255,0.12)',
        subtle: 'rgba(255,255,255,0.22)',
        faint: 'rgba(255,255,255,0.08)',
        active: 'rgba(255,255,255,0.18)',
        strong: 'rgba(255,255,255,0.22)',
        stronger: 'rgba(255,255,255,0.28)',
        disabled: 'rgba(255,255,255,0.06)',
      }
    : {
        DEFAULT: 'rgba(255,255,255,0.12)',
        soft: 'rgba(255,255,255,0.08)',
        muted: 'rgba(255,255,255,0.1)',
        subtle: 'rgba(255,255,255,0.2)',
        faint: 'rgba(255,255,255,0.06)',
        active: 'rgba(255,255,255,0.16)',
        strong: 'rgba(255,255,255,0.2)',
        stronger: 'rgba(255,255,255,0.26)',
        disabled: 'rgba(255,255,255,0.05)',
      }
}

function createInverseSemanticValues(theme: 'light' | 'dark') {
  return theme === 'dark'
    ? {
        DEFAULT: '#ffffff',
        soft: 'rgba(255,255,255,0.7)',
        muted: 'rgba(255,255,255,0.74)',
        subtle: 'rgba(255,255,255,0.82)',
        faint: 'rgba(255,255,255,0.64)',
        active: '#ffffff',
        strong: '#ffffff',
        stronger: '#ffffff',
        disabled: 'rgba(255,255,255,0.46)',
      }
    : {
        DEFAULT: '#ffffff',
        soft: 'rgba(255,255,255,0.68)',
        muted: 'rgba(255,255,255,0.72)',
        subtle: 'rgba(255,255,255,0.8)',
        faint: 'rgba(255,255,255,0.6)',
        active: '#ffffff',
        strong: '#ffffff',
        stronger: '#ffffff',
        disabled: 'rgba(255,255,255,0.42)',
      }
}

function createVarPalette(name: string, fixedBase: string) {
  return {
    DEFAULT: `var(--dux-color-${name})`,
    soft: `var(--dux-color-${name}-soft)`,
    muted: `var(--dux-color-${name}-muted)`,
    subtle: `var(--dux-color-${name}-subtle)`,
    faint: `var(--dux-color-${name}-faint)`,
    active: `var(--dux-color-${name}-active)`,
    strong: `var(--dux-color-${name}-strong)`,
    stronger: `var(--dux-color-${name}-stronger)`,
    disabled: `var(--dux-color-${name}-disabled)`,
    ...createFixedScalePalette(fixedBase),
  }
}

function createVarOnlyPalette(name: string) {
  return {
    DEFAULT: `var(--dux-color-${name})`,
    soft: `var(--dux-color-${name}-soft)`,
    muted: `var(--dux-color-${name}-muted)`,
    subtle: `var(--dux-color-${name}-subtle)`,
    faint: `var(--dux-color-${name}-faint)`,
    active: `var(--dux-color-${name}-active)`,
    strong: `var(--dux-color-${name}-strong)`,
    stronger: `var(--dux-color-${name}-stronger)`,
    disabled: `var(--dux-color-${name}-disabled)`,
  }
}

function toCssVars(prefix: string, values: Record<string, string>) {
  return Object.entries(values).reduce<Record<string, string>>((output, [key, value]) => {
    const suffix = key === 'DEFAULT' ? '' : `-${key}`
    output[`--dux-color-${prefix}${suffix}`] = value
    return output
  }, {})
}

function createShadowVars(primary: string, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    return {
      '--dux-shadow-card': '0 12rpx 28rpx rgba(0,0,0,0.24)',
      '--dux-shadow-card-strong': '0 18rpx 40rpx rgba(0,0,0,0.32)',
      '--dux-shadow-floating': '0 24rpx 56rpx rgba(0,0,0,0.38)',
      '--dux-shadow-navbar': '0 8rpx 20rpx rgba(0,0,0,0.18)',
    }
  }

  return {
    '--dux-shadow-card': '0 12rpx 30rpx rgba(15,23,42,0.06)',
    '--dux-shadow-card-strong': `0 16rpx 40rpx ${toRgba(primary, 0.1)}`,
    '--dux-shadow-floating': '0 24rpx 60rpx rgba(15,23,42,0.12)',
    '--dux-shadow-navbar': '0 8rpx 18rpx rgba(15,23,42,0.05)',
  }
}

export function createWotThemeVars(tokens: Partial<DuxThemeTokens> = {}, theme: 'light' | 'dark' = 'light') {
  const nextTokens = resolveThemeTokens(tokens)
  const neutralScale = createFixedScalePalette(nextTokens.neutral)
  const backgroundValues = createBackgroundSemanticValues(nextTokens.background, nextTokens.backgroundMuted, theme)
  const chromeValues = createChromeSemanticValues(nextTokens.chrome, theme)
  const surfaceValues = createSurfaceSemanticValues(nextTokens.surface, nextTokens.surfaceMuted, theme)
  const inverseValues = createInverseSemanticValues(theme)
  const navBackground = theme === 'dark' ? chromeValues.DEFAULT : nextTokens.navBackground
  const navColor = theme === 'dark' ? inverseValues.DEFAULT : nextTokens.text
  const secondaryColor = theme === 'dark' ? inverseValues.muted : nextTokens.textSecondary
  const aidColor = theme === 'dark' ? inverseValues.faint : neutralScale[500]
  const tipColor = theme === 'dark' ? inverseValues.disabled : neutralScale[400]
  const borderColor = theme === 'dark' ? mixColor(surfaceValues.DEFAULT, '#ffffff', 0.12) : nextTokens.border
  const borderLightColor = theme === 'dark' ? mixColor(surfaceValues.DEFAULT, '#ffffff', 0.08) : mixColor(nextTokens.border, '#ffffff', 0.28)
  const tabColor = theme === 'dark' ? mixColor(nextTokens.neutral, '#ffffff', 0.4) : nextTokens.tabColor
  const darkBackground = createBackgroundSemanticValues(nextTokens.background, nextTokens.backgroundMuted, 'dark')
  const darkSurface = createSurfaceSemanticValues(nextTokens.surface, nextTokens.surfaceMuted, 'dark')

  return {
    colorTheme: nextTokens.primary,
    colorSuccess: nextTokens.success,
    colorWarning: nextTokens.warning,
    colorDanger: nextTokens.danger,
    colorInfo: nextTokens.info,
    colorBlue: nextTokens.info,
    colorYellow: nextTokens.warning,
    buttonPrimaryBgColor: nextTokens.primary,
    buttonPrimaryBorderColor: nextTokens.primary,
    buttonPrimaryColor: '#ffffff',
    fabTriggerBgColor: nextTokens.primary,
    colorGray1: neutralScale[50],
    colorGray2: neutralScale[100],
    colorGray3: neutralScale[200],
    colorGray4: neutralScale[300],
    colorGray5: neutralScale[400],
    colorGray6: neutralScale[500],
    colorGray7: neutralScale[700],
    colorGray8: neutralScale[900],
    fontGray1: theme === 'dark' ? inverseValues.DEFAULT : nextTokens.text,
    fontGray2: secondaryColor,
    fontGray3: aidColor,
    fontGray4: tipColor,
    colorTitle: theme === 'dark' ? inverseValues.DEFAULT : nextTokens.text,
    colorContent: theme === 'dark' ? inverseValues.subtle : nextTokens.text,
    colorSecondary: secondaryColor,
    colorAid: aidColor,
    colorTip: tipColor,
    colorBorder: borderColor,
    colorBorderLight: borderLightColor,
    colorBg: theme === 'dark' ? darkBackground.muted : nextTokens.backgroundMuted,
    darkBackground: chromeValues.DEFAULT,
    darkBackground2: darkBackground.DEFAULT,
    darkBackground3: chromeValues.muted,
    darkBackground4: darkBackground.muted,
    darkBackground5: darkSurface.strong,
    darkBackground6: mixColor(nextTokens.danger, darkBackground.DEFAULT, 0.78),
    darkBackground7: darkSurface.stronger,
    darkColor: inverseValues.DEFAULT,
    darkColor2: mixColor(nextTokens.danger, '#ffffff', 0.18),
    darkColor3: inverseValues.subtle,
    darkColorGray: inverseValues.muted,
    darkBorderColor: mixColor(darkSurface.DEFAULT, '#ffffff', 0.12),
    colorIcon: theme === 'dark' ? inverseValues.muted : neutralScale[400],
    colorIconActive: theme === 'dark' ? inverseValues.DEFAULT : nextTokens.text,
    colorIconDisabled: theme === 'dark' ? inverseValues.disabled : neutralScale[300],
    navbarBackground: navBackground,
    navbarColor: navColor,
    navbarDescFontColor: secondaryColor,
    tabsLineColor: nextTokens.primary,
    tabbarBoxShadow: theme === 'dark' ? 'none' : 'var(--dux-shadow-card)',
    tabbarInactiveColor: tabColor,
    tabbarActiveColor: nextTokens.tabSelectedColor,
  }
}

export function createUnoThemeVars(tokens: Partial<DuxThemeTokens> = {}, theme: 'light' | 'dark' = 'light') {
  const nextTokens = resolveThemeTokens(tokens)

  return {
    ...createShadowVars(nextTokens.primary, theme),
    ...toCssVars('primary', createColorSemanticValues(nextTokens.primary, theme)),
    ...toCssVars('accent', createColorSemanticValues(nextTokens.primary, theme)),
    ...toCssVars('info', createColorSemanticValues(nextTokens.info, theme)),
    ...toCssVars('success', createColorSemanticValues(nextTokens.success, theme)),
    ...toCssVars('warning', createColorSemanticValues(nextTokens.warning, theme)),
    ...toCssVars('danger', createColorSemanticValues(nextTokens.danger, theme)),
    ...toCssVars('error', createColorSemanticValues(nextTokens.danger, theme)),
    ...toCssVars('neutral', createNeutralSemanticValues(nextTokens.neutral, theme)),
    ...toCssVars('background', createBackgroundSemanticValues(nextTokens.background, nextTokens.backgroundMuted, theme)),
    ...toCssVars('chrome', createChromeSemanticValues(nextTokens.chrome, theme)),
    ...toCssVars('surface', createSurfaceSemanticValues(nextTokens.surface, nextTokens.surfaceMuted, theme)),
    ...toCssVars('glass', createGlassSemanticValues(theme)),
    ...toCssVars('inverse', createInverseSemanticValues(theme)),
  }
}

export function createUnoTheme(tokens: Partial<DuxThemeTokens> = {}, radius: Partial<DuxRadiusTokens> = {}, spacing: Partial<DuxSpacingTokens> = {}) {
  const nextTokens = resolveThemeTokens(tokens)
  const nextRadius = {
    ...defaultRadiusTokens,
    ...radius,
  }
  const nextSpacing = {
    ...defaultSpacingTokens,
    ...spacing,
  }

  return {
    colors: {
      primary: createVarPalette('primary', nextTokens.primary),
      accent: createVarPalette('accent', nextTokens.primary),
      info: createVarPalette('info', nextTokens.info),
      success: createVarPalette('success', nextTokens.success),
      warning: createVarPalette('warning', nextTokens.warning),
      danger: createVarPalette('danger', nextTokens.danger),
      error: createVarPalette('error', nextTokens.danger),
      neutral: createVarPalette('neutral', nextTokens.neutral),
      background: createVarOnlyPalette('background'),
      chrome: createVarOnlyPalette('chrome'),
      surface: createVarOnlyPalette('surface'),
      glass: createVarOnlyPalette('glass'),
      inverse: createVarOnlyPalette('inverse'),
      white: '#ffffff',
      black: '#000000',
    },
    borderRadius: {
      card: nextRadius.card,
      button: nextRadius.button,
      shell: nextRadius.shell,
    },
    boxShadow: {
      card: 'var(--dux-shadow-card)',
      'card-strong': 'var(--dux-shadow-card-strong)',
      floating: 'var(--dux-shadow-floating)',
      navbar: 'var(--dux-shadow-navbar)',
    },
    spacing: {
      page: nextSpacing.page,
      section: nextSpacing.section,
      gap: nextSpacing.gap,
      'bottom-inset': nextSpacing.bottomInset,
    },
  }
}

export { createUniTheme, defaultRadiusTokens, defaultSpacingTokens, defaultThemeTokens }
