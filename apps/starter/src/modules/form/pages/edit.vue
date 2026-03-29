<route lang="json">
{
  "title": "编辑表单",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import type { DemoOrder } from '@/demo/types'
import { usePageTitle } from '@duxweb/uni'
import AsyncForm from '@duxweb/uni-pro/components/AsyncForm.vue'
import AsyncPicker from '@duxweb/uni-pro/components/AsyncPicker.vue'
import { ref } from 'vue'
import { useToast } from 'wot-design-uni/components/wd-toast/index'

const updatedOrder = ref<DemoOrder | null>(null)
const editOrderId = ref<number | string>(1002)
const toast = useToast()

const orderStatusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'progress' },
  { label: '已完成', value: 'done' },
]

const orderPriorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

const editOrderOptions = [
  { label: 'DX-1001', value: 1001 },
  { label: 'DX-1002', value: 1002 },
  { label: 'DX-1003', value: 1003 },
  { label: 'DX-1004', value: 1004 },
  { label: 'DX-1005', value: 1005 },
]

async function handleUpdateSuccess(payload: unknown) {
  updatedOrder.value = (payload || null) as DemoOrder | null
  toast.success('工单更新成功')
}

usePageTitle('编辑表单')
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <wd-segmented
        :value="editOrderId"
        :options="editOrderOptions"
        @update:value="editOrderId = $event"
      />
    </view>

    <AsyncForm
      :id="editOrderId"
      mode="edit"
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
      @submit-success="handleUpdateSuccess"
    >
      <template #default="{ form, submit, saving, loading, record }">
        <view class="flex flex-col gap-[20rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
          <view class="overflow-hidden rounded-[24rpx]">
            <wd-cell-group border>
              <wd-cell title="当前工单" :value="record?.code || '加载中'" />
              <wd-cell title="加载状态" :value="loading ? '详情加载中' : '已回填'" />
              <wd-input v-model="form.values.title" label="标题" prop="title" placeholder="请输入工单标题" />
              <wd-input v-model="form.values.amount" label="预算" type="number" placeholder="3200" />
              <wd-input v-model="form.values.remark" label="说明" disabled />
            </wd-cell-group>
          </view>

          <view class="flex flex-col gap-[12rpx]">
            <text class="text-[24rpx] text-neutral-stronger font-semibold">
              工单状态
            </text>
            <wd-segmented
              :value="form.values.status"
              :options="orderStatusOptions"
              @update:value="form.values.status = $event"
            />
          </view>

          <view class="flex flex-col gap-[12rpx]">
            <text class="text-[24rpx] text-neutral-stronger font-semibold">
              优先级
            </text>
            <wd-segmented
              :value="form.values.priority"
              :options="orderPriorityOptions"
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

          <wd-button type="primary" block :loading="saving || loading" @click="submit">
            保存修改
          </wd-button>
        </view>
      </template>
    </AsyncForm>

    <view v-if="updatedOrder" class="overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="overflow-hidden rounded-[24rpx]">
        <wd-cell-group border>
          <wd-cell title="工单号" :value="updatedOrder.code" />
          <wd-cell title="标题" :value="updatedOrder.title" />
          <wd-cell title="状态" :value="updatedOrder.status" />
          <wd-cell title="优先级" :value="updatedOrder.priority" />
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>
