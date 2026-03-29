# 按场景找能力

这一页用于快速定位：你现在要解决的问题，应该看哪部分文档、先用哪些能力。

## 应用初始化

```text
看文档 => 快速开始 / 应用生命周期 / 最小可运行应用 / 应用配置
看能力 => defineDuxConfig / createUni / installUniApp / setupUniAppLifecycle
```

## 新增一个业务模块

```text
看文档 => 第一个业务模块 / 应用架构 / 模块系统 / 页面 Route
看能力 => defineUniModule / 模块 index.ts / <route lang="json"> / defaultLayout / middlewares
```

## 登录、退出、登录态检查

```text
看文档 => 认证与会话 / 实战 Recipes
看能力 => useAuth / useLogin / useLogout / useCheck / usePageGuard
```

## 权限控制

```text
看文档 => 认证与会话 / 页面 Route / 模块系统
看能力 => useCan / permission / auth / guestOnly / middlewares
```

## 页面跳转和 tabBar

```text
看文档 => 路由与运行时 / 应用配置
看能力 => useRouter / useRoute / router.home / router.login / router.tabBar
```

## 列表、详情、分页、刷新

```text
看文档 => 数据查询 / 实战 Recipes
看能力 => useList / useInfiniteList / useOne / useMany / useInvalidate / useRefetch
```

## 表单、异步选项、树选择

```text
看文档 => 数据查询 / 实战 Recipes
看能力 => useForm / useSelect / useTree
```

## 弹窗、抽屉、确认框

```text
看文档 => Overlay / 实战 Recipes / uni-pro 组件总览
看能力 => useConfirm / useModal / useDrawer / useOverlayContext / DuxRoot
```

## 上传、下载、扫码、定位

```text
看文档 => 设备与原生能力
看能力 => useUpload / useDownload / useScanCode / useLocation / useImagePicker / useAuthorize
```

## WebSocket、SSE、事件总线

```text
看文档 => 事件总线 / Socket / SSE / 模块系统 / 实战 Recipes
看能力 => useEvent / useListener / useListenerOnly / useSocket / useSocketManager / useSSE / createSocketBridge
```

## JSON 动态渲染页面

```text
看文档 => Schema 渲染 / Schema 协议 / 组件
看能力 => useJsonSchema / UniSchemaRenderer / defineSchemaComponents
```

## 接 Wot UI 和主题

```text
看文档 => uni-pro 概览 / 主题与 Token / 组件总览 / API Reference
看能力 => createWotThemeVars / createUnoTheme / DuxRoot / ProPageShell
```

## 找完整示例

```text
看文档 => Starter 对照
看代码 => apps/starter/src/modules/*
```

## 理解自动生成层

```text
看文档 => CLI 与命令 / 自动生成产物
看能力 => dux-uni sync / src/runtime/* / src/pages/* / src/pages.json
```

## 做模块扩展点或事件注入

```text
看文档 => 扩展机制 / 模块系统 / 事件总线
看能力 => hooks.tap / hooks.collect / useHooks / useEvent / useListener / useAction / useActions
```
