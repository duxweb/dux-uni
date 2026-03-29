# 认证与会话

`@duxweb/uni` 默认按 uni-app 多端环境设计认证层，不假设浏览器一定有 session 或 cookie。

## useAuth

用于统一读取当前认证状态，比如 token、用户信息和权限数据。

```ts
const auth = useAuth(app?)
```

```ts
import { computed } from 'vue'
import { useAuth } from '@duxweb/uni'

const auth = useAuth()

// 推荐从 auth 推导是否登录
const isLogin = computed(() => Boolean(auth.value?.token))
```

它返回的是：

```ts
ComputedRef<UniAuthState | null>
```

也就是说你可以直接读：

```ts
auth.value?.token
auth.value?.user
auth.value?.permissions
auth.value?.expiresAt
```

例如：

```ts
import { computed } from 'vue'
import { useAuth } from '@duxweb/uni'

const auth = useAuth()

const token = computed(() => auth.value?.token)
const user = computed(() => auth.value?.user)
const permissions = computed(() => auth.value?.permissions)
```

所以 `useAuth()` 不只是能判断是否登录，也能直接拿到用户信息。

## useLogin

用于执行登录动作，并自动处理会话写入、缓存清理和成功跳转。

```ts
const login = useLogin(options?)
await login.login(payload)
```

```ts
import { useLogin } from '@duxweb/uni'

const login = useLogin({
  redirectTo: '/pages/home/index', // 登录成功后跳首页
})

await login.login({
  username: 'demo', // 登录参数
  password: 'demo123',
})
```

它会统一处理：

- 调用 `authProvider.login`
- 写入会话
- 清理查询缓存
- 触发登录事件
- 按需跳转

如果某个页面要临时覆盖接口地址或方法，也可以直接写：

```ts
const login = useLogin({
  path: '/passport/login-by-phone', // 临时覆盖登录接口
  method: 'PUT', // 临时覆盖请求方法
})
```

## useLogout

用于执行退出动作，并自动处理本地会话清理和退出后的跳转。

```ts
const logout = useLogout(options?)
await logout.logout(payload?)
```

```ts
import { useLogout } from '@duxweb/uni'

const logout = useLogout({
  redirectTo: '/pages/auth/login', // 退出后跳登录页
})

await logout.logout({
  reason: 'manual',
})
```

它会统一处理：

- 调用 `authProvider.logout`
- 清理本地会话
- 清理查询缓存
- 触发登出事件
- 按需跳转

## useCheck

用于手动校验当前登录态是否有效。

```ts
const check = useCheck(options?)
await check.check(payload?)
```

```ts
import { useCheck } from '@duxweb/uni'

const check = useCheck({
  path: '/passport/check', // 临时覆盖校验接口
})

await check.check({
  scene: 'launch', // 业务自定义校验参数
})
```

`useCheck()` 本身不是定时轮询。

它是一个手动触发的 action，通常放在：

- 关键页面进入时
- 业务主动要求立即校验时
- 你想覆盖默认自动校验策略时

不过框架运行时默认会在这些时机自动触发 `check`：

- App 启动且本地已有 token 时
- App 从后台回前台时

默认前台自动校验会带一个节流间隔，避免每次切回来都请求。

如果你不想要这个行为，可以在 `dux.ts` 里关闭。

## 运行时自动 check

```ts
auth: {
  autoCheckOnLaunch: true, // 默认 true
  autoCheckOnShow: true, // 默认 true
  checkTtl: 300000, // 默认 5 分钟
  path: '/passport/check', // 可选，覆盖默认 check 接口
  method: 'POST', // 可选，覆盖默认 check 方法
}
```

默认行为可以理解成：

```text
launch     => 如果本地已有 token，自动 check 一次
show       => 距上次 check 超过 checkTtl，再自动 check
login      => 不额外自动 check，直接使用 login 返回的数据
```

## useCan

用于判断当前用户是否拥有某个权限，适合控制按钮、页面块和操作入口显示。

```ts
const canDelete = useCan('orders.delete')
```

```ts
import { useCan } from '@duxweb/uni'

const canDelete = useCan('orders.delete')
```

它会走当前 `authProvider.can()` 的实现。

## simpleAuthProvider

```ts
const provider = simpleAuthProvider(options?)
```

```ts
import { simpleAuthProvider } from '@duxweb/uni'

authProvider: simpleAuthProvider({
  path: {
    login: '/login', // 登录接口
    check: '/check', // 校验接口
    logout: '/logout', // 退出接口
  },
  method: {
    login: 'POST',
    check: 'GET',
    logout: 'POST',
  },
  route: {
    login: '/pages/auth/login', // 登录页路由
    index: '/pages/home/index', // 登录成功后的首页
  },
  permissionKey: 'permissions', // 权限字段名
})
```

默认响应大致是：

```json
{
  "message": "ok",
  "data": {
    "token": "token-value",
    "user": { "id": 1 },
    "permissions": ["orders.read"]
  }
}
```

其中：

```text
path.check          => useCheck() 默认调用的接口
```

## 页面授权怎么配

```vue
<route lang="json">
{
  "title": "账户中心",
  "auth": true,
  "permission": "system.profile.read"
}
</route>
```

## 继续阅读

- [请求配置](/uni/request)
- [路由与运行时](/uni/router)
