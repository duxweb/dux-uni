<route lang="json">
{
  "title": "新增表单",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import type { DemoOrder } from '@/demo/types'
import { usePageTitle } from '@duxweb/uni'
import AsyncColPicker from '@duxweb/uni-pro/components/AsyncColPicker.vue'
import AsyncForm from '@duxweb/uni-pro/components/AsyncForm.vue'
import AsyncPicker from '@duxweb/uni-pro/components/AsyncPicker.vue'
import AsyncUpload from '@duxweb/uni-pro/components/AsyncUpload.vue'
import { ref } from 'vue'
import { useToast } from 'wot-design-uni/components/wd-toast/index'

const createdOrder = ref<DemoOrder | null>(null)
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

function wait(ms = 120) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function mockUploadExecutor(input: {
  asset: { name?: string }
  onProgress?: (progress: { loaded: number, total?: number, percent?: number }) => void
}) {
  for (const percent of [18, 42, 66, 86, 100]) {
    input.onProgress?.({ loaded: percent, total: 100, percent })
    await wait(70)
  }

  return {
    url: `https://demo.local/uploads/${input.asset.name || 'order-attachment'}`,
    name: input.asset.name || 'order-attachment',
  }
}

async function handleCreateSuccess(payload: unknown) {
  createdOrder.value = (payload || null) as DemoOrder | null
  toast.success('工单创建成功')
}

usePageTitle('新增表单')
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <AsyncForm
      path="demo/orders"
      :initial-values="{
        title: 'uni-pro 异步工单',
        amount: '3200',
        status: 'pending',
        priority: 'medium',
        assigneeId: 1,
        categoryIds: [1, 11],
        attachments: [],
        remark: '通过 AsyncForm 统一 create 提交。',
      }"
      :rules="{
        title: [{ required: true, message: '请输入工单标题' }],
        assigneeId: [{ required: true, message: '请选择负责人' }],
        categoryIds: [{ required: true, message: '请选择分类路径' }],
      }"
      :validate-rules="{
        title: value => String(value || '').trim() ? undefined : '请输入工单标题',
        assigneeId: value => Number(value || 0) > 0 ? undefined : '请选择负责人',
        categoryIds: value => Array.isArray(value) && value.length > 0 ? undefined : '请选择分类路径',
      }"
      :transform-submit="values => ({
        title: String(values.title || '').trim(),
        amount: Number(values.amount || 0),
        status: values.status,
        priority: values.priority,
        assigneeId: Number(values.assigneeId || 0),
        categoryId: Array.isArray(values.categoryIds) ? Number(values.categoryIds.at(-1) || 0) : 0,
        attachments: Array.isArray(values.attachments)
          ? values.attachments.map((item: any) => item.response?.url || item.url).filter(Boolean)
          : [],
        remark: values.remark,
      })"
      @submit-success="handleCreateSuccess"
    >
      <template #default="{ form, submit, saving }">
        <view class="flex flex-col gap-[20rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
          <view class="overflow-hidden rounded-[24rpx]">
            <wd-cell-group border>
              <wd-input v-model="form.values.title" label="标题" prop="title" placeholder="请输入工单标题" />
              <wd-input v-model="form.values.amount" label="预算" type="number" placeholder="3200" />
              <wd-input v-model="form.values.remark" label="备注" placeholder="填写说明信息" />
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

          <AsyncColPicker
            v-model="form.values.categoryIds"
            label="分类路径"
            prop="categoryIds"
            title="选择分类"
            placeholder="请选择分类路径"
            path="demo/categories"
            value-key="id"
            label-key="name"
            :tree-options="{
              idKey: 'id',
              parentKey: 'parent_id',
              childrenKey: 'children',
              sortKey: 'sort',
            }"
          />

          <AsyncUpload
            v-model:file-list="form.values.attachments"
            url="mock://dux/upload/order-attachment"
            :executor="mockUploadExecutor"
            :limit="3"
            accept="image"
          />

          <wd-button type="primary" block :loading="saving" @click="submit">
            提交创建
          </wd-button>
        </view>
      </template>
    </AsyncForm>

    <view v-if="createdOrder" class="overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="overflow-hidden rounded-[24rpx]">
        <wd-cell-group border>
          <wd-cell title="工单号" :value="createdOrder.code" />
          <wd-cell title="标题" :value="createdOrder.title" />
          <wd-cell title="状态" :value="createdOrder.status" />
          <wd-cell title="优先级" :value="createdOrder.priority" />
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>
