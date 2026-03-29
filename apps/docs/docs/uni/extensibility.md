# 扩展机制：Hooks / Events / Actions

`dux-uni` 不是只给页面提供 hook，它本身也提供了一套应用内部扩展机制。

这套机制主要由三部分组成：

- hooks
- events
- actions

## 1. hooks

hooks 更适合“收集式扩展”。

典型特征：

- 一个点位允许多个模块注入内容
- 调用方主动收集结果
- 适合做扩展点

### 运行时能力

运行时提供：

- `hooks.tap(name, handler)`
- `hooks.collect(name, payload?, meta?)`
- `hooks.waterfall(name, payload, meta?)`

页面侧可通过：

- `useHooks()`

获取 registry。

### 典型场景

最典型的是登录页注入额外登录方式。

starter 里：

- `apps/starter/src/modules/account/index.ts`

通过模块入口注册：

```ts
register({ hooks }) {
  hooks.tap('auth.login.methods', () => ({
    key: 'sso',
    label: '企业 SSO',
  }))
}
```

登录页里：

```ts
const hooks = useHooks()
const methods = await hooks.collect('auth.login.methods')
```

### collect 和 waterfall 的区别

| 方法 | 用途 |
| --- | --- |
| `collect()` | 收集多个结果，返回数组 |
| `waterfall()` | 上一个处理器的输出作为下一个输入 |

如果你只是想“让多个模块往一个点注入数据”，优先用 `collect()`。

## 2. events

events 更适合“广播式通知”。

典型特征：

- 一方 emit
- 多方监听
- 适合状态变化和业务通知

### 运行时能力

运行时提供：

- `events.on()`
- `events.once()`
- `events.off()`
- `events.emit()`

页面侧可用：

- `useEvent()`
- `useListener()`
- `useListenerOnce()`
- `useListenerOnly()`
- `useEvents()`

### priority 和 only

事件监听支持：

- `priority`
- `only`
- `once`

也就是说，你可以做：

- 优先级监听
- 唯一监听器
- 只监听一次

### 典型场景

- 登录成功后刷新账户页
- socket 收到消息后广播给多个页面
- 模块之间互相通知

## 3. actions

actions 更适合“命令式执行”。

典型特征：

- 按名字执行一个明确动作
- 适合 schema action、按钮动作、运行时命令

### 运行时能力

运行时提供：

- `actions.register(name, handler)`
- `actions.execute(name, context)`

页面侧可用：

- `useActions()`
- `useAction(name)`

### 内置例子

runtime 默认注册了一个：

- `navigate`

因此 schema 或业务动作可以直接执行统一导航。

## 模块里怎么注册

模块入口可以直接注册：

- `hooks`
- `listeners`
- `actions`
- 或在 `register()` 里手动接 runtime registry

## 推荐怎么选

### 用 hooks

当你需要：

- 做扩展点
- 收集多个模块注入结果
- 做页面插槽式能力注入

### 用 events

当你需要：

- 广播通知
- 一处触发，多处响应
- 页面和模块之间松耦合通信

### 用 actions

当你需要：

- 明确执行一个动作
- 给 schema/button 统一接命令
- 按名字调用能力

## 和业务 hook 的区别

这里的 hooks 指的是“运行时 hook registry”，不是 `useList()`、`useForm()` 这种业务 hook。

两者不是一回事：

- `useList()` 是组合式业务 API
- `hooks.tap()` 是扩展机制

## 一个实用判断标准

如果你在想：

- “我要收集多个模块的扩展结果” => 用 hooks
- “我要广播一个状态变化” => 用 events
- “我要执行一个命名动作” => 用 actions
