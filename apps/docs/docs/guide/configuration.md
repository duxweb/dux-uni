# 应用配置

`src/dux.config.ts` 是应用级配置入口。

## 基础写法

```ts
import { defineDuxConfig } from '@duxweb/uni'
import { duxModules } from './runtime/generated/modules'

export default defineDuxConfig({
  app: {
    name: 'template',
    title: 'Dux Uni Template',
    description: 'Dux Uni 模块化模板',
  },
  router: {
    home: 'home.index',
    login: '/pages/auth/login',
    tabBar: ['home', 'account'],
  },
  ui: {
    theme: 'auto',
  },
  runtime: {
    storageKey: 'template-session',
  },
  extraPages: [],
  modules: duxModules,
})
```

## app

```ts
app: {
  name: 'template', // 应用唯一标识
  title: 'Dux Uni Template', // 默认标题
  description: 'Dux Uni 模块化模板', // 应用说明
}
```

## router

```ts
router: {
  home: 'home.index', // 首页
  login: 'auth.login', // 登录页
  tabBar: ['home', 'account'], // 一级 tabBar 模块
  tabBarMode: 'auto', // auto / native / custom
  tabBarRenderer: 'auto', // auto / native / custom
}
```

- `tabBarMode`
  决定底层导航是走 `switchTab` 还是 `reLaunch`
- `tabBarRenderer`
  决定界面上显示原生 tabbar 还是业务自定义 tabbar
- 推荐移动端一级导航使用 `tabBarMode: 'native'`，如果需要自定义外观，再配 `tabBarRenderer: 'custom'`

推荐优先写页面名：

```ts
router: {
  home: 'home.index',
  login: 'auth.login',
}
```

## ui

```ts
ui: {
  library: 'wot',
  theme: 'auto',
  tokens: {
    primary: '#059669',
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

这里不承载业务 UI 代码，只承载应用视觉层默认配置。

`ui.theme` 语义：

- `auto`
  默认跟随系统
- `light`
  固定浅色
- `dark`
  固定深色

推荐优先维护语义 token，而不是直接在页面里散写十六进制颜色。

常用分层：

- `background`
  页面底色
- `chrome`
  `navbar / tabbar`
- `surface`
  卡片、弹层、内容容器

如果没有显式覆盖，`navBackground` 和 `tabBackground` 默认会跟随 `chrome`。

## runtime

```ts
runtime: {
  apiBaseURL: 'https://api.example.com',
  storageKey: 'template-session',
}
```

常见内容：

```text
apiBaseURL
storageKey
request
query
permission
themeRuntime
```

### runtime.storageKey

```ts
runtime: {
  storageKey: 'crm-auth',
}
```

它本质上只是一个你自己定义的字符串 key，用来保存当前应用的会话数据。

推荐原则：

```text
固定
唯一
能看出属于哪个应用
```

### runtime.request

```ts
runtime: {
  request: {
    getHeaders: () => ({
      'X-App': 'template',
    }),
    sign: async request => {
      const ts = String(Date.now())
      return {
        query: {
          ...(request.query || {}),
          ts,
        },
        headers: {
          ...(request.headers || {}),
          'X-Timestamp': ts,
        },
      }
    },
  },
}
```

常用字段：

```text
adapter
baseURL
timeout
getHeaders
sign
onRequest
onResponse
onError
```

### runtime.themeRuntime

如果应用支持浅色 / 深色 / 跟随系统，并且希望切换时 uni 原生导航栏与页面背景同步变化，可以配置 `themeRuntime`。

但要注意：

- 走 `defineDuxConfig() + resolveDuxConfig()` 的标准项目，通常不需要自己手写这一段
- 只要走 `defineDuxConfig() + resolveDuxConfig()`，运行时就会自动注入默认的 `themeRuntime`
- 只有裸用 `defineUniConfig()` / `createUni()` 时，才更常需要手动配置

标准项目等价于自动生成：

```ts
runtime: {
  themeRuntime: {
    tokens: ui.tokens,
  },
}
```

并默认桥接 `useThemeStore()`。

```ts
import { defineUniConfig, useThemeStore } from '@duxweb/uni'
import type { Pinia } from 'pinia'

defineUniConfig({
  themeRuntime: {
    tokens: config.ui.tokens,
    getTheme(context) {
      return useThemeStore(context.pinia as Pinia).resolvedTheme
    },
    onSystemThemeChange(theme, context) {
      useThemeStore(context.pinia as Pinia).setSystemTheme(theme)
    },
  },
})
```

作用：

- 用 `tokens` 生成 uni 原生主题色
- 根据 `getTheme()` 返回值同步当前生效主题
- 系统主题变化时，通过 `onSystemThemeChange()` 回写到主题 store

如果你没有自定义需求，建议不要覆盖这段默认行为。

推荐职责划分：

- `ui.tokens`
  管理颜色 token
- `themeRuntime`
  管理原生主题同步
- `useThemeStore()`
  管理主题偏好状态

如果只是静态主题，不需要切换，也可以不配置这一段。

## extraPages

```ts
extraPages: []
```

适合：

```text
特殊平台页
临时兼容页
不走模块扫描的补充页
```

## modules

```ts
import { duxModules } from './runtime/generated/modules'

modules: duxModules
```

真实模块代码仍然写在：

```text
src/modules/*/index.ts
```

## 它和 uni-app 配置的关系

`dux.config.ts` 不是替代 uni-app 全部配置，而是你自己的应用架构层。

它会进一步生成：

```text
页面清单
路由 manifest
tabBar 配置
globalStyle
```
