import type { StoreDefinition } from 'pinia'
import type { QueryClient, QueryClientConfig } from '@tanstack/vue-query'
import type { Component } from 'vue'
import type { DuxThemeTokens } from './dux/types'

export type Dict<T = unknown> = Record<string, T>
export type UniTabBarMode = 'auto' | 'custom' | 'native'
export type UniTabBarRenderer = 'auto' | 'custom' | 'native'

export interface UniPageMeta {
  name: string
  path: string
  module?: string
  title?: string
  navbarTitle?: string
  navbarSubtitle?: string
  navbarRightText?: string
  navbarShadow?: boolean
  immersive?: boolean
  tabBarActive?: string
  auth?: boolean
  guestOnly?: boolean
  middleware?: string[]
  permission?: string | string[]
  layout?: string
  tabBar?: boolean | Dict
  keepAlive?: boolean
  params?: string[]
  [key: string]: unknown
}

export interface UniNavigationTarget {
  name?: string
  path?: string
  query?: Dict<string | number | boolean | undefined | null>
}

export interface UniNavigationAdapter {
  navigateTo: (options: { url: string }) => Promise<unknown> | unknown
  redirectTo: (options: { url: string }) => Promise<unknown> | unknown
  switchTab: (options: { url: string }) => Promise<unknown> | unknown
  reLaunch: (options: { url: string }) => Promise<unknown> | unknown
  navigateBack: (options?: { delta?: number }) => Promise<unknown> | unknown
  setNavigationBarTitle?: (options: { title: string }) => Promise<unknown> | unknown
}

export interface UniCurrentRoute {
  path: string
  fullPath: string
  name?: string
  module?: string
  query: Dict<string>
  meta?: UniPageMeta
  tabBar: boolean
}

export type UniPermissionFallbackMode = 'redirect' | 'component'

export interface UniPermissionConfig {
  fallback?: UniPermissionFallbackMode
  redirectTo?: string
  component?: Component
}

export interface UniAuthRuntimeConfig {
  autoCheckOnLaunch?: boolean
  autoCheckOnShow?: boolean
  checkTtl?: number
  path?: string
  method?: string
}

export interface UniStorageAdapter {
  get<T = unknown>(key: string): Promise<T | null | undefined>
  set<T = unknown>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

export interface UniUploadProgress {
  loaded: number
  total?: number
  percent?: number
}

export type UniAuthorizeScope = string

export interface UniLocationResult {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  verticalAccuracy?: number
  horizontalAccuracy?: number
  address?: string
  name?: string
  [key: string]: unknown
}

export interface UniImageAsset {
  path: string
  size?: number
  name?: string
  type?: string
  extname?: string
  duration?: number
  width?: number
  height?: number
  [key: string]: unknown
}

export interface UniRequestOptions {
  url: string
  method?: string
  query?: Dict
  data?: unknown
  headers?: Dict<string>
  timeout?: number
  signal?: AbortSignal
  meta?: Dict
  onUploadProgress?: (progress: UniUploadProgress) => void
  onDownloadProgress?: (progress: UniUploadProgress) => void
}

export interface UniRequestResponse<T = unknown> {
  status: number
  data: T
  headers?: Dict<string>
  raw?: unknown
}

export interface UniRequestError<T = unknown> extends Error {
  status?: number
  data?: T
  headers?: Dict<string>
  raw?: unknown
}

export interface UniRequestAdapter {
  request<T = unknown>(options: UniRequestOptions): Promise<UniRequestResponse<T>>
}

export interface UniRequestInterceptorContext extends UniRequestOptions {}

export interface UniResponseInterceptorContext<T = unknown> {
  request: UniRequestOptions
  response: UniRequestResponse<T>
}

export interface UniAuthState {
  token?: string
  user?: Dict
  permissions?: string[] | Dict<boolean>
  expiresAt?: number
  [key: string]: unknown
}

export interface UniSessionState {
  initialized: boolean
  authenticated: boolean
  auth: UniAuthState | null
}

export interface UniLoginResult {
  success: boolean
  message?: string
  redirectTo?: string
  data?: UniAuthState
}

export interface UniLogoutResult {
  success: boolean
  message?: string
  redirectTo?: string
}

export interface UniCheckResult {
  success: boolean
  logout?: boolean
  message?: string
  data?: UniAuthState
}

export interface UniAuthRequestOptions {
  path?: string
  method?: string
}

export interface UniAuthProvider {
  login: (params: Dict, context: UniAppContext, request?: UniAuthRequestOptions) => Promise<UniLoginResult>
  logout: (params: Dict | undefined, context: UniAppContext, request?: UniAuthRequestOptions) => Promise<UniLogoutResult>
  check?: (params: Dict | undefined, context: UniAppContext, auth: UniAuthState | null, request?: UniAuthRequestOptions) => Promise<UniCheckResult>
  can?: (permission: string, context: UniAppContext, auth: UniAuthState | null) => boolean
  onError?: (error: UniRequestError, context: UniAppContext) => Promise<{ logout?: boolean; redirectTo?: string } | void>
}

export interface UniDataResult<T = unknown> {
  message?: string
  data?: T
  meta?: Dict
  status?: number
  headers?: Dict<string>
  raw?: unknown
}

export interface UniListOptions {
  path: string
  pagination?: boolean | { page?: number; pageSize?: number }
  filters?: Dict
  sorters?: Dict<'asc' | 'desc'>
  meta?: Dict
}

export interface UniMutateOptions {
  path?: string
  id?: string | number
  data?: unknown
  meta?: Dict
}

export interface UniGetOneOptions {
  path: string
  id?: string | number
  meta?: Dict
}

export interface UniGetManyOptions {
  path: string
  ids: Array<string | number>
  meta?: Dict
}

export interface UniCustomOptions {
  path?: string
  method?: string
  query?: Dict
  filters?: Dict
  sorters?: Dict<'asc' | 'desc'>
  payload?: unknown
  headers?: Dict<string>
  meta?: Dict
}

export interface UniDataProvider {
  apiUrl?: (path?: string, basePath?: string) => string
  getList: (options: UniListOptions, context: UniAppContext, auth: UniAuthState | null) => Promise<UniDataResult>
  getOne: (options: UniGetOneOptions, context: UniAppContext, auth: UniAuthState | null) => Promise<UniDataResult>
  getMany: (options: UniGetManyOptions, context: UniAppContext, auth: UniAuthState | null) => Promise<UniDataResult>
  create: (options: UniMutateOptions, context: UniAppContext, auth: UniAuthState | null) => Promise<UniDataResult>
  update: (options: UniMutateOptions, context: UniAppContext, auth: UniAuthState | null) => Promise<UniDataResult>
  deleteOne: (options: UniMutateOptions, context: UniAppContext, auth: UniAuthState | null) => Promise<UniDataResult>
  custom: (options: UniCustomOptions, context: UniAppContext, auth: UniAuthState | null) => Promise<UniDataResult>
  getTotal: (result: UniDataResult) => number
}

export interface UniActionContext {
  app: UniAppContext
  node?: UniSchemaNode
  scope?: Dict
  payload?: unknown
}

export type UniActionHandler = (context: UniActionContext) => unknown | Promise<unknown>

export interface UniActionRegistry {
  register: (name: string, handler: UniActionHandler) => void
  unregister: (name: string) => void
  execute: (name: string, context: UniActionContext) => Promise<unknown>
  list: () => string[]
}

export interface UniHookExecutionContext {
  hook: string
  meta?: Dict
}

export type UniHookHandler<TPayload = unknown, TResult = unknown> = (
  payload: TPayload,
  context: UniHookExecutionContext,
) => TResult | Promise<TResult>

export interface UniHookRegistry {
  tap: (name: string, handler: UniHookHandler) => () => void
  collect: <T = unknown>(name: string, payload?: unknown, meta?: Dict) => Promise<T[]>
  waterfall: <T = unknown>(name: string, payload: T, meta?: Dict) => Promise<T>
  clear: (name?: string) => void
  list: () => string[]
}

export type UniEventHandler = (payload?: unknown) => void

export interface UniEventListenerOptions {
  priority?: number
  once?: boolean
  only?: boolean
}

export interface UniEventBus {
  on: (name: string, handler: UniEventHandler, options?: UniEventListenerOptions) => () => void
  once: (name: string, handler: UniEventHandler, options?: Omit<UniEventListenerOptions, 'once'>) => () => void
  off: (name: string, handler: UniEventHandler) => void
  emit: (name: string, payload?: unknown) => void
  clear: () => void
  list: () => string[]
}

export type UniModuleMiddlewareResult = void | false | string | {
  redirectTo: string
} | {
  component: Component
}

export interface UniModuleMiddlewareContext {
  app: UniAppContext
  to?: UniPageMeta
  from?: UniPageMeta
  path: string
  fullPath?: string
  query?: Dict<string>
}

export interface UniModuleMiddleware {
  name: string
  order?: number
  matcher?: string | string[] | ((page: UniPageMeta | undefined) => boolean)
  handler: (context: UniModuleMiddlewareContext) => UniModuleMiddlewareResult | Promise<UniModuleMiddlewareResult>
}

export interface UniMiddlewareRegistry {
  register: (input: UniModuleMiddleware) => () => void
  unregister: (name: string) => void
  resolve: (page?: UniPageMeta) => UniModuleMiddleware[]
  run: (context: UniModuleMiddlewareContext) => Promise<UniModuleMiddlewareResult | undefined>
  list: () => string[]
}

export interface UniSchemaBindings {
  state?: Dict
  props?: Dict
  query?: Dict
  request?: Dict
  [key: string]: unknown
}

export interface UniSchemaActionConfig {
  name: string
  payload?: unknown
}

export interface UniSchemaComponentRegistration {
  name: string
  component: Component
  aliases?: string[]
}

export interface UniSchemaNode {
  tag?: string | Component
  component?: string | Component
  key?: string
  attrs?: Dict
  props?: Dict
  class?: string
  style?: string | Dict
  if?: string
  elseIf?: string
  else?: boolean
  switch?: string
  case?: unknown
  defaultCase?: boolean
  visibleWhen?: string
  forEach?: string
  bind?: string
  model?: string
  modelProp?: string
  disabledWhen?: string
  text?: unknown
  children?: string | UniSchemaNode | Array<string | UniSchemaNode>
  slots?: Record<string, string | UniSchemaNode | Array<string | UniSchemaNode>>
  actions?: {
    tap?: UniSchemaActionConfig
    change?: UniSchemaActionConfig
    submit?: UniSchemaActionConfig
  }
}

export interface UniRenderedSchemaNode {
  tag: string | Component
  key?: string
  props: Dict
  class?: string
  style?: string | Dict
  text?: unknown
  model?: string
  modelProp?: string
  disabled?: boolean
  children?: Array<UniRenderedSchemaNode | string>
  slots?: Record<string, Array<UniRenderedSchemaNode | string>>
  actions?: UniSchemaNode['actions']
  binding?: unknown
}

export interface UniSchemaComponentMap {
  [name: string]: unknown
}

export interface UniSchemaRendererOptions {
  components?: UniSchemaComponentMap | UniSchemaComponentRegistration[] | Component[]
  actions?: UniActionRegistry
  allowedComponents?: string[]
}

export type UniSseTransportMode = 'auto' | 'fetch' | 'request' | 'plus'

export type UniSseStatus = 'idle' | 'connecting' | 'open' | 'retrying' | 'closed' | 'error'

export type UniSocketManagerStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed' | 'error'

export interface UniSocketMessage {
  manager?: string
  event?: string
  data?: unknown
  text?: string
  raw: unknown
  receivedAt: number
}

export interface UniSocketManagerParseResult {
  event?: string
  data?: unknown
  text?: string
}

export interface UniSocketManagerConnectOptions {
  url?: string
  protocols?: string[]
  method?: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'
  headers?: Dict<string>
  auth?: boolean
  heartbeat?: boolean | {
    message?: string | ArrayBuffer
    interval?: number
    pongTimeout?: number
  }
  autoReconnect?: boolean | {
    retries?: number
    delay?: number
    onFailed?: () => void
  }
  parse?: (raw: unknown, app: UniAppContext) => UniSocketManagerParseResult
}

export interface UniSocketManagerConfig extends UniSocketManagerConnectOptions {
  connectOnLaunch?: boolean
  connectOnLogin?: boolean
  disconnectOnLogout?: boolean
  keepAliveOnHide?: boolean
}

export interface UniSocketSubscription {
  matcher?: string | ((message: UniSocketMessage) => boolean)
  handler: (message: UniSocketMessage) => void
}

export interface UniSocketManager {
  name?: string
  status: UniSocketManagerStatus
  connected: boolean
  retryCount: number
  activeUrl?: string
  lastMessage?: UniSocketMessage
  error?: unknown
  connect: (options?: Partial<UniSocketManagerConnectOptions>) => void
  disconnect: () => void
  reconnect: () => void
  send: (data: string | ArrayBuffer) => boolean
  sendJson: (payload: unknown) => boolean
  subscribe: (matcher: UniSocketSubscription['matcher'], handler: UniSocketSubscription['handler']) => () => void
  subscribeAll: (handler: UniSocketSubscription['handler']) => () => void
  onLaunch: () => void
  onShow: () => void
  onHide: () => void
}

export interface UniSseOpenResult {
  status?: number
  headers?: Dict<string>
  raw?: unknown
}

export interface UniSseMessage {
  id?: string
  event?: string
  data: string
  retry?: number
  raw?: string
}

export interface UniSseRetryContext {
  attempt: number
  delay: number
  error?: unknown
}

export type UniOverlayKind = 'confirm' | 'modal' | 'drawer'
export type UniOverlayFrame = 'default' | 'page'
export type UniOverlayPosition = 'center' | 'right' | 'bottom'

export type UniOverlayContentLoader = () => Promise<{ default?: Component } | Component>

export type UniOverlayContent = Component | UniOverlayContentLoader

export interface UniOverlayConfirmContext<TPayload = unknown, TResult = unknown> {
  id: string
  kind: UniOverlayKind
  loading: boolean
  payload?: TPayload
  meta?: Dict
  app: UniAppContext
  close: () => Promise<void>
  submit: (result?: TResult) => Promise<void>
  setLoading: (value: boolean) => void
  updatePayload: (payload: TPayload) => void
}

export interface UniBaseOverlayRequest<TPayload = unknown, TResult = unknown> {
  title?: string
  confirmText?: string
  cancelText?: string
  frame?: UniOverlayFrame
  payload?: TPayload
  meta?: Dict
  closeOnClickModal?: boolean
  onConfirm?: (context: UniOverlayConfirmContext<TPayload, TResult>) => TResult | void | Promise<TResult | void>
  onClose?: (context: UniOverlayConfirmContext<TPayload, TResult>) => void | Promise<void>
}

export interface UniConfirmOverlayRequest<TPayload = unknown, TResult = boolean> extends UniBaseOverlayRequest<TPayload, TResult> {
  kind?: 'confirm'
  message?: string
  danger?: boolean
}

export interface UniFormOverlayRequest<TPayload = unknown, TResult = unknown> extends UniBaseOverlayRequest<TPayload, TResult> {
  kind: 'modal' | 'drawer'
  content?: UniOverlayContent
  component?: UniOverlayContent
  contentKey?: string
  componentKey?: string
  width?: string
  position?: UniOverlayPosition
}

export type UniOverlayRequest<TPayload = unknown, TResult = unknown> =
  | UniConfirmOverlayRequest<TPayload, TResult>
  | UniFormOverlayRequest<TPayload, TResult>

export interface UniOverlayEntry<TPayload = unknown, TResult = unknown> {
  id: string
  kind: UniOverlayKind
  frame: UniOverlayFrame
  position?: UniOverlayPosition
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  payload?: TPayload
  meta?: Dict
  closeOnClickModal: boolean
  visible: boolean
  loading: boolean
  danger?: boolean
  width?: string
  content?: UniOverlayContent
  contentKey?: string
  onConfirm?: (context: UniOverlayConfirmContext<TPayload, TResult>) => TResult | void | Promise<TResult | void>
  onClose?: (context: UniOverlayConfirmContext<TPayload, TResult>) => void | Promise<void>
}

export interface UniOverlayRuntime {
  entries: UniOverlayEntry[]
  open: <TPayload = unknown, TResult = unknown>(request: UniOverlayRequest<TPayload, TResult>) => Promise<TResult | undefined>
  get: (id: string) => UniOverlayEntry | undefined
  remove: (id: string) => void
  close: (id: string) => Promise<void>
  submit: <TResult = unknown>(id: string, result?: TResult) => Promise<void>
  reject: (id: string, error?: unknown) => Promise<void>
  setLoading: (id: string, value: boolean) => void
  update: (id: string, patch: Partial<UniOverlayEntry>) => void
}

export interface CreateUniRequestClientOptions {
  adapter?: UniRequestAdapter
  baseURL?: string
  timeout?: number
  getHeaders?: () => Dict<string> | undefined
  sign?: (
    request: UniRequestInterceptorContext,
  ) => Promise<Partial<UniRequestOptions> | void> | Partial<UniRequestOptions> | void
  onRequest?: Array<(request: UniRequestInterceptorContext) => Promise<UniRequestInterceptorContext> | UniRequestInterceptorContext>
  onResponse?: Array<<T = unknown>(context: UniResponseInterceptorContext<T>) => Promise<UniRequestResponse<T>> | UniRequestResponse<T>>
  onError?: Array<(error: UniRequestError) => Promise<never> | never>
}

export interface CreateUniQueryClientOptions extends QueryClientConfig {
  client?: QueryClient
}

export interface UniRequestClient {
  request: <T = unknown>(options: UniRequestOptions) => Promise<UniRequestResponse<T>>
}

export interface UniThemeRuntimeConfig {
  tokens?: Partial<DuxThemeTokens>
  mode?: 'system' | 'light' | 'dark'
  getTheme?: (context: UniAppContext) => 'light' | 'dark'
  onSystemThemeChange?: (theme: 'light' | 'dark', context: UniAppContext) => void
}

export interface UniAppConfig {
  appName?: string
  storageKey?: string
  apiBaseURL?: string
  apiBasePath?: string
  overlayRegistry?: Component | string
  tabBarMode?: UniTabBarMode
  tabBarRenderer?: UniTabBarRenderer
  pages?: UniPageMeta[]
  layouts?: Record<string, string>
  modules?: UniModuleManifest[]
  moduleActions?: Record<string, UniActionHandler>
  authProvider?: UniAuthProvider
  auth?: UniAuthRuntimeConfig
  dataProvider?: UniDataProvider
  navigator?: UniNavigationAdapter
  request?: CreateUniRequestClientOptions
  query?: CreateUniQueryClientOptions
  storage?: UniStorageAdapter
  schema?: UniSchemaRendererOptions
  permission?: UniPermissionConfig
  themeRuntime?: UniThemeRuntimeConfig
  socket?: UniSocketManagerConfig
  sockets?: Record<string, UniSocketManagerConfig>
}

export interface UniStores {
  auth: StoreDefinition
  app: StoreDefinition
  session: StoreDefinition
  schema: StoreDefinition
}

export interface UniAppContext {
  config: UniAppConfig
  pinia?: unknown
  ready: Promise<void>
  modules: UniModuleManifest[]
  request: UniRequestClient
  queryClient: QueryClient
  navigator: ReturnType<typeof import('./runtime/navigator').createNavigator>
  router: ReturnType<typeof import('./runtime/router').createRouter>
  session: ReturnType<typeof import('./runtime/session').createSessionManager>
  actions: UniActionRegistry
  hooks: UniHookRegistry
  events: UniEventBus
  middlewares: UniMiddlewareRegistry
  overlay: UniOverlayRuntime
  socket: UniSocketManager
  sockets: Record<string, UniSocketManager>
  stores: UniStores
}

export interface UniModuleSetupContext {
  app: UniAppContext
  module: UniModuleManifest
}

export interface UniModuleLifecycle {
  register?: (context: UniModuleRegisterContext) => void
  init?: (context: UniModuleSetupContext) => void | Promise<void>
  boot?: (context: UniModuleSetupContext) => void | Promise<void>
  setup?: (context: UniModuleSetupContext) => void | Promise<void>
}

export interface UniModuleRegisterContext {
  config: UniAppConfig
  module: UniModuleManifest
  actions: UniActionRegistry
  hooks: UniHookRegistry
  events: UniEventBus
  middlewares: UniMiddlewareRegistry
  extendConfig: (patch: Partial<UniAppConfig>) => void
}

export interface UniModuleManifest {
  name: string
  pages?: UniPageMeta[]
  dependsOn?: string[]
  layouts?: Record<string, string>
  defaultLayout?: string
  middlewares?: UniModuleMiddleware[]
  stores?: Dict<StoreDefinition>
  actions?: Record<string, UniActionHandler>
  hooks?: Record<string, UniHookHandler | UniHookHandler[]>
  listeners?: Record<string, UniEventHandler | UniEventHandler[]>
  config?: Partial<UniAppConfig> | ((context: UniModuleRegisterContext) => Partial<UniAppConfig> | void)
  schema?: {
    components?: UniSchemaComponentMap
  }
  lifecycle?: UniModuleLifecycle
  register?: (context: UniModuleRegisterContext) => void
  init?: (context: UniModuleSetupContext) => void | Promise<void>
  boot?: (context: UniModuleSetupContext) => void | Promise<void>
  setup?: (context: UniModuleSetupContext) => void | Promise<void>
}
