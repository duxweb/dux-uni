<route lang="json">
{
  "title": "文件能力"
}
</route>

<script setup lang="ts">
import type { UniUploadAsset } from '@duxweb/uni'
import type { UploadFileItem } from 'wot-design-uni/components/wd-upload/types'
import { useDownload, usePageTitle } from '@duxweb/uni'
import AsyncUpload from '@duxweb/uni-pro/components/AsyncUpload.vue'
import { computed, ref } from 'vue'
import AppStatusTip from '@/components/AppStatusTip.vue'

function wait(ms = 120) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const uploadFiles = ref<UploadFileItem[]>([])
const uploadError = ref('')
const downloadError = ref('')

const downloadDemo = useDownload({
  url: 'mock://dux/download/runtime-report.pdf',
  executor: async ({ onProgress }) => {
    for (const percent of [18, 36, 58, 82, 100]) {
      onProgress?.({ loaded: percent, total: 100, percent })
      await wait(80)
    }
    return {
      tempFilePath: '/tmp/runtime-report.pdf',
      data: { filename: 'runtime-report.pdf' },
    }
  },
})

const downloading = computed(() => downloadDemo.downloading.value)
const downloadProgress = computed(() => downloadDemo.progress.value?.percent || 0)
const downloadResultPath = computed(() => downloadDemo.result.value?.tempFilePath || '尚未下载')
const uploadedResponse = computed(() => {
  const file = uploadFiles.value[0]
  const response = file?.response as { url?: string } | undefined
  return response?.url || '尚未上传'
})

usePageTitle('文件能力')

async function mockUploadExecutor(input: {
  asset: UniUploadAsset
  onProgress?: (progress: {
    loaded: number
    total?: number
    percent?: number
  }) => void
}) {
  for (const percent of [20, 44, 68, 88, 100]) {
    input.onProgress?.({
      loaded: percent,
      total: 100,
      percent,
    })
    await wait(80)
  }

  return {
    url: `https://demo.local/uploads/${input.asset.name || 'demo-file'}`,
    name: input.asset.name || 'demo-file',
  }
}

function normalizeUploadError(payload: unknown) {
  if (payload && typeof payload === 'object' && 'error' in (payload as Record<string, unknown>)) {
    return String((payload as Record<string, unknown>).error || '')
  }
  if (payload && typeof payload === 'object' && 'errMsg' in (payload as Record<string, unknown>)) {
    return String((payload as Record<string, unknown>).errMsg || '')
  }
  return String(payload || '上传失败')
}

function handleUploadFail(payload: unknown) {
  uploadError.value = normalizeUploadError(payload)
}

async function runDownloadDemo() {
  downloadError.value = ''
  try {
    await downloadDemo.download()
  }
  catch (error) {
    downloadError.value = error instanceof Error ? error.message : '下载失败'
  }
}
</script>

<template>
  <view class="feature-files-page flex flex-col gap-[24rpx]">
    <view class="flex flex-col gap-[18rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        AsyncUpload 演示
      </text>

      <AsyncUpload
        v-model:file-list="uploadFiles"
        url="mock://dux/upload"
        :executor="mockUploadExecutor"
        :limit="1"
        accept="image"
        @fail="handleUploadFail"
      />

      <wd-progress :percentage="uploadFiles[0]?.percent || 0" />
      <text class="break-all text-[24rpx] text-primary font-mono">
        {{ uploadedResponse }}
      </text>
      <AppStatusTip v-if="uploadError" image="network" :tip="uploadError" />
    </view>

    <view class="flex flex-col gap-[18rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        下载演示
      </text>
      <view class="overflow-hidden rounded-[20rpx]">
        <wd-cell-group border>
          <wd-cell title="runtime-report.pdf" label="useDownload + 模拟执行器" is-link @click="runDownloadDemo">
            <template #right-icon>
              <wd-button size="small" plain :loading="downloading">
                开始
              </wd-button>
            </template>
          </wd-cell>
        </wd-cell-group>
      </view>
      <wd-progress :percentage="downloadProgress" />
      <text class="break-all text-[24rpx] text-primary font-mono">
        {{ downloadResultPath }}
      </text>
      <AppStatusTip v-if="downloadError" image="network" :tip="downloadError" />
    </view>
  </view>
</template>
