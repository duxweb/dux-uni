import { computed } from 'vue'

function normalizeAttrName(name: string) {
  return name.replace(/-/g, '').toLowerCase()
}

function isVirtualHostAttr(name: string) {
  return normalizeAttrName(name).startsWith('virtualhost')
}

export function sanitizeAttrs(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => {
      if (value === undefined || isVirtualHostAttr(key)) {
        return false
      }
      return true
    }),
  )
}

export function useSanitizedAttrs(input: Record<string, unknown>) {
  return computed(() => sanitizeAttrs(input))
}
