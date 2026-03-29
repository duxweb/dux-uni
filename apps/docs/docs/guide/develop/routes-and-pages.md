# 页面与路由

在 `Dux Uni` 里，真实页面仍然写在模块内，路由和 uni 页面包装层由框架生成。

## 真实页面写在哪里

```text
src/modules/orders/pages/index.vue
src/modules/orders/pages/detail.vue
```

## 页面里怎么声明路由信息

```vue
<route lang="json">
{
  "title": "订单详情",
  "auth": true,
  "layout": "default"
}
</route>
```

这里通常只写页面自身关心的元信息：

- `title`
- `auth`
- `permission`
- `layout`
- `middleware`

## path / name / module 怎么来

默认会从文件路径自动推导。

```text
src/modules/orders/pages/detail.vue
```

会推导出：

```text
path   => /pages/orders/detail
name   => orders.detail
module => orders
```

## 页面跳转怎么写

```ts
import { useRouter, useRoute } from '@duxweb/uni'

const router = useRouter()
const route = useRoute()

// 按路径跳转
await router.to('/pages/orders/detail?id=1')

// 按页面名跳转
await router.to({
  name: 'orders.detail',
  query: { id: 1 },
})

// 读取当前页面 query
route.query.id
```

## 自动生成层是什么

```text
src/pages/*      # 自动生成的页面包装层
src/pages.json   # 自动生成的 uni 页面配置
```

它们的职责是：

- 兼容 uni-app 的页面目录要求
- 挂接页面运行时
- 再渲染真实模块页面

## 继续阅读

- [路由与运行时](/uni/router)
- [页面 Route](/uni/page-route)
- [自动生成产物](/guide/generated-files)
