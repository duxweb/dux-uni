export type DemoOrderStatus = 'pending' | 'progress' | 'done'

export type DemoOrderPriority = 'high' | 'medium' | 'low'

export interface DemoMetric {
  [key: string]: unknown
  key: string
  label: string
  value: string
  trend: string
}

export interface DemoHighlight {
  [key: string]: unknown
  id: number
  title: string
  summary: string
  tag: string
}

export interface DemoOverviewOrder {
  [key: string]: unknown
  id: number
  code: string
  title: string
  status: DemoOrderStatus
  priority: DemoOrderPriority
  progress: number
  assigneeName: string
}

export interface DemoOverview {
  [key: string]: unknown
  greeting: string
  subtitle: string
  completionRate: number
  metrics: DemoMetric[]
  highlights: DemoHighlight[]
  orders: DemoOverviewOrder[]
}

export interface DemoMember {
  [key: string]: unknown
  id: number
  name: string
  title: string
  team: string
  status: 'online' | 'busy' | 'offline'
}

export interface DemoCategory {
  [key: string]: unknown
  id: number
  parent_id: number
  name: string
  code: string
  sort: number
}

export interface DemoOrder {
  [key: string]: unknown
  id: number
  code: string
  title: string
  status: DemoOrderStatus
  priority: DemoOrderPriority
  progress: number
  amount: number
  assigneeId: number
  assigneeName: string
  team: string
  categoryId: number
  categoryName: string
  createdAt: string
  dueAt: string
  tags: string[]
}

export interface DemoSchemaPayload {
  [key: string]: unknown
  schema: any[]
  cards: DemoHighlight[]
  subtitle: string
}

export interface DemoActivity {
  [key: string]: unknown
  id: number
  title: string
  summary: string
  type: 'framework' | 'data' | 'form' | 'account'
  status: 'new' | 'active' | 'done'
  score: number
  createdAt: string
}

export interface DemoFormSubmitResult {
  [key: string]: unknown
  requestId: string
  title: string
  amount: number
  priority: string
  memberName: string
  categoryName: string
  remark: string
  submittedAt: string
}
