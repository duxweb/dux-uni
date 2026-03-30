<script setup lang="ts">
import type { Dict, UseTreeOptions } from '@duxweb/uni'
import { computed, ref, useAttrs, watch } from 'vue'
import { useTree } from '@duxweb/uni'
import { useSanitizedAttrs } from '../attrs'

defineOptions({
  inheritAttrs: false,
})

type PickerValue = string | number

export interface AsyncColPickerLoaderContext<T = Dict> {
  level: number
  values: PickerValue[]
  items: T[]
  parent?: T
}

const props = withDefaults(defineProps<{
  modelValue: PickerValue[]
  path?: string
  params?: Dict
  items?: Dict[]
  columns?: Dict[][]
  loader?: (context: AsyncColPickerLoaderContext) => Promise<Dict[]>
  immediate?: boolean
  valueKey?: string
  labelKey?: string
  tipKey?: string
  treeOptions?: UseTreeOptions['treeOptions']
}>(), {
  immediate: true,
  valueKey: 'value',
  labelKey: 'label',
  tipKey: 'tip',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: PickerValue[]): void
  (e: 'confirm', payload: unknown): void
  (e: 'close'): void
  (e: 'loaded', columns: Dict[][]): void
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
const treePath = ref<string | undefined>(props.loader ? undefined : props.path)
const treeParams = ref<Dict | undefined>(props.params)

const tree = useTree({
  path: treePath as any,
  params: treeParams as any,
  immediate: props.loader ? false : props.immediate,
  treeOptions: props.treeOptions,
})

const loading = ref(false)
const columnsRef = ref<Dict[][]>(props.columns?.map(column => [...column]) || [])

const rootItems = computed(() => (props.items || tree.items.value || []) as Dict[])
const childrenKey = computed(() => props.treeOptions?.childrenKey || 'children')

function sameValue(left: unknown, right: unknown) {
  return Object.is(left, right) || String(left) === String(right)
}

function getValue(item: Dict | undefined) {
  if (!item) {
    return undefined
  }
  return item[props.valueKey]
}

function getChildren(item: Dict | undefined) {
  if (!item) {
    return []
  }
  const children = item[childrenKey.value]
  return Array.isArray(children) ? children as Dict[] : []
}

function buildTreeColumns(values: PickerValue[] = props.modelValue) {
  const roots = rootItems.value
  if (!roots.length) {
    return []
  }

  const nextColumns: Dict[][] = [roots]
  let current = roots

  for (const value of values) {
    const selected = current.find(item => sameValue(getValue(item), value))
    if (!selected) {
      break
    }

    const children = getChildren(selected)
    if (!children.length) {
      break
    }

    nextColumns.push(children)
    current = children
  }

  return nextColumns
}

function getSelectedItems(values: PickerValue[], source: Dict[][] = columnsRef.value) {
  const items: Dict[] = []
  values.forEach((value, level) => {
    const column = source[level] || []
    const selected = column.find(item => sameValue(getValue(item), value))
    if (selected) {
      items.push(selected)
    }
  })
  return items
}

async function loadCascadeColumns(values: PickerValue[] = props.modelValue) {
  if (!props.loader) {
    return columnsRef.value
  }

  loading.value = true

  try {
    const nextColumns: Dict[][] = []
    const selectedItems: Dict[] = []

    for (let level = 0; ; level += 1) {
      const column = await props.loader({
        level,
        values: values.slice(0, level),
        items: [...selectedItems],
        parent: selectedItems[level - 1],
      })

      const normalizedColumn = Array.isArray(column) ? column : []
      if (!normalizedColumn.length) {
        break
      }

      nextColumns.push(normalizedColumn)

      const selectedValue = values[level]
      if (selectedValue == null) {
        break
      }

      const selectedItem = normalizedColumn.find(item => sameValue(getValue(item), selectedValue))
      if (!selectedItem) {
        break
      }

      selectedItems.push(selectedItem)
    }

    columnsRef.value = nextColumns
    emit('loaded', nextColumns)
    return nextColumns
  }
  finally {
    loading.value = false
  }
}

async function refresh() {
  if (props.loader) {
    return await loadCascadeColumns(props.modelValue)
  }

  if (props.path && !props.items) {
    await tree.refresh()
  }

  const nextColumns = buildTreeColumns(props.modelValue)
  columnsRef.value = nextColumns.length ? nextColumns : (props.columns?.map(column => [...column]) || [])
  emit('loaded', columnsRef.value)
  return columnsRef.value
}

async function handleColumnChange(option: {
  selectedItem: Dict
  index: number
  rowIndex: number
  resolve: (nextColumn: Dict[]) => void
  finish: (isOk?: boolean) => void
}) {
  if (props.loader) {
    loading.value = true

    try {
      const nextValues = [
        ...props.modelValue.slice(0, option.index),
        getValue(option.selectedItem) as PickerValue,
      ]
      const selectedItems = [
        ...getSelectedItems(nextValues, columnsRef.value).slice(0, option.index),
        option.selectedItem,
      ]
      const nextColumn = await props.loader({
        level: option.index + 1,
        values: nextValues,
        items: selectedItems,
        parent: option.selectedItem,
      })
      const normalizedColumn = Array.isArray(nextColumn) ? nextColumn : []

      columnsRef.value = [
        ...columnsRef.value.slice(0, option.index + 1),
        ...(normalizedColumn.length ? [normalizedColumn] : []),
      ]
      emit('loaded', columnsRef.value)
      option.resolve(normalizedColumn)

      if (!normalizedColumn.length) {
        option.finish()
      }
    }
    finally {
      loading.value = false
    }

    return
  }

  const nextColumn = getChildren(option.selectedItem)
  columnsRef.value = [
    ...columnsRef.value.slice(0, option.index + 1),
    ...(nextColumn.length ? [nextColumn] : []),
  ]
  emit('loaded', columnsRef.value)
  option.resolve(nextColumn)

  if (!nextColumn.length) {
    option.finish()
  }
}

watch(() => props.columns, (value) => {
  if (!props.loader && !props.path && !props.items) {
    columnsRef.value = value?.map(column => [...column]) || []
  }
}, {
  deep: true,
  immediate: true,
})

watch(() => [props.loader, props.path], () => {
  treePath.value = props.loader ? undefined : props.path
}, {
  immediate: true,
})

watch(() => props.params, (value) => {
  treeParams.value = value
}, {
  deep: true,
  immediate: true,
})

watch([rootItems, () => props.modelValue], () => {
  if (props.loader) {
    return
  }

  const nextColumns = buildTreeColumns(props.modelValue)
  if (nextColumns.length) {
    columnsRef.value = nextColumns
    emit('loaded', columnsRef.value)
  }
}, {
  deep: true,
  immediate: true,
})

watch(() => [props.modelValue, props.path, props.params, props.loader], () => {
  if (!props.loader) {
    return
  }
  void loadCascadeColumns(props.modelValue)
}, {
  deep: true,
  immediate: true,
})

defineExpose({
  refresh,
  columns: computed(() => columnsRef.value),
  loading: computed(() => loading.value || tree.loading.value),
})
</script>

<template>
  <wd-col-picker
    v-bind="forwardedAttrs"
    :model-value="modelValue"
    :columns="columnsRef as any"
    :value-key="valueKey"
    :label-key="labelKey"
    :tip-key="tipKey"
    :root-portal="pickerRootPortal"
    :z-index="pickerZIndex"
    :column-change="handleColumnChange"
    @close="emit('close')"
    @confirm="emit('confirm', $event)"
    @update:modelValue="emit('update:modelValue', $event)"
  />
</template>
