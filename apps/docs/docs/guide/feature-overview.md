# 功能概览

这一页回答的是：`Dux Uni` 现在已经覆盖了哪些应用层能力。

## @duxweb/uni

### 应用与运行时

```ts
createUni()
installUniApp()
setupUniAppLifecycle()
defineUniConfig()
definePageMeta()
defineUniModule()
mergeUniModules()
```

### 路由与页面

```ts
useRouter()
useRoute()
usePageTitle()
usePageGuard()
useModules()
useActions()
useAction()
```

### 鉴权与权限

```ts
useAuth()
useLogin()
useLogout()
useCheck()
useCan()
```

### 数据查询

```ts
useList()
useInfiniteList()
useOne()
useMany()
useCustom()
useCreate()
useUpdate()
useDelete()
useCustomMutation()
useInvalidate()
useRefetch()
```

### 表单与数据整理

```ts
useForm()
useSelect()
useTree()
```

### Overlay

```ts
useConfirm()
useModal()
useDrawer()
useOverlayContext()
useOverlayEntries()
```

### 事件与实时

```ts
useEvent()
useListener()
useListenerOnce()
useListenerOnly()
useSocket()
useSSE()
```

### 设备与原生能力

```ts
useAuthorize()
useLocation()
useImagePicker()
useClipboard()
useScanCode()
useShare()
usePhoneCall()
useOpenLocation()
useDownload()
useUpload()
```

### Schema 渲染

```ts
useJsonSchema()
UniSchemaRenderer
createSchemaRenderer()
renderSchema()
defineSchemaComponents()
registerSchemaComponents()
```

## @duxweb/uni-pro

### Root 与 Overlay 宿主

```ts
DuxRoot.vue
ProAppProvider.vue
DuxOverlayHost.vue
DuxOverlayPresenter.vue
```

### 页面基础组件

```ts
ProPageShell.vue
ProSection.vue
ProEmpty.vue
```

### 主题能力

```ts
createWotThemeVars()
createUnoTheme()
createUniTheme()
defaultThemeTokens
defaultRadiusTokens
defaultSpacingTokens
```

## 如果你想继续看落地方式

- [快速开始](/guide/getting-started)
- [开发应用](/guide/development-flow)
- [Starter 对照](/guide/starter-showcase)
