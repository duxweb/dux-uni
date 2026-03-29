import type { Dict, UniAppContext, UniUploadProgress } from '../types'
import { computed, ref } from 'vue'
import { resolveHookAppOptions, resolveResourceUrl, withAuthHeaders } from './shared'

export interface UniDownloadResult {
  filePath?: string
  tempFilePath?: string
  data?: unknown
  raw?: unknown
}

export interface UseDownloadOptions {
  path?: string
  url?: string
  query?: Dict
  headers?: Dict<string>
  filePath?: string
  executor?: (input: {
    url: string
    query?: Dict
    headers?: Dict<string>
    filePath?: string
    onProgress?: (progress: UniUploadProgress) => void
  }) => Promise<UniDownloadResult>
}

async function defaultDownloadExecutor(input: {
  url: string
  query?: Dict
  headers?: Dict<string>
  filePath?: string
  onProgress?: (progress: UniUploadProgress) => void
}) {
  const { default: un } = await import('@uni-helper/uni-network')
  const client = un.create()
  const response = await client.download({
    url: input.url,
    params: input.query,
    headers: input.headers,
    filePath: input.filePath,
    onDownloadProgress(progress) {
      input.onProgress?.({
        loaded: progress?.totalBytesWritten || 0,
        total: progress?.totalBytesExpectedToWrite,
        percent: progress?.progress,
      })
    },
  })

  return {
    filePath: response.filePath,
    tempFilePath: response.tempFilePath,
    data: response.data,
    raw: response,
  }
}

export function useDownload(appOrOptions?: UniAppContext | UseDownloadOptions, maybeOptions: UseDownloadOptions = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const downloading = ref(false)
  const progress = ref<UniUploadProgress | null>(null)
  const result = ref<UniDownloadResult | null>(null)
  const error = ref<string | null>(null)

  async function download(override?: Partial<UseDownloadOptions>) {
    const executor = override?.executor || options.executor || defaultDownloadExecutor
    downloading.value = true
    error.value = null

    try {
      const nextResult = await executor({
        url: resolveResourceUrl(app, {
          path: override?.path || options.path,
          url: override?.url || options.url,
        }),
        query: override?.query || options.query,
        headers: withAuthHeaders(app, override?.headers || options.headers),
        filePath: override?.filePath || options.filePath,
        onProgress(nextProgress) {
          progress.value = nextProgress
        },
      })

      result.value = nextResult
      return nextResult
    }
    catch (reason) {
      error.value = reason instanceof Error ? reason.message : 'Download failed'
      throw reason
    }
    finally {
      downloading.value = false
    }
  }

  return {
    downloading: computed(() => downloading.value),
    progress: computed(() => progress.value),
    result: computed(() => result.value),
    error: computed(() => error.value),
    download,
  }
}
