# 路由与运行时

这一页只讲页面跳转、页面信息读取和页面级运行时能力。

## useRouter

用于统一处理页面跳转，不需要业务层自己判断是普通页、tabBar 页还是模块首页。

```ts
const router = useRouter(app?)
```

```ts
import { useRouter } from '@duxweb/uni'

const router = useRouter()

// 按路径跳转
await router.to('/pages/account/index')

// 按页面名跳转
await router.to({
  name: 'orders.detail',
  query: { id: 1 },
})

// 按模块名跳转到模块首页
await router.module('account')

// 跳首页和登录页
await router.home()
await router.login()

// 返回上一页
await router.back()
```

适合：

- 页面间跳转
- 按模块首页跳转
- 不想自己区分 `switchTab`、`navigateTo`、`reLaunch`

## useRoute

用于读取当前页面信息，包括路径、页面名、模块名、query 和 meta。

```ts
const route = useRoute(app?)
```

```ts
import { useRoute } from '@duxweb/uni'

const route = useRoute()

route.path      // 当前页面路径
route.fullPath  // 带 query 的完整路径
route.name      // 页面名
route.module    // 所属模块
route.query     // 当前 query 参数
route.meta      // 页面 Route 配置
route.tabBar    // 是否是 tabBar 页面
```

适合：

- 读取 query 参数
- 判断当前模块
- 读取页面 Route 配置

## usePageTitle

用于设置当前页面标题，支持固定标题和响应式标题。

```ts
const { setTitle } = usePageTitle(title, options?)
```

```ts
import { usePageTitle } from '@duxweb/uni'

// 进入页面后立即设置标题
usePageTitle('订单详情')
```

```ts
import { computed } from 'vue'
import { usePageTitle } from '@duxweb/uni'

const title = computed(() => `订单 #${route.query.id}`)

// 标题会跟着响应式数据变化
usePageTitle(title)
```

## usePageGuard

用于在页面内做简单的登录保护或游客页保护，不想单独写中间件时很方便。

```ts
const guard = usePageGuard(options?)
```

```ts
import { usePageGuard } from '@duxweb/uni'

const guard = usePageGuard({
  mode: 'auth', // 当前页面需要登录
})
```

适合：

- 页面内做简单登录保护
- 等待登录态校验完成后再渲染页面

## 页面配置来自哪里

页面最终配置来自两部分：

1. 页面里的 `<route lang="json">`
2. 模块入口与 `dux.config.ts` 的合并结果

页面示例：

```vue
<route lang="json">
{
  "title": "订单详情",
  "auth": true,
  "layout": "default"
}
</route>
```

## 为什么统一用 `router.to()`

因为不同页面底层跳转方式不一样。

```text
普通页面     => navigateTo / redirectTo
原生 tabBar  => switchTab
自定义 tabBar=> reLaunch
```

`useRouter().to()` 会按页面信息自动判断，业务层不用自己分支。

## 继续阅读

- [页面 Route](/uni/page-route)
- [页面运行时](/uni/page-runtime)
- [模块系统](/uni/modules)
