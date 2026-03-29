import type { UniModuleManifest } from '../types'

export function defineUniModule<T extends UniModuleManifest>(module: T): T {
  return module
}
