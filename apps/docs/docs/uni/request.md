# 请求配置

应用层真正需要关心的是 `dux.ts` 或 `dux.config.ts` 里的 `runtime.request`。

## 最常见配置

```ts
import { createUni, defineUniConfig } from '@duxweb/uni'

export const dux = createUni(defineUniConfig({
  apiBaseURL: 'https://api.example.com',
  request: {
    getHeaders: () => ({
      'X-App': 'starter', // 每次请求都带上应用标识
    }),
  },
}))
```

## 默认 adapter

```ts
import { createUniNetworkAdapter } from '@duxweb/uni'
```

如果你没有显式传 `request.adapter`，默认就是 `createUniNetworkAdapter()`。

它底层基于 `@uni-helper/uni-network`，适合 uni-app 多端请求。

## 动态 Header

```ts
request: {
  getHeaders: () => ({
    'X-App-Version': '1.0.0', // 动态应用版本
    'X-Platform': 'uni-app', // 动态平台标识
  }),
}
```

当前登录态里的 `Authorization` 也会继续合并进去。

## 请求签名

```ts
request: {
  sign: async request => {
    const ts = String(Date.now())

    return {
      query: {
        ...(request.query || {}),
        ts, // 给 query 追加时间戳
      },
      headers: {
        ...(request.headers || {}),
        'X-Timestamp': ts, // 给 header 追加签名相关信息
        'X-Sign': `signed:${request.method || 'GET'}:${request.url}`,
      },
    }
  },
}
```

适合：

- 时间戳
- nonce
- 请求签名
- 平台标识

## onRequest

```ts
request: {
  onRequest: [
    request => ({
      ...request,
      timeout: 15000, // 统一超时时间
      headers: {
        ...(request.headers || {}),
        'X-Trace-Id': 'trace-1', // 统一 trace id
      },
    }),
  ],
}
```

推荐约定：

```text
业务签名 => sign
底层统一改写 => onRequest
```

## 自定义 adapter

```ts
request: {
  adapter: {
    async request(options) {
      return {
        status: 200,
        data: { ok: true }, // 自定义 transport 结果
      }
    },
  },
}
```

适合：

- mock
- 测试桩
- 特殊传输协议

## 响应与错误拦截

```ts
request: {
  onResponse: [
    ({ response }) => response, // 统一整理响应结构
  ],
  onError: [
    error => {
      console.error(error.status, error.message) // 统一错误处理
      throw error
    },
  ],
}
```

## 它最终会影响哪些地方

```text
useList / useOne / useMany
useCreate / useUpdate / useDelete
useCustom / useCustomMutation
simpleAuthProvider
simpleDataProvider
```

也就是说，应用级请求配置只改一处，所有数据请求和鉴权请求都会一起生效。
