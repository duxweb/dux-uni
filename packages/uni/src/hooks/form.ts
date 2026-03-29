import type { ComputedRef, MaybeRef, Ref } from 'vue'
import type { Dict } from '../types'
import { computed, reactive, ref, shallowRef, toRaw, unref, watch } from 'vue'

export type UniFormRule<T extends Dict = Dict> = (
  value: unknown,
  values: T,
) => string | undefined | null | Promise<string | undefined | null>

export interface UseFormOptions<T extends Dict = Dict> {
  initialValues: MaybeRef<T>
  rules?: Partial<Record<keyof T & string, UniFormRule<T> | UniFormRule<T>[]>>
  onSubmit?: (values: T) => unknown | Promise<unknown>
}

export interface UseFormSubmitResult<T = unknown> {
  success: boolean
  data?: T
  errors?: Record<string, string>
}

function cloneValues<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sameValue(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useForm<T extends Dict = Dict>(options: UseFormOptions<T>) {
  const sourceInitialValues = shallowRef<T>(cloneValues(unref(options.initialValues)))
  const values = reactive(cloneValues(sourceInitialValues.value)) as T
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})
  const submitting = ref(false)

  watch(() => unref(options.initialValues), (value) => {
    sourceInitialValues.value = cloneValues(value)
    Object.assign(values, cloneValues(value))
    errors.value = {}
    touched.value = {}
  }, {
    deep: true,
  })

  const dirty = computed(() => !sameValue(toRaw(values), sourceInitialValues.value))

  async function validateField(name: keyof T & string) {
    const rules = options.rules?.[name]
    if (!rules) {
      delete errors.value[name]
      return true
    }

    const fieldRules = Array.isArray(rules) ? rules : [rules]
    for (const rule of fieldRules) {
      const result = await rule(values[name], values)
      if (result) {
        errors.value[name] = result
        return false
      }
    }

    delete errors.value[name]
    return true
  }

  async function validate(fields?: Array<keyof T & string>) {
    const names = fields || Object.keys(options.rules || {}) as Array<keyof T & string>
    const results = await Promise.all(names.map(async (name) => {
      return await validateField(name)
    }))
    return results.every(Boolean)
  }

  function setValue<K extends keyof T & string>(name: K, value: T[K]) {
    values[name] = value
    touched.value[name] = true
  }

  function setValues(nextValues: Partial<T>) {
    Object.entries(nextValues).forEach(([name, value]) => {
      ;(values as Dict)[name] = value
      touched.value[name] = true
    })
  }

  function reset(nextValues?: Partial<T>) {
    const target = cloneValues(sourceInitialValues.value)
    Object.assign(values, target, nextValues || {})
    errors.value = {}
    touched.value = {}
  }

  function resetErrors(fields?: Array<keyof T & string>) {
    if (!fields) {
      errors.value = {}
      return
    }
    fields.forEach((field) => {
      delete errors.value[field]
    })
  }

  async function submit<TResult = unknown>() {
    const valid = await validate()
    if (!valid) {
      return {
        success: false,
        errors: { ...errors.value },
      } satisfies UseFormSubmitResult<TResult>
    }

    submitting.value = true
    try {
      const data = await options.onSubmit?.(cloneValues(toRaw(values))) as TResult
      return {
        success: true,
        data,
      } satisfies UseFormSubmitResult<TResult>
    }
    finally {
      submitting.value = false
    }
  }

  function bindField<K extends keyof T & string>(name: K) {
    return {
      modelValue: computed(() => values[name]) as ComputedRef<T[K]>,
      error: computed(() => errors.value[name]),
      touched: computed(() => Boolean(touched.value[name])),
      'onUpdate:modelValue': (value: T[K]) => setValue(name, value),
    } as {
      modelValue: ComputedRef<T[K]>
      error: ComputedRef<string | undefined>
      touched: ComputedRef<boolean>
      'onUpdate:modelValue': (value: T[K]) => void
    }
  }

  return {
    values,
    errors: errors as Ref<Record<string, string>>,
    touched: touched as Ref<Record<string, boolean>>,
    dirty,
    submitting,
    setValue,
    setValues,
    reset,
    resetErrors,
    validateField,
    validate,
    submit,
    bindField,
  }
}
