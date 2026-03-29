# 初始化配置

`dux.ts` 是应用真正被创建出来的地方。

## 最小写法

```ts
import { createUni, defineUniConfig, resolveDuxConfig } from '@duxweb/uni'
import duxConfig from './dux.config'
import { routerManifest } from './runtime/router/manifest'

const config = resolveDuxConfig(duxConfig)

export const dux = createUni(defineUniConfig({
  ...config.runtime,
  appName: config.app.name, // 应用名
  tabBarMode: routerManifest.config.router.tabBarMode, // 当前 tabBar 模式
  pages: routerManifest.pages, // 最终页面清单
  modules: config.modules, // 当前模块列表
}))
```

## 这里主要负责什么

```text
读取 dux.config.ts
注入自动生成的页面和 manifest
注入扫描后的模块
创建 createUni() 应用实例
挂接应用级能力
```

## request

```ts
request: {
  getHeaders: () => ({
    'X-App': config.app.name, // 每次请求带应用标识
  }),
  sign: async request => {
    const ts = String(Date.now())

    return {
      query: {
        ...(request.query || {}),
        ts, // 给 query 追加时间戳
      },
    }
  },
}
```

这里适合接：

```text
header
sign
adapter
错误拦截
```

继续看：[请求配置](/uni/request)

## authProvider

```ts
import { simpleAuthProvider } from '@duxweb/uni'

authProvider: simpleAuthProvider({
  path: {
    login: '/login',
    check: '/check',
    logout: '/logout',
  },
  method: {
    login: 'POST',
    check: 'GET',
    logout: 'POST',
  },
  route: {
    login: '/pages/auth/login',
    index: '/pages/home/index',
  },
})
```

继续看：[认证与会话](/uni/auth)

## auth

```ts
auth: {
  autoCheckOnLaunch: true, // 默认 true，启动时自动校验
  autoCheckOnShow: true, // 默认 true，回前台时自动校验
  checkTtl: 300000, // 默认 5 分钟，前台校验节流时间
  path: '/passport/check', // 可选，覆盖默认 check 接口
  method: 'POST', // 可选，覆盖默认 check 方法
}
```

适合：

```text
希望启动时自动恢复登录态
希望 App 回前台时自动校验会话
不想在页面或模块里手动写 useCheck()
```

默认行为是：

```text
本地有 token 时，launch 自动 check
回前台且超过 checkTtl 时，show 自动 check
login 成功后不额外重复 check
```

## dataProvider

```ts
import { simpleDataProvider } from '@duxweb/uni'

dataProvider: simpleDataProvider({
  apiUrl: '/api', // 统一 API 前缀
})
```

继续看：[数据查询](/uni/data)

## permission

```ts
permission: {
  redirectTo: '/pages/system/forbidden/index', // 无权限时跳转到统一页面
}
```

它会和页面里的：

```json
{
  "auth": true,
  "permission": "orders.read"
}
```

一起工作。

## socket

```ts
socket: {
  url: 'wss://example.com/ws',
  auth: true, // 连接时自动带认证 token
  connectOnLaunch: false, // 应用启动时不自动连接
  connectOnLogin: true, // 登录成功后自动连接
  disconnectOnLogout: true, // 退出登录时自动断开
  keepAliveOnHide: true, // 应用切到后台时保持连接
}
```

```ts
sockets: {
  chat: {
    url: 'wss://example.com/ws/chat',
    auth: true,
    connectOnLogin: true,
  },
  notice: {
    url: 'wss://example.com/ws/notice',
    auth: true,
    connectOnLaunch: true,
  },
}
```

适合：

```text
客服
通知
消息流
全局在线状态
```

如果你的业务是“登录后再建立全局长连接”，这就是推荐配置。

这里的 `socket` 是：

```text
应用默认的那一条全局 WebSocket 连接配置
```

这里的 `sockets` 是：

```text
应用里的命名全局 WebSocket 连接集合
```

如果你有多条 WebSocket：

```text
默认主连接        => 放在 socket 里统一管理
命名全局连接      => 放在 sockets.xxx 里统一管理
页面局部连接      => 用 useSocket()
```

这样页面里通常只需要：

```ts
import { useSocketManager } from '@duxweb/uni'

const manager = useSocketManager()

manager.sendJson({
  event: 'chat.message',
  data: {
    text: 'hello',
  },
})
```

命名全局连接则可以这样读：

```ts
import { useSocketManager } from '@duxweb/uni'

const chatSocket = useSocketManager('chat')

chatSocket.sendJson({
  event: 'chat.message',
  data: {
    text: 'hello',
  },
})
```

其他页面再通过：

```ts
manager.subscribe('chat.message', handler)
```

或者：

```ts
useListener('socket:chat.message', handler)
```

来消费消息即可。

如果监听的是命名全局连接，则事件名会变成：

```ts
useListener('socket:chat:message', handler)
useListener('socket:chat:chat.message', handler)
```

## 一条默认连接加两条命名连接的完整示例

```ts
import {
  createUni,
  defineUniConfig,
  resolveDuxConfig,
  simpleAuthProvider,
  simpleDataProvider,
} from '@duxweb/uni'
import duxConfig from './dux.config'
import { routerManifest } from './runtime/router/manifest'

const config = resolveDuxConfig(duxConfig)

export const dux = createUni(defineUniConfig({
  ...config.runtime,
  appName: config.app.name,
  tabBarMode: routerManifest.config.router.tabBarMode,
  pages: routerManifest.pages,
  modules: config.modules,
  authProvider: simpleAuthProvider({
    path: {
      login: '/login',
      check: '/check',
      logout: '/logout',
    },
  }),
  dataProvider: simpleDataProvider({
    apiUrl: '/api',
  }),
  socket: {
    url: 'wss://example.com/ws/main',
    auth: true,
    connectOnLogin: true,
  },
  sockets: {
    chat: {
      url: 'wss://example.com/ws/chat',
      auth: true,
      connectOnLogin: true,
    },
    notice: {
      url: 'wss://example.com/ws/notice',
      auth: true,
      connectOnLaunch: true,
    },
  },
}))
```

推荐职责拆分：

```text
socket            => 主业务连接、默认通知
sockets.chat      => 聊天、客服、IM
sockets.notice    => 系统推送、公告流
```

## storage / storageKey

```ts
runtime: {
  storageKey: 'my-app-session', // 自定义本地会话 key
}
```

如果你要换底层存储实现，也是在这里接 `storage`。

## 一份完整示例

```ts
import {
  createUni,
  defineUniConfig,
  resolveDuxConfig,
  simpleAuthProvider,
  simpleDataProvider,
} from '@duxweb/uni'
import duxConfig from './dux.config'
import { routerManifest } from './runtime/router/manifest'

const config = resolveDuxConfig(duxConfig)

export const dux = createUni(defineUniConfig({
  ...config.runtime,
  appName: config.app.name,
  tabBarMode: routerManifest.config.router.tabBarMode,
  pages: routerManifest.pages,
  modules: config.modules,
  request: {
    getHeaders: () => ({
      'X-App': config.app.name,
    }),
  },
  authProvider: simpleAuthProvider({
    path: {
      login: '/login',
      check: '/check',
      logout: '/logout',
    },
  }),
  dataProvider: simpleDataProvider({
    apiUrl: '/api',
  }),
  permission: {
    redirectTo: '/pages/system/forbidden/index',
  },
  socket: {
    url: 'wss://example.com/ws',
    auth: true,
  },
}))
```

## 不要把什么放进来

```text
页面组件代码
模块内部业务逻辑
模块自己的监听器和中间件
页面级表单逻辑
```

这些应该回到：

```text
src/modules/*
页面里的 Hook
模块 index.ts
```
