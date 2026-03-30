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
  (e: 'open'): void
  (e: 'confirm', payload: unknown): void
  (e: 'cancel'): void
  (e: 'clear'): void
}>()

const attrs = useAttrs()
const forwardedAttrs = useSanitizedAttrs(attrs)

function getAttrValue<T = unknown>(name: string) {
  return attrs[name] as T
}

const pickerRootPortal = computed(() => {
  const direct = getAttrValue<boolean | undefined>('rootPortal')
  if (typeof direct !== 'undefined') {
    return direct
  }

  const kebab = getAttrValue<boolean | undefined>('root-portal')
  if (typeof kebab !== 'undefined') {
    return kebab
  }

  return true
})

const pickerZIndex = computed(() => {
  const direct = getAttrValue<number | string | undefined>('zIndex')
  if (typeof direct !== 'undefined') {
    return direct
  }

  const kebab = getAttrValue<number | string | undefined>('z-index')
  if (typeof kebab !== 'undefined') {
    return kebab
  }

  return 1300
})

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

async function ensureLoaded() {
  if (!props.path || select.loading.value) {
    return
  }
  if (props.immediate === false || !columns.value.length) {
    await select.refresh()
  }
}

async function handleOpen() {
  await ensureLoaded()
  emit('open')
}

function handleUpdate(value: string | number | Array<string | number>) {
  emit('update:modelValue', value)
}

defineExpose({
  refresh: select.refresh,
  search: select.search,
  hydrateSelected: select.hydrateSelected,
  loading,
  options: select.options,
})
</script>

<template>
  <wd-picker
    v-bind="forwardedAttrs"
    :model-value="modelValue as any"
    :columns="columns as any"
    :loading="loading"
    :root-portal="pickerRootPortal"
    :z-index="pickerZIndex"
    @open="handleOpen"
    @confirm="emit('confirm', $event)"
    @cancel="emit('cancel')"
    @clear="emit('clear')"
    @update:modelValue="handleUpdate"
  />
</template>
