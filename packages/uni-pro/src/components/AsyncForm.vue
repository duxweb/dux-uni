<script setup lang="ts">
import type { Dict, UniFormRule, UseFormSubmitResult } from '@duxweb/uni'
import { computed, ref, useAttrs, watch } from 'vue'
import { useCreate, useForm, useOne, useUpdate } from '@duxweb/uni'

defineOptions({
  inheritAttrs: false,
})

type AsyncFormMode = 'auto' | 'create' | 'edit'

function cloneValues<T>(value: T): T {
  return JSON.parse(JSON.stringify(value || {})) as T
}

const props = withDefaults(defineProps<{
  id?: string | number | null
  path?: string
  loadPath?: string
  submitPath?: string
  mode?: AsyncFormMode
  initialValues: Dict
  validateRules?: Partial<Record<string, UniFormRule<Dict> | UniFormRule<Dict>[]>>
  loadMeta?: Dict
  submitMeta?: Dict
  enabled?: boolean
  invalidate?: boolean | Dict | Dict[]
  transformLoad?: (record: Dict) => Dict
  transformSubmit?: (values: Dict, context: {
    mode: 'create' | 'edit'
    id?: string | number | null
    record?: Dict
  }) => unknown
  submit?: (values: Dict, context: {
    mode: 'create' | 'edit'
    id?: string | number | null
    record?: Dict
  }) => Promise<unknown>
}>(), {
  mode: 'auto',
  enabled: true,
})

const emit = defineEmits<{
  (e: 'loaded', payload: Dict): void
  (e: 'load-error', error: unknown): void
  (e: 'submit-success', payload: unknown): void
  (e: 'submit-error', payload: unknown): void
}>()

const attrs = useAttrs()
const formRef = ref<{
  validate?: (prop?: string | string[]) => Promise<{ valid: boolean, errors: Array<{ prop: string, message: string }> }>
  reset?: () => void
} | null>(null)
const loadPathRef = ref<string | undefined>(props.loadPath || props.path)
const recordIdRef = ref<string | number | undefined>(props.id == null ? undefined : props.id)
const loadMetaRef = ref<Dict | undefined>(props.loadMeta)
const loadEnabledRef = ref(false)
const submitPathRef = ref<string | undefined>(props.submitPath || props.path)

const resolvedMode = computed<'create' | 'edit'>(() => {
  if (props.mode === 'create' || props.mode === 'edit') {
    return props.mode
  }
  return props.id != null ? 'edit' : 'create'
})

const recordQuery = useOne({
  path: loadPathRef as any,
  id: recordIdRef as any,
  meta: loadMetaRef as any,
  enabled: loadEnabledRef as any,
})

const createMutation = useCreate({
  path: submitPathRef as any,
  invalidate: props.invalidate as any,
})

const updateMutation = useUpdate({
  path: submitPathRef as any,
  id: recordIdRef as any,
  invalidate: props.invalidate as any,
})

const record = computed(() => (recordQuery.data.value?.data || undefined) as Dict | undefined)

const initialValues = computed(() => {
  const base = cloneValues(props.initialValues || {})
  if (resolvedMode.value !== 'edit' || !record.value) {
    return base
  }

  const mapped = props.transformLoad
    ? props.transformLoad(record.value)
    : record.value

  return {
    ...base,
    ...(cloneValues(mapped || {})),
  }
})

const initialValuesRef = ref<Dict>(cloneValues(initialValues.value))

const form = useForm<any>({
  initialValues: initialValuesRef as any,
  rules: props.validateRules as any,
  onSubmit: async (values: Dict) => {
    const context = {
      mode: resolvedMode.value,
      id: props.id,
      record: record.value,
    } as const

    if (props.submit) {
      return await props.submit(values, context)
    }

    const payload = props.transformSubmit
      ? props.transformSubmit(values, context)
      : values

    if (resolvedMode.value === 'edit') {
      const result = await updateMutation.update({
        id: props.id == null ? undefined : props.id,
        data: payload,
        meta: props.submitMeta,
      })
      return result.data
    }

    const result = await createMutation.create({
      data: payload,
      meta: props.submitMeta,
    })
    return result.data
  },
})

const loading = computed(() => Boolean(recordQuery.isLoading.value || recordQuery.isFetching.value))
const saving = computed(() => Boolean(form.submitting.value || createMutation.isPending.value || updateMutation.isPending.value))

watch(() => [props.loadPath, props.path], () => {
  loadPathRef.value = props.loadPath || props.path
  submitPathRef.value = props.submitPath || props.path
}, {
  immediate: true,
})

watch(() => props.submitPath, () => {
  submitPathRef.value = props.submitPath || props.path
}, {
  immediate: true,
})

watch(() => props.id, (value) => {
  recordIdRef.value = value == null ? undefined : value
}, {
  immediate: true,
})

watch(() => props.loadMeta, (value) => {
  loadMetaRef.value = value
}, {
  deep: true,
  immediate: true,
})

watch([resolvedMode, () => props.enabled, loadPathRef, recordIdRef], () => {
  loadEnabledRef.value = props.enabled !== false
    && resolvedMode.value === 'edit'
    && Boolean(loadPathRef.value)
    && recordIdRef.value != null
}, {
  immediate: true,
})

watch(initialValues, (value) => {
  initialValuesRef.value = cloneValues(value)
}, {
  deep: true,
  immediate: true,
})

watch(record, (value) => {
  if (value) {
    emit('loaded', value)
  }
}, {
  immediate: true,
})

watch(() => recordQuery.error.value, (error) => {
  if (error) {
    emit('load-error', error)
  }
})

async function validateWot() {
  if (!formRef.value?.validate) {
    return {
      valid: true,
      errors: {} as Record<string, string>,
    }
  }

  const result = await formRef.value.validate()
  if (result.valid) {
    return {
      valid: true,
      errors: {} as Record<string, string>,
    }
  }

  return {
    valid: false,
    errors: result.errors.reduce<Record<string, string>>((output, item) => {
      output[item.prop] = item.message
      return output
    }, {}),
  }
}

async function submit(): Promise<UseFormSubmitResult> {
  const wot = await validateWot()
  if (!wot.valid) {
    const result = {
      success: false,
      errors: wot.errors,
    } satisfies UseFormSubmitResult
    emit('submit-error', result)
    return result
  }

  const result = await form.submit()
  if (result.success) {
    emit('submit-success', result.data)
  }
  else {
    emit('submit-error', result)
  }
  return result
}

function reset(nextValues?: Partial<Dict>) {
  form.reset(nextValues)
  formRef.value?.reset?.()
}

async function refresh() {
  if (resolvedMode.value === 'edit') {
    await recordQuery.refetch()
  }
  return record.value
}

defineExpose({
  form,
  submit,
  reset,
  refresh,
  loading,
  saving,
  mode: resolvedMode,
  record,
})
</script>

<template>
  <wd-form
    ref="formRef"
    v-bind="attrs"
    :model="form.values"
  >
    <slot
      :form="form"
      :submit="submit"
      :reset="reset"
      :refresh="refresh"
      :loading="loading"
      :saving="saving"
      :mode="resolvedMode"
      :record="record"
    />
  </wd-form>
</template>
