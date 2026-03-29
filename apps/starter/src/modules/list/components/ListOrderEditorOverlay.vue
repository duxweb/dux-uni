<script setup lang="ts">
import type {
  DemoCategory,
  DemoMember,
  DemoOrder,
  DemoOrderPriority,
  DemoOrderStatus,
} from '@/demo/types'
import {
  useCreate,
  useInvalidate,
  useOverlayContext,
  useSelect,
  useTree,
  useUpdate,
} from '@duxweb/uni'
import DuxDrawerPage from '@duxweb/uni-pro/components/DuxDrawerPage.vue'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'wot-design-uni/components/wd-toast/index'

interface ListOrderEditorPayload {
  mode?: 'create' | 'edit'
  order?: DemoOrder
}

const overlay = useOverlayContext<ListOrderEditorPayload, DemoOrder | undefined>()
const toast = useToast()
const statusSegmentedRef = ref<{ updateActiveStyle?: () => void } | null>(null)
const prioritySegmentedRef = ref<{ updateActiveStyle?: () => void } | null>(null)
const isEdit = computed(() => overlay.payload?.mode === 'edit' && overlay.payload?.order?.id != null)
const editingOrder = computed(() => overlay.payload?.order)

const form = reactive({
  title: '',
  assigneeId: 0,
  categoryId: 0,
  amount: '1200',
})

const memberKeyword = ref('')
const formStatusLabel = ref('待处理')
const formPriorityLabel = ref('中')

const editorStatusValueMap: Record<string, DemoOrderStatus> = {
  待处理: 'pending',
  进行中: 'progress',
  已完成: 'done',
}

const editorStatusLabelMap: Record<DemoOrderStatus, string> = {
  pending: '待处理',
  progress: '进行中',
  done: '已完成',
}

const priorityValueMap: Record<string, DemoOrderPriority> = {
  高: 'high',
  中: 'medium',
  低: 'low',
}

const priorityLabelMap: Record<DemoOrderPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const editorStatusOptions = ['待处理', '进行中', '已完成']
const priorityOptions = ['高', '中', '低']

const assigneeSelect = useSelect<DemoMember>({
  path: 'demo/members',
  optionLabel: 'name',
  optionValue: 'id',
  keywordField: 'keyword',
  pagination: 20,
  immediate: false,
})

const categoryTree = useTree<DemoCategory>({
  path: 'demo/categories',
  immediate: false,
})

async function loadEditorOptions() {
  void assigneeSelect.refresh()
  void categoryTree.refresh()
}

onMounted(() => {
  void loadEditorOptions()
})

const createOrder = useCreate<DemoOrder>({ path: 'demo/orders' })
const updateOrder = useUpdate<DemoOrder>({ path: 'demo/orders' })
const { invalidate } = useInvalidate()

const assignees = computed(() => assigneeSelect.options.value)
const categories = computed(() => categoryTree.flatItems.value || [])

function applyDefaultSelection() {
  if (!form.assigneeId) {
    form.assigneeId = Number(assignees.value[0]?.value || 0)
  }

  if (!form.categoryId) {
    form.categoryId = categories.value[0]?.id || 0
  }
}

function resetCreateForm() {
  form.title = ''
  formStatusLabel.value = '待处理'
  formPriorityLabel.value = '中'
  form.assigneeId = 0
  form.categoryId = 0
  form.amount = '1200'
  memberKeyword.value = ''
  applyDefaultSelection()
}

function fillEditForm(order: DemoOrder) {
  form.title = order.title
  formStatusLabel.value = editorStatusLabelMap[order.status] || '待处理'
  formPriorityLabel.value = priorityLabelMap[order.priority] || '中'
  form.assigneeId = order.assigneeId
  form.categoryId = order.categoryId
  form.amount = String(order.amount)
  memberKeyword.value = ''
}

watch(editingOrder, (order) => {
  if (isEdit.value && order) {
    fillEditForm(order)
    return
  }

  resetCreateForm()
}, { immediate: true })

watch([assignees, categories, isEdit], () => {
  if (isEdit.value) {
    return
  }

  applyDefaultSelection()
}, { immediate: true })

async function refreshOrders() {
  await invalidate({ scope: 'list', path: 'demo/orders' })
  await invalidate({ scope: 'custom', path: 'demo/overview' })
}

function handleMemberSearch(event: { value?: string }) {
  memberKeyword.value = event.value || ''
  assigneeSelect.search(memberKeyword.value)
}

async function submit() {
  const title = form.title.trim()
  if (!title) {
    toast.warning('请填写列表项标题')
    return undefined
  }

  if (!form.assigneeId || !form.categoryId) {
    toast.warning('请选择负责人和分类')
    return undefined
  }

  const payload = {
    title,
    status: editorStatusValueMap[formStatusLabel.value] || 'pending',
    priority: priorityValueMap[formPriorityLabel.value] || 'medium',
    assigneeId: form.assigneeId,
    categoryId: form.categoryId,
    amount: Number(form.amount || 0),
  }

  const result = isEdit.value
    ? await updateOrder.update({ id: editingOrder.value?.id, data: payload })
    : await createOrder.create({ data: payload })

  await refreshOrders()
  toast.success(isEdit.value ? '列表项已更新' : '列表项已创建')
  return typeof result.data === 'undefined' ? payload : result.data
}

async function refreshLayout() {
  await nextTick()
  setTimeout(() => {
    statusSegmentedRef.value?.updateActiveStyle?.()
    prioritySegmentedRef.value?.updateActiveStyle?.()
  }, 32)
}
</script>

<template>
  <DuxDrawerPage
    :title="isEdit ? '更新分页列表示例' : '新建分页列表示例'"
    :confirm-text="isEdit ? '保存修改' : '创建列表项'"
    :submit="submit"
    :refresh-layout="refreshLayout"
  >
    <view class="flex flex-col gap-[20rpx]">
      <view class="overflow-hidden rounded-[24rpx]">
        <wd-cell-group border>
          <wd-input v-model="form.title" label="标题" placeholder="请输入列表项标题" />
          <wd-input v-model="form.amount" label="预算" type="number" placeholder="1200" />
        </wd-cell-group>
      </view>

      <view class="flex flex-col gap-[12rpx]">
        <text class="text-[24rpx] text-neutral-stronger font-semibold">
          状态
        </text>
        <wd-segmented
          ref="statusSegmentedRef"
          :value="formStatusLabel"
          :options="editorStatusOptions"
          @update:value="formStatusLabel = $event"
        />
      </view>

      <view class="flex flex-col gap-[12rpx]">
        <text class="text-[24rpx] text-neutral-stronger font-semibold">
          优先级
        </text>
        <wd-segmented
          ref="prioritySegmentedRef"
          :value="formPriorityLabel"
          :options="priorityOptions"
          @update:value="formPriorityLabel = $event"
        />
      </view>

      <view class="flex flex-col gap-[12rpx]">
        <text class="text-[24rpx] text-neutral-stronger font-semibold">
          负责人
        </text>
        <wd-search
          :model-value="memberKeyword"
          placeholder="搜索成员"
          hide-cancel
          @change="handleMemberSearch"
        />
        <view class="overflow-hidden rounded-[24rpx]">
          <wd-cell-group border>
            <wd-cell
              v-for="member in assignees"
              :key="member.key"
              clickable
              :title="member.label"
              :label="member.raw.title"
              :value="member.raw.team"
              @click="form.assigneeId = Number(member.value)"
            >
              <template #right-icon>
                <wd-badge v-if="form.assigneeId === Number(member.value)" is-dot type="success" />
              </template>
            </wd-cell>
          </wd-cell-group>
        </view>
      </view>

      <view class="flex flex-col gap-[12rpx]">
        <text class="text-[24rpx] text-neutral-stronger font-semibold">
          分类
        </text>
        <view class="overflow-hidden rounded-[24rpx]">
          <wd-cell-group border>
            <wd-cell
              v-for="category in categories"
              :key="category.id"
              clickable
              :title="category.name"
              :label="category.code"
              @click="form.categoryId = category.id"
            >
              <template #right-icon>
                <wd-badge v-if="form.categoryId === category.id" is-dot type="primary" />
              </template>
            </wd-cell>
          </wd-cell-group>
        </view>
      </view>
    </view>
  </DuxDrawerPage>
</template>
