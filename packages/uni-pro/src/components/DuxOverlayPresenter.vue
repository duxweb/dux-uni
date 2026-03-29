<script setup lang="ts">
import type { ComponentPublicInstance, PropType } from 'vue'
import type { UniOverlayContent, UniOverlayEntry } from '@duxweb/uni'
import { computed, markRaw, provide, ref, shallowRef, watch } from 'vue'
import {
  UniOverlayRegistryBridge,
  createOverlayConfirmContext,
  UNI_OVERLAY_CONTEXT_KEY,
  useUniApp,
} from '@duxweb/uni'
import DuxOverlayContentRenderer from './DuxOverlayContentRenderer.vue'

interface OverlaySubmitter extends ComponentPublicInstance {
  submit?: () => unknown | Promise<unknown>
  refreshLayout?: () => void | Promise<void>
}

const props = defineProps({
  entry: {
    type: Object as PropType<UniOverlayEntry>,
    required: true,
  },
  overlayRegistry: {
    type: [Object, Function, String] as PropType<any>,
    default: undefined,
  },
})

const app = useUniApp()
const contentRef = ref<OverlaySubmitter>()
const overlayContext = createOverlayConfirmContext(app, props.entry as never)
const resolvedContent = shallowRef<any>()
const contentLoading = ref(false)
const registryContent = computed(() => app.config.overlayRegistry || props.overlayRegistry)

provide(UNI_OVERLAY_CONTEXT_KEY, overlayContext)

function isOverlayLoader(content: UniOverlayContent) {
  return typeof content === 'function'
}

async function resolveOverlayContent(content?: UniOverlayContent) {
  resolvedContent.value = undefined

  if (!content) {
    contentLoading.value = false
    return
  }

  if (!isOverlayLoader(content)) {
    resolvedContent.value = markRaw(content as any)
    contentLoading.value = false
    return
  }

  contentLoading.value = true
  try {
    const resolved = await (content as () => Promise<{ default?: unknown } | unknown>)()
    const component = ((resolved as { default?: unknown }).default || resolved) as object
    resolvedContent.value = markRaw(component)
  }
  finally {
    contentLoading.value = false
  }
}

watch(() => props.entry.content, (content) => {
  void resolveOverlayContent(content)
}, { immediate: true })

const popupPosition = computed(() => {
  if (props.entry.kind === 'drawer') {
    return props.entry.position === 'bottom' ? 'bottom' : 'right'
  }

  return 'center'
})
const popupStyle = computed(() => {
  if (props.entry.kind === 'drawer') {
    if (props.entry.position === 'bottom') {
      if (props.entry.frame === 'page') {
        return 'width:100vw;max-width:100vw;height:min(80vh,1400rpx);background:var(--dux-color-surface);overflow:hidden;border-radius:36rpx 36rpx 0 0;'
      }

      return 'width:100vw;max-width:100vw;max-height:min(80vh,1400rpx);overflow:hidden;border-radius:36rpx 36rpx 0 0;'
    }

    if (props.entry.frame === 'page') {
      return `width:${props.entry.width || '760rpx'};max-width:92vw;height:100vh;background:var(--dux-color-surface);`
    }
    return `width:${props.entry.width || '720rpx'};max-width:92vw;height:100vh;`
  }

  if (props.entry.kind === 'modal') {
    if (props.entry.frame === 'page') {
      return `width:${props.entry.width || '720rpx'};max-width:92vw;height:min(88vh,1200rpx);overflow:hidden;border-radius:32rpx;background:var(--dux-color-surface);`
    }
    return `width:${props.entry.width || '680rpx'};max-width:92vw;overflow:hidden;border-radius:32rpx;`
  }

  return 'width:620rpx;max-width:90vw;overflow:hidden;border-radius:32rpx;'
})
const modalStyle = computed(() => 'background:rgba(15,23,42,0.3);')

function bindContentRef(instance: ComponentPublicInstance | Element | null) {
  contentRef.value = (instance as OverlaySubmitter | null) || undefined
}

async function close() {
  await app.overlay.close(props.entry.id)
}

async function handleModelValue(nextValue: boolean) {
  if (!nextValue) {
    await close()
  }
}

function handleAfterLeave() {
  app.overlay.remove(props.entry.id)
}

function handleAfterEnter() {
  void contentRef.value?.refreshLayout?.()
}

async function handleConfirm() {
  app.overlay.setLoading(props.entry.id, true)

  try {
    if (props.entry.onConfirm) {
      const result = await props.entry.onConfirm(overlayContext as never)

      if (typeof result !== 'undefined') {
        await app.overlay.submit(props.entry.id, result)
        return
      }

      if (props.entry.kind === 'confirm') {
        await app.overlay.submit(props.entry.id, true)
      }
      return
    }

    if (props.entry.kind !== 'confirm' && contentRef.value?.submit) {
      const result = await contentRef.value.submit()
      if (typeof result !== 'undefined') {
        await app.overlay.submit(props.entry.id, result)
      }
      return
    }

    await app.overlay.submit(props.entry.id, props.entry.kind === 'confirm' ? true : props.entry.payload)
  }
  catch (error) {
    app.overlay.setLoading(props.entry.id, false)
    console.error('[duxweb/uni-pro] overlay confirm failed', error)
  }
}
</script>

<template>
  <wd-popup
    :model-value="entry.visible"
    :position="popupPosition"
    custom-class="pointer-events-auto"
    :close-on-click-modal="entry.closeOnClickModal"
    root-portal
    :z-index="1200"
    :modal-style="modalStyle"
    :safe-area-inset-bottom="entry.kind === 'drawer' && popupPosition === 'bottom'"
    :custom-style="popupStyle"
    @after-enter="handleAfterEnter"
    @after-leave="handleAfterLeave"
    @update:model-value="handleModelValue"
  >
    <view
      v-if="entry.kind === 'confirm'"
      class="flex flex-col gap-[24rpx] px-[32rpx] pt-[32rpx] pb-[28rpx]"
    >
      <view class="flex flex-col gap-[12rpx]">
        <text v-if="entry.title" class="text-[32rpx] font-semibold text-neutral-stronger">
          {{ entry.title }}
        </text>
        <text v-if="entry.message" class="text-[26rpx] leading-[1.6] text-neutral-muted">
          {{ entry.message }}
        </text>
      </view>
      <view class="grid grid-cols-2 gap-[16rpx]">
        <wd-button plain block @click="close">
          {{ entry.cancelText || '取消' }}
        </wd-button>
        <wd-button :type="entry.danger ? 'error' : 'primary'" block :loading="entry.loading" @click="handleConfirm">
          {{ entry.confirmText || '确定' }}
        </wd-button>
      </view>
    </view>

    <view
      v-else-if="entry.frame === 'page' && entry.contentKey && registryContent"
      class="h-full"
    >
      <UniOverlayRegistryBridge
        ref="contentRef"
        :registry="registryContent"
        :name="entry.contentKey"
        :context="overlayContext"
      />
    </view>

    <view
      v-else-if="entry.frame === 'page' && entry.contentKey"
      class="h-full min-h-[320rpx] flex items-center justify-center text-[24rpx] text-neutral-muted"
    >
      未注册弹层组件：{{ entry.contentKey }}
    </view>

    <DuxOverlayContentRenderer
      v-else-if="entry.frame === 'page' && resolvedContent"
      ref="contentRef"
      :content="resolvedContent"
      content-class="h-full"
    />

    <view
      v-else-if="entry.frame === 'page' && contentLoading"
      class="h-full min-h-[320rpx] flex items-center justify-center text-[24rpx] text-neutral-muted"
    >
      加载中...
    </view>

    <view
      v-else
      class="flex flex-col"
      :class="entry.kind === 'drawer' && popupPosition === 'right' ? 'h-screen' : ''"
    >
      <view class="flex items-center justify-between px-[28rpx] pt-[28rpx] pb-[20rpx]">
        <text class="text-[30rpx] font-semibold text-neutral-stronger">
          {{ entry.title || '操作面板' }}
        </text>
        <wd-button size="small" plain @click="close">
          {{ entry.cancelText || '关闭' }}
        </wd-button>
      </view>

      <view class="px-[28rpx] pb-[24rpx] flex-1 overflow-y-auto">
        <DuxOverlayContentRenderer
          v-if="resolvedContent"
          ref="contentRef"
          :content="resolvedContent"
        />
      </view>

      <view class="flex gap-[16rpx] px-[28rpx] pt-[8rpx] pb-[calc(env(safe-area-inset-bottom)+24rpx)]">
        <wd-button plain block @click="close">
          {{ entry.cancelText || '取消' }}
        </wd-button>
        <wd-button type="primary" block :loading="entry.loading" @click="handleConfirm">
          {{ entry.confirmText || '确定' }}
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>
