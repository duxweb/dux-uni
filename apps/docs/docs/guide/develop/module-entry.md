# 模块入口与生命周期

模块入口的目标只有一个：让模块自己注册模块自己的能力。

## 模块入口最小示例

```ts
import { defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'orders',
  defaultLayout: 'default', // 当前模块页面的默认布局
})
```

## index.ts 适合放什么

```text
middlewares      # 模块自己的中间件
hooks            # 扩展点注册
listeners        # 全局事件监听
actions          # 运行时 action
schema.components# schema 可渲染组件
config           # 模块补充的配置片段
init/register/boot
```

## 生命周期怎么理解

### register

```ts
register({ app, hooks, events }) {
  // 注册 hooks、listeners、schema 组件、中间件等
}
```

适合做：

- 注册能力
- 补模块扩展点
- 合并模块配置

### init

```ts
init({ app }) {
  // 做模块早期初始化
}
```

适合做：

- 准备模块运行时依赖
- 初始化模块资源

### boot

```ts
boot({ app }) {
  // App ready 后执行
}
```

适合做：

- 连接实时服务
- 拉取基础数据
- 绑定跨模块事件

## 一个带中间件的示例

```ts
import { defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'orders',
  middlewares: [
    {
      name: 'tenant-ready',
      handler({ app }) {
        if (app.session.isAuthenticated()) {
          return
        }
        return '/pages/auth/login'
      },
    },
  ],
})
```

## 一个带命名 Socket 的模块示例

这个场景很常见：

```text
应用在 dux.ts 里声明 sockets.chat
chat 模块负责桥接 chat 连接里的消息
页面只订阅业务事件，不自己管理长连接
```

模块入口可以这样写：

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
  boot({ app }) {
    // 如果 dux.ts 里已经配置了 connectOnLogin，
    // 这里通常不需要再手动 connect。
    app.sockets.chat?.subscribe('chat.message', message => {
      console.log('chat 模块收到消息', message.data)
    })
  },
})
```

页面里就可以只消费业务事件：

```ts
import { useListener, useSocketManager } from '@duxweb/uni'

const chatSocket = useSocketManager('chat')

useListener('chat:message', payload => {
  console.log('消费桥接后的业务消息', payload)
})

chatSocket.sendJson({
  event: 'chat.message',
  data: {
    text: 'hello',
  },
})
```

## 继续阅读

- [模块系统](/uni/modules)
- [扩展机制](/uni/extensibility)
