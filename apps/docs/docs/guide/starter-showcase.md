# Starter 对照

`apps/starter` 的定位不是模板本身，而是：

```text
模板 + 演示模块 + mock 数据
```

它主要用来做：

```text
能力验证
页面联调
回归测试
文档示例对照
```

## 启动方式

```bash
# 启动 starter 开发服务
pnpm starter:dev

# 打开预览
pnpm starter:open
```

常用变体：

```bash
pnpm starter:dev:h5
pnpm starter:dev:app
pnpm starter:dev:wx
pnpm starter:build:h5
pnpm starter:build:app
pnpm starter:build:wx
```

说明：

- `app` 是 uni-app 的 App 运行目标，覆盖 iOS / Android 的开发与构建入口。
- 当前 CLI 不区分 `app-ios` / `app-android` 这类独立平台名，原生打包与发行仍在后续平台链路里处理。

## 当前模块清单

```text
base     => 布局、tabBar、基础壳
home     => 首页能力总览
feature  => 功能入口与二级 demo
list     => 列表与分页演示
form     => 表单、select、tree、schema 演示
account  => 账户中心与会话展示
auth     => 登录与鉴权中间件
system   => 系统页，例如 forbidden
```

## 一级导航

### 首页

```text
路由  => /pages/home/index
模块  => home
页面  => apps/starter/src/modules/home/pages/index.vue
入口  => apps/starter/src/modules/home/index.ts
```

用途：

- 展示框架能力概览
- 引导进入功能页和我的页

### 功能

```text
路由  => /pages/feature/index
模块  => feature
页面  => apps/starter/src/modules/feature/pages/index.vue
入口  => apps/starter/src/modules/feature/index.ts
```

用途：

- 演示目录页
- 汇总所有二级 demo 场景入口

### 我的

```text
路由  => /pages/account/index
模块  => account
页面  => apps/starter/src/modules/account/pages/index.vue
入口  => apps/starter/src/modules/account/index.ts
```

用途：

- 登录状态
- 用户信息
- 权限信息
- 退出等账户能力

## 功能页里的二级演示

### 表单与 Schema

```text
路由    => /pages/form/index
页面    => apps/starter/src/modules/form/pages/index.vue
入口    => apps/starter/src/modules/form/index.ts
组件注册=> apps/starter/src/modules/form/components/SchemaWotButton.ts
```

主要看：

```text
useForm
useSelect
useTree
useJsonSchema
schema 组件注册
schema model / switch / case
```

### 数据列表

```text
路由  => /pages/list/index
页面  => apps/starter/src/modules/list/pages/index.vue
入口  => apps/starter/src/modules/list/index.ts
```

主要看：

```text
useList
useInfiniteList
useCreate
useUpdate
useDelete
useInvalidate
```

### 文件能力

```text
路由  => /pages/feature/files
页面  => apps/starter/src/modules/feature/pages/files.vue
```

主要看：

```text
useUpload
useDownload
```

### 弹层能力

```text
路由  => /pages/feature/overlay
页面  => apps/starter/src/modules/feature/pages/overlay.vue
组件  => apps/starter/src/modules/feature/components/FeatureSettingsOverlay.vue
```

主要看：

```text
useConfirm
useModal
useDrawer
```

### 实时能力

```text
路由  => /pages/feature/realtime
页面  => apps/starter/src/modules/feature/pages/realtime.vue
入口  => apps/starter/src/modules/feature/index.ts
```

主要看：

```text
useSocket
useSSE
事件分发
socket bridge
```

### 权限能力

```text
路由  => /pages/feature/permission
页面  => apps/starter/src/modules/feature/pages/permission.vue
系统页=> apps/starter/src/modules/system/pages/forbidden/index.vue
鉴权  => apps/starter/src/modules/auth/index.ts
```

主要看：

```text
页面权限
中间件
无权限跳转
```

## 最值得对照的几个文件

```text
apps/starter/src/dux.config.ts
apps/starter/src/modules/auth/index.ts
apps/starter/src/modules/feature/index.ts
apps/starter/src/modules/form/index.ts
apps/starter/src/modules/base/layouts/default.vue
apps/starter/src/modules/base/layouts/home.vue
apps/starter/src/modules/base/components/AppTabbar.vue
```

## 自动生成层

这些文件只看，不手改：

```text
apps/starter/src/runtime/generated/*
apps/starter/src/runtime/router/*
apps/starter/src/pages/*
```
