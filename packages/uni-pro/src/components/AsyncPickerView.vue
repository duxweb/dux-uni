<script setup lang="ts">
import type { Dict, UseSelectOptions } from '@duxweb/uni'
import { computed, toRef, useAttrs } from 'vue'
import { useSelect } from '@duxweb/uni'
import { useSanitizedAttrs } from '../attrs'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  modelValue?: string | number | Array<string | number> | null
  path?: string
  params?: Dict
  optionLabel?: string | ((item: Dict) => string)
  optionValue?: string | ((item: Dict) => string | number)
  optionKey?: string | ((item: Dict) => string | number)
  keywordField?: string
  pagination?: boolean | number
  immediate?: boolean
  debounce?: number
}>(), {
  immediate: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | Array<string | number> | null | undefined): void
  (e: 'change', payload: unknown): void
  (e: 'pickstart'): void
  (e: 'pickend'): void
}>()

const attrs = useAttrs()
const forwardedAttrs = useSanitizedAttrs(attrs)

const select = useSelect({
  path: toRef(props, 'path') as any,
  params: toRef(props, 'params') as any,
  defaultValue: toRef(props, 'modelValue') as any,
  optionLabel: props.optionLabel as UseSelectOptions<Dict>['optionLabel'],
  optionValue: props.optionValue as UseSelectOptions<Dict>['optionValue'],
  optionKey: props.optionKey as UseSelectOptions<Dict>['optionKey'],
  keywordField: props.keywordField,
  pagination: props.pagination,
  immediate: props.immediate,
  debounce: props.debounce,
})

const columns = computed(() =>
  select.options.value.map(option => ({
    label: option.label,
    value: option.value,
    key: option.key,
    raw: option.raw,
  })))

const loading = computed(() => Boolean(attrs.loading) || select.loading.value)

defineExpose({
  refresh: select.refresh,
  search: select.search,
  hydrateSelected: select.hydrateSelected,
  loading,
  options: select.options,
})
</script>

<template>
  <wd-picker-view
    v-bind="forwardedAttrs"
    :model-value="modelValue as any"
    :columns="columns as any"
    :loading="loading"
    @change="emit('change', $event)"
    @pickstart="emit('pickstart')"
    @pickend="emit('pickend')"
    @update:modelValue="emit('update:modelValue', $event)"
  />
</template>
