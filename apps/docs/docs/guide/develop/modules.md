# 模块开发

`Dux Uni` 推荐你把应用按业务模块开发，而不是继续把页面、状态和逻辑散在全局目录里。

## 一个模块的最小结构

```text
src/modules/orders/
  pages/
  components/
  store/
  index.ts
```

## 每个目录放什么

```text
pages/        # 模块真实页面
components/   # 只服务当前模块的组件
store/        # 当前模块的 Pinia store
index.ts      # 模块入口，负责注册模块自己的能力
```

## 新模块的推荐顺序

```text
1. 新建模块目录
2. 补 index.ts
3. 新建 pages/index.vue
4. 在页面里写 <route> 和 Hook
5. 运行 sync:uni
6. 再检查生成出来的路由和 pages.json
```

## 模块页面示例

```vue
<route lang="json">
{
  "title": "订单列表",
  "auth": true
}
</route>

<script setup lang="ts">
import { useList, useRouter } from '@duxweb/uni'

const router = useRouter()

const list = useList({
  path: 'orders', // 对应 data provider 的资源路径
  pagination: 20, // 开启分页
})

function goDetail(id: number) {
  return router.to({
    name: 'orders.detail', // 页面名默认由 模块名.页面名 推导
    query: { id },
  })
}
</script>
```

## 模块开发的关键原则

- 页面写在 `modules/*/pages/*`
- 不手写 `src/pages/*`
- 模块自己的注册都尽量收回 `index.ts`
- 全局只保留应用骨架，不处理模块内部细节

## 继续阅读

- [页面与路由](/guide/develop/routes-and-pages)
- [模块入口与生命周期](/guide/develop/module-entry)
- [第一个业务模块](/guide/first-module)
