# @duxweb/uni

`@duxweb/uni` 是面向 `uni-app` 的运行时基础库。

它负责：

- `createUni()` 应用启动配置
- 路由和页面运行时
- 请求、鉴权、会话与存储
- 查询、列表、表单、上传下载
- 事件、实时连接、Schema 渲染

UI 层能力不在这个包里，Wot UI 集成请看 `@duxweb/uni-pro`。

## 文档

完整文档统一放在仓库里的 `apps/docs`：

```bash
pnpm docs:dev
pnpm docs:open
```

重点文档入口：

- `apps/docs/docs/guide/getting-started.md`
- `apps/docs/docs/guide/minimal-app.md`
- `apps/docs/docs/guide/first-module.md`
- `apps/docs/docs/guide/scenarios.md`
- `apps/docs/docs/uni/api-reference.md`
- `apps/docs/docs/uni/router.md`
- `apps/docs/docs/uni/data.md`
- `apps/docs/docs/uni/auth.md`
- `apps/docs/docs/uni/schema.md`
- `apps/docs/docs/uni/schema-protocol.md`

## 推荐用法

业务代码优先使用 `@duxweb/uni` 暴露的 hooks，而不是直接读取运行时单例。

### Navigation

```ts
import { useRouter, useRoute } from '@duxweb/uni'

const router = useRouter()
const route = useRoute()

await router.to('account.index')
await router.module('account')
await router.home()
await router.login()
await router.back()

route.path
route.fullPath
route.name
route.module
route.query
route.meta
route.tabBar
```

说明：

- `useRouter()` 是主导航入口
- `useRoute()` 返回当前 uni 页面路由快照
- `useNavigator()` 仍然保留为兼容别名，但不再推荐

### TabBar Routing

业务层只调用 `useRouter().to()`。

内部会按 tabBar 模式自动分发：

- normal page: `push`
- native tabBar page: `switchTab`
- custom tabBar page: `reLaunch`

`tabBarMode` 决定底层导航：

- `native`: tab 页注册到 `pages.json`，切换走 `switchTab`
- `custom`: tab 页按普通页面处理，切换走 `reLaunch`

`tabBarRenderer` 决定界面渲染：

- `native`: 使用平台原生 tabbar
- `custom`: 继续使用业务层自定义 tabbar，但底层仍可配合 `native` 模式保留 tab 页缓存

默认行为：

- `tabBarMode`: `native`
- when `src/modules/base/components/AppTabbar.vue` exists, `tabBarRenderer` is `custom`
- otherwise, `tabBarRenderer` is `native`

### Custom TabBar Loading

现在要区分“底层导航模式”和“界面渲染模式”。

- `tabBarMode: 'native'`
  - tab 页走 `switchTab`
  - 页面缓存和一级切换性能由平台原生 tab 页承接
- `tabBarRenderer: 'custom'`
  - 只影响界面外观
  - 不会强制把 tab 页退回普通页面跳转

推荐组合：

- `native + native`
  - 原生 tab 页 + 原生 tabbar
- `native + custom`
  - 原生 tab 页 + 自定义 tabbar
- `custom + custom`
  - 普通页面跳转 + 自定义 tabbar

如果你关心小程序 / App 的一级导航切换性能，优先使用 `tabBarMode: 'native'`。

`uni.preloadPage()` is not a universal solution here:

- H5 only preloads the JS file, not page prerender
- App only supports preloading `nvue` pages
- mini-program platforms do not support it

Sources:

- [custom-tab-bar | uni-app 官网](https://uniapp.dcloud.net.cn/component/custom-tab-bar.html)
- [uni.preloadPage | uni-app 官网](https://uniapp.dcloud.net.cn/api/preload-page.html)

### Auth

```ts
import { computed } from 'vue'
import { useAuth, useLogin, useLogout, useCheck } from '@duxweb/uni'

const auth = useAuth()
const isLogin = computed(() => Boolean(auth.value?.token))

const login = useLogin()
const logout = useLogout()
const check = useCheck()
```

认证状态读取优先使用 `useAuth()`。`useIsLogin()` 仅保留兼容用途。

### Generated Page Wrapper

`src/pages/*` 下的自动生成包装页会使用 `usePageRuntime()`，它负责等待运行时启动并在真实模块页面挂载前执行页面中间件。

### Schema Rendering

`useJsonSchema()` 是首选入口，`UniSchemaRenderer` 是其底层渲染器。

```ts
import { computed, reactive } from 'vue'
import { useJsonSchema } from '@duxweb/uni'

const state = reactive({
  message: 'hello',
  status: 'active',
})

const schema = computed(() => [
  {
    tag: 'input',
    model: 'state.message',
    props: {
      placeholder: 'Type here',
    },
  },
  {
    tag: 'text',
    bind: 'state.message',
  },
  {
    tag: 'text',
    switch: 'state.status',
    case: 'active',
    text: 'Active',
  },
  {
    tag: 'text',
    defaultCase: true,
    text: 'Other',
  },
])

const { render: SchemaRender } = useJsonSchema({
  data: schema,
  bindings: computed(() => ({
    state,
  })),
})
```

当前支持的 schema 字段包括：

- `tag` / `component`
- `props` / `attrs`
- `style` / `class`
- `bind`
- `forEach`
- `if` / `elseIf` / `else`
- `switch` / `case` / `defaultCase`
- `model` / `modelProp`
- `actions`

schema 组件可以显式注册：

```ts
import { defineSchemaComponents, defineUniModule } from '@duxweb/uni'
import MySchemaButton from './components/MySchemaButton'

export default defineUniModule({
  name: 'demo',
  schema: {
    components: defineSchemaComponents([
      {
        name: 'my-button',
        component: MySchemaButton,
        aliases: ['schema-button'],
      },
    ]),
  },
})
```

## Scripts

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

完整能力请以 docs 为准，不再在 README 中重复维护详细手册。
