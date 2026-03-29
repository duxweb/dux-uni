# 组件

`@duxweb/uni` 不是视觉组件库，所以这一页只列运行时相关组件。

## UniSchemaRenderer

```vue
<UniSchemaRenderer :schema="schema" :bindings="bindings" />
```

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { UniSchemaRenderer } from '@duxweb/uni'

const schema = computed(() => [
  {
    tag: 'view',
    children: [
      {
        tag: 'text',
        text: 'Hello Dux Uni',
      },
    ],
  },
])
</script>

<template>
  <UniSchemaRenderer :schema="schema" />
</template>
```

用途：

- 直接渲染 schema 节点树
- 作为 `useJsonSchema()` 的底层渲染组件

## createSchemaRenderer / renderSchema

```ts
createSchemaRenderer()
renderSchema()
```

适合：

- 二次封装 schema 系统
- 模块内构造自己的 renderer
- 做更底层的运行时扩展

## 自动生成页面包装组件

严格来说，应用里还有一类运行时组件：

```text
src/pages/* 下自动生成的页面包装组件
```

它们不是给业务直接 import 的公共组件，但在运行时里非常重要。

职责：

- 对接 uni 页面目录约束
- 调用 `usePageRuntime()`
- 再挂载真实模块页面

## 为什么这里组件不多

因为 `@duxweb/uni` 的定位不是视觉层，而是：

```text
路由
请求
鉴权
查询
Schema
运行时桥接
```

视觉组件请看 `@duxweb/uni-pro`。
