# 组件总览

`@duxweb/uni-pro` 当前主要分成两层：

- 宿主层：`DuxRoot`、overlay host、页面壳组件
- 异步组件层：把 Wot UI 组件接到 `@duxweb/uni` 的 Headless Hook

如果你已经在页面里直接使用 Wot 组件，那么优先看这一页。

## DuxRoot

```vue
<DuxRoot :theme="theme" :tokens="tokens">
  <slot />
</DuxRoot>
```

```vue
<script setup lang="ts">
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
</script>

<template>
  <DuxRoot
    theme="light"
    :tokens="{
      primary: '#2563eb',
    }"
  >
    <slot />
  </DuxRoot>
</template>
```

职责：

- 包裹 `wd-config-provider`
- 注入 Wot UI 主题变量
- 挂载 `wd-root-portal`
- 挂载 overlay host

## ProAppProvider

```vue
<ProAppProvider :theme="theme" :tokens="tokens">
  <slot />
</ProAppProvider>
```

它是 `DuxRoot` 的轻包装，更适合直接作为全局 provider 使用。

## DuxOverlayHost

```ts
import DuxOverlayHost from '@duxweb/uni-pro/components/DuxOverlayHost.vue'
```

职责：

- 读取 `@duxweb/uni` 的 overlay 队列
- 逐个把 overlay entry 渲染出来

## DuxOverlayPresenter

```ts
import DuxOverlayPresenter from '@duxweb/uni-pro/components/DuxOverlayPresenter.vue'
```

职责：

- 把单个 overlay entry 渲染成 Wot UI popup
- 承接 `confirm / modal / drawer`
- 支持异步内容组件

## ProPageShell

```vue
<ProPageShell padding="24rpx" gap="24rpx">
  <slot />
</ProPageShell>
```

适合：

- 列表页
- 详情页
- 表单页

## ProSection

```vue
<ProSection title="账户信息" description="当前登录用户资料">
  <slot />
</ProSection>
```

适合：

- 首页能力卡片
- 分组表单
- 功能区块

## ProEmpty

```vue
<ProEmpty title="暂无数据" description="当前模块还没有任何内容" />
```

适合：

- 空列表
- 功能未接入
- 空状态占位

## AsyncForm

`AsyncForm` 负责把：

- `useForm`
- `useOne`
- `useCreate`
- `useUpdate`

串成一个可直接放进 Wot 页面里的表单根组件。

它适合：

- 创建页
- 编辑页
- 需要统一 `submit / loading / saving / record` 状态的表单页

```vue
<script setup lang="ts">
import AsyncForm from '@duxweb/uni-pro/components/AsyncForm.vue'
import AsyncPicker from '@duxweb/uni-pro/components/AsyncPicker.vue'
import AsyncColPicker from '@duxweb/uni-pro/components/AsyncColPicker.vue'

const orderRules = {
  title: [{ required: true, message: '请输入标题' }],
}

const validateRules = {
  title: value => String(value || '').trim() ? undefined : '请输入标题',
}
</script>

<template>
  <AsyncForm
    path="orders"
    :initial-values="{
      title: '',
      assigneeId: 0,
      categoryIds: [],
    }"
    :rules="orderRules"
    :validate-rules="validateRules"
    :transform-submit="values => ({
      ...values,
      categoryId: values.categoryIds.at(-1),
    })"
  >
    <template #default="{ form, submit, saving }">
      <wd-input v-model="form.values.title" label="标题" prop="title" />

      <AsyncPicker
        v-model="form.values.assigneeId"
        path="members"
        label="负责人"
        option-label="name"
        option-value="id"
        option-key="id"
      />

      <AsyncColPicker
        v-model="form.values.categoryIds"
        path="categories"
        label="分类路径"
        value-key="id"
        label-key="name"
        :tree-options="{ idKey: 'id', parentKey: 'parent_id' }"
      />

      <wd-button type="primary" :loading="saving" @click="submit">
        提交
      </wd-button>
    </template>
  </AsyncForm>
</template>
```

`AsyncForm` 说明：

- `rules` 继续透传给 `wd-form`
- `validate-rules` 给 `useForm` 做 Headless 校验
- `path` 默认同时作为加载路径和提交路径
- `load-path`、`submit-path` 可拆开定义
- `mode="edit"` 且传入 `id` 时，会自动调用 `useOne` 拉取详情并回填
- `transform-load` 可把详情数据转成表单结构
- `transform-submit` 可把表单结构转成接口载荷

Starter 里已经有“创建工单”和“编辑工单”两个完整示例，可以直接对照：

- `apps/starter/src/modules/form/pages/index.vue`

## AsyncPicker

`AsyncPicker` 是 `wd-picker + useSelect`。

它适合：

- 远程负责人选择
- 异步字典项选择
- 详情回显时需要自动 hydrate 已选值的场景

```vue
<AsyncPicker
  v-model="memberId"
  path="members"
  label="负责人"
  title="选择负责人"
  option-label="name"
  option-value="id"
  option-key="id"
/>
```

说明：

- 支持 `path / params / pagination / immediate / debounce`
- 内部会自动合并已选项与当前页数据，避免详情回显时标签丢失
- 暴露 `refresh()`、`search()`、`hydrateSelected()`

页面控制搜索示例：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import AsyncPicker from '@duxweb/uni-pro/components/AsyncPicker.vue'

const pickerRef = ref()
const keyword = ref('')
const memberId = ref()

function onSearchChange(event) {
  keyword.value = event.value || ''
  pickerRef.value?.search?.(keyword.value)
}
</script>

<template>
  <wd-search
    :model-value="keyword"
    placeholder="输入成员名后再次打开选择器"
    @change="onSearchChange"
  />

  <AsyncPicker
    ref="pickerRef"
    v-model="memberId"
    path="members"
    keyword-field="keyword"
    :pagination="10"
    :immediate="false"
    option-label="name"
    option-value="id"
    option-key="id"
  />
</template>
```

## AsyncColPicker

`AsyncColPicker` 是 `wd-col-picker + useTree`，也支持自定义 `loader` 做逐级异步加载。

它适合：

- 地区联动
- 分类路径选择
- level 级联选择器

树模式示例：

```vue
<AsyncColPicker
  v-model="categoryIds"
  path="categories"
  label="分类路径"
  value-key="id"
  label-key="name"
  :tree-options="{
    idKey: 'id',
    parentKey: 'parent_id',
    childrenKey: 'children',
    sortKey: 'sort',
  }"
/>
```

逐级加载示例：

```vue
<script setup lang="ts">
const loadColumns = async ({ level, values }) => {
  return await requestLevelOptions(level, values)
}
</script>

<template>
  <AsyncColPicker
    v-model="regionIds"
    label="地区"
    :loader="loadColumns"
    value-key="id"
    label-key="name"
  />
</template>
```

说明：

- 不传 `loader` 时，默认按树数据模式处理
- 传 `loader` 时，按级联异步模式处理
- 暴露 `refresh()` 和当前 `columns`
- Starter 里同时提供了树模式和 `loader(parentId)` 的远程加载模式示例

## AsyncPickerView

`AsyncPickerView` 是 `wd-picker-view + useSelect`。

它适合：

- 页面内嵌滚筒
- 不需要 popup 的异步选择

```vue
<AsyncPickerView
  v-model="memberId"
  path="members"
  option-label="name"
  option-value="id"
  option-key="id"
  :columns-height="180"
/>
```

说明：

- 适合页面内直接展示的选择器
- 暴露 `refresh()`、`search()`、`hydrateSelected()`

## AsyncUpload

`AsyncUpload` 是 `wd-upload + useUpload`。

它适合：

- 沿用 Wot 上传交互
- 但上传执行器、鉴权头、资源地址仍由 `dux-uni` 统一处理

```vue
<script setup lang="ts">
import { ref } from 'vue'
import AsyncUpload from '@duxweb/uni-pro/components/AsyncUpload.vue'

const files = ref([])

async function executor({ asset, onProgress }) {
  onProgress?.({ loaded: 50, total: 100, percent: 50 })
  return {
    url: `https://cdn.example.com/${asset.name}`,
  }
}
</script>

<template>
  <AsyncUpload
    v-model:file-list="files"
    :executor="executor"
    :limit="1"
    accept="image"
  />
</template>
```

说明：

- 沿用 `wd-upload` 的选择、预览、删除交互
- 上传执行走 `useUpload`
- 返回结果里如果能识别到 `url`，会自动回填到预览地址

表单内联示例：

```vue
<script setup lang="ts">
import AsyncForm from '@duxweb/uni-pro/components/AsyncForm.vue'
import AsyncUpload from '@duxweb/uni-pro/components/AsyncUpload.vue'

async function executor({ asset, onProgress }) {
  onProgress?.({ loaded: 100, total: 100, percent: 100 })
  return {
    url: `https://cdn.example.com/${asset.name}`,
  }
}
</script>

<template>
  <AsyncForm
    path="orders"
    :initial-values="{
      title: '',
      attachments: [],
    }"
    :transform-submit="values => ({
      title: values.title,
      attachments: values.attachments.map(item => item.response?.url || item.url),
    })"
  >
    <template #default="{ form }">
      <wd-input v-model="form.values.title" label="标题" />
      <AsyncUpload
        v-model:file-list="form.values.attachments"
        :executor="executor"
        :limit="3"
      />
    </template>
  </AsyncForm>
</template>
```
