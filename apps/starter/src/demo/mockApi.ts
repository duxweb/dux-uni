import type { UniRequestAdapter, UniRequestError, UniRequestOptions, UniSchemaNode } from '@duxweb/uni'
import type {
  DemoActivity,
  DemoCategory,
  DemoFormSubmitResult,
  DemoHighlight,
  DemoMember,
  DemoOrder,
  DemoOverview,
} from './types'

const demoToken = 'Bearer demo-token'

export const demoAuth = {
  token: demoToken,
  refreshToken: 'refresh-demo-token',
  user: {
    id: 1,
    name: '演示管理员',
    role: '维护者',
  },
  permissions: [
    'dashboard.view',
    'list.view',
    'orders.write',
    'form.view',
    'account.view',
  ],
}

const highlights: DemoHighlight[] = [
  {
    id: 1,
    title: '运行时优先',
    summary: '认证、请求、会话和导航全部由 @duxweb/uni 统一驱动，与 UI 层完全解耦。',
    tag: '核心',
  },
  {
    id: 2,
    title: 'Schema 驱动',
    summary: 'Schema 页面从远端 JSON 获取数据，通过运行时 SchemaRenderer 在本地渲染为组件树。',
    tag: '表单',
  },
  {
    id: 3,
    title: '模块化模板',
    summary: '模板应用以 modules 为业务组织单位，starter 在模板基础上补充了完整演示数据与页面。',
    tag: '起步',
  },
  {
    id: 4,
    title: 'Hook 扩展',
    summary: '模块可通过 hooks.tap() 注入登录方式和运行时能力，页面再用 hooks.collect() 汇总扩展结果。',
    tag: '扩展',
  },
  {
    id: 5,
    title: '事件驱动',
    summary: 'useEvent() 与 useListener() 让页面和模块在运行时进行轻量事件分发与状态回显。',
    tag: '扩展',
  },
]

const members: DemoMember[] = [
  { id: 1, name: '张伟', title: '产品负责人', team: '产品组', status: 'online' },
  { id: 2, name: '李娜', title: '前端工程师', team: '应用小组', status: 'online' },
  { id: 3, name: '王芳', title: '后端工程师', team: '平台组', status: 'busy' },
  { id: 4, name: '刘洋', title: '设计系统', team: '设计组', status: 'offline' },
  { id: 5, name: '陈静', title: '测试工程师', team: '质量组', status: 'online' },
]

const categories: DemoCategory[] = [
  { id: 1, parent_id: 0, name: '产品', code: 'product', sort: 1 },
  { id: 2, parent_id: 1, name: '增长', code: 'growth', sort: 1 },
  { id: 3, parent_id: 1, name: '用户', code: 'member', sort: 2 },
  { id: 4, parent_id: 0, name: '技术', code: 'engineering', sort: 2 },
  { id: 5, parent_id: 4, name: '运行时', code: 'runtime', sort: 1 },
  { id: 6, parent_id: 4, name: '工具链', code: 'tooling', sort: 2 },
]

let orderId = 1006

let orders: DemoOrder[] = [
  buildOrder({
    id: 1001,
    code: 'DX-1001',
    title: '搭建仪表盘框架与首页布局',
    status: 'done',
    priority: 'high',
    progress: 100,
    amount: 4200,
    assigneeId: 2,
    categoryId: 5,
    createdAt: '2026-03-20',
    dueAt: '2026-03-24',
    tags: ['仪表盘', '起步'],
  }),
  buildOrder({
    id: 1002,
    code: 'DX-1002',
    title: '实现 CRUD 操作后的查询失效刷新',
    status: 'progress',
    priority: 'high',
    progress: 72,
    amount: 3600,
    assigneeId: 3,
    categoryId: 5,
    createdAt: '2026-03-22',
    dueAt: '2026-03-28',
    tags: ['查询', '缓存'],
  }),
  buildOrder({
    id: 1003,
    code: 'DX-1003',
    title: '设计 Schema 驱动的详情页面',
    status: 'progress',
    priority: 'medium',
    progress: 48,
    amount: 2800,
    assigneeId: 4,
    categoryId: 6,
    createdAt: '2026-03-23',
    dueAt: '2026-03-29',
    tags: ['schema', '渲染器'],
  }),
  buildOrder({
    id: 1004,
    code: 'DX-1004',
    title: '完善登录交互与鉴权守卫逻辑',
    status: 'pending',
    priority: 'medium',
    progress: 18,
    amount: 1900,
    assigneeId: 1,
    categoryId: 2,
    createdAt: '2026-03-24',
    dueAt: '2026-03-30',
    tags: ['认证', '守卫'],
  }),
  buildOrder({
    id: 1005,
    code: 'DX-1005',
    title: '添加上传与下载功能演示',
    status: 'pending',
    priority: 'low',
    progress: 6,
    amount: 1600,
    assigneeId: 5,
    categoryId: 6,
    createdAt: '2026-03-25',
    dueAt: '2026-04-02',
    tags: ['上传', '下载'],
  }),
]

const activities: DemoActivity[] = [
  { id: 2001, title: '分页列表状态筛选', summary: '演示 useList 配合筛选条件与分页元数据。', type: 'data', status: 'active', score: 92, createdAt: '2026-03-21' },
  { id: 2002, title: '下拉刷新后的缓存失效', summary: '通过 invalidate 触发列表与首页概览同步刷新。', type: 'data', status: 'done', score: 88, createdAt: '2026-03-22' },
  { id: 2003, title: '远程成员选择', summary: '表单页通过 useSelect 做异步搜索与选项回填。', type: 'form', status: 'active', score: 90, createdAt: '2026-03-23' },
  { id: 2004, title: '分类树数据装配', summary: 'useTree 将平铺分类数据转换成树结构。', type: 'form', status: 'done', score: 84, createdAt: '2026-03-23' },
  { id: 2005, title: 'Schema JSON 预览', summary: 'useJsonSchema 将远端配置渲染为本地组件树。', type: 'form', status: 'new', score: 86, createdAt: '2026-03-24' },
  { id: 2006, title: '上传演示执行器', summary: '功能页中的文件演示使用 useUpload 模拟文件上传进度。', type: 'account', status: 'active', score: 79, createdAt: '2026-03-24' },
  { id: 2007, title: '下载演示执行器', summary: '功能页中的文件演示使用 useDownload 模拟文件落地。', type: 'account', status: 'done', score: 74, createdAt: '2026-03-25' },
  { id: 2008, title: '运行时导航封装', summary: '页面跳转统一收敛在 @duxweb/uni useRouter。', type: 'framework', status: 'done', score: 91, createdAt: '2026-03-25' },
  { id: 2009, title: '认证守卫演示', summary: '登录与会话检查由 auth provider 管理。', type: 'framework', status: 'active', score: 95, createdAt: '2026-03-25' },
  { id: 2010, title: 'Pinia 会话同步', summary: 'storage 与运行时 store 状态保持一致。', type: 'framework', status: 'done', score: 87, createdAt: '2026-03-25' },
  { id: 2011, title: '无限滚动列表', summary: '通过 useInfiniteList 构造移动端长列表场景。', type: 'data', status: 'active', score: 89, createdAt: '2026-03-26' },
  { id: 2012, title: '列表项评分体系', summary: '给 feed 项补充 score 字段用于视觉对比。', type: 'data', status: 'new', score: 68, createdAt: '2026-03-26' },
  { id: 2013, title: '表单提交回显', summary: 'useCustomMutation 提交后返回结果摘要。', type: 'form', status: 'active', score: 83, createdAt: '2026-03-26' },
  { id: 2014, title: '框架能力总览', summary: '首页聚合关键指标与场景导航。', type: 'framework', status: 'done', score: 93, createdAt: '2026-03-26' },
  { id: 2015, title: '账户能力收敛', summary: '我的页只保留登录、授权、权限和会话相关演示。', type: 'account', status: 'new', score: 72, createdAt: '2026-03-27' },
]

const schema: UniSchemaNode[] = [
  {
    tag: 'view',
    style: {
      borderRadius: '32rpx',
      padding: '32rpx',
      border: '1px solid var(--dux-color-primary-subtle)',
      background: 'linear-gradient(135deg, var(--dux-color-primary-muted) 0%, var(--dux-color-background) 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20rpx',
    },
    children: [
      {
        tag: 'text',
        text: '服务端驱动的 Schema 渲染',
        style: {
          display: 'block',
          fontSize: '36rpx',
          fontWeight: '700',
          color: 'var(--dux-color-primary-stronger)',
        },
      },
      {
        tag: 'text',
        bind: 'request.subtitle',
        style: {
          display: 'block',
          fontSize: '24rpx',
          color: 'var(--dux-color-primary-strong)',
          lineHeight: '1.7',
        },
      },
      {
        tag: 'view',
        forEach: 'request.cards',
        style: {
          marginTop: '12rpx',
          borderRadius: '24rpx',
          backgroundColor: 'var(--dux-color-surface)',
          padding: '24rpx',
          border: '1px solid var(--dux-color-neutral-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10rpx',
        },
        children: [
          {
            tag: 'text',
            bind: 'item.title',
            style: {
              display: 'block',
              fontSize: '30rpx',
              fontWeight: '700',
              color: 'var(--dux-color-neutral-stronger)',
            },
          },
          {
            tag: 'text',
            bind: 'item.summary',
            style: {
              display: 'block',
              fontSize: '24rpx',
              color: 'var(--dux-color-neutral-muted)',
              lineHeight: '1.7',
            },
          },
          {
            tag: 'text',
            bind: 'item.tag',
            style: {
              alignSelf: 'flex-start',
              fontSize: '20rpx',
              fontWeight: '700',
              color: 'var(--dux-color-primary-strong)',
              backgroundColor: 'var(--dux-color-primary-soft)',
              borderRadius: '9999rpx',
              padding: '8rpx 18rpx',
            },
          },
        ],
      },
      {
        tag: 'view',
        style: {
          borderRadius: '24rpx',
          backgroundColor: 'var(--dux-color-surface)',
          padding: '24rpx',
          border: '1px solid var(--dux-color-neutral-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12rpx',
        },
        children: [
          {
            tag: 'text',
            text: 'bindings 双向写回',
            style: {
              display: 'block',
              fontSize: '28rpx',
              fontWeight: '700',
              color: 'var(--dux-color-neutral-stronger)',
            },
          },
          {
            tag: 'input',
            model: 'state.message',
            props: {
              placeholder: '请输入一段 Schema 文本',
            },
            style: {
              borderRadius: '18rpx',
              border: '1px solid var(--dux-color-neutral-subtle)',
              backgroundColor: 'var(--dux-color-background)',
              padding: '18rpx 20rpx',
              fontSize: '24rpx',
              color: 'var(--dux-color-neutral-stronger)',
            },
          },
          {
            tag: 'text',
            bind: 'state.message',
            style: {
              display: 'block',
              fontSize: '24rpx',
              color: 'var(--dux-color-neutral-strong)',
              lineHeight: '1.7',
            },
          },
        ],
      },
      {
        tag: 'view',
        style: {
          borderRadius: '24rpx',
          backgroundColor: 'var(--dux-color-surface)',
          padding: '24rpx',
          border: '1px solid var(--dux-color-neutral-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12rpx',
        },
        children: [
          {
            tag: 'text',
            text: 'switch / case 条件分支',
            style: {
              display: 'block',
              fontSize: '28rpx',
              fontWeight: '700',
              color: 'var(--dux-color-neutral-stronger)',
            },
          },
          {
            tag: 'text',
            switch: 'state.status',
            case: 'active',
            text: '当前状态：active，适合展示进行中的交互。',
            style: {
              display: 'block',
              fontSize: '24rpx',
              color: 'var(--dux-color-success-strong)',
              lineHeight: '1.7',
            },
          },
          {
            tag: 'text',
            case: 'draft',
            text: '当前状态：draft，适合展示草稿或待完善内容。',
            style: {
              display: 'block',
              fontSize: '24rpx',
              color: 'var(--dux-color-warning-strong)',
              lineHeight: '1.7',
            },
          },
          {
            tag: 'text',
            defaultCase: true,
            text: '当前状态：其他，走默认分支。',
            style: {
              display: 'block',
              fontSize: '24rpx',
              color: 'var(--dux-color-neutral-muted)',
              lineHeight: '1.7',
            },
          },
        ],
      },
      {
        tag: 'wd-button',
        props: {
          type: 'primary',
          block: true,
        },
        text: '查看表单页',
        style: {
          marginTop: '12rpx',
        },
        actions: {
          tap: {
            name: 'navigate',
            payload: '/pages/form/index',
          },
        },
      },
      {
        tag: 'wd-button',
        props: {
          plain: true,
          block: true,
        },
        text: '触发提示',
        style: {
          marginTop: '12rpx',
        },
        actions: {
          tap: {
            name: 'toast',
            payload: 'Schema 动作执行成功',
          },
        },
      },
    ],
  },
]

function sleep(ms = 120) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function getMember(id: number) {
  return members.find(item => item.id === id) || members[0]
}

function getCategory(id: number) {
  return categories.find(item => item.id === id) || categories[0]
}

interface DemoOrderDraft {
  id: number
  code: string
  title: string
  status: DemoOrder['status']
  priority: DemoOrder['priority']
  progress: number
  amount: number
  assigneeId: number
  categoryId: number
  createdAt: string
  dueAt: string
  tags: string[]
}

function buildOrder(input: DemoOrderDraft): DemoOrder {
  const member = getMember(input.assigneeId)
  const category = getCategory(input.categoryId)

  return {
    ...input,
    assigneeName: member.name,
    team: member.team,
    categoryName: category.name,
  }
}

function buildOverview(): DemoOverview {
  const doneCount = orders.filter(item => item.status === 'done').length
  const progressCount = orders.filter(item => item.status === 'progress').length
  const pendingCount = orders.filter(item => item.status === 'pending').length
  const completionRate = Math.round(doneCount / Math.max(orders.length, 1) * 100)

  return {
    greeting: 'Dux Uni 演示',
    subtitle: '一个演示应用，展示 @duxweb/uni 如何统一管理认证、数据与查询编排，同时保持 UI 层的完全解耦。',
    completionRate,
    metrics: [
      { key: 'orders', label: '工单总数', value: String(orders.length), trend: `${progressCount} 个进行中` },
      { key: 'done', label: '已完成', value: String(doneCount), trend: `完成率 ${completionRate}%` },
      { key: 'pending', label: '待处理', value: String(pendingCount), trend: '待下一迭代安排' },
    ],
    highlights,
    orders: orders.slice(0, 3).map(item => ({
      id: item.id,
      code: item.code,
      title: item.title,
      status: item.status,
      priority: item.priority,
      progress: item.progress,
      assigneeName: item.assigneeName,
    })),
  }
}

function getPath(url: string) {
  const normalized = String(url || '').trim()
  if (!normalized) {
    return '/'
  }

  const withoutOrigin = normalized
    .replace(/^[a-z]+:\/\/[^/]+/i, '')
    .split('?')[0]
    .split('#')[0]

  const path = withoutOrigin.startsWith('/') ? withoutOrigin : `/${withoutOrigin}`
  return path.replace(/\/+$/, '') || '/'
}

function getPagination(query: Record<string, any> | undefined) {
  const page = Math.max(Number(query?.page) || 1, 1)
  const pageSize = Math.max(Number(query?.pageSize) || 20, 1)

  return {
    page,
    pageSize,
  }
}

function getIds(query: Record<string, any> | undefined) {
  const value = query?.ids
  if (Array.isArray(value)) {
    return value.map(item => Number(item))
  }
  if (typeof value === 'string') {
    return value.split(',').map(item => Number(item.trim())).filter(Boolean)
  }
  return []
}

function filterOrders(query: Record<string, any> | undefined) {
  const keyword = String(query?.keyword || '').trim().toLowerCase()
  const status = String(query?.status || '').trim()
  const { page, pageSize } = getPagination(query)

  let items = [...orders]

  if (keyword) {
    items = items.filter(item =>
      item.code.toLowerCase().includes(keyword)
      || item.title.toLowerCase().includes(keyword)
      || item.assigneeName.toLowerCase().includes(keyword),
    )
  }

  if (status) {
    items = items.filter(item => item.status === status)
  }

  const total = items.length
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)

  return {
    data,
    total,
    page,
    pageSize,
  }
}

function filterActivities(query: Record<string, any> | undefined) {
  const keyword = String(query?.keyword || '').trim().toLowerCase()
  const type = String(query?.type || '').trim()
  const { page, pageSize } = getPagination(query)

  let items = [...activities]

  if (keyword) {
    items = items.filter(item =>
      item.title.toLowerCase().includes(keyword)
      || item.summary.toLowerCase().includes(keyword),
    )
  }

  if (type) {
    items = items.filter(item => item.type === type)
  }

  const total = items.length
  const start = (page - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  }
}

function submitDemoForm(body: Record<string, any>): DemoFormSubmitResult {
  const member = getMember(Number(body.memberId) || 1)
  const category = getCategory(Number(body.categoryId) || 1)

  return {
    requestId: `FORM-${Date.now()}`,
    title: String(body.title || '未命名表单'),
    amount: Number(body.amount) || 0,
    priority: String(body.priority || '中'),
    memberName: member.name,
    categoryName: category.name,
    remark: String(body.remark || ''),
    submittedAt: '2026-03-27 10:30',
  }
}

function filterMembers(query: Record<string, any> | undefined) {
  const ids = getIds(query)
  if (ids.length) {
    return members.filter(item => ids.includes(item.id))
  }

  const keyword = String(query?.keyword || '').trim().toLowerCase()
  const { page, pageSize } = getPagination(query)
  let items = [...members]

  if (keyword) {
    items = items.filter(item =>
      item.name.toLowerCase().includes(keyword)
      || item.title.toLowerCase().includes(keyword)
      || item.team.toLowerCase().includes(keyword),
    )
  }

  const total = items.length
  const start = (page - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    total,
  }
}

function unauthorized(message = 'Unauthorized'): never {
  const error = new Error(message) as UniRequestError
  error.status = 401
  error.data = {
    message,
  }
  throw error
}

function ensureAuthorized(options: UniRequestOptions) {
  if (options.headers?.Authorization !== demoToken) {
    unauthorized()
  }
}

function notFound(method: string, path: string): never {
  const error = new Error(`Unhandled mock request: ${method} ${path}`) as UniRequestError
  error.status = 404
  throw error
}

export function createMockRequestAdapter(): UniRequestAdapter {
  return {
    async request<T>(options: UniRequestOptions) {
      await sleep()

      const path = getPath(options.url)
      const method = (options.method || 'GET').toUpperCase()
      const query = options.query as Record<string, any> | undefined
      const body = (options.data || {}) as Record<string, any>

      if (path === '/api/login' && method === 'POST') {
        if (body.username !== 'demo' || body.password !== 'demo123') {
          const error = new Error('用户名或密码错误') as UniRequestError
          error.status = 422
          error.data = {
            message: '请使用 demo / demo123 登录',
          }
          throw error
        }

        return {
          status: 200,
          data: {
            message: '登录成功',
            data: clone(demoAuth),
          } as T,
        }
      }

      if (path === '/api/check' && method === 'GET') {
        ensureAuthorized(options)
        return {
          status: 200,
          data: {
            message: '会话有效',
            data: clone(demoAuth),
          } as T,
        }
      }

      if (path === '/api/logout' && method === 'POST') {
        return {
          status: 200,
          data: {
            message: '已退出登录',
          } as T,
        }
      }

      if (path === '/api/demo/overview' && method === 'GET') {
        return {
          status: 200,
          data: {
            message: '概览加载成功',
            data: clone(buildOverview()),
          } as T,
        }
      }

      if (path === '/api/demo/schema' && method === 'GET') {
        return {
          status: 200,
          data: {
            message: 'Schema 加载成功',
            data: {
              schema: clone(schema),
              cards: clone(highlights),
              subtitle: '该内容由远端 JSON 组装，在本地通过 SchemaRenderer 渲染为组件树。',
            },
          } as T,
        }
      }

      if (path === '/api/demo/members' && method === 'GET') {
        const data = filterMembers(query)
        if (Array.isArray(data)) {
          return {
            status: 200,
            data: {
              message: '成员加载成功',
              data: clone(data),
              meta: {
                total: data.length,
              },
            } as T,
          }
        }

        return {
          status: 200,
          data: {
            message: '成员加载成功',
            data: clone(data.data),
            meta: {
              total: data.total,
            },
          } as T,
        }
      }

      if (path === '/api/demo/categories' && method === 'GET') {
        return {
          status: 200,
          data: {
            message: '分类加载成功',
            data: clone(categories),
            meta: {
              total: categories.length,
            },
          } as T,
        }
      }

      if (path === '/api/demo/category-options' && method === 'GET') {
        const parentId = Number(query?.parentId || 0)
        const data = categories
          .filter(item => item.parent_id === parentId)
          .sort((a, b) => a.sort - b.sort)

        return {
          status: 200,
          data: {
            message: '分类选项加载成功',
            data: clone(data),
            meta: {
              total: data.length,
            },
          } as T,
        }
      }

      if (path === '/api/demo/orders' && method === 'GET') {
        const result = filterOrders(query)
        return {
          status: 200,
          data: {
            message: '工单加载成功',
            data: clone(result.data),
            meta: {
              total: result.total,
              page: result.page,
              pageSize: result.pageSize,
            },
          } as T,
        }
      }

      if (path === '/api/demo/activities' && method === 'GET') {
        const result = filterActivities(query)
        return {
          status: 200,
          data: {
            message: '动态列表加载成功',
            data: clone(result.data),
            meta: {
              total: result.total,
              page: result.page,
              pageSize: result.pageSize,
            },
          } as T,
        }
      }

      if (path === '/api/demo/form-submit' && method === 'POST') {
        return {
          status: 200,
          data: {
            message: '表单提交成功',
            data: submitDemoForm(body),
          } as T,
        }
      }

      if (path === '/api/demo/orders' && method === 'POST') {
        orderId += 1
        const nextOrder = buildOrder({
          id: orderId,
          code: `DX-${orderId}`,
          title: String(body.title || '未命名工单'),
          status: body.status || 'pending',
          priority: body.priority || 'medium',
          progress: body.status === 'done' ? 100 : body.status === 'progress' ? 56 : 12,
          amount: Number(body.amount) || 0,
          assigneeId: Number(body.assigneeId) || 1,
          categoryId: Number(body.categoryId) || 1,
          createdAt: '2026-03-26',
          dueAt: '2026-04-04',
          tags: ['新建', '演示'],
        })

        orders = [nextOrder, ...orders]

        return {
          status: 201,
          data: {
            message: '工单创建成功',
            data: clone(nextOrder),
          } as T,
        }
      }

      const orderMatch = path.match(/^\/api\/demo\/orders\/(\d+)$/)
      if (orderMatch && method === 'GET') {
        const id = Number(orderMatch[1])
        const current = orders.find(item => item.id === id)
        if (!current) {
          notFound(method, path)
        }

        return {
          status: 200,
          data: {
            message: '工单详情加载成功',
            data: clone(current),
          } as T,
        }
      }

      if (orderMatch && method === 'PUT') {
        const id = Number(orderMatch[1])
        const current = orders.find(item => item.id === id)
        if (!current) {
          notFound(method, path)
        }

        const nextOrder = buildOrder({
          ...current,
          title: String(body.title || current.title),
          status: body.status || current.status,
          priority: body.priority || current.priority,
          amount: Number(body.amount ?? current.amount),
          assigneeId: Number(body.assigneeId || current.assigneeId),
          categoryId: Number(body.categoryId || current.categoryId),
          progress: body.status === 'done'
            ? 100
            : body.status === 'progress'
              ? Math.max(current.progress, 56)
              : 16,
        })

        orders = orders.map(item => item.id === id ? nextOrder : item)

        return {
          status: 200,
          data: {
            message: '工单更新成功',
            data: clone(nextOrder),
          } as T,
        }
      }

      if (orderMatch && method === 'DELETE') {
        const id = Number(orderMatch[1])
        orders = orders.filter(item => item.id !== id)

        return {
          status: 200,
          data: {
            message: '工单删除成功',
            data: {
              id,
            },
          } as T,
        }
      }

      notFound(method, path)
    },
  }
}
