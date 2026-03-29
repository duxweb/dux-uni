import type { Ref } from 'vue'
import type { Dict, UniAppContext, UniUploadProgress } from '../types'
import { computed, ref } from 'vue'
import { resolveHookAppOptions, resolveResourceUrl, withAuthHeaders } from './shared'

export interface UniUploadAsset {
  id?: string
  filePath?: string
  file?: File
  name?: string
  size?: number
  type?: string
  formName?: string
  formData?: Dict<string | number | boolean>
  headers?: Dict<string>
}

export interface UniUploadFile extends UniUploadAsset {
  id: string
  progress?: UniUploadProgress
  status: 'pending' | 'uploading' | 'success' | 'error'
  response?: unknown
  error?: string
}

export interface UseUploadOptions {
  path?: string
  url?: string
  formName?: string
  formData?: Dict<string | number | boolean>
  headers?: Dict<string>
  autoUpload?: boolean
  maxFileCount?: number
  maxFileSize?: number
  executor?: (input: {
    asset: UniUploadAsset
    url: string
    headers?: Dict<string>
    formData?: Dict<string | number | boolean>
    onProgress?: (progress: UniUploadProgress) => void
  }) => Promise<unknown>
}

function parseMaybeJson(value: unknown) {
  if (typeof value !== 'string') {
    return value
  }
  try {
    return JSON.parse(value)
  }
  catch {
    return value
  }
}

function createId() {
  return `upload-${Math.random().toString(36).slice(2, 10)}`
}

async function defaultUploadExecutor(input: {
  asset: UniUploadAsset
  url: string
  headers?: Dict<string>
  formData?: Dict<string | number | boolean>
  onProgress?: (progress: UniUploadProgress) => void
}) {
  const { default: un } = await import('@uni-helper/uni-network')
  const client = un.create()
  const response = await client.upload({
    url: input.url,
    name: input.asset.formName || 'file',
    filePath: input.asset.filePath,
    file: input.asset.file as any,
    headers: input.headers,
    formData: input.formData,
    onUploadProgress(progress) {
      input.onProgress?.({
        loaded: progress?.totalBytesSent || 0,
        total: progress?.totalBytesExpectedToSend,
        percent: progress?.progress,
      })
    },
  })

  return parseMaybeJson(response.data)
}

export function useUpload(appOrOptions?: UniAppContext | UseUploadOptions, maybeOptions: UseUploadOptions = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const files = ref<UniUploadFile[]>([])
  const uploading = ref(false)

  function assertAsset(asset: UniUploadAsset) {
    if (!asset.file && !asset.filePath) {
      throw new Error('Upload assets require a file or filePath')
    }
    if (options.maxFileSize && asset.size && asset.size > options.maxFileSize) {
      throw new Error(`File size exceeds the configured max size: ${options.maxFileSize}`)
    }
    if (options.maxFileCount && files.value.length >= options.maxFileCount) {
      throw new Error(`File count exceeds the configured max count: ${options.maxFileCount}`)
    }
  }

  async function uploadFile(file: UniUploadFile) {
    const executor = options.executor || defaultUploadExecutor
    const target = files.value.find(item => item.id === file.id)
    if (!target) {
      return
    }

    target.status = 'uploading'
    uploading.value = true

    try {
      const response = await executor({
        asset: file,
        url: resolveResourceUrl(app, {
          path: options.path,
          url: options.url,
        }),
        headers: withAuthHeaders(app, {
          ...(options.headers || {}),
          ...(file.headers || {}),
        }),
        formData: {
          ...(options.formData || {}),
          ...(file.formData || {}),
        },
        onProgress(progress) {
          target.progress = progress
        },
      })

      target.status = 'success'
      target.response = response
      return response
    }
    catch (error) {
      target.status = 'error'
      target.error = error instanceof Error ? error.message : 'Upload failed'
      throw error
    }
    finally {
      uploading.value = files.value.some(item => item.status === 'uploading')
    }
  }

  async function add(input: UniUploadAsset | UniUploadAsset[]) {
    const assets = Array.isArray(input) ? input : [input]
    const appended = assets.map((asset) => {
      assertAsset(asset)
      const item: UniUploadFile = {
        ...asset,
        id: asset.id || createId(),
        formName: asset.formName || options.formName || 'file',
        status: 'pending',
      }
      files.value.push(item)
      return item
    })

    if (options.autoUpload !== false) {
      for (const file of appended) {
        await uploadFile(file)
      }
    }

    return appended
  }

  function remove(id: string) {
    files.value = files.value.filter(file => file.id !== id)
  }

  function clear() {
    files.value = []
  }

  return {
    files,
    uploading: computed(() => uploading.value),
    completed: computed(() => files.value.filter(file => file.status === 'success')),
    add,
    upload: uploadFile,
    remove,
    clear,
  }
}
