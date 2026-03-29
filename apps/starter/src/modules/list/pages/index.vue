<route lang="json">
{
  "title": "列表",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import type {
  DemoActivity,
  DemoOrder,
  DemoOrderPriority,
  DemoOrderStatus,
} from '@/demo/types'
import { onReachBottom } from '@dcloudio/uni-app'
import {
  useCan,
  useDelete,
  useDrawer,
  useEvent,
  useHooks,
  useInfiniteList,
  useInvalidate,
  useList,
  useListener,
} from '@duxweb/uni'
import { computed, reactive, ref, watch } from 'vue'
import { useToast } from 'wot-design-uni/components/wd-toast/index'
import AppStatusTip from '@/components/AppStatusTip.vue'
import { overlayKeys } from '@/runtime/generated/overlay-keys'
import { formatCurrency } from '@/utils/format'

interface LoginMethodOption {
  key: string
  label: string
  description?: string
}

interface RuntimeEventPayload {
  action: string
  source: string
  at: string
}

const canWrite = useCan('orders.write')
const drawer = useDrawer()
const toast = useToast()
const hooks = useHooks()
const runtimeEvent = useEvent<RuntimeEventPayload>('starter:list.runtime')

const viewMode = ref('分页列表')
const keyword = ref('')
const statusLabel = ref('全部')

const activityKeyword = ref('')
const activityTypeLabel = ref('全部')
const loginMethods = ref<LoginMethodOption[]>([])
const eventLogs = ref<Array<RuntimeEventPayload & { id: number }>>([])
const eventSeed = ref(0)

const statusLabelMap: Record<string, 'all' | DemoOrderStatus> = {
  全部: 'all',
  待处理: 'pending',
  进行中: 'progress',
  已完成: 'done',
}

const activityTypeMap: Record<string, '' | DemoActivity['type']> = {
  全部: '',
  框架: 'framework',
  数据: 'data',
  表单: 'form',
  账户: 'account',
}

const editorStatusLabelMap: Record<DemoOrderStatus, string> = {
  pending: '待处理',
  progress: '进行中',
  done: '已完成',
}

const priorityLabelMap: Record<DemoOrderPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const filters = reactive<Record<string, string>>({})
const activityFilters = reactive<Record<string, string>>({})
const pagination = { page: 1, pageSize: 4 }

watch([keyword, statusLabel], ([nextKeyword, nextStatusLabel]) => {
  if (nextKeyword.trim()) {
    filters.keyword = nextKeyword.trim()
  }
  else {
    delete filters.keyword
  }

  const nextStatus = statusLabelMap[nextStatusLabel] || 'all'
  if (nextStatus !== 'all') {
    filters.status = nextStatus
  }
  else {
    delete filters.status
  }
}, { immediate: true })

watch([activityKeyword, activityTypeLabel], ([nextKeyword, nextTypeLabel]) => {
  if (nextKeyword.trim()) {
    activityFilters.keyword = nextKeyword.trim()
  }
  else {
    delete activityFilters.keyword
  }

  const nextType = activityTypeMap[nextTypeLabel] || ''
  if (nextType) {
    activityFilters.type = nextType
  }
  else {
    delete activityFilters.type
  }
}, { immediate: true })

const ordersQuery = useList<DemoOrder>({
  path: 'demo/orders',
  filters,
  pagination,
})

const activityQuery = useInfiniteList<DemoActivity>({
  path: 'demo/activities',
  filters: activityFilters,
  pagination: { pageSize: 5 },
})
const deleteOrder = useDelete<DemoOrder>({ path: 'demo/orders' })
const { invalidate } = useInvalidate()

const orders = computed(() => ordersQuery.data.value?.data || [])
const activities = computed(() => activityQuery.items.value || [])
const currentPage = computed(() => ordersQuery.pagination.value.page)
const currentPageSize = computed(() => ordersQuery.pagination.value.pageSize)
const totalOrders = computed(() => ordersQuery.total.value)
const totalPages = computed(() => Math.max(1, Math.ceil(totalOrders.value / Math.max(currentPageSize.value, 1))))
const paginationPage = computed({
  get: () => currentPage.value,
  set: (value: number) => {
    ordersQuery.pagination.value.page = value
  },
})
const loadingMoreActivities = computed(() => activityQuery.isFetchingNextPage.value)
const hasMoreActivities = computed(() => Boolean(activityQuery.hasNextPage.value))

void hooks.collect<LoginMethodOption>('auth.login.methods').then((items) => {
  loginMethods.value = items
})

useListener<RuntimeEventPayload>('starter:list.runtime', (payload) => {
  if (!payload) {
    return
  }

  eventSeed.value += 1
  eventLogs.value = [
    {
      id: eventSeed.value,
      ...payload,
    },
    ...eventLogs.value,
  ].slice(0, 6)
})

function formatAmount(value: number) {
  return formatCurrency(value)
}

function padTime(value: number) {
  return String(value).padStart(2, '0')
}

function createNowLabel() {
  const now = new Date()
  return `${padTime(now.getHours())}:${padTime(now.getMinutes())}:${padTime(now.getSeconds())}`
}

function getStatusType(value: DemoOrderStatus) {
  if (value === 'done')
    return 'success'
  if (value === 'progress')
    return 'primary'
  return 'warning'
}

function getStatusLabel(value: DemoOrderStatus) {
  return editorStatusLabelMap[value] || '待处理'
}

function getPriorityType(value: DemoOrderPriority) {
  if (value === 'high')
    return 'danger'
  if (value === 'medium')
    return 'warning'
  return 'default'
}

function getPriorityLabel(value: DemoOrderPriority) {
  return priorityLabelMap[value] || '中'
}

function getActivityTypeLabel(value: DemoActivity['type']) {
  if (value === 'framework')
    return '框架'
  if (value === 'data')
    return '数据'
  if (value === 'form')
    return '表单'
  return '账户'
}

function getActivityStatusType(value: DemoActivity['status']) {
  if (value === 'done')
    return 'success'
  if (value === 'active')
    return 'primary'
  return 'warning'
}

function getActivityStatusLabel(value: DemoActivity['status']) {
  if (value === 'done')
    return '完成'
  if (value === 'active')
    return '进行中'
  return '新增'
}

async function openCreate() {
  await drawer.open({
    frame: 'page',
    position: 'bottom',
    componentKey: overlayKeys.listOrderEditorOverlay,
    payload: {
      mode: 'create',
    },
  })
}

async function openEdit(order: DemoOrder) {
  await drawer.open({
    frame: 'page',
    position: 'bottom',
    componentKey: overlayKeys.listOrderEditorOverlay,
    payload: {
      mode: 'edit',
      order,
    },
  })
}

async function refreshOrders() {
  await invalidate({ scope: 'list', path: 'demo/orders' })
  await invalidate({ scope: 'custom', path: 'demo/overview' })
}

async function confirmDelete(order: DemoOrder) {
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '删除列表项',
      content: `确认删除 ${order.code}？`,
      success(result) {
        resolve(Boolean(result.confirm))
      },
      fail() {
        resolve(false)
      },
    })
  })
  if (!confirmed) {
    return
  }

  await deleteOrder.remove({ id: order.id })
  await refreshOrders()
  toast.success('列表项已删除')
}
async function loadMoreActivities() {
  if (!hasMoreActivities.value || loadingMoreActivities.value) {
    return
  }
  await activityQuery.fetchNextPage()
}

function emitRuntime(action: string) {
  runtimeEvent.emit({
    action,
    source: 'list-page',
    at: createNowLabel(),
  })
}

function clearRuntimeLogs() {
  eventLogs.value = []
}

onReachBottom(() => {
  if (viewMode.value !== '无限滚动') {
    return
  }
  void loadMoreActivities()
})
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="flex items-center justify-between gap-[16rpx]">
        <view class="flex flex-col gap-[8rpx]">
          <text class="text-[32rpx] text-neutral-stronger font-semibold">
            列表能力演示
          </text>
          <text class="text-[24rpx] text-neutral-muted leading-relaxed">
            同一个页面分开展示分页列表与无限滚动列表，避免演示内容互相打架。
          </text>
        </view>
        <wd-button
          v-if="canWrite && viewMode === '分页列表'"
          size="small"
          type="primary"
          @click="openCreate"
        >
          新建
        </wd-button>
      </view>

      <wd-segmented
        :value="viewMode"
        :options="['分页列表', '无限滚动', 'Hook / Event']"
        @update:value="viewMode = $event"
      />

      <view class="overflow-hidden rounded-[16rpx]">
        <wd-notice-bar
          text="分页列表示例负责 CRUD、搜索与分页；无限列表负责长列表滚动；Hook / Event 视图集中展示运行时扩展能力。"
          prefix="warn-bold"
          :scrollable="false"
          type="info"
        />
      </view>
    </view>

    <template v-if="viewMode === '分页列表'">
      <view class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
        <wd-search
          :model-value="keyword"
          placeholder="搜索编号 / 标题 / 负责人"
          hide-cancel
          @update:model-value="keyword = $event"
        />

        <wd-tabs :model-value="statusLabel" @change="statusLabel = $event.name">
          <wd-tab v-for="opt in ['全部', '待处理', '进行中', '已完成']" :key="opt" :title="opt" :name="opt" />
        </wd-tabs>
      </view>

      <view class="flex flex-col gap-[16rpx]">
        <template v-if="orders.length">
          <view class="overflow-hidden rounded-[24rpx]">
            <wd-cell-group border>
              <template v-for="order in orders" :key="order.id">
                <wd-swipe-action v-if="canWrite">
                  <wd-cell
                    :title="order.title"
                    :label="`${order.code} · ${order.assigneeName} · ${order.categoryName} · ${formatAmount(order.amount)}`"
                    @click="openEdit(order)"
                  >
                    <template #right-icon>
                      <view class="flex flex-col items-end gap-1">
                        <wd-tag :type="getStatusType(order.status)" size="small">
                          {{ getStatusLabel(order.status) }}
                        </wd-tag>
                        <wd-tag plain :type="getPriorityType(order.priority)" size="small">
                          {{ getPriorityLabel(order.priority) }}
                        </wd-tag>
                      </view>
                    </template>
                  </wd-cell>
                  <template #right>
                    <view class="h-full flex">
                      <view
                        class="w-[140rpx] flex items-center justify-center bg-primary text-[26rpx] text-white"
                        @click="openEdit(order)"
                      >
                        编辑
                      </view>
                      <view
                        class="w-[140rpx] flex items-center justify-center bg-error text-[26rpx] text-white"
                        @click="confirmDelete(order)"
                      >
                        删除
                      </view>
                    </view>
                  </template>
                </wd-swipe-action>

                <wd-cell
                  v-else
                  :title="order.title"
                  :label="`${order.code} · ${order.assigneeName} · ${formatAmount(order.amount)}`"
                >
                  <template #right-icon>
                    <wd-tag :type="getStatusType(order.status)" size="small">
                      {{ getStatusLabel(order.status) }}
                    </wd-tag>
                  </template>
                </wd-cell>
              </template>
            </wd-cell-group>
          </view>

          <view class="flex flex-col gap-[12rpx] rounded-[24rpx] bg-surface p-[20rpx]">
            <view class="flex items-center justify-between gap-[12rpx]">
              <text class="text-[24rpx] text-neutral-stronger font-semibold">
                第 {{ currentPage }} / {{ totalPages }} 页
              </text>
              <text class="text-[22rpx] text-neutral-muted">
                共 {{ totalOrders }} 条，每页 {{ currentPageSize }} 条
              </text>
            </view>
            <wd-pagination
              v-model="paginationPage"
              :total="totalOrders"
              :page-size="currentPageSize"
              show-icon
              show-message
              :hide-if-one-page="false"
            />
          </view>
        </template>

        <view v-else class="rounded-[24rpx] bg-surface py-[60rpx]">
          <AppStatusTip image="content" tip="暂无符合条件的列表数据" />
        </view>
      </view>
    </template>

    <template v-else-if="viewMode === '无限滚动'">
      <view class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
        <wd-search
          :model-value="activityKeyword"
          placeholder="搜索动态列表内容"
          hide-cancel
          @update:model-value="activityKeyword = $event"
        />

        <wd-segmented
          :value="activityTypeLabel"
          :options="['全部', '框架', '数据', '表单', '账户']"
          @update:value="activityTypeLabel = $event"
        />
      </view>

      <view class="flex flex-col gap-[16rpx]">
        <view
          v-for="activity in activities"
          :key="activity.id"
          class="flex flex-col gap-[14rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]"
        >
          <view class="flex items-start justify-between gap-[16rpx]">
            <view class="flex-1">
              <text class="block text-[30rpx] text-neutral-stronger font-semibold">
                {{ activity.title }}
              </text>
              <text class="mt-[8rpx] block text-[24rpx] text-neutral-muted leading-relaxed">
                {{ activity.summary }}
              </text>
            </view>
            <wd-tag :type="getActivityStatusType(activity.status)" size="small">
              {{ getActivityStatusLabel(activity.status) }}
            </wd-tag>
          </view>

          <view class="flex items-center justify-between gap-[16rpx]">
            <view class="flex gap-[10rpx]">
              <wd-tag plain type="primary" size="small">
                {{ getActivityTypeLabel(activity.type) }}
              </wd-tag>
              <wd-tag plain size="small">
                评分 {{ activity.score }}
              </wd-tag>
            </view>
            <text class="text-[22rpx] text-neutral-muted">
              {{ activity.createdAt }}
            </text>
          </view>
        </view>

        <view v-if="!activities.length" class="rounded-[24rpx] bg-surface py-[60rpx]">
          <AppStatusTip image="content" tip="暂无匹配的动态列表数据" />
        </view>

        <view class="flex flex-col items-center gap-[12rpx] rounded-[24rpx] bg-surface p-[20rpx]">
          <wd-button
            plain
            :loading="loadingMoreActivities"
            :disabled="!hasMoreActivities"
            @click="loadMoreActivities"
          >
            {{ hasMoreActivities ? '继续加载' : '已经到底了' }}
          </wd-button>
          <text class="text-[22rpx] text-neutral-muted">
            滚动到底部也会自动继续加载下一页。
          </text>
        </view>
      </view>
    </template>

    <template v-else>
      <view class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
        <view class="flex flex-col gap-[8rpx]">
          <text class="text-[30rpx] text-neutral-stronger font-semibold">
            Hook 收集结果
          </text>
          <text class="text-[24rpx] text-neutral-muted leading-relaxed">
            这里演示模块通过 `hooks.tap()` 注入能力，页面再通过 `hooks.collect()` 汇总结果。
          </text>
        </view>

        <view v-if="loginMethods.length" class="overflow-hidden rounded-[24rpx]">
          <wd-cell-group border>
            <wd-cell
              v-for="item in loginMethods"
              :key="item.key"
              :title="item.label"
              :label="item.description || item.key"
            />
          </wd-cell-group>
        </view>

        <view v-else class="rounded-[24rpx] bg-background-muted py-[48rpx]">
          <AppStatusTip image="search" tip="当前没有模块注入的 Hook 结果" />
        </view>
      </view>

      <view class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
        <view class="flex items-start justify-between gap-[16rpx]">
          <view class="flex flex-1 flex-col gap-[8rpx]">
            <text class="text-[30rpx] text-neutral-stronger font-semibold">
              运行时事件
            </text>
            <text class="text-[24rpx] text-neutral-muted leading-relaxed">
              使用 `useEvent()` 发送事件，`useListener()` 订阅并在当前页面回显消息。
            </text>
          </view>
          <wd-button size="small" plain @click="clearRuntimeLogs">
            清空
          </wd-button>
        </view>

        <view class="flex flex-wrap gap-[12rpx]">
          <wd-button size="small" type="primary" plain @click="emitRuntime('refresh')">
            发送 refresh
          </wd-button>
          <wd-button size="small" type="success" plain @click="emitRuntime('created')">
            发送 created
          </wd-button>
          <wd-button size="small" type="warning" plain @click="emitRuntime('synced')">
            发送 synced
          </wd-button>
        </view>

        <view v-if="eventLogs.length" class="overflow-hidden rounded-[24rpx]">
          <wd-cell-group border>
            <wd-cell
              v-for="item in eventLogs"
              :key="item.id"
              :title="`${item.action} · ${item.at}`"
              :label="`source: ${item.source}`"
            />
          </wd-cell-group>
        </view>

        <view v-else class="rounded-[24rpx] bg-background-muted py-[48rpx]">
          <AppStatusTip image="message" tip="还没有事件记录，点击上方按钮发送一次" />
        </view>
      </view>
    </template>
  </view>
</template>
