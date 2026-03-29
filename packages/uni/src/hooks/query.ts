import type { UniAppContext } from '../types'
import type { UniQueryDescriptor } from '../runtime/query'
import { computed } from 'vue'
import { createQueryFilters, getQueryKey } from '../runtime/query'
import { resolveHookAppOptions } from './shared'

export { getQueryKey } from '../runtime/query'

export function useInvalidate(appOrNothing?: UniAppContext) {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)
  return {
    isFetching: computed(() => app.queryClient.isFetching(createQueryFilters(app))),
    invalidate: async (descriptor: UniQueryDescriptor = {}) => {
      await app.queryClient.invalidateQueries(createQueryFilters(app, descriptor))
    },
    reset: async (descriptor: UniQueryDescriptor = {}) => {
      await app.queryClient.resetQueries(createQueryFilters(app, descriptor))
    },
    remove: async (descriptor: UniQueryDescriptor = {}) => {
      await app.queryClient.removeQueries(createQueryFilters(app, descriptor))
    },
  }
}

export function useRefetch(appOrNothing?: UniAppContext) {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)
  return {
    refetch: async (descriptor: UniQueryDescriptor = {}) => {
      await app.queryClient.refetchQueries(createQueryFilters(app, descriptor))
    },
    keyOf: (descriptor: UniQueryDescriptor = {}) => getQueryKey(app, descriptor),
  }
}
