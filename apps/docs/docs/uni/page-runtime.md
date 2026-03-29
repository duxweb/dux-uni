# 页面运行时

真实页面从模块页变成“真正可进入页面”的过程，主要发生在页面运行时层。

## 整体流程

```text
1. sync 扫描页面和 <route> route 配置
2. 生成 src/pages/feature/secure.vue
3. 包装页里调用 definePage()
4. 包装页里调用 usePageRuntime('feature.secure')
5. 等待 dux.ready
6. 运行页面中间件链
7. 通过后再渲染真实页面
```

## definePage

你通常只会在自动生成包装页里看到它。

作用：

```text
把页面最终解析后的静态页面 Route 固化下来
```

业务页本身还是优先写 `<route lang="json">`。

## usePageRuntime

它位于：

```text
src/runtime/router/page.ts
```

负责：

```text
等待 runtime ready
找到当前页面 route 配置
执行中间件
处理拦截结果
允许时设置 ready = true
```

返回值：

```text
ready              => 页面是否允许渲染
fallbackComponent  => 中间件返回的兜底组件
```

## 中间件链从哪里来

页面运行时只负责“执行”中间件链。

中间件链本身来自：

```text
页面 Route 里的 middleware
页面 Route 里的 auth / guestOnly / permission
模块入口里注册的 middlewares
```

字段怎么写，优先看：

- [页面 Route](/uni/page-route)
- [模块系统](/uni/modules)

## handler 可以返回什么

```text
undefined         => 通过，继续下一个中间件
false             => 阻断当前页面
string            => 视为重定向路径
{ redirectTo }    => 显式重定向
{ component }     => 返回 fallback 组件
```

## 页面重定向怎么发生

如果中间件返回：

```ts
'/pages/auth/login'
```

或：

```ts
{ redirectTo: '/pages/auth/login' }
```

包装运行时会调用：

```ts
dux.navigator.reLaunch(...)
```

并阻止真实页面渲染。

## fallback component 是什么

如果中间件返回：

```ts
{
  component: ForbiddenComponent,
}
```

那么包装页不会进入真实页面，而是直接渲染这个兜底组件。

适合：

```text
权限不足但不想跳页
页面级兜底内容
```

## permission 中间件

`permission` 是 runtime 自带注册的。

它会：

```text
1. 读取页面 permission
2. 调用 authProvider.can()
3. 无权限时重定向或渲染 fallback component
```

## 常见排查方式

### 页面进不去

先看：

```text
<route> 是否写了 auth / permission
模块是否注册了对应中间件
authProvider.can() 是否返回 false
```

### 页面白屏但没报错

重点排查：

```text
是否被中间件阻断
是否存在 fallbackComponent
生成的 src/pages/* 是否已更新
```

### 改了路由声明但没生效

先执行：

```bash
pnpm sync:uni
```

## 继续阅读

- [页面 Route](/uni/page-route)
- [模块系统](/uni/modules)
