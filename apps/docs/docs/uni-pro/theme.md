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
  theme: 'auto',
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

## 主题模式切换

`@duxweb/uni` 现在内置了主题偏好 store，不需要再在业务项目里自己维护一套“系统 / 浅色 / 深色”底层状态。

常用入口：

- `useThemeStore()`
- `useThemePreference()`

推荐约定：

- `ui.theme = 'auto'`
  作为默认值，表示跟随系统
- `ui.theme = 'light'`
  固定浅色，不跟随系统
- `ui.theme = 'dark'`
  固定深色，不跟随系统

推荐页面里直接使用 `useThemePreference()`：

```ts
import { useThemePreference } from '@duxweb/uni'

const {
  themePreference,
  canSetThemePreference,
  systemTheme,
  currentTheme,
  setThemePreference,
  cycleThemePreference,
} = useThemePreference()
```

它只提供主题值和动作：

- `themePreference`
  用户当前设置的模式：`system / light / dark`
- `canSetThemePreference`
  当前平台是否支持手动切换应用主题。不支持时应只展示“跟随系统”。
- `systemTheme`
  当前设备探测到的系统模式：`light / dark`
- `currentTheme`
  实际生效的主题值：`light / dark`
- `setThemePreference(mode)`
  显式设置主题模式
- `cycleThemePreference()`
  在三种模式间循环切换

注意：

- 这个 composable 不返回业务文案
- 类似“跟随系统（深色）”这种 label，建议由页面自己计算

页面里最常见的接法：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useThemePreference } from '@duxweb/uni'

const { themePreference, systemTheme, currentTheme, cycleThemePreference } = useThemePreference()

const themePreferenceLabel = computed(() => {
  if (themePreference.value === 'system') {
    return `跟随系统 (${systemTheme.value === 'dark' ? '深色' : '浅色'})`
  }
  return themePreference.value === 'dark' ? '深色模式' : '浅色模式'
})
</script>

<template>
  <view>
    <text>当前主题：{{ currentTheme }}</text>
    <text>当前模式：{{ themePreferenceLabel }}</text>
    <wd-button @click="cycleThemePreference">
      切换主题
    </wd-button>
  </view>
</template>
```

## 运行时接入

如果你使用的是：

- `defineDuxConfig()`
- `resolveDuxConfig()`
- `createUni()`

那么主题运行时现在会自动接入，不需要在业务里手写 `themeRuntime`。

也就是这类项目只要配置好：

```ts
ui: {
  theme: 'auto',
  tokens: {
    primary: '#059669',
    neutral: '#71717a',
    background: '#fafafa',
    chrome: '#ffffff',
    surface: '#ffffff',
  },
}
```

`resolveDuxConfig()` 会自动把 `ui.tokens` 注入到运行时主题配置，并默认接上：

- 系统主题初始值同步
- `uni.onThemeChange`
- `uni.setNavigationBarColor()`
- `uni.setBackgroundColor()`
- `useThemeStore()` 的默认桥接

所以 starter 这类标准项目里，`dux.ts` 不需要再额外写：

```ts
themeRuntime: {
  // 不需要手写
}
```

只有在完全裸用 `defineUniConfig()` / `createUni()`、并且不走 `dux.config.ts` 这条链路时，才需要自己显式配置 `themeRuntime`。

裸 runtime 的手动写法仍然是：

```ts
createUni(defineUniConfig({
  themeRuntime: {
    tokens,
  },
}))
```

这样分层会更清晰：

- `dux.config.ts`
  负责 token 和默认主题模式
- `resolveDuxConfig()`
  负责自动注入主题运行时
- `useThemeStore()`
  负责主题模式偏好
- 页面组件
  只负责显示和交互
