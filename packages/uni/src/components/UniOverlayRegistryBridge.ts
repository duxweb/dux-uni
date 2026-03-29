import type { ComponentPublicInstance, PropType } from 'vue'
import type { UniOverlayConfirmContext } from '../types'
import { defineComponent, h, provide, ref, resolveComponent } from 'vue'
import { UNI_OVERLAY_CONTEXT_KEY } from '../hooks/overlay'

interface OverlayRegistryInstance extends ComponentPublicInstance {
  submit?: () => unknown | Promise<unknown>
  close?: () => Promise<void>
}

export const UniOverlayRegistryBridge = defineComponent({
  name: 'UniOverlayRegistryBridge',
  props: {
    registry: {
      type: [Object, Function, String] as PropType<any>,
      required: true,
    },
    name: {
      type: String,
      default: undefined,
    },
    context: {
      type: Object as PropType<UniOverlayConfirmContext>,
      required: true,
    },
  },
  setup(props, { expose }) {
    const registryRef = ref<OverlayRegistryInstance>()

    provide(UNI_OVERLAY_CONTEXT_KEY, props.context)

    expose({
      submit: () => registryRef.value?.submit?.(),
      close: () => registryRef.value?.close?.(),
    })

    return () => {
      const target = typeof props.registry === 'string'
        ? resolveComponent(props.registry)
        : props.registry

      if (!target) {
        return null
      }

      return h(target as any, {
        name: props.name,
        ref: (value: unknown) => {
          registryRef.value = (value as OverlayRegistryInstance | null) || undefined
        },
      })
    }
  },
})
