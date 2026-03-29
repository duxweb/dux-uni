import type {
  CreateUniRequestClientOptions,
  Dict,
  UniRequestAdapter,
  UniRequestClient,
  UniRequestError,
  UniRequestOptions,
  UniRequestResponse,
} from '../types'
import type { UnData, UnMethod } from '@uni-helper/uni-network'
import un, { isUnError } from '@uni-helper/uni-network'

function joinUrl(baseURL: string | undefined, url: string) {
  if (!baseURL) {
    return url
  }
  return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
}

function stringifyQuery(query?: Dict) {
  if (!query) {
    return ''
  }

  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

function appendQuery(url: string, query?: Dict) {
  if (!query || Object.keys(query).length === 0) {
    return url
  }

  const queryString = stringifyQuery(query)
  if (!queryString) {
    return url
  }
  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`
}

function mapProgress(
  progress: {
    progress?: number
    totalBytesSent?: number
    totalBytesExpectedToSend?: number
    totalBytesWritten?: number
    totalBytesExpectedToWrite?: number
  } | undefined,
  type: 'upload' | 'download',
) {
  if (!progress) {
    return {
      loaded: 0,
      total: undefined,
      percent: undefined,
    }
  }

  if (type === 'upload') {
    return {
      loaded: progress.totalBytesSent || 0,
      total: progress.totalBytesExpectedToSend,
      percent: progress.progress,
    }
  }

  return {
    loaded: progress.totalBytesWritten || 0,
    total: progress.totalBytesExpectedToWrite,
    percent: progress.progress,
  }
}

export function createUniNetworkAdapter(): UniRequestAdapter {
  const client = un.create()

  return {
    async request<T>(options: UniRequestOptions) {
      try {
        const response = await client.request<T>({
          url: options.url,
          method: (options.method || 'GET') as UnMethod,
          data: options.data as UnData | undefined,
          params: options.url.includes('?') ? undefined : options.query,
          headers: options.headers,
          timeout: options.timeout,
          signal: options.signal as any,
          onUploadProgress: (progress?: any) => {
            options.onUploadProgress?.(mapProgress(progress, 'upload'))
          },
          onDownloadProgress: (progress?: any) => {
            options.onDownloadProgress?.(mapProgress(progress, 'download'))
          },
        })

        return {
          status: response.status || 200,
          data: response.data as T,
          headers: response.headers as Dict<string> | undefined,
          raw: response,
        }
      }
      catch (error) {
        if (isUnError(error)) {
          const requestError = new Error(error.message || 'Request failed') as UniRequestError
          requestError.status = error.status
          requestError.data = error.response?.data
          requestError.headers = error.response?.headers as Dict<string> | undefined
          requestError.raw = error
          throw requestError
        }
        throw error
      }
    },
  }
}

function normalizeError(error: unknown): UniRequestError {
  if (error instanceof Error) {
    return error as UniRequestError
  }
  const requestError = new Error('Unknown request error') as UniRequestError
  requestError.raw = error
  return requestError
}

function mergeRequestPatch(
  request: UniRequestOptions,
  patch?: Partial<UniRequestOptions> | void,
): UniRequestOptions {
  if (!patch) {
    return request
  }

  return {
    ...request,
    ...patch,
    headers: patch.headers
      ? {
          ...(request.headers || {}),
          ...patch.headers,
        }
      : request.headers,
    query: patch.query
      ? {
          ...(request.query || {}),
          ...patch.query,
        }
      : request.query,
    meta: patch.meta
      ? {
          ...(request.meta || {}),
          ...patch.meta,
        }
      : request.meta,
  }
}

export function createRequestClient(options?: CreateUniRequestClientOptions): UniRequestClient {
  const adapter = options?.adapter || createUniNetworkAdapter()

  return {
    async request<T>(input: UniRequestOptions): Promise<UniRequestResponse<T>> {
      let request: UniRequestOptions = {
        ...input,
        url: joinUrl(options?.baseURL, input.url),
        timeout: input.timeout ?? options?.timeout,
        headers: {
          ...(options?.getHeaders?.() || {}),
          ...(input.headers || {}),
        },
      }

      request = mergeRequestPatch(request, await options?.sign?.(request))

      for (const interceptor of options?.onRequest || []) {
        request = await interceptor(request)
      }

      try {
        const transportRequest: UniRequestOptions = {
          ...request,
          url: appendQuery(request.url, request.query),
        }

        let response = await adapter.request<T>(transportRequest)
        for (const interceptor of options?.onResponse || []) {
          response = await interceptor({ request: transportRequest, response })
        }
        return response
      }
      catch (error) {
        const normalizedError = normalizeError(error)
        for (const interceptor of options?.onError || []) {
          await interceptor(normalizedError)
        }
        throw normalizedError
      }
    },
  }
}
