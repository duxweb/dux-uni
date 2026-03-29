import { onMounted, onUnmounted, ref } from 'vue'

interface NetworkChangeResult {
  isConnected?: boolean
  networkType?: string
}

type UniNetworkApi = typeof uni & {
  onNetworkStatusChange?: (callback: (result: NetworkChangeResult) => void) => void
  offNetworkStatusChange?: (callback: (result: NetworkChangeResult) => void) => void
}

const networkApi = uni as UniNetworkApi

export function useNetworkStatusDemo() {
  const isOnline = ref(true)
  const type = ref('unknown')

  const handleChange = (result: NetworkChangeResult) => {
    type.value = result.networkType || 'unknown'
    isOnline.value = typeof result.isConnected === 'boolean'
      ? result.isConnected
      : result.networkType !== 'none'
  }

  const refresh = async () => {
    try {
      const result = await new Promise<NetworkChangeResult>((resolve, reject) => {
        uni.getNetworkType({
          success: resolve,
          fail: reject,
        })
      })
      handleChange(result)
    }
    catch {
      type.value = 'unknown'
      isOnline.value = true
    }
  }

  onMounted(() => {
    void refresh()
    networkApi.onNetworkStatusChange?.(handleChange)
  })

  onUnmounted(() => {
    networkApi.offNetworkStatusChange?.(handleChange)
  })

  return {
    isOnline,
    type,
    refresh,
  }
}
