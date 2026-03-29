# Dux Uni Starter

`starter` 是一个基于官方 uni 编译链的演示应用，用来验证 `@duxweb/uni` 的模块化架构与运行时能力。

## 目录

- `src/modules/*`
  应用业务模块，模块内按功能组织 `pages`、`store`、`components` 与模块入口。
- `src/pages/*`
  自动生成的 uni 页面薄壳，不属于业务架构。
- `src/runtime/*`
  自动生成的运行时桥接层，不手写维护。
- `src/dux.config.ts`
  应用唯一配置入口，模块清单由生成层自动注入。
- `src/dux.ts`
  应用运行时单例入口。

## 命令

```bash
pnpm --filter @duxweb/uni-starter sync:uni
pnpm starter:dev
pnpm --filter @duxweb/uni-starter type-check
```

## dux.ts

`src/dux.ts` 不是普通工具文件，它是应用运行时单例。

这里会把这些能力组装成一个统一入口：

- 路由与页面清单
- 请求客户端
- 登录态与会话
- 模块注册
- actions / hooks / middlewares

页面里拿到的 `useUniApp()`，本质上就是在使用这里创建出来的 `dux`。

## 页面 Hook 约定

`starter` 用来演示模板推荐的页面层 API：

- `useRouter()`
  - 统一页面跳转入口
- `useRoute()`
  - 读取当前页面路由信息
- `useAuth()`
  - 读取认证态
- `usePageRuntime()`
  - 自动生成页包装层使用

示例页面可以直接参考：

- `src/modules/home/pages/index.vue`
- `src/modules/feature/pages/index.vue`
- `src/modules/list/pages/index.vue`
- `src/modules/account/pages/index.vue`

## Starter 导航结构

`starter` 现在按真实 App 的一级信息架构组织：

- `首页`
  - 只展示 `@duxweb/uni` 与 `@duxweb/uni-pro` 的核心能力总览
- `功能`
  - 作为所有演示能力的目录入口
  - 再进入列表、表单、文件等具体 demo 页面
- `我的`
  - 只处理登录、授权、会话校验、用户信息与退出

## TabBar 说明

`starter` 当前保留 `src/modules/base/components/AppTabbar.vue`，因此会自动被识别为自定义 tabBar 模式。

这意味着：

- tab 页切换统一仍然只调用 `useRouter().to()`
- 但内部会对 tab 页走 `reLaunch`
- 不会生成原生 `pages.json.tabBar`

这样更适合演示 Wot UI 的浮动圆角导航样式，但首屏首次切换性能不如原生 tabBar。

与之相对，`template` 默认不保留该组件，因此默认就是原生 tabBar 模板。

如果后续切回原生 tabBar：

- 删除 `src/modules/base/components/AppTabbar.vue`
- 重新执行 `pnpm --filter @duxweb/uni-starter sync:uni`
- `useRouter().to()` 不需要改，框架会自动改走 `switchTab`
