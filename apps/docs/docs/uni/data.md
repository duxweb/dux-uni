# 数据查询

`@duxweb/uni` 直接基于 `@tanstack/vue-query` 封装，不额外发明一套新的查询系统。

## 读数据和提交数据的边界

```text
读数据     => useList / useOne / useMany / useCustom
提交动作   => useCreate / useUpdate / useDelete / useCustomMutation
```

如果你只是想“手动获取一次数据”，也仍然建议用 query：

```ts
import { useCustom } from '@duxweb/uni'

const profile = useCustom({
  path: 'profile',
  method: 'GET',
  enabled: false, // 默认不发请求
})

await profile.refetch() // 手动触发读取
```

## useList

用于拉取标准分页列表，适合列表页、订单页、成员页这类“有分页、有筛选、有刷新”的页面。

```ts
const list = useList(options)
```

```ts
import { useList } from '@duxweb/uni'

const list = useList({
  path: 'orders', // 资源路径
  filters: {
    status: 'progress', // 查询过滤条件
  },
  pagination: 20, // 每页 20 条
})
```

适合：

- 标准分页列表
- 后台列表页
- 移动端订单列表

## useInfiniteList

用于无限滚动列表，适合 feed 流、时间线、消息流这类“下一页接着加载”的场景。

```ts
const list = useInfiniteList(options)
```

```ts
import { useInfiniteList } from '@duxweb/uni'

const list = useInfiniteList({
  path: 'feeds', // feed 流数据
  pagination: 20, // 每次加载 20 条
})
```

适合：

- 时间线
- feed 流
- 无限滚动列表

## useOne

用于拉取单条详情，最常见的就是详情页按 `id` 查询一条记录。

```ts
const detail = useOne(options)
```

```ts
import { computed } from 'vue'
import { useOne, useRoute } from '@duxweb/uni'

const route = useRoute()

const detail = useOne({
  path: 'orders', // 资源路径
  id: computed(() => route.query.id), // 当前详情 id
})
```

## useMany

用于按一组 `id` 批量查询数据，常见于表单回显、标签回填和批量详情补齐。

```ts
const many = useMany(options)
```

```ts
import { useMany } from '@duxweb/uni'

const many = useMany({
  path: 'members', // 资源路径
  ids: [1, 2, 3], // 需要批量回填的 id
})
```

适合：

- 表单回显
- 选项补齐
- 批量详情回填

## useCustom

用于读取型自定义接口，不要求接口一定按资源式 REST 组织。

```ts
const query = useCustom(options)
```

```ts
import { useCustom } from '@duxweb/uni'

const query = useCustom({
  path: 'dashboard/stats', // 自定义接口路径
  method: 'GET', // 读取型自定义请求
  query: {
    range: '7d',
  },
})
```

适合：

- 非资源式读取接口
- 统计数据
- 自定义读取型接口

## useCreate

用于新增数据，提交成功后可以自动刷新同路径相关查询。

```ts
const create = useCreate(options)
await create.create(payload?)
```

```ts
import { useCreate } from '@duxweb/uni'

const create = useCreate({
  path: 'orders', // 提交到 orders 资源
  invalidate: true, // 成功后自动刷新同 path 查询
})

await create.create({
  data: {
    title: '新订单',
  },
})
```

## useUpdate

用于更新已有数据，适合编辑页、状态切换、批量更新中的单条更新。

```ts
const update = useUpdate(options)
await update.update(payload?)
```

```ts
import { useUpdate } from '@duxweb/uni'

const update = useUpdate({
  path: 'orders',
  id: 1, // 默认更新 id = 1
  invalidate: true, // 成功后自动失效同 path 查询
})

await update.update({
  data: {
    status: 'done',
  },
})
```

## useDelete

用于删除数据，通常会和列表页联动，在成功后让列表缓存重新拉取。

```ts
const remove = useDelete(options)
await remove.remove(payload?)
```

```ts
import { useDelete } from '@duxweb/uni'

const remove = useDelete({
  path: 'orders',
  id: 1, // 默认删除 id = 1
  invalidate: true, // 删除后自动刷新列表和相关缓存
})

await remove.remove({})
```

## useCustomMutation

用于提交型自定义接口，适合“不是标准增删改，但本质是一次命令式提交”的场景。

```ts
const mutation = useCustomMutation(options)
await mutation.execute(payload?)
```

```ts
import { useCustomMutation } from '@duxweb/uni'

const mutation = useCustomMutation({
  path: 'orders/submit', // 自定义提交接口
  method: 'POST', // 提交型请求
  invalidate: true, // 成功后自动刷新同 path 查询
})

await mutation.execute({
  payload: {
    id: 1001,
  },
})
```

适合：

- 非资源式提交接口
- 命令式动作
- 自定义提交型请求

## useInvalidate

用于让指定 query 缓存失效、重置或移除，适合手动控制刷新范围。

```ts
const invalidate = useInvalidate(app?)
await invalidate.invalidate(descriptor?)
```

```ts
import { useInvalidate } from '@duxweb/uni'

const invalidate = useInvalidate()

await invalidate.invalidate({
  scope: 'list', // 只失效列表类缓存
  path: 'orders', // 只失效 orders 路径
})
```

## useRefetch

用于主动刷新指定 query，而不是等它自己失效后再重新拉取。

```ts
const refetch = useRefetch(app?)
await refetch.refetch(descriptor?)
```

```ts
import { useRefetch } from '@duxweb/uni'

const refetch = useRefetch()

await refetch.refetch({
  path: 'orders', // 主动刷新 orders 相关缓存
})
```

## useForm

用于管理表单值、校验和提交逻辑，让页面不用自己散着处理 `values / errors / submit`。

```ts
const form = useForm(options)
```

```ts
import { useCreate, useForm } from '@duxweb/uni'

const create = useCreate({
  path: 'orders',
  invalidate: true,
})

const form = useForm({
  initialValues: {
    title: '',
    status: 'draft',
  },
  rules: {
    title: value => value ? undefined : '请输入标题',
  },
  onSubmit: async values => {
    return await create.create({
      data: values, // 表单提交时直接复用 create mutation
    })
  },
})
```

## useSelect

用于拉取远程选项数据，统一处理搜索、分页、回填和 `label/value` 映射。

```ts
const select = useSelect(options)
```

```ts
import { useSelect } from '@duxweb/uni'

const categorySelect = useSelect({
  path: 'categories', // 远程选项来源
  optionLabel: 'name', // 选项名称字段
  optionValue: 'id', // 选项值字段
  keywordField: 'keyword', // 搜索关键字字段
  pagination: true,
})
```

## useTree

用于把平铺数据整理成树结构，适合树选择器、部门树、分类树等场景。

```ts
const tree = useTree(options)
```

```ts
import { useTree } from '@duxweb/uni'

const departmentTree = useTree({
  path: 'departments',
  treeOptions: {
    idKey: 'id', // 节点 id 字段
    parentKey: 'parent_id', // 父级 id 字段
    childrenKey: 'children', // 子节点字段
  },
})
```

## simpleDataProvider

```ts
const provider = simpleDataProvider(options?)
```

```ts
import { simpleDataProvider } from '@duxweb/uni'

dataProvider: simpleDataProvider({
  apiUrl: '/api', // 统一 API 前缀
})
```

它负责：

- 统一资源 URL 拼接
- 统一列表、详情、创建、更新、删除请求形态
- 自动注入当前登录态里的 `Authorization`
- 兼容常见响应 envelope
