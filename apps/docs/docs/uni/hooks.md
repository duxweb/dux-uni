# Hook 总览

这一页只做导航，不展开长篇说明。

如果你想查详细参数、返回值和示例，直接点到对应能力页。

## 路由与页面

- [`useRouter()`](/uni/router#userouter)：统一页面跳转入口，会自动处理普通页、tabBar 页和模块首页跳转
- [`useRoute()`](/uni/router#useroute)：读取当前页面的路径、页面名、模块名、query 和 meta
- [`usePageTitle()`](/uni/router#usepagetitle)：设置当前页面标题，支持字符串和响应式标题
- [`usePageGuard()`](/uni/router#usepageguard)：在页面内做简单登录保护或游客页保护

## 请求与数据

- [`useList()`](/uni/data#uselist)：标准分页列表查询
- [`useInfiniteList()`](/uni/data#useinfinitelist)：无限滚动列表查询
- [`useOne()`](/uni/data#useone)：单条详情查询
- [`useMany()`](/uni/data#usemany)：根据 id 数组批量查询和回填
- [`useCustom()`](/uni/data#usecustom)：读取型自定义 query，请求非资源式接口
- [`useCreate()`](/uni/data#usecreate)：创建型 mutation，适合新增数据
- [`useUpdate()`](/uni/data#useupdate)：更新型 mutation，适合修改数据
- [`useDelete()`](/uni/data#usedelete)：删除型 mutation，适合删除数据
- [`useCustomMutation()`](/uni/data#usecustommutation)：提交型自定义 mutation，适合命令式动作
- [`useInvalidate()`](/uni/data#useinvalidate)：让 query 缓存失效、重置或移除
- [`useRefetch()`](/uni/data#userefetch)：主动刷新指定 query

## 认证与权限

- [`useAuth()`](/uni/auth#useauth)：读取当前认证状态和用户 token 信息
- [`useLogin()`](/uni/auth#uselogin)：执行登录动作，自动写入会话和处理跳转
- [`useLogout()`](/uni/auth#uselogout)：执行退出动作，自动清理会话和缓存
- [`useCheck()`](/uni/auth#usecheck)：手动校验当前登录态是否有效，也可覆盖默认自动校验
- [`useCan()`](/uni/auth#usecan)：判断当前用户是否拥有某个权限

## 表单与数据整理

- [`useForm()`](/uni/data#useform)：管理表单值、校验和提交流程
- [`useSelect()`](/uni/data#useselect)：拉取远程选项，处理搜索、分页和回填
- [`useTree()`](/uni/data#usetree)：把平铺数据整理成树结构，适合树选择和树展示

## 弹层

- [`useConfirm()`](/uni/overlay#useconfirm)：打开确认框并等待用户确认结果
- [`useModal()`](/uni/overlay#usemodal)：打开模态弹窗，支持异步组件和结果回传
- [`useDrawer()`](/uni/overlay#usedrawer)：打开抽屉弹层，适合筛选器和侧边编辑
- [`useOverlayContext()`](/uni/overlay#useoverlaycontext)：在弹层内容组件里读取 payload、提交结果或主动关闭
- [`useOverlayEntries()`](/uni/overlay#useoverlayentries)：读取当前 overlay 队列，通常给 overlay host 用

## 事件

- [`useEvent()`](/uni/realtime#useevent)：主动触发一个业务事件
- [`useListener()`](/uni/realtime#uselistener)：监听业务事件并在回调里消费它
- [`useListenerOnce()`](/uni/realtime#uselisteneronce)：只监听一次事件，触发后自动解绑
- [`useListenerOnly()`](/uni/realtime#uselisteneronly)：注册唯一监听器，适合独占式事件处理

## Socket 与 SSE

- [`useSocket()`](/uni/socket#usesocket)：建立页面级或局部级 WebSocket 连接
- [`useSocketManager()`](/uni/socket#usesocketmanager)：读取默认或命名的全局 WebSocket 管理器
- [`useSocketManagers()`](/uni/socket#usesocketmanagers)：一次性读取全部全局 WebSocket 管理器
- [`useSSE()`](/uni/sse#usesse)：建立 SSE 流式连接，适合 AI 输出和单向流
- [`useEventSource()`](/uni/sse#useeventsource)：更底层的 SSE Hook

## 设备与原生能力

- [`useAuthorize()`](/uni/device#useauthorize)：统一查询和申请原生权限
- [`useLocation()`](/uni/device#uselocation)：获取定位、选点和打开地图
- [`useImagePicker()`](/uni/device#useimagepicker)：选择图片并整理成统一文件结构
- [`useClipboard()`](/uni/device#useclipboard)：读取或复制剪贴板内容
- [`useScanCode()`](/uni/device#usescancode)：调起扫码能力
- [`useShare()`](/uni/device#useshare)：发起原生分享
- [`usePhoneCall()`](/uni/device#usephonecall)：调起拨号
- [`useOpenLocation()`](/uni/device#useopenlocation)：直接打开地图导航
- [`useUpload()`](/uni/device#useupload)：上传文件并跟踪进度
- [`useDownload()`](/uni/device#usedownload)：下载文件并处理保存或打开
