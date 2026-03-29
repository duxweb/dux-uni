<script setup lang="ts">
import AsyncForm from '@duxweb/uni-pro/components/AsyncForm.vue'
import AsyncPicker from '@duxweb/uni-pro/components/AsyncPicker.vue'
import { nextTick, ref } from 'vue'
import { useToast } from 'wot-design-uni/components/wd-toast/index'

defineProps<{
  isEdit: boolean
  orderId?: number | string
}>()

const formRef = ref<any>(null)
const statusSegmentedRef = ref<{ updateActiveStyle?: () => void } | null>(null)
const prioritySegmentedRef = ref<{ updateActiveStyle?: () => void } | null>(null)
const toast = useToast()

const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'progress' },
  { label: '已完成', value: 'done' },
]

const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

async function submit() {
  const result = await formRef.value?.submit?.()
  if (!result) {
    return undefined
  }

  if (result.success) {
    return result.data
  }

  const firstError = String(Object.values(result.errors || {})[0] || '表单校验失败')
  toast.warning(firstError)
  return undefined
}

async function refreshLayout() {
  await nextTick()
  setTimeout(() => {
    statusSegmentedRef.value?.updateActiveStyle?.()
    prioritySegmentedRef.value?.updateActiveStyle?.()
  }, 32)
}

defineExpose({
  submit,
  refreshLayout,
})
</script>

<template>
  <AsyncForm
    :id="orderId"
    ref="formRef"
    :mode="isEdit ? 'edit' : 'create'"
    path="demo/orders"
    :initial-values="{
      title: '',
      amount: '0',
      status: 'pending',
      priority: 'medium',
      assigneeId: 1,
      remark: '',
    }"
    :rules="{
      title: [{ required: true, message: '请输入标题' }],
      assigneeId: [{ required: true, message: '请选择负责人' }],
    }"
    :validate-rules="{
      title: value => String(value || '').trim() ? undefined : '请输入标题',
      assigneeId: value => Number(value || 0) > 0 ? undefined : '请选择负责人',
    }"
    :transform-load="record => ({
      title: record.title,
      amount: String(record.amount || 0),
      status: record.status,
      priority: record.priority,
      assigneeId: record.assigneeId,
      remark: `当前工单：${record.code}`,
    })"
    :transform-submit="values => ({
      title: String(values.title || '').trim(),
      amount: Number(values.amount || 0),
      status: values.status,
      priority: values.priority,
      assigneeId: Number(values.assigneeId || 0),
    })"
  >
    <template #default="{ form }">
      <view class="flex flex-col gap-[20rpx]">
        <view class="overflow-hidden rounded-[24rpx]">
          <wd-cell-group border>
            <wd-input v-model="form.values.title" label="标题" prop="title" placeholder="请输入工单标题" />
            <wd-input v-model="form.values.amount" label="预算" type="number" placeholder="3200" />
            <wd-input v-model="form.values.remark" label="说明" placeholder="当前说明" :disabled="isEdit" />
          </wd-cell-group>
        </view>

        <view class="flex flex-col gap-[12rpx]">
          <text class="text-[24rpx] text-neutral-stronger font-semibold">
            工单状态
          </text>
          <wd-segmented
            ref="statusSegmentedRef"
            :value="form.values.status"
            :options="statusOptions"
            @update:value="form.values.status = $event"
          />
        </view>

        <view class="flex flex-col gap-[12rpx]">
          <text class="text-[24rpx] text-neutral-stronger font-semibold">
            优先级
          </text>
          <wd-segmented
            ref="prioritySegmentedRef"
            :value="form.values.priority"
            :options="priorityOptions"
            @update:value="form.values.priority = $event"
          />
        </view>

        <AsyncPicker
          v-model="form.values.assigneeId"
          label="负责人"
          prop="assigneeId"
          title="选择负责人"
          placeholder="请选择负责人"
          path="demo/members"
          option-label="name"
          option-value="id"
          option-key="id"
        />
      </view>
    </template>
  </AsyncForm>
</template>
