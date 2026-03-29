# 第一个业务模块

这一页按实际开发顺序，走一遍“从模板应用开始，到落一个新业务模块”的完整过程。

目标：新增一个 `orders` 模块。

## 1. 新建模块目录

```text
src/modules/orders/
  pages/
  components/
  store/
  index.ts
```

即使当前还没有组件和 store，也建议目录先留出来。

## 2. 编写模块入口

```ts
import { defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'orders',
  defaultLayout: 'default', // 当前模块页面默认 layout
})
```

## 3. 新建列表页

```vue
<route lang="json">
{
  "title": "订单列表",
  "auth": true
}
</route>

<script setup lang="ts">
import { useList, usePageTitle, useRouter } from '@duxweb/uni'

const router = useRouter()

// 设置页面标题
usePageTitle('订单列表')

// 拉取订单列表
const list = useList({
  path: 'orders',
  pagination: 20,
})

function goDetail(id: number) {
  return router.to({
    name: 'orders.detail', // 默认页面名由 模块名.页面名 推导
    query: { id },
  })
}
</script>
```

## 4. 新建详情页

```vue
<route lang="json">
{
  "title": "订单详情",
  "auth": true
}
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { useOne, usePageTitle, useRoute } from '@duxweb/uni'

const route = useRoute()

// 根据当前页面 query 读取订单详情
const detail = useOne({
  path: 'orders',
  id: computed(() => route.query.id),
})

usePageTitle('订单详情')
</script>
```

默认会推导出：

```text
path   => /pages/orders/detail
name   => orders.detail
module => orders
```

## 5. 如果模块要进 tabBar

```ts
router: {
  home: 'home.index',
  login: 'auth.login',
  tabBar: ['home', 'orders', 'account'],
}
```

如果只是普通业务模块，就不用加到 `tabBar`。

## 6. 如果模块需要权限

```vue
<route lang="json">
{
  "auth": true,
  "permission": "orders.read"
}
</route>
```

前提是你的 `authProvider.can()` 已经实现对应权限判断。

## 7. 如果模块需要自己的中间件

```ts
import { defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'orders',
  middlewares: [
    {
      name: 'tenant-ready',
      handler() {
        return
      },
    },
  ],
})
```

页面里声明：

```json
{
  "middleware": ["tenant-ready"]
}
```

## 8. 如果模块需要自己的 schema 组件

```ts
import { defineSchemaComponents, defineUniModule } from '@duxweb/uni'
import OrderStatusTag from './components/OrderStatusTag.vue'

export default defineUniModule({
  name: 'orders',
  schema: {
    components: defineSchemaComponents([
      {
        name: 'order-status-tag',
        component: OrderStatusTag, // 允许 schema 渲染订单状态组件
      },
    ]),
  },
})
```

## 9. 你真正需要改哪些文件

```text
src/modules/orders/index.ts
src/modules/orders/pages/index.vue
src/modules/orders/pages/detail.vue
src/dux.config.ts
```

## 10. 最常见误区

```text
不要手改 src/pages/*
不要把模块逻辑堆到全局
不要一开始就写复杂抽象，先把模块跑通
```
