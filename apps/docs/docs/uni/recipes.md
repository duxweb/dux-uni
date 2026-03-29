# 实战 Recipes

这一页只放最常用的落地组合。

## 登录后回首页

```ts
import { useLogin } from '@duxweb/uni'

const loginAction = useLogin({
  redirectTo: '/pages/home/index', // 登录成功后跳首页
})

await loginAction.login({
  username: 'demo',
  password: 'demo123',
})
```

## 列表页新增后刷新

```ts
import { useCreate, useList } from '@duxweb/uni'

const list = useList({
  path: 'demo/orders',
  pagination: 20,
})

const create = useCreate({
  path: 'demo/orders',
  invalidate: true, // 提交成功后自动刷新同 path 查询
})

async function submit(data: Record<string, unknown>) {
  await create.mutateAsync({
    data,
  })
}
```

## 页面里做异步选择器

```ts
import { useSelect } from '@duxweb/uni'

const categorySelect = useSelect({
  path: 'demo/categories',
  optionLabel: 'name', // 选项名称字段
  optionValue: 'id', // 选项值字段
  keywordField: 'keyword', // 搜索关键字字段
  pagination: true,
})

categorySelect.search('手机')
```

## 树形数据回填

```ts
import { useTree } from '@duxweb/uni'

const departmentTree = useTree({
  path: 'demo/departments',
  treeOptions: {
    idKey: 'id',
    parentKey: 'parent_id',
    childrenKey: 'children',
    sortKey: 'sort',
  },
})
```

## 打开一个异步弹窗

```ts
import { useModal } from '@duxweb/uni'

const modal = useModal()

const result = await modal.open({
  title: '编辑资料',
  payload: {
    id: 1001, // 透传给弹层内容
  },
  content: () => import('./ProfileEditor.vue'), // 异步加载组件
})
```

如果弹层内容组件需要提交结果，内部可以通过 `useOverlayContext()` 回传。

## Schema 页面渲染

```ts
import { computed, reactive } from 'vue'
import { useJsonSchema } from '@duxweb/uni'

const state = reactive({
  keyword: '',
})

const schema = computed(() => [
  {
    tag: 'input',
    model: 'state.keyword', // 双向绑定到 state.keyword
    props: {
      placeholder: '请输入关键字',
    },
  },
  {
    tag: 'text',
    bind: 'state.keyword', // 直接展示当前关键字
  },
])

const { render: SchemaRender } = useJsonSchema({
  data: schema,
  bindings: computed(() => ({
    state,
  })),
})
```

## 页面监听业务事件

```ts
import { useEvent, useListener } from '@duxweb/uni'

const refreshEvent = useEvent('member.refresh')

useListener('member.refresh', () => {
  console.log('refresh list')
})

refreshEvent.emit()
```

## 模块里桥接 socket 消息

```ts
import { createSocketBridge, defineUniModule } from '@duxweb/uni'

export default defineUniModule({
  name: 'chat',
  ...createSocketBridge({
    manager: 'chat',
    status: 'chat:socket-status',
    messages: {
      'chat.message': 'chat:message',
    },
  }),
})
```

页面里消费：

```ts
useListener('chat:message', payload => {
  console.log(payload)
})
```

## 受保护页面

页面声明：

```vue
<route lang="json">
{
  "title": "受保护页面",
  "auth": true,
  "permission": "system.admin"
}
</route>
```

模块提供中间件：

```ts
defineUniModule({
  name: 'auth',
  middlewares: [
    {
      name: 'auth',
      handler() {
        return '/pages/auth/login'
      },
    },
  ],
})
```

## App 启动时建立全局实时连接

```ts
defineUniModule({
  name: 'chat',
  async boot({ app }) {
    app.socket.connect({
      url: 'wss://example.com/ws',
      auth: true,
      heartbeat: true,
      autoReconnect: true,
    })
  },
})
```

如果你已经在 `dux.ts` 里配置了命名全局连接，也可以直接操作：

```ts
defineUniModule({
  name: 'chat',
  async boot({ app }) {
    app.sockets.chat?.connect()
  },
})
```

适合：

```text
IM
客服
全局通知
在线状态同步
```
