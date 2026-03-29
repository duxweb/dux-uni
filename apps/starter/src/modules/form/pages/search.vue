<route lang="json">
{
  "title": "远程搜索",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import { usePageTitle } from '@duxweb/uni'
import AsyncPicker from '@duxweb/uni-pro/components/AsyncPicker.vue'
import { ref } from 'vue'

const memberSearchPickerRef = ref<any>(null)
const memberSearchKeyword = ref('')
const searchedMemberValue = ref<number | string>(2)

function handleMemberSearchChange(event: { value?: string } | string) {
  const value = typeof event === 'string' ? event : (event?.value || '')
  memberSearchKeyword.value = value
  memberSearchPickerRef.value?.search?.(value)
}

usePageTitle('远程搜索')
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="flex flex-col gap-[18rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <wd-search
        :model-value="memberSearchKeyword"
        placeholder="输入成员名后再次打开选择器"
        hide-cancel
        @change="handleMemberSearchChange"
      />

      <AsyncPicker
        ref="memberSearchPickerRef"
        v-model="searchedMemberValue"
        label="搜索负责人"
        title="搜索负责人"
        placeholder="请选择负责人"
        path="demo/members"
        option-label="name"
        option-value="id"
        option-key="id"
        keyword-field="keyword"
        :pagination="10"
        :immediate="false"
      />
    </view>

    <view class="overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="overflow-hidden rounded-[24rpx]">
        <wd-cell-group border>
          <wd-cell title="搜索关键词" :value="memberSearchKeyword || '空'" />
          <wd-cell title="当前值" :value="String(searchedMemberValue)" />
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>
