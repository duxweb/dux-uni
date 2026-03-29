# API Reference

这一页只做导出索引。

每个 API 后面都附一行中文说明和对应跳转页，适合快速查名字、用途和入口。

## App 与配置

| API | 说明 | 跳转 |
| --- | --- | --- |
| `createUni()` | 创建应用 runtime，把路由、请求、鉴权、模块等能力收进同一个应用容器 | [应用生命周期](/guide/runtime-entry) |
| `installUniApp()` | 把创建好的 runtime 安装到 Vue app | [应用生命周期](/guide/runtime-entry) |
| `setupUniAppLifecycle()` | 把 uni-app 生命周期绑定到 runtime | [应用生命周期](/guide/runtime-entry) |
| `defineUniConfig()` | 定义传给 `createUni()` 的运行时配置 | [初始化配置](/guide/dux-ts) |
| `definePageMeta()` | 定义页面 Route 的辅助方法 | [页面 Route](/uni/page-route) |
| `useUniApp()` | 读取当前已安装的应用 runtime | [应用生命周期](/guide/runtime-entry) |
| `useDux()` | `useUniApp()` 的同层入口，语义上更贴近 Dux runtime | [应用生命周期](/guide/runtime-entry) |

## 路由与页面

| API | 说明 | 跳转 |
| --- | --- | --- |
| `useRouter()` | 统一页面跳转入口，会自动处理普通页和 tabBar 页 | [useRouter](/uni/router#userouter) |
| `useNavigator()` | `useRouter()` 的兼容别名 | [useRouter](/uni/router#userouter) |
| `useRoute()` | 读取当前页面路径、query、页面名、模块名和 meta | [useRoute](/uni/router#useroute) |
| `usePageTitle()` | 设置当前页面标题，支持响应式标题 | [usePageTitle](/uni/router#usepagetitle) |
| `usePageGuard()` | 页面内做简单登录保护或游客页保护 | [usePageGuard](/uni/router#usepageguard) |
| `useModules()` | 读取当前已注册的模块列表 | [模块系统](/uni/modules) |
| `useActions()` | 读取 action registry，并执行运行时 action | [扩展机制](/uni/extensibility) |
| `useAction()` | 读取并执行单个 action | [扩展机制](/uni/extensibility) |

## 认证与权限

| API | 说明 | 跳转 |
| --- | --- | --- |
| `useAuth()` | 读取当前认证状态、token、用户信息和权限数据 | [useAuth](/uni/auth#useauth) |
| `useLogin()` | 执行登录动作，自动写入会话并处理成功跳转 | [useLogin](/uni/auth#uselogin) |
| `useLogout()` | 执行退出动作，自动清理会话和缓存 | [useLogout](/uni/auth#uselogout) |
| `useCheck()` | 手动校验当前登录态是否有效，也可配合运行时自动校验 | [useCheck](/uni/auth#usecheck) |
| `useCan()` | 判断当前用户是否拥有某个权限 | [useCan](/uni/auth#usecan) |
| `useIsLogin()` | 兼容保留 Hook，建议改用 `useAuth()` 推导登录态 | [认证与会话](/uni/auth) |
| `simpleAuthProvider()` | 默认认证 provider，适合 token 型登录协议 | [simpleAuthProvider](/uni/auth#simpleauthprovider) |

## 请求与数据

| API | 说明 | 跳转 |
| --- | --- | --- |
| `useList()` | 标准分页列表查询 | [useList](/uni/data#uselist) |
| `useInfiniteList()` | 无限滚动列表查询 | [useInfiniteList](/uni/data#useinfinitelist) |
| `useOne()` | 单条详情查询 | [useOne](/uni/data#useone) |
| `useMany()` | 批量 id 查询和回填 | [useMany](/uni/data#usemany) |
| `useCustom()` | 读取型自定义 query | [useCustom](/uni/data#usecustom) |
| `useCreate()` | 创建型 mutation，适合新增数据 | [useCreate](/uni/data#usecreate) |
| `useUpdate()` | 更新型 mutation，适合编辑数据 | [useUpdate](/uni/data#useupdate) |
| `useDelete()` | 删除型 mutation | [useDelete](/uni/data#usedelete) |
| `useCustomMutation()` | 提交型自定义 mutation，适合命令式动作 | [useCustomMutation](/uni/data#usecustommutation) |
| `useInvalidate()` | 让指定 query 缓存失效、重置或移除 | [useInvalidate](/uni/data#useinvalidate) |
| `useRefetch()` | 主动刷新指定 query | [useRefetch](/uni/data#userefetch) |
| `getQueryKey()` | 生成统一 query key | [数据查询](/uni/data) |
| `simpleDataProvider()` | 默认数据 provider，统一资源式请求 | [数据查询](/uni/data) |
| `createUniNetworkAdapter()` | 基于 `@uni-helper/uni-network` 的默认 adapter | [请求配置](/uni/request) |
| `createRequestClient()` | 构造底层请求客户端，支持 header、sign、拦截器和 adapter | [请求配置](/uni/request) |

## 表单与弹层

| API | 说明 | 跳转 |
| --- | --- | --- |
| `useForm()` | 管理表单值、校验和提交流程 | [useForm](/uni/data#useform) |
| `useSelect()` | 拉取远程选项，处理搜索、分页和回填 | [useSelect](/uni/data#useselect) |
| `useTree()` | 把平铺数据整理成树结构 | [useTree](/uni/data#usetree) |
| `useConfirm()` | 打开确认框并等待结果 | [useConfirm](/uni/overlay#useconfirm) |
| `useModal()` | 打开模态弹窗，支持异步组件和结果回传 | [useModal](/uni/overlay#usemodal) |
| `useDrawer()` | 打开抽屉弹层 | [useDrawer](/uni/overlay#usedrawer) |
| `useOverlayContext()` | 在弹层内部读取 payload、提交结果或主动关闭 | [useOverlayContext](/uni/overlay#useoverlaycontext) |
| `useOverlayEntries()` | 读取当前 overlay 队列 | [useOverlayEntries](/uni/overlay#useoverlayentries) |
| `useModalForm()` | `useModal()` 的兼容别名 | [useModal](/uni/overlay#usemodal) |
| `useDrawerForm()` | `useDrawer()` 的兼容别名 | [useDrawer](/uni/overlay#usedrawer) |

## 事件、实时与设备

| API | 说明 | 跳转 |
| --- | --- | --- |
| `useEvent()` | 主动触发业务事件 | [useEvent](/uni/realtime#useevent) |
| `useListener()` | 监听业务事件 | [useListener](/uni/realtime#uselistener) |
| `useListenerOnce()` | 只监听一次业务事件 | [useListenerOnce](/uni/realtime#uselisteneronce) |
| `useListenerOnly()` | 注册唯一监听器，适合独占式监听 | [useListenerOnly](/uni/realtime#uselisteneronly) |
| `useSocket()` | 建立页面级或局部级 WebSocket 连接 | [useSocket](/uni/socket#usesocket) |
| `useSocketManager()` | 读取默认或命名的全局 WebSocket 管理器 | [useSocketManager](/uni/socket#usesocketmanager) |
| `useSocketManagers()` | 一次性读取全部全局 WebSocket 管理器 | [useSocketManagers](/uni/socket#usesocketmanagers) |
| `useWebSocketManager()` | `useSocketManager()` 的兼容别名 | [useSocketManager](/uni/socket#usesocketmanager) |
| `useEventSource()` | 更底层的 SSE 流式连接 Hook | [useEventSource](/uni/sse#useeventsource) |
| `useSSE()` | SSE 简写 Hook，适合 AI 和日志流 | [useSSE](/uni/sse#usesse) |
| `useAuthorize()` | 查询和申请原生权限 | [useAuthorize](/uni/device#useauthorize) |
| `useLocation()` | 获取定位、选点和打开地图 | [useLocation](/uni/device#uselocation) |
| `useImagePicker()` | 选择图片并整理成统一文件结构 | [useImagePicker](/uni/device#useimagepicker) |
| `useClipboard()` | 读取或复制剪贴板内容 | [useClipboard](/uni/device#useclipboard) |
| `useScanCode()` | 调起扫码能力 | [useScanCode](/uni/device#usescancode) |
| `useShare()` | 发起原生分享 | [useShare](/uni/device#useshare) |
| `usePhoneCall()` | 调起拨号 | [usePhoneCall](/uni/device#usephonecall) |
| `useOpenLocation()` | 打开地图导航 | [useOpenLocation](/uni/device#useopenlocation) |
| `useUpload()` | 上传文件并跟踪进度 | [useUpload](/uni/device#useupload) |
| `useDownload()` | 下载文件并处理保存或打开 | [useDownload](/uni/device#usedownload) |

## 模块、Schema 与底层运行时

| API | 说明 | 跳转 |
| --- | --- | --- |
| `defineUniModule()` | 定义模块入口 | [模块系统](/uni/modules) |
| `mergeUniModules()` | 合并模块 pages、layouts、actions 和 schema | [模块系统](/uni/modules) |
| `mergeUniConfigPatch()` | 合并模块级配置 patch | [模块系统](/uni/modules) |
| `createSocketBridge()` | 把 socket 消息桥接成业务事件 | [实战 Recipes](/uni/recipes) |
| `useJsonSchema()` | JSON Schema 渲染入口 | [Schema 渲染](/uni/schema) |
| `UniSchemaRenderer` | 底层 Schema 渲染组件 | [Schema 渲染](/uni/schema) |
| `createSchemaRenderer()` | 创建底层 Schema renderer | [Schema 渲染](/uni/schema) |
| `renderSchema()` | 直接渲染 schema 为 VNode | [Schema 渲染](/uni/schema) |
| `registerSchemaComponents()` | 注册 schema 可用组件 | [Schema 渲染](/uni/schema) |
| `defineSchemaComponents()` | 定义 schema 组件注册表 | [Schema 渲染](/uni/schema) |
| `createActionRegistry()` | 创建 action registry | [扩展机制](/uni/extensibility) |
| `createEventBus()` | 创建 event bus | [扩展机制](/uni/extensibility) |
| `createHookRegistry()` | 创建 hook registry | [扩展机制](/uni/extensibility) |
| `createMiddlewareRegistry()` | 创建 middleware registry | [页面运行时](/uni/page-runtime) |
| `createOverlayRuntime()` | 创建 overlay runtime | [Overlay](/uni/overlay) |
| `createRouter()` | 创建 router runtime | [路由与运行时](/uni/router) |
| `createNavigator()` | 创建 navigator runtime | [路由与运行时](/uni/router) |
| `createSessionManager()` | 创建 session manager | [认证与会话](/uni/auth) |
| `createSocketManager()` | 创建全局 socket manager | [useSocketManager](/uni/socket#usesocketmanager) |
| `createUniQueryClient()` | 创建 query client | [数据查询](/uni/data) |

## 常用类型

| 类型 | 说明 | 跳转 |
| --- | --- | --- |
| `UniPageMeta` | 页面 Route 类型 | [页面 Route](/uni/page-route) |
| `UniNavigationTarget` | 路由跳转目标类型 | [路由与运行时](/uni/router) |
| `UniAuthState` | 认证状态类型 | [认证与会话](/uni/auth) |
| `UniDataResult` | 数据请求结果类型 | [数据查询](/uni/data) |
| `UniModuleManifest` | 模块描述类型 | [模块系统](/uni/modules) |
| `UniModuleMiddleware` | 模块中间件类型 | [页面运行时](/uni/page-runtime) |
| `UniSchemaNode` | Schema 节点类型 | [Schema 协议](/uni/schema-protocol) |
| `UniSchemaBindings` | Schema 绑定上下文类型 | [Schema 协议](/uni/schema-protocol) |
| `DuxConfig` | `dux.config.ts` 类型 | [应用配置](/guide/configuration) |
| `DuxThemeTokens` | 主题 token 类型 | [主题与 Token](/uni-pro/theme) |
