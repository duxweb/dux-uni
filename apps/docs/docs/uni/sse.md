# SSE

SSE 适合服务端单向连续推送的场景，比如：

```text
AI 回复流
日志流
长任务进度
单向通知流
```

## useSSE

用于建立 SSE 流式连接，适合 AI 回复、日志流、服务端单向增量数据。

```ts
const sse = useSSE<T>(options)
```

### 最小连接示例

```ts
import { useSSE } from '@duxweb/uni'

const sse = useSSE<{ delta?: string }>({
  path: 'ai/chat-stream',
  method: 'POST',
  body: {
    prompt: '你好',
  },
  immediate: true,
})
```

### 如何开始和关闭流

```ts
await sse.connect()
sse.close()
sse.reset()
```

### 如何接收流式消息

最常用的是直接读：

```ts
sse.messages.value
sse.lastMessage.value
sse.text.value
```

也可以在选项里直接监听：

```ts
const sse = useSSE({
  path: 'ai/chat-stream',
  onMessage(message) {
    console.log('收到分段消息', message.data)
  },
})
```

### 如何把消息解析成 JSON

如果服务端推的是 JSON 字符串，推荐用 `parse`：

```ts
const sse = useSSE<{ delta?: string }>({
  path: 'ai/chat-stream',
  parse(message) {
    return JSON.parse(message.data)
  },
})
```

这样你就可以读：

```ts
sse.lastMessage.value?.parsed?.delta
```

### 如何读取流状态

```ts
sse.status.value
sse.connecting.value
sse.streaming.value
sse.retrying.value
sse.retryCount.value
sse.error.value
```

### 它返回什么

```text
status
connecting
streaming
retrying
retryCount
openResult
messages
lastMessage
text
error
connect()
close()
reset()
```

## useEventSource

这是更底层的 SSE hook，`useSSE()` 可以理解成它的简化别名。

```ts
const sse = useEventSource(options)
```

如果你需要更底层地控制：

```text
onOpen
onRetry
transport
timeout
heartbeatTimeout
executor
```

就直接用 `useEventSource()`。

## 什么时候用 SSE

推荐场景：

```text
服务端持续往前端推文本片段
前端不需要向同一连接反向发消息
你希望保留 HTTP 语义
```

如果你的场景需要双向收发，优先看 [Socket](/uni/socket)。
