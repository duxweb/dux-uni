export function wrapAsyncEvent<T extends unknown[]>(
  label: string,
  handler: (...args: T) => unknown | Promise<unknown>,
) {
  return async (...args: T) => {
    try {
      return await handler(...args)
    }
    catch (error) {
      console.error(`[starter] ${label} failed`, error)
      return undefined
    }
  }
}
