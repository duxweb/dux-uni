# Overlay

`@duxweb/uni` 的弹层能力只处理逻辑与结果回收，不把展示层写死在核心层。

## useConfirm

用于打开一个“确认 / 取消”类型的确认框，并等待用户选择结果。

```ts
const confirm = useConfirm(app?)
const ok = await confirm.open(options)
```

```ts
import { useConfirm } from '@duxweb/uni'

const confirm = useConfirm()

const ok = await confirm.open({
  title: '删除确认', // 弹层标题
  message: '确定删除这条记录吗？', // 弹层说明
  danger: true, // 危险操作
})
```

## useModal

用于打开模态弹窗，支持异步组件、透传 payload 和回传结果。

```ts
const modal = useModal(app?)
const result = await modal.open(options)
```

```ts
import { useModal } from '@duxweb/uni'

const modal = useModal()

const result = await modal.open({
  title: '编辑资料',
  payload: {
    id: 1001, // 透传给弹层内容的数据
  },
  content: () => import('./ProfileEditor.vue'), // 推荐字段
})
```

`content` 是当前推荐写法。

运行时仍兼容旧别名 `component`，但新项目建议统一写成 `content`，这样 `modal` / `drawer` 的调用结构保持一致。

适合：

- 表单弹窗
- 异步编辑器
- 需要回传结果的弹层

和 `@duxweb/uni-pro` 组合时，推荐把弹层内容写成独立组件，再在内容组件里使用 `DuxModalPage`：

```ts
import { useModal } from '@duxweb/uni'

const modal = useModal()

const result = await modal.open({
  title: '创建工单',
  confirmText: '创建',
  frame: 'page',
  payload: {
    mode: 'create',
  },
  content: () => import('../components/OrderOverlay.vue'),
})
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useOverlayContext } from '@duxweb/uni'
import DuxModalPage from '@duxweb/uni-pro/components/DuxModalPage.vue'
import AsyncForm from '@duxweb/uni-pro/components/AsyncForm.vue'

const overlay = useOverlayContext<{ id?: number }, unknown>()
const formRef = ref<any>(null)

async function submit() {
  const result = await formRef.value?.submit?.()
  if (result?.success) {
    return result.data
  }
  return undefined
}
</script>

<template>
  <DuxModalPage title="编辑资料" confirm-text="保存" :submit="submit">
    <AsyncForm
      ref="formRef"
      path="profile"
      :id="overlay.payload?.id"
    />
  </DuxModalPage>
</template>
```

这套结构里有几个约定：

- `useModal().open()` 只负责打开弹层和传 `payload`
- 内容组件内部通过 `useOverlayContext()` 读取 `payload`
- 页面壳优先使用 `DuxModalPage`
- 如果内容里是表单，只需要暴露 `submit()`，底部确认按钮会自动调用
- 如果只是展示型弹层，可以直接调用 `overlay.close()` 或 `overlay.submit(result)`

## useDrawer

用于打开抽屉弹层，适合筛选器、侧边编辑器和辅助面板。

```ts
const drawer = useDrawer(app?)
const result = await drawer.open(options)
```

```ts
import { useDrawer } from '@duxweb/uni'

const drawer = useDrawer()

await drawer.open({
  title: '筛选条件',
  content: () => import('./FilterPanel.vue'), // 异步加载抽屉内容
  width: '720rpx',
})
```

配合 `AsyncForm` 时，抽屉很适合做编辑表单：

```ts
await drawer.open({
  title: '编辑工单',
  confirmText: '保存',
  frame: 'page',
  width: '760rpx',
  payload: {
    mode: 'edit',
    id: 1002,
  },
  content: () => import('../components/OrderOverlay.vue'),
})
```

抽屉内容组件的推荐结构与 `modal` 相同，只是页面壳改成 `DuxDrawerPage`。

## useOverlayContext

用于在弹层内容组件内部读取 payload、提交结果或主动关闭当前弹层。

```ts
const overlay = useOverlayContext<TResult, TPayload>()
```

```ts
import { useOverlayContext } from '@duxweb/uni'

const overlay = useOverlayContext()

// 读取打开弹层时传入的 payload
overlay.payload

// 主动提交结果
overlay.submit({
  ok: true,
})

// 主动关闭弹层
overlay.close()
```

适合：

- 弹窗表单
- 弹窗选择器
- 抽屉筛选器

## useOverlayEntries

用于读取当前 overlay 队列，通常由展示宿主组件消费，而不是业务页直接消费。

```ts
const entries = useOverlayEntries(app?)
```

它通常由 overlay host 使用，用来读取当前 overlay 队列。

## 兼容别名

当前仍保留：

- `useModalForm()`
- `useDrawerForm()`

但新项目建议统一用：

- `useModal()`
- `useDrawer()`

## 与 UI 层的关系

```text
@duxweb/uni      => 只负责弹层逻辑
@duxweb/uni-pro  => 负责 Wot UI 下的展示宿主
```
