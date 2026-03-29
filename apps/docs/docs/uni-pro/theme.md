# 主题与 Token

`@duxweb/uni-pro` 的主题层负责把 `@duxweb/uni` 的语义 token 映射到 Wot UI、UnoCSS 和 uni 原生主题。

目标不是“分别改三套颜色”，而是只维护一套 `dux.config.ts` token，然后同步驱动：

- Wot UI 组件
- UnoCSS 语义类名
- uni 原生 `theme.json`

## createWotThemeVars

```ts
const themeVars = createWotThemeVars(tokens)
```

```ts
import { createWotThemeVars } from '@duxweb/uni-pro'

const themeVars = createWotThemeVars({
  primary: '#059669', // 主色
  success: '#16a34a', // 成功色
  neutral: '#71717a', // 中性色基底
})
```

适合：

- `wd-config-provider`
- Wot UI 全局主题统一

## createUnoTheme

```ts
const theme = createUnoTheme(tokens)
```

```ts
import { createUnoTheme } from '@duxweb/uni-pro'

const theme = createUnoTheme({
  primary: '#059669',
})
```

输出主要包含：

```text
colors
borderRadius
spacing
```

## createUniTheme

```ts
const theme = createUniTheme(tokens)
```

它来自 `@duxweb/uni`，也会从 `@duxweb/uni-pro` 透出，适合作为统一的基础主题对象。

## defaultThemeTokens

```ts
import { defaultThemeTokens } from '@duxweb/uni-pro'
```

作用：

- 提供颜色相关默认值
- 作为业务自定义 token 的起点

## defaultRadiusTokens

```ts
import { defaultRadiusTokens } from '@duxweb/uni-pro'
```

作用：

- 提供圆角相关默认值
- 统一页面和组件的圆角语义

## defaultSpacingTokens

```ts
import { defaultSpacingTokens } from '@duxweb/uni-pro'
```

作用：

- 提供间距相关默认值
- 统一 UnoCSS 与 UI 组件的 spacing 语义

## 推荐接入方式

推荐把颜色都收口到 `src/dux.config.ts`：

```ts
ui: {
  theme: 'light',
  darkmode: true,
  tokens: {
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
  },
}
```

语义建议：

- `primary`
  品牌主色
- `neutral`
  中性色基底，推荐用 `zinc`
- `background`
  页面底色
- `chrome`
  `navbar / tabbar` 专用层
- `surface`
  卡片、弹层、分组容器

层级建议：

- 浅色：`background < chrome = surface`
- 深色：`background < chrome < surface`

也就是深色模式下，`header/tabbar` 应该单独占一层，不要和页面背景或卡片共用同一个色块。

```vue
<script setup lang="ts">
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
</script>

<template>
  <DuxRoot
    theme="light"
    :tokens="{
      primary: '#059669',
      chrome: '#ffffff',
      surface: '#ffffff',
    }"
  >
    <slot />
  </DuxRoot>
</template>
```

配好之后，页面里优先用语义类名，不要再写硬编码色值：

- `bg-background`
- `bg-chrome`
- `bg-surface`
- `text-primary`
- `text-neutral`
- `text-neutral-muted`

目标很简单：

- Wot UI 不突兀
- UnoCSS 不突兀
- 业务模块共享同一套 token 语义
