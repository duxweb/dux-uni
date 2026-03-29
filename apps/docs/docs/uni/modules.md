# 模块系统

`Dux Uni` 的模块系统目标很明确：模块处理模块自己的事情，全局只保留应用骨架。

## defineUniModule

```ts
const module = defineUniModule(options)
```

```ts
import { defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'orders',
  defaultLayout: 'default', // 当前模块页面的默认布局
})
```

## 模块入口能注册什么

```text
pages
layouts
defaultLayout
middlewares
hooks
listeners
actions
schema.components
config
register / init / boot
```

## register

```ts
register(context) {
  // 注册 hooks、listeners、schema components、中间件等
}
```

适合：

- 注册扩展点
- 注入模块事件
- 合并模块配置

## init

```ts
init(context) {
  // 做模块早期初始化
}
```

适合：

- 初始化模块依赖
- 准备运行时资源

## boot

```ts
boot(context) {
  // app.ready 后执行
}
```

适合：

- 建立全局 WebSocket
- 拉取模块基础数据
- 绑定跨模块事件

## defaultLayout

```ts
export default defineUniModule({
  name: 'feature',
  defaultLayout: 'home', // 模块内页面未写 layout 时默认使用 home
})
```

## middlewares

```ts
import { defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'auth',
  middlewares: [
    {
      name: 'auth',
      handler({ app }) {
        if (app.session.isAuthenticated()) {
          return
        }
        return '/pages/auth/login' // 未登录时跳登录页
      },
    },
  ],
})
```

## hooks 与 listeners

```ts
export default defineUniModule({
  name: 'account',
  register({ hooks, events }) {
    hooks.tap('auth.login.methods', () => ({
      name: 'weixin',
      label: '微信登录',
    }))

    events.on('auth:login-success', () => {
      console.log('refresh account module')
    })
  },
})
```

适合：

- 给其他模块提供扩展点
- 监听全局事件
- 注入模块间交互能力

## 模块里桥接命名 Socket

如果你的模块依赖某一条命名全局连接，推荐在模块入口里桥接成业务事件：

```ts
import { createSocketBridge, defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'chat',
  ...createSocketBridge({
    manager: 'chat',
    status: 'chat:socket-status',
    messages: {
      'chat.message': 'chat:message',
      'chat.typing': 'chat:typing',
    },
  }),
})
```

这样页面就不用感知底层连接名，而是直接监听：

```ts
useListener('chat:message', payload => {
  console.log(payload)
})
```

## config patch

```ts
export default defineUniModule({
  name: 'system',
  config() {
    return {
      permission: {
        redirectTo: '/pages/system/forbidden/index',
      },
    }
  },
})
```

## 继续阅读

- [开发应用](/guide/develop/module-entry)
- [扩展机制](/uni/extensibility)
