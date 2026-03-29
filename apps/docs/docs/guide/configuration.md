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
    theme: 'light',
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
}
```

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
  theme: 'light',
  darkmode: true,
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
