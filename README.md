<div align="center">

# Dux Uni

![Dux Uni](https://img.shields.io/badge/Dux%20Uni-uni--app-059669?style=for-the-badge)

**面向 uni-app 的运行时框架与 UI 适配工作区**

_适合需要统一路由、鉴权、数据、表单、Schema、弹层和跨端主题体验的项目_

[![npm version](https://img.shields.io/npm/v/@duxweb/uni.svg)](https://www.npmjs.com/package/@duxweb/uni)
[![npm version](https://img.shields.io/npm/v/@duxweb/uni-pro.svg)](https://www.npmjs.com/package/@duxweb/uni-pro)
[![npm version](https://img.shields.io/npm/v/@duxweb/uni-create.svg)](https://www.npmjs.com/package/@duxweb/uni-create)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

📖 **[查看文档源码](./apps/docs/docs/guide/overview.md)** | 🚀 **[快速开始](#快速开始)** | 🧩 **[包与应用结构](#包与应用结构)** | 📦 **[发布说明](./RELEASING.md)**

</div>

---

## 什么是 Dux Uni？

**Dux Uni 是一套给 uni-app 项目使用的运行时框架。**

它的重点不是单纯提供组件，而是把移动端项目里反复出现的基础能力统一起来：

- **路由、页面守卫、登录跳转统一处理**
- **请求、查询、缓存失效和 CRUD 统一处理**
- **表单、选择器、上传下载、Schema 渲染统一处理**
- **UI 层可以独立替换，不把运行时能力绑死在某个组件库上**

在这个工作区里，`@duxweb/uni` 负责 Headless 运行时能力，`@duxweb/uni-pro` 负责 Wot UI 适配和主题整合，`starter` 与 `template` 则分别承担演示和模板职责。

## 为什么用 Dux Uni

### 1. 运行时能力统一

很多 uni-app 项目都会重复处理这些事情：

- 登录与会话恢复
- 权限校验与页面重定向
- 列表查询、详情查询、提交、删除
- 表单校验、远程选择器、上传下载
- 弹层页面、抽屉页面、Schema 动态渲染

Dux Uni 把这些都放在统一的运行时层，而不是散落在页面里。

### 2. UI 层不和能力层绑死

`@duxweb/uni` 自身不要求你必须使用某个 UI 库。

你可以：

- 只使用 `@duxweb/uni`
- 结合 `@duxweb/uni-pro`
- 后续接入自己的 UI 适配层

这样做的好处是：**能力层稳定，界面层可以替换。**

### 3. 更适合模块化组织

工作区默认以 `src/modules/*` 组织模块，页面包装层由路由生成器自动产出。

这意味着：

- 页面代码更聚焦业务模块
- `src/pages/*` 不需要手写
- 运行时代码、生成代码、业务代码边界更清晰

## 核心特点

- 🎯 **Headless 运行时优先**
- 🔐 **内建登录、会话、权限、页面守卫**
- 📦 **内建列表、CRUD、缓存失效、表单与上传下载能力**
- 🧱 **支持 JSON Schema 动态渲染**
- 🪟 **支持 confirm、modal、drawer 等统一弹层协议**
- 🎨 **支持通过 `@duxweb/uni-pro` 对接 Wot UI 与主题 Token**
- 🧩 **适合按模块组织 uni-app 项目**
- 📘 **完整 TypeScript 支持**

## 包与应用结构

### `@duxweb/uni`

定位：
- uni-app 的运行时基础能力层

负责：
- 路由、页面元信息、页面守卫
- 认证、权限、会话
- 数据 Provider、查询与 Mutation
- 表单、上传下载、Schema、事件与 Hook 扩展

### `@duxweb/uni-pro`

定位：
- `@duxweb/uni` 的 Wot UI 适配层

负责：
- Wot UI 主题接入
- Dux Root、页面壳、弹层 Presenter
- AsyncForm、AsyncPicker、AsyncUpload 等高频适配组件
- UnoCSS Token 与界面层整合

### `@duxweb/uni-create`

定位：
- 官方脚手架入口

负责：
- 通过 `npx` 创建新项目
- 注入官方模板
- 同步 `@duxweb/uni` / `@duxweb/uni-pro` 的模板版本

### `apps/template`

定位：
- 官方模板骨架

适合：
- 作为真实业务项目起点

### `apps/starter`

定位：
- 官方演示应用

适合：
- 联调能力
- 验收 UI 与运行时集成
- 查看完整页面示例

### `apps/docs`

定位：
- VitePress 文档站源码

## `uni` 和 `uni-pro` 怎么选

### 选 `@duxweb/uni`

适合你：

- 已有自己的 UI 或设计体系
- 只想要运行时能力层
- 想自己控制页面、布局和组件封装

### 选 `@duxweb/uni-pro`

适合你：

- 想更快落地一套完整界面
- 需要 Wot UI 适配和统一主题
- 不想重复封装高频表单、选择器、弹层页面壳

### 对比表

| 对比项 | `@duxweb/uni` | `@duxweb/uni-pro` |
| --- | --- | --- |
| 定位 | Headless 运行时层 | Wot UI 适配层 |
| 是否包含路由 / 鉴权 / 数据能力 | ✅ | 依赖 `@duxweb/uni` |
| 是否包含页面壳 / Async 组件 | ❌ | ✅ |
| UI 方案 | 自由 | Wot UI |
| 适合谁 | 自己掌控界面层的团队 | 想快速落地界面的团队 |

## 快速开始

### 通过脚手架创建项目

```bash
npx @duxweb/uni-create my-app --ui pro
npx @duxweb/uni-create my-app --ui base
```

- `pro`：使用 `@duxweb/uni-pro` 和 Wot UI 适配
- `base`：只使用 `@duxweb/uni` 的运行时能力

### 在当前工作区启动演示应用

```bash
pnpm install

pnpm starter:dev:h5
pnpm starter:dev:wx
pnpm starter:dev:app
```

### 启动模板应用

```bash
pnpm template:dev:h5
pnpm template:dev:wx
pnpm template:dev:app
```

## 常用命令

```bash
pnpm install
pnpm test
pnpm typecheck

pnpm starter:dev:h5
pnpm starter:build:h5
pnpm starter:build:wx

pnpm template:dev:h5
pnpm template:build:h5

pnpm docs:dev
pnpm docs:build
```

## 文档入口

建议从这些文档开始：

- [总览](./apps/docs/docs/guide/overview.md)
- [快速开始](./apps/docs/docs/guide/getting-started.md)
- [最小应用](./apps/docs/docs/guide/minimal-app.md)
- [应用架构](./apps/docs/docs/guide/app-architecture.md)
- [Starter 演示](./apps/docs/docs/guide/starter-showcase.md)
- [Overlay 使用](./apps/docs/docs/uni/overlay.md)
- [Theme 说明](./apps/docs/docs/uni-pro/theme.md)

## 工作区约定

- 业务模块放在 `src/modules/*`
- `src/pages/*` 是自动生成的路由包装层，不手写业务
- 自动生成内容统一收敛到 `src/runtime/*` 和 `src/pages/*`
- 页面与模块优先通过 `useRouter()`、`useRoute()`、`useAuth()`、`useList()`、`useJsonSchema()` 等 Hook 访问运行时能力

## 发布说明

发版说明见：

- [RELEASING.md](./RELEASING.md)

常用发布检查：

```bash
pnpm run release:check
pnpm run release:check:full
```

- `release:check`：只检查真正参与发布的包
- `release:check:full`：额外包含 docs 构建

## 一句话总结

**Dux Uni 适合用 uni-app 做更稳定的模块化应用，把路由、认证、数据、表单、Schema 和 UI 适配拆成清晰分层，而不是把这些能力散落在每个页面里。**
