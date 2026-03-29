# 事件总线

这一页只讲应用内事件。

如果你要看长连接或流式连接，请直接跳到：

```text
Socket  => /uni/socket
SSE     => /uni/sse
```

## useEvent

用于主动发出一个业务事件，适合页面之间、模块之间做轻量通知。

```ts
const event = useEvent<TPayload>(name)
event.emit(payload)
```

```ts
import { useEvent } from '@duxweb/uni'

const messageEvent = useEvent<{ id: string }>('chat.message')

messageEvent.emit({
  id: '1001', // 主动广播消息事件
})
```

## useListener

用于监听业务事件，是最常用的事件消费入口。

```ts
const { off } = useListener<TPayload>(name, handler, priority?)
```

```ts
import { useListener } from '@duxweb/uni'

useListener<{ id: string }>('chat.message', payload => {
  console.log(payload?.id) // 监听并消费事件
})
```

## useListenerOnce

用于只消费一次事件，第一次触发后自动解绑。

```ts
const { off } = useListenerOnce<TPayload>(name, handler, priority?)
```

```ts
useListenerOnce('chat.message', payload => {
  console.log(payload) // 只接收一次，之后自动解绑
})
```

## useListenerOnly

用于注册唯一监听器，适合一个时刻只允许一个有效处理器的事件。

```ts
const { off } = useListenerOnly<TPayload>(name, handler, priority?)
```

```ts
useListenerOnly('chat.message', payload => {
  console.log(payload) // 同一时刻只允许一个有效监听器
}, 1000)
```

## 什么时候用哪个

```text
应用内广播      => useEvent / useListener
双向实时连接    => /uni/socket
服务端单向流    => /uni/sse
```
