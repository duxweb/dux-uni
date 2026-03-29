import type {
  UniAppConfig,
  UniActionRegistry,
  UniAppContext,
  UniEventBus,
  UniHookHandler,
  UniHookRegistry,
  UniMiddlewareRegistry,
  UniModuleManifest,
  UniModuleRegisterContext,
  UniModuleSetupContext,
} from '../types'
import { mergeUniConfigPatch, mergeUniModules } from '../module/merge'

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

function getRegisterHandler(module: UniModuleManifest) {
  return module.lifecycle?.register || module.register
}

function getSetupHandler(module: UniModuleManifest, stage: 'init' | 'boot') {
  if (stage === 'init') {
    return module.lifecycle?.init || module.init
  }
  return module.lifecycle?.boot || module.boot || module.setup
}

export function sortUniModules(modules: UniModuleManifest[]) {
  const output: UniModuleManifest[] = []
  const moduleMap = new Map(modules.map(item => [item.name, item]))
  const visited = new Set<string>()
  const visiting = new Set<string>()

  const visit = (module: UniModuleManifest) => {
    if (visited.has(module.name)) {
      return
    }
    if (visiting.has(module.name)) {
      return
    }

    visiting.add(module.name)
    module.dependsOn?.forEach((dependency) => {
      const dependencyModule = moduleMap.get(dependency)
      if (dependencyModule) {
        visit(dependencyModule)
      }
    })
    visiting.delete(module.name)
    visited.add(module.name)
    output.push(module)
  }

  modules.forEach(visit)
  return output
}

export function createModuleRuntime(input: {
  config: UniAppConfig
  modules: UniModuleManifest[]
  actions: UniActionRegistry
  hooks: UniHookRegistry
  events: UniEventBus
  middlewares: UniMiddlewareRegistry
}) {
  const modules = sortUniModules(input.modules)
  let extensions: Partial<UniAppConfig> = {}

  const extendConfig = (patch: Partial<UniAppConfig>) => {
    extensions = mergeUniConfigPatch(extensions, patch)
  }

  const createRegisterContext = (module: UniModuleManifest): UniModuleRegisterContext => ({
    config: input.config,
    module,
    actions: input.actions,
    hooks: input.hooks,
    events: input.events,
    middlewares: input.middlewares,
    extendConfig,
  })

  const registerHooks = (module: UniModuleManifest) => {
    Object.entries(module.hooks || {}).forEach(([name, handler]) => {
      toArray<UniHookHandler>(handler).forEach(item => input.hooks.tap(name, item))
    })
  }

  const registerListeners = (module: UniModuleManifest) => {
    Object.entries(module.listeners || {}).forEach(([name, handler]) => {
      toArray(handler).forEach(item => input.events.on(name, item))
    })
  }

  const registerConfigPatch = (module: UniModuleManifest, context: UniModuleRegisterContext) => {
    const patch = typeof module.config === 'function'
      ? module.config(context)
      : module.config
    if (patch) {
      extendConfig(patch)
    }
  }

  const register = () => {
    modules.forEach((module) => {
      const context = createRegisterContext(module)

      module.middlewares?.forEach(middleware => input.middlewares.register(middleware))
      registerHooks(module)
      registerListeners(module)
      registerConfigPatch(module, context)
      getRegisterHandler(module)?.(context)
    })
  }

  const resolveConfig = (base: UniAppConfig) => {
    return mergeUniModules(mergeUniConfigPatch(base, extensions) as UniAppConfig)
  }

  const run = async (
    stage: 'init' | 'boot',
    app: UniAppContext,
  ) => {
    await Promise.all(modules.map(async (module) => {
      const handler = getSetupHandler(module, stage)
      if (!handler) {
        return
      }
      const context: UniModuleSetupContext = {
        app,
        module,
      }
      await handler(context)
    }))
  }

  return {
    modules,
    extendConfig,
    register,
    resolveConfig,
    getConfigExtensions: () => extensions,
    run,
  }
}
