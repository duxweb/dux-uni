# Schema 渲染

`Schema` 渲染的目标不是做一个万能低代码 DSL，而是提供一套后端可稳定产出、前端可稳定渲染的 JSON UI 协议。

## useJsonSchema

```ts
const { render, schema, bindings } = useJsonSchema(options)
```

```ts
import { computed, reactive } from 'vue'
import { useJsonSchema } from '@duxweb/uni'

const state = reactive({
  message: 'hello',
  status: 'active',
})

const schema = computed(() => [
  {
    tag: 'input',
    model: 'state.message', // 双向绑定到 state.message
    props: {
      placeholder: '请输入内容',
    },
  },
  {
    tag: 'text',
    bind: 'state.message', // 读取绑定值并渲染
  },
  {
    tag: 'text',
    switch: 'state.status', // 按当前状态分支渲染
    case: 'active',
    text: '当前为 active',
  },
])

const { render: SchemaRender } = useJsonSchema({
  data: schema,
  bindings: computed(() => ({
    state, // 把响应式数据注入 bindings
  })),
})
```

模板里：

```vue
<component :is="SchemaRender" />
```

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

## createSchemaRenderer

```ts
const renderer = createSchemaRenderer(options?)
```

适合：

- 二次封装 schema 系统
- 模块内构造自己的 renderer
- 做更底层的运行时扩展

## renderSchema

```ts
const vnode = renderSchema(schema, options?)
```

适合：

- 在更底层逻辑里直接生成 VNode
- 做高级扩展，不经过 Hook

## registerSchemaComponents / defineSchemaComponents

```ts
import { defineSchemaComponents, defineUniModule } from '@duxweb/uni'
import MyButton from './components/MyButton.vue'

export default defineUniModule({
  name: 'demo',
  schema: {
    components: defineSchemaComponents([
      {
        name: 'my-button',
        component: MyButton, // 允许 schema 使用这个组件
        aliases: ['schema-button'],
      },
    ]),
  },
})
```

这样后端 JSON 就可以安全地写：

```json
{
  "tag": "schema-button",
  "text": "点击提交"
}
```

## 当前支持的核心字段

```text
结构    => tag / component / children / slots / text
属性    => props / attrs / style / class
数据    => bind / forEach / model / modelProp
条件    => if / elseIf / else / switch / case / defaultCase / visibleWhen
行为    => actions.tap / actions.change / actions.submit
```

## 为什么放在 @duxweb/uni

因为这属于运行时能力，不应该依赖某个具体 UI 库。

```text
@duxweb/uni      => 负责协议和运行时
@duxweb/uni-pro  => 只负责 UI 适配
```
