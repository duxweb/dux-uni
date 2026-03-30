import { computed } from 'vue'

const blockedAttrs = new Set([
  'virtualHostStyle',
  'virtualHostClass',
])

export function sanitizeAttrs(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => value !== undefined && !blockedAttrs.has(key)),
  )
}

export function useSanitizedAttrs(input: Record<string, unknown>) {
  return computed(() => sanitizeAttrs(input))
}
