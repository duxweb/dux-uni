<route lang="json">
{
  "title": "异步选择器",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import { usePageTitle } from '@duxweb/uni'
import AsyncPickerView from '@duxweb/uni-pro/components/AsyncPickerView.vue'
import { computed, ref } from 'vue'

const memberPickerViewRef = ref<any>(null)
const memberPickerViewValue = ref<number | string>(1)
const pickerViewOptions = computed(() => {
  const exposed = memberPickerViewRef.value?.options
  if (Array.isArray(exposed)) {
    return exposed
  }
  return exposed?.value || []
})

const selectedPickerViewMemberLabel = computed(() => {
  const selected = pickerViewOptions.value.find((item: { value: string | number, label: string }) => String(item.value) === String(memberPickerViewValue.value))
  return selected?.label || '未选择'
})

usePageTitle('异步选择器')
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <AsyncPickerView
        ref="memberPickerViewRef"
        v-model="memberPickerViewValue"
        path="demo/members"
        option-label="name"
        option-value="id"
        option-key="id"
        :columns-height="180"
      />
    </view>

    <view class="overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="overflow-hidden rounded-[24rpx]">
        <wd-cell-group border>
          <wd-cell title="当前选中成员" :value="selectedPickerViewMemberLabel" />
          <wd-cell title="当前值" :value="String(memberPickerViewValue)" />
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>
