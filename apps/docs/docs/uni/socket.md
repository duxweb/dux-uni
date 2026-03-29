# Socket

`@duxweb/uni` 里的 WebSocket 能力分成两层：

```text
useSocket()            => 页面级或局部级连接
useSocketManager()     => 全局连接
```

## useSocket

用于建立页面级或局部级 WebSocket 连接，适合聊天、客服、局部实时状态同步。

```ts
const socket = useSocket<Data>(url, options?)
```

### 最小连接示例

```ts
import { useSocket } from '@duxweb/uni'

const socket = useSocket<{ type?: string; payload?: unknown }>('wss://example.com/ws', {
  auth: true, // 自动带当前登录 token
})
```

### 如何打开和关闭连接

```ts
socket.open()
socket.close()
```

### 如何发送消息

```ts
socket.send('ping')

socket.sendJson({
  type: 'ping',
  payload: {
    ts: Date.now(),
  },
})
```

### 如何接收消息

`useSocket()` 会把收到的最新消息放到 `socket.data` 里。

```ts
import { watch } from 'vue'

watch(socket.data, message => {
  if (!message) {
    return
  }

  console.log('收到消息', message)
})
```

也可以在建立连接时直接用 `onMessage`：

```ts
const socket = useSocket('wss://example.com/ws', {
  onMessage(_task, result) {
    console.log('原始消息', result.data)
  },
})
```

### 如何读取连接状态

```ts
socket.status.value
socket.isOpen.value
socket.isConnecting.value
socket.isClosed.value
socket.task.value
```

### 它返回什么

```text
data
status
isOpen
isConnecting
isClosed
open()
close()
send()
sendJson()
task
```

### 和事件总线的关系

`useSocket()` 还会往全局事件总线发这些事件：

```text
socket:open
socket:close
socket:error
socket:message
```

如果你想在别处统一监听，也可以这样写：

```ts
import { useListener } from '@duxweb/uni'

useListener('socket:message', payload => {
  console.log('收到页面级 socket 消息', payload)
})
```

## useSocketManager

用于读取全局 WebSocket 管理器。

```ts
const manager = useSocketManager()
```

如果你已经配置了命名全局连接，也可以直接按名称读取：

```ts
const chatSocket = useSocketManager('chat')
const noticeSocket = useSocketManager('notice')
```

### 什么时候用它

```text
客服系统
IM
全局通知
在线状态同步
```

### 全局连接应该放哪里

推荐做法是：

```text
把连接动作放在模块入口、应用启动链路或登录成功链路
页面里只负责订阅消息、读取状态、发送消息
```

不推荐每个页面都各自调用 `manager.connect()`，因为那样容易：

```text
重复连接
互相覆盖状态
让谁负责断线重连变得混乱
```

### 默认连接和命名连接

现在内建支持两层：

```text
socket                    => 默认全局连接
sockets.chat / notice     => 命名全局连接
```

对应地：

```text
useSocketManager()           => 读取默认全局连接
useSocketManager('chat')     => 读取 chat 全局连接
useSocketManager('notice')   => 读取 notice 全局连接
```

### 如果业务里有多个 WebSocket 怎么办

推荐按下面的方式拆分：

```text
默认主连接           => 用 dux.ts 里的 socket + useSocketManager()
命名全局业务连接     => 用 dux.ts 里的 sockets.xxx + useSocketManager('xxx')
页面或局部连接       => 用 useSocket()
```

这样边界会比较清晰：

```text
客服主通道、全局通知、在线状态   => 走默认全局连接
聊天、消息中心、协同编辑         => 走命名全局连接
某个页面独有的局部实时能力       => 走页面级 useSocket()
```

如果你的应用里没有“默认主连接”这个概念，也可以不配 `socket`，只配 `sockets`。

### 登录后自动连接

如果你的全局长连接应该在“用户登录之后”再建立，最简单的方式就是在 `dux.ts` 里配置：

```ts
socket: {
  url: 'wss://example.com/ws',
  auth: true,
  connectOnLogin: true,
  disconnectOnLogout: true,
}
```

如果你有多条全局连接，可以这样写：

```ts
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
}
```

### 其他页面怎么消费这条连接

其他页面不需要重新建连接，直接读取对应的全局 manager 或订阅对应事件即可。

#### 方式 1：直接订阅 manager 消息

```ts
import { onUnmounted } from 'vue'
import { useSocketManager } from '@duxweb/uni'

const manager = useSocketManager()

const off = manager.subscribe('chat.message', message => {
  console.log('收到聊天消息', message.data)
})

onUnmounted(() => {
  off()
})
```

命名连接同理：

```ts
const chatSocket = useSocketManager('chat')

const off = chatSocket.subscribe('chat.message', message => {
  console.log('收到 chat 连接的消息', message.data)
})
```

#### 方式 2：订阅全局事件总线

```ts
import { useListener } from '@duxweb/uni'

useListener('socket:message', payload => {
  console.log('收到任意 socket 消息', payload)
})

useListener('socket:chat.message', payload => {
  console.log('收到默认连接的指定事件消息', payload)
})
```

默认全局连接在收到带事件名的消息后，会额外广播：

```text
socket:open
socket:close
socket:error
socket:message
socket:<eventName>
```

命名全局连接则会广播：

```text
socket:chat:open
socket:chat:close
socket:chat:error
socket:chat:message
socket:chat:<eventName>
```

例如：

```ts
useListener('socket:chat:message', payload => {
  console.log('收到 chat 连接里的任意消息', payload)
})

useListener('socket:chat:chat.message', payload => {
  console.log('收到 chat 连接里的 chat.message 事件', payload)
})
```

### 如何连接、发送和订阅消息

```ts
import { useSocketManager } from '@duxweb/uni'

const manager = useSocketManager()

manager.connect({
  url: 'wss://example.com/ws',
  auth: true,
  heartbeat: true,
  autoReconnect: true,
})

manager.send('ping')

manager.sendJson({
  event: 'chat.message',
  data: {
    text: 'hello',
  },
})

const offAll = manager.subscribeAll(message => {
  console.log('所有消息', message)
})

const offChat = manager.subscribe('chat.message', message => {
  console.log('聊天消息', message.data)
})
```

命名连接只需要换成：

```ts
const manager = useSocketManager('chat')
```

### 它提供什么状态

```text
status
connected
retryCount
activeUrl
lastMessage
error
name
connect()
disconnect()
reconnect()
send()
sendJson()
subscribe()
subscribeAll()
```

## useSocketManagers

用于一次性读取全部全局 socket manager。

```ts
const managers = useSocketManagers()

managers.default.send('ping')
managers.chat?.sendJson({
  event: 'chat.message',
  data: {
    text: 'hello',
  },
})
```

## useWebSocketManager

这是 `useSocketManager()` 的兼容别名。

```ts
const manager = useWebSocketManager()
```
