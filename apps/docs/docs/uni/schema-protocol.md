# Schema 协议

这一页定义的是“后端输出给前端”的 JSON 协议约定。

目标很简单：

```text
后端好生成
前端好渲染
组件可控
行为可扩展
```

## 推荐返回结构

```json
{
  "schema": [],
  "bindings": {},
  "meta": {}
}
```

当前前端最常见的接法是：

```ts
const { render: SchemaRender } = useJsonSchema({
  data: computed(() => payload.value?.schema || []),
  bindings: computed(() => ({
    state,
    request: {
      cards: payload.value?.cards || [],
      subtitle: payload.value?.subtitle || '',
    },
  })),
})
```

## 单个节点结构

```json
{
  "tag": "text",
  "props": {},
  "attrs": {},
  "style": {},
  "class": "",
  "text": "hello"
}
```

## 核心字段

### 渲染字段

```text
tag
component
children
slots
text
```

### 属性字段

```text
props
attrs
style
class
```

### 数据字段

```text
bind
forEach
model
modelProp
```

### 条件字段

```text
if
elseIf
else
switch
case
defaultCase
visibleWhen
```

### 行为字段

```text
actions.tap
actions.change
actions.submit
```

## bindings 推荐分层

```ts
{
  state,
  props,
  query,
  request,
}
```

推荐理解：

```text
state   => 前端本地可变状态
props   => 外部传入静态属性
query   => 当前页面 query 参数
request => 接口返回的远端数据
```

## 条件写法

### if / elseIf / else

```json
[
  {
    "tag": "text",
    "if": "state.isActive",
    "text": "A"
  },
  {
    "tag": "text",
    "else": true,
    "text": "B"
  }
]
```

当前实现更推荐写 bindings 路径，而不是复杂 JS 表达式。

## switch / case / defaultCase

```json
[
  {
    "tag": "text",
    "switch": "state.status",
    "case": "active",
    "text": "进行中"
  },
  {
    "tag": "text",
    "case": "draft",
    "text": "草稿"
  },
  {
    "tag": "text",
    "defaultCase": true,
    "text": "其他状态"
  }
]
```

## model 写法

```json
{
  "tag": "input",
  "model": "state.message",
  "props": {
    "placeholder": "请输入内容"
  }
}
```

如果组件不是 `modelValue` 协议，可以指定：

```json
{
  "tag": "my-input",
  "model": "state.keyword",
  "modelProp": "value"
}
```

## actions 写法

```json
{
  "tag": "schema-button",
  "text": "提交",
  "actions": {
    "tap": {
      "name": "navigate",
      "payload": "/pages/form/index"
    }
  }
}
```

动作最终会走：

```ts
app.actions.execute(name, context)
```

## 组件注册

后端不应该假设任何组件天然可用，前端应该显式注册：

```ts
schema: {
  components: defineSchemaComponents([
    {
      name: 'wd-button',
      component: SchemaWotButton,
      aliases: ['schema-button'],
    },
  ]),
}
```

这样 schema 才能稳定、可控、可裁剪。
