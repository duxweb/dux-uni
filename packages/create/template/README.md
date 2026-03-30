# Dux Uni Template

`template` 是脚手架模板本体，不是演示应用。

它的目标是提供一套最小可开发的模块化 uni-app 基础骨架，业务代码从 `src/modules/*` 开始扩展。

## 目录

- `src/modules/*`
  应用模块源码，每个模块自带自己的页面和入口。
- `src/pages/*`
  自动生成的 uni 页面薄壳，不手写。
- `src/runtime/*`
  自动生成的路由与页面运行时桥接层，不手写。
- `src/dux.config.ts`
  模板唯一配置入口，自动扫描到的模块清单会注入到这里。
- `src/dux.ts`
  应用运行时单例入口。

## 页面开发约定

模板内页面主用这三个 hook：

- `useRouter()`
  - 负责页面跳转
  - 常用方法：`to()`、`module()`、`home()`、`login()`、`back()`
- `useRoute()`
  - 读取当前页面信息
  - 常用字段：`name`、`module`、`path`、`fullPath`、`query`、`meta`
- `usePageRuntime()`
  - 只在自动生成的 `src/pages/*` 薄壳里使用
  - 负责页面中间件与 ready 状态

示例：

```ts
import { useRoute, useRouter } from '@duxweb/uni'

const router = useRouter()
const route = useRoute()

await router.module('account')
await router.to({ name: 'list.index', query: { keyword: 'demo' } })

console.log(route.name, route.module, route.query)
```

不推荐在业务页面里直接使用 `getCurrentPages()` 或直接操作 `dux.navigator`。

## TabBar 约定

tabBar 现在拆成两层：

- `router.tabBarMode`
  - 决定底层导航行为
  - `native` 时 tab 页走 `switchTab`
  - `custom` 时 tab 页走 `reLaunch`
- `router.tabBarRenderer`
  - 决定界面上显示原生 tabbar 还是业务自定义 tabbar

默认规则：

- `tabBarMode` 默认优先按 `native` 处理
- 如果存在 `src/modules/base/components/AppTabbar.vue`
  - `tabBarRenderer` 会自动推断为 `custom`
- 如果不存在该组件
  - `tabBarRenderer` 会自动推断为 `native`

当前 `template` 默认不内置 `AppTabbar.vue`，因此默认就是原生渲染。

如果目标是小程序和 App 的正式一级导航，优先推荐：

```ts
router: {
  tabBarMode: 'native',
}
```

如果你要保留原生 tab 页缓存，但界面上使用自己的悬浮 tabbar，则使用：

```ts
router: {
  tabBarMode: 'native',
  tabBarRenderer: 'custom',
}
```

## 命令

```bash
pnpm --filter @duxweb/uni-template sync:uni
pnpm --filter @duxweb/uni-template module:new user-center
pnpm template:dev
pnpm --filter @duxweb/uni-template type-check
```

## module:new

`module:new` 由 `@duxweb/uni` 的 `dux-uni` CLI 提供，不在模板内维护独立脚本。

执行后会生成：

- `src/modules/<name>/index.ts`
- `src/modules/<name>/pages/index.vue`
- `src/modules/<name>/components/index.ts`
- `src/modules/<name>/store/index.ts`

## dux.ts

`src/dux.ts` 是应用运行时容器。

它负责把：

- 模块
- 路由
- 请求
- 鉴权
- session
- actions / hooks / middlewares

组装成统一的 `dux` 单例，页面和 composable 通过 `useUniApp()` 访问的就是它。

业务页面通常不需要直接访问 `useUniApp()`；优先使用 `useRouter()`、`useRoute()`、`useAuth()` 这类能力型 hook。
