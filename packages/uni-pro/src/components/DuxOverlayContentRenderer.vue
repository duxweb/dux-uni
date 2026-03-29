<template>
  <view />
</template>

<script lang="ts">
import { defineComponent, h, ref, resolveComponent } from 'vue'

export default defineComponent({
  name: 'DuxOverlayContentRenderer',
  inheritAttrs: false,
  props: {
    content: {
      type: [Object, Function, String],
      default: undefined,
    },
    contentClass: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { attrs, expose }) {
    const innerRef = ref<{ submit?: () => unknown | Promise<unknown> }>()

    expose({
      submit: () => innerRef.value?.submit?.(),
    })

    return () => {
      if (!props.content) {
        return null
      }

      const target = typeof props.content === 'string'
        ? resolveComponent(props.content)
        : props.content

      return h(target as any, {
        ...attrs,
        ref: (value: unknown) => {
          innerRef.value = (value as { submit?: () => unknown | Promise<unknown> }) || undefined
        },
        class: props.contentClass || attrs.class,
      })
    }
  },
})
</script>
