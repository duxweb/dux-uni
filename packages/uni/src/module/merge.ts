import type {
  UniActionHandler,
  UniAppConfig,
  UniModuleManifest,
  UniPageMeta,
  UniSchemaComponentMap,
  UniSchemaComponentRegistration,
} from '../types'
import type { Component } from 'vue'

type SchemaComponentsInput = UniSchemaComponentMap | UniSchemaComponentRegistration[] | Component[] | undefined

function mergeSocketConfig(
  base?: UniAppConfig['socket'],
  patch?: UniAppConfig['socket'],
) {
  if (!base && !patch) {
    return undefined
  }
  return {
    ...(base || {}),
    ...(patch || {}),
  }
}

function mergeNamedSocketConfigs(
  base?: UniAppConfig['sockets'],
  patch?: UniAppConfig['sockets'],
) {
  if (!base && !patch) {
    return undefined
  }

  const output: NonNullable<UniAppConfig['sockets']> = {}
  const names = new Set([
    ...Object.keys(base || {}),
    ...Object.keys(patch || {}),
  ])

  names.forEach((name) => {
    output[name] = {
      ...((base || {})[name] || {}),
      ...((patch || {})[name] || {}),
    }
  })

  return output
}

function uniquePages(pages: UniPageMeta[]) {
  const pageMap = new Map<string, UniPageMeta>()
  pages.forEach((page) => {
    pageMap.set(page.path, page)
  })
  return [...pageMap.values()]
}

function isSchemaComponentRegistration(value: unknown): value is UniSchemaComponentRegistration {
  return Boolean(value)
    && typeof value === 'object'
    && 'name' in (value as Record<string, unknown>)
    && typeof (value as Record<string, unknown>).name === 'string'
    && 'component' in (value as Record<string, unknown>)
}

function normalizeSchemaComponentsInput(
  input: SchemaComponentsInput,
) {
  if (!input) {
    return {}
  }

  if (!Array.isArray(input)) {
    return input as UniSchemaComponentMap
  }

  return input.reduce<UniSchemaComponentMap>((output, component) => {
    if (isSchemaComponentRegistration(component)) {
      output[component.name] = component.component
      component.aliases?.forEach((alias) => {
        output[alias] = component.component
      })
      return output
    }

    const rawComponent = component as { name?: string, __name?: string }
    const name = rawComponent.name || rawComponent.__name
    if (name) {
      output[name] = component
    }
    return output
  }, {})
}

function mergeSchemaComponents(
  base: SchemaComponentsInput,
  modules: UniModuleManifest[],
) {
  return modules.reduce<UniSchemaComponentMap>((output, module) => {
    return {
      ...output,
      ...normalizeSchemaComponentsInput(module.schema?.components),
    }
  }, {
    ...normalizeSchemaComponentsInput(base),
  })
}

function mergeActions(modules: UniModuleManifest[]) {
  return modules.reduce<Record<string, UniActionHandler>>((output, module) => {
    return {
      ...output,
      ...(module.actions || {}),
    }
  }, {})
}

export function mergeUniModules(config: UniAppConfig): UniAppConfig {
  const modules = config.modules || []

  return {
    ...config,
    pages: uniquePages([
      ...(config.pages || []),
      ...modules.flatMap(module => module.pages || []),
    ]),
    schema: {
      ...(config.schema || {}),
      components: mergeSchemaComponents(config.schema?.components, modules),
    },
    layouts: modules.reduce<Record<string, string>>((output, module) => {
      return {
        ...output,
        ...(module.layouts || {}),
      }
    }, {
      ...(config.layouts || {}),
    }),
    moduleActions: mergeActions(modules),
  }
}

export function mergeUniConfigPatch(
  base: Partial<UniAppConfig>,
  patch: Partial<UniAppConfig>,
): Partial<UniAppConfig> {
  return {
    ...base,
    ...patch,
    pages: uniquePages([
      ...((base.pages || []) as UniPageMeta[]),
      ...((patch.pages || []) as UniPageMeta[]),
    ]),
    modules: [
      ...(base.modules || []),
      ...(patch.modules || []),
    ],
    moduleActions: {
      ...(base.moduleActions || {}),
      ...(patch.moduleActions || {}),
    },
    layouts: {
      ...(base.layouts || {}),
      ...(patch.layouts || {}),
    },
    request: {
      ...(base.request || {}),
      ...(patch.request || {}),
    },
    socket: mergeSocketConfig(base.socket, patch.socket),
    sockets: mergeNamedSocketConfigs(base.sockets, patch.sockets),
    query: {
      ...(base.query || {}),
      ...(patch.query || {}),
    },
    schema: {
      ...(base.schema || {}),
      ...(patch.schema || {}),
    },
  }
}
