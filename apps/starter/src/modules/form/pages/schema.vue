<route lang="json">
{
  "title": "动态渲染",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import type { DemoSchemaPayload } from '@/demo/types'
import { UniSchemaRenderer, useCustom, usePageTitle, useThemePreference } from '@duxweb/uni'
import { computed, reactive, ref } from 'vue'
import { wrapAsyncEvent } from '@/utils/async'

const schemaMode = ref('预览')
const schemaModes = ['预览', 'JSON']
const schemaStatusOptions = ['active', 'draft', 'archived']
const { currentTheme } = useThemePreference()

const schemaState = reactive({
  message: '这段文本来自 bindings.state.message，可被 JSON 输入框直接改写。',
  status: 'active',
})

const schemaQuery = useCustom<DemoSchemaPayload>({
  path: 'demo/schema',
  method: 'GET',
})

const schemaPayload = computed(() => schemaQuery.data.value?.data)
const schema = computed(() => schemaPayload.value?.schema || [])
const schemaBindings = computed(() => ({
  state: schemaState,
  request: {
    cards: schemaPayload.value?.cards || [],
    subtitle: schemaPayload.value?.subtitle || '',
  },
}))

const schemaCodeStyle = computed(() => ({
  background: currentTheme.value === 'dark'
    ? 'var(--dux-color-surface-strong)'
    : 'var(--dux-color-surface-muted)',
}))

const refreshSchema = wrapAsyncEvent('form.schema.refresh', async () => {
  await schemaQuery.refetch()
})

usePageTitle('动态渲染')
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="flex flex-col gap-[18rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="flex items-center justify-between gap-[16rpx]">
        <wd-segmented
          :value="schemaMode"
          :options="schemaModes"
          @update:value="schemaMode = $event"
        />
        <wd-button size="small" plain @click="refreshSchema">
          刷新
        </wd-button>
      </view>

      <wd-segmented
        :value="schemaState.status"
        :options="schemaStatusOptions"
        @update:value="schemaState.status = $event"
      />

      <view v-if="schemaMode === '预览'" class="border border-neutral-subtle rounded-[20rpx] bg-background p-[20rpx]">
        <UniSchemaRenderer :schema="schema" :bindings="schemaBindings" />
      </view>

      <view
        v-else
        class="border border-neutral-subtle rounded-[20rpx] p-[20rpx]"
        :style="schemaCodeStyle"
      >
        <text class="block whitespace-pre-wrap text-[22rpx] text-primary-strong leading-relaxed font-mono">
          {{ JSON.stringify(schema, null, 2) }}
        </text>
      </view>
    </view>
  </view>
</template>
