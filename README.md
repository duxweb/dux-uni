# dux-uni workspace

`dux-uni` 是一个基于 `pnpm workspace` 的 uni-app 基础框架仓库。

- `packages/uni` => `@duxweb/uni`
  负责运行时、路由、请求、鉴权、查询、表单、上传下载、Schema 渲染。
- `packages/uni-pro` => `@duxweb/uni-pro`
  负责 Wot UI、主题 token、UI 适配。
- `packages/create` => `@duxweb/uni-create`
  负责通过 `npx` 创建新项目并注入官方模板。
- `apps/template`
  官方模板，作为脚手架基础骨架。
- `apps/starter`
  在模板之上补演示页面，用于联调和验收。
- `apps/docs`
  VitePress 文档站。

完整文档统一放在 `apps/docs`，不要再以 README 作为主文档维护。

## 文档

```bash
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
pnpm docs:open
```

默认文档开发地址是 `http://127.0.0.1:5177/`。

推荐直接从这些文档入口开始：

- `apps/docs/docs/guide/overview.md`
- `apps/docs/docs/guide/getting-started.md`
- `apps/docs/docs/guide/minimal-app.md`
- `apps/docs/docs/guide/first-module.md`
- `apps/docs/docs/guide/scenarios.md`
- `apps/docs/docs/uni/api-reference.md`

## 创建项目

```bash
npx @duxweb/uni-create my-app --ui pro
npx @duxweb/uni-create my-app --ui base
```

- `pro`：带 `@duxweb/uni-pro` 和 Wot UI 适配。
- `base`：只保留 `@duxweb/uni` 运行时与数据层。

## 常用命令

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build

pnpm starter:dev
pnpm starter:open
pnpm template:dev
pnpm template:open
```

`starter:dev` 和 `template:dev` 默认启动 H5 预览。

## 仓库维护

发版与版本管理文档见：

- `RELEASING.md`

## 架构约定

- 应用内部按 `src/modules/*` 组织业务模块。
- `src/pages/*` 是自动生成的路由包装层，不承载业务实现。
- 自动生成内容统一收敛到 `src/runtime/*` 与 `src/pages/*`。
- 业务代码优先使用 `useRouter()`、`useRoute()`、`useAuth()`、`useList()`、`useForm()`、`useJsonSchema()` 等 Hook。

更详细的说明见：

- `apps/docs/docs/guide/getting-started.md`
- `apps/docs/docs/guide/app-architecture.md`
- `apps/docs/docs/guide/starter-showcase.md`
- `apps/docs/docs/guide/scenarios.md`
