# 页面 Route

页面 Route 就是页面里的 `<route lang="json">` 配置。

它决定了：

```text
页面标题
是否需要登录
是否需要权限
是否挂中间件
使用哪个 layout
是否是 tabBar 页面
```

## 推荐写法

```vue
<route lang="json">
{
  "title": "受保护页面",
  "auth": true,
  "permission": "system.admin"
}
</route>
```

这就是 `src/modules/*/pages/*.vue` 的推荐写法。

## 常用字段

```text
name        => 页面名
path        => 页面路径
module      => 所属模块
title       => 页面标题
auth        => 是否需要登录
guestOnly   => 是否仅游客可访问
middleware  => 中间件名数组
permission  => 权限标识或权限数组
layout      => 页面布局
tabBar      => 是否是 tabBar 页面
keepAlive   => 是否缓存
params      => 路由参数定义
```

## path / name / module 默认怎么来

如果你没有显式填写，会按文件路径自动推导。

```text
src/modules/feature/pages/secure.vue
```

默认会变成：

```text
path   => /pages/feature/secure
module => feature
name   => feature.secure
```

所以日常开发里通常不用重复手写这三个字段。

## layout 从哪里来

```text
优先用页面里显式声明的 layout
否则继承模块入口的 defaultLayout
```

## auth / guestOnly / permission

### auth

```json
{
  "auth": true
}
```

表示页面需要登录。

### guestOnly

```json
{
  "guestOnly": true
}
```

表示登录后不应该再访问当前页，典型就是登录页。

### permission

```json
{
  "permission": "system.admin"
}
```

表示页面还需要额外权限校验。

## middleware

如果你想显式追加模块中间件：

```json
{
  "middleware": ["auth", "audit"]
}
```

运行时会把它和根据 `auth / guestOnly / permission` 自动推导出来的中间件一起合并后执行。

## definePage 是什么

你会在自动生成的 `src/pages/*` 里看到：

```ts
definePage({
  title: '受保护页面',
  auth: true,
  path: 'pages/feature/secure',
  module: 'feature',
  name: 'feature.secure',
})
```

它属于自动生成层的静态声明，不是业务页主要手写入口。

日常业务仍然优先写 `<route lang="json">`。

## 继续阅读

- [页面运行时](/uni/page-runtime)
- [路由与运行时](/uni/router)
