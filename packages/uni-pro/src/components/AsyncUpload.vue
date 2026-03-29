<script setup lang="ts">
import type { Dict, UniUploadAsset } from '@duxweb/uni'
import type { UploadFileItem } from 'wot-design-uni/components/wd-upload/types'
import { computed, useAttrs } from 'vue'
import { useUpload } from '@duxweb/uni'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  modelValue?: UploadFileItem[]
  fileList?: UploadFileItem[]
  path?: string
  url?: string
  headers?: Dict<string>
  formData?: Dict<string | number | boolean>
  formName?: string
  autoUpload?: boolean
  maxFileCount?: number
  maxFileSize?: number
  executor?: (input: {
    asset: UniUploadAsset
    url: string
    headers?: Dict<string>
    formData?: Dict<string | number | boolean>
    onProgress?: (progress: {
      loaded: number
      total?: number
      percent?: number
    }) => void
  }) => Promise<unknown>
}>(), {
  autoUpload: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: UploadFileItem[]): void
  (e: 'update:fileList', value: UploadFileItem[]): void
  (e: 'change', payload: unknown): void
  (e: 'success', payload: unknown): void
  (e: 'fail', payload: unknown): void
  (e: 'progress', payload: unknown): void
  (e: 'remove', payload: unknown): void
  (e: 'chooseerror', payload: unknown): void
  (e: 'oversize', payload: unknown): void
}>()

const attrs = useAttrs()

const upload = useUpload({
  path: props.path,
  url: props.url,
  headers: props.headers,
  formData: props.formData,
  formName: props.formName,
  autoUpload: false,
  maxFileCount: props.maxFileCount,
  maxFileSize: props.maxFileSize,
  executor: props.executor,
})

const currentFileList = computed(() => props.fileList || props.modelValue || [])
const resolvedAction = computed(() => props.url || props.path || String(attrs.action || '__dux_async_upload__'))

function pickUploadUrl(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const source = value as Dict

  if (typeof source.url === 'string') {
    return source.url
  }

  if (source.data && typeof source.data === 'object' && typeof (source.data as Dict).url === 'string') {
    return (source.data as Dict).url as string
  }

  return undefined
}

async function uploadMethod(
  file: UploadFileItem,
  formData: Record<string, any>,
  options: {
    action: string
    header: Record<string, any>
    name: string
    fileName: string
    fileType: 'image' | 'video' | 'audio'
    statusCode: number
    abortPrevious?: boolean
    onSuccess: (res: UniApp.UploadFileSuccessCallbackResult, file: UploadFileItem, formData: Record<string, any>) => void
    onError: (res: UniApp.GeneralCallbackResult, file: UploadFileItem, formData: Record<string, any>) => void
    onProgress: (res: UniApp.OnProgressUpdateResult, file: UploadFileItem) => void
  },
) {
  try {
    const [taskFile] = await upload.add({
      filePath: file.url,
      name: file.name || options.fileName,
      size: file.size,
      type: options.fileType,
      formName: options.name,
      headers: options.header,
      formData,
    })

    const response = await upload.upload(taskFile)
    const uploadedUrl = pickUploadUrl(response)
    if (uploadedUrl) {
      file.url = uploadedUrl
    }

    options.onSuccess({
      statusCode: options.statusCode,
      data: typeof response === 'string' ? response : JSON.stringify(response || {}),
      errMsg: 'uploadFile:ok',
    }, file, formData)

    upload.remove(taskFile.id)
  }
  catch (error) {
    options.onError({
      errMsg: error instanceof Error ? error.message : 'uploadFile:fail',
    }, file, formData)
  }
}

function emitFileList(value: UploadFileItem[]) {
  emit('update:fileList', value)
  emit('update:modelValue', value)
}

defineExpose({
  runtime: upload,
})
</script>

<template>
  <wd-upload
    v-bind="attrs"
    :file-list="currentFileList"
    :action="resolvedAction"
    :header="headers"
    :form-data="formData"
    :name="formName || 'file'"
    :auto-upload="autoUpload"
    :limit="maxFileCount"
    :max-size="maxFileSize"
    :upload-method="uploadMethod"
    @change="emit('change', $event)"
    @chooseerror="emit('chooseerror', $event)"
    @fail="emit('fail', $event)"
    @oversize="emit('oversize', $event)"
    @progress="emit('progress', $event)"
    @remove="emit('remove', $event)"
    @success="emit('success', $event)"
    @update:fileList="emitFileList"
  />
</template>
