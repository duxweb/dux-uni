import type { Component, PropType, VNodeChild } from 'vue'
import type {
  Dict,
  UniAppContext,
  UniRenderedSchemaNode,
  UniSchemaBindings,
  UniSchemaComponentMap,
  UniSchemaComponentRegistration,
  UniSchemaNode,
  UniSchemaRendererOptions,
} from '../types'
import { computed, defineComponent, Fragment, h, isRef, markRaw } from 'vue'
import { useUniApp } from '../app/install'

const defaultAllowedTags = [
  'view',
  'text',
  'image',
  'scroll-view',
  'input',
  'textarea',
  'switch',
  'button',
]

const interpolationPattern = /\{\{\s*([^}]+?)\s*\}\}/g
const interpolationExactPattern = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/u

export type UniSchemaSource<T> = T | { value: T }
export type UniSchemaData = UniSchemaSource<UniSchemaNode[]>
export type UniSchemaComponentInput = UniSchemaComponentMap | Component[] | UniSchemaComponentRegistration[]

export interface UseJsonSchemaProps {
  data?: UniSchemaData
  bindings?: UniSchemaSource<UniSchemaBindings | undefined>
  components?: UniSchemaComponentInput
}

function kebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function pascalCase(value: string) {
  return value
    .replace(/(^\w|-\w)/g, item => item.replace('-', '').toUpperCase())
}

function isPlainObject(value: unknown): value is Dict {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function readPath(source: Dict, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((current, segment) => {
      if (current && typeof current === 'object' && segment in (current as Dict)) {
        return (current as Dict)[segment]
      }
      return undefined
    }, source)
}

function resolveInterpolationValue(expression: string, bindings: UniSchemaBindings) {
  return readPath(bindings as Dict, expression.trim())
}

function resolveTemplateString(input: string, bindings: UniSchemaBindings) {
  const exactMatch = input.match(interpolationExactPattern)
  if (exactMatch) {
    return resolveInterpolationValue(exactMatch[1], bindings)
  }

  return input.replace(interpolationPattern, (_raw, expression) => {
    const value = resolveInterpolationValue(expression, bindings)
    return value == null ? '' : String(value)
  })
}

function resolveSchemaValue<T = unknown>(value: T, bindings: UniSchemaBindings): T {
  if (typeof value === 'string') {
    return resolveTemplateString(value, bindings) as T
  }

  if (Array.isArray(value)) {
    return value.map(item => resolveSchemaValue(item, bindings)) as T
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce<Dict>((output, [key, current]) => {
      output[key] = resolveSchemaValue(current, bindings)
      return output
    }, {}) as T
  }

  return value
}

function toBoolean(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return Boolean(value)
}

function isSchemaComponentRegistration(value: unknown): value is UniSchemaComponentRegistration {
  return Boolean(value)
    && typeof value === 'object'
    && 'name' in (value as Dict)
    && typeof (value as Dict).name === 'string'
    && 'component' in (value as Dict)
}

function normalizeComponentInput(input?: UniSchemaComponentInput): UniSchemaComponentMap {
  if (!input) {
    return {}
  }

  if (!Array.isArray(input)) {
    return Object.entries(input).reduce<UniSchemaComponentMap>((output, [name, component]) => {
      output[name] = markRaw(component as Component)
      return output
    }, {})
  }

  return input.reduce<UniSchemaComponentMap>((output, component) => {
    if (isSchemaComponentRegistration(component)) {
      output[component.name] = markRaw(component.component)
      component.aliases?.forEach((alias) => {
        output[alias] = markRaw(component.component)
      })
      return output
    }

    const rawComponent = markRaw(component)
    const name = (rawComponent as { name?: string, __name?: string }).name
      || (rawComponent as { name?: string, __name?: string }).__name
    if (name) {
      output[name] = rawComponent
    }
    return output
  }, {})
}

function resolveTagName(node: UniSchemaNode) {
  return node.tag || node.component
}

function resolveConditionExpression(node: UniSchemaNode) {
  return node.if || node.visibleWhen || node.elseIf
}

function isConditionalNode(node: UniSchemaNode) {
  return Boolean(resolveConditionExpression(node) || node.else)
}

function isSwitchNode(node: UniSchemaNode) {
  return Boolean(node.switch || typeof node.case !== 'undefined' || node.defaultCase)
}

function checkSchemaCondition(expression: string | undefined, bindings: UniSchemaBindings) {
  if (!expression) {
    return true
  }
  return toBoolean(resolveSchemaValue(`{{${expression}}}`, bindings))
}

function stripConditionalNode(node: UniSchemaNode): UniSchemaNode {
  return {
    ...node,
    if: undefined,
    elseIf: undefined,
    else: undefined,
    visibleWhen: undefined,
  }
}

function stripSwitchNode(node: UniSchemaNode): UniSchemaNode {
  return {
    ...node,
    switch: undefined,
    case: undefined,
    defaultCase: undefined,
  }
}

function compareSwitchValue(current: unknown, expected: unknown) {
  if (Array.isArray(expected)) {
    return expected.some(item => Object.is(item, current))
  }
  return Object.is(current, expected)
}

function readModelPath(source: UniSchemaBindings, path: string) {
  return readPath(source as Dict, path)
}

function writeModelPath(source: UniSchemaBindings, path: string, value: unknown) {
  const segments = path.split('.').filter(Boolean)
  if (!segments.length) {
    return false
  }

  let current: unknown = source

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    if (!current || typeof current !== 'object') {
      return false
    }
    current = (current as Dict)[segment]
  }

  if (!current || typeof current !== 'object') {
    return false
  }

  const lastKey = segments[segments.length - 1]
  ;(current as Dict)[lastKey] = value
  return true
}

function extractModelValue(eventPayload: unknown) {
  if (eventPayload && typeof eventPayload === 'object') {
    if ('detail' in (eventPayload as Dict) && (eventPayload as Dict).detail && typeof (eventPayload as Dict).detail === 'object') {
      const detail = (eventPayload as Dict).detail as Dict
      if ('value' in detail) {
        return detail.value
      }
      if ('checked' in detail) {
        return detail.checked
      }
    }
    if ('target' in (eventPayload as Dict) && (eventPayload as Dict).target && typeof (eventPayload as Dict).target === 'object') {
      const target = (eventPayload as Dict).target as Dict
      if ('value' in target) {
        return target.value
      }
      if ('checked' in target) {
        return target.checked
      }
    }
    if ('value' in (eventPayload as Dict)) {
      return (eventPayload as Dict).value
    }
    if ('checked' in (eventPayload as Dict)) {
      return (eventPayload as Dict).checked
    }
  }
  return eventPayload
}

function resolveSchemaProps(node: UniSchemaNode, bindings: UniSchemaBindings) {
  const resolvedAttrs = resolveSchemaValue(node.attrs || {}, bindings)
  const resolvedProps = resolveSchemaValue(node.props || {}, bindings)

  return {
    ...resolvedAttrs,
    ...resolvedProps,
  }
}

function normalizeSchemaChildren(
  children: UniSchemaNode['children'],
  bindings: UniSchemaBindings,
  options: {
    allowedTags: Set<string>
  },
): Array<UniRenderedSchemaNode | string> | undefined {
  if (typeof children === 'undefined' || children === null) {
    return undefined
  }

  if (typeof children === 'string') {
    return [String(resolveTemplateString(children, bindings) ?? '')]
  }

  if (Array.isArray(children)) {
    return normalizeSchemaNodeList(children, bindings, options)
  }

  return normalizeSchemaNode(children, bindings, options)
}

function normalizeSchemaSlots(
  slots: UniSchemaNode['slots'],
  bindings: UniSchemaBindings,
  options: {
    allowedTags: Set<string>
  },
) {
  if (!slots) {
    return undefined
  }

  return Object.entries(slots).reduce<Record<string, Array<UniRenderedSchemaNode | string>>>((output, [name, content]) => {
    const normalized = normalizeSchemaChildren(content, bindings, options)
    if (normalized?.length) {
      output[name] = normalized
    }
    return output
  }, {})
}

function normalizeSchemaNode(
  node: UniSchemaNode,
  bindings: UniSchemaBindings,
  options: {
    allowedTags: Set<string>
  },
): UniRenderedSchemaNode[] {
  if (node.forEach) {
    const collection = resolveSchemaValue(`{{${node.forEach}}}`, bindings)
    if (!Array.isArray(collection)) {
      return []
    }

    const clonedNode = {
      ...node,
      forEach: undefined,
    }

    return collection.flatMap((item, index) =>
      normalizeSchemaNode(clonedNode, {
        ...bindings,
        item,
        index,
      }, options))
  }

  const tag = resolveTagName(node)
  if (!tag) {
    return []
  }

  const binding = node.bind ? resolveSchemaValue(`{{${node.bind}}}`, bindings) : undefined
  const text = typeof node.text !== 'undefined'
    ? resolveSchemaValue(node.text, bindings)
    : binding
  const children = normalizeSchemaChildren(node.children, bindings, options)
  const slots = normalizeSchemaSlots(node.slots, bindings, options)
  const actions = node.actions ? resolveSchemaValue(node.actions, bindings) : undefined

  return [{
    tag,
    key: node.key,
    props: resolveSchemaProps(node, bindings),
    class: typeof node.class === 'string' ? String(resolveTemplateString(node.class, bindings) ?? '') : node.class,
    style: resolveSchemaValue(node.style, bindings),
    text,
    model: node.model,
    modelProp: node.modelProp,
    disabled: node.disabledWhen ? toBoolean(resolveSchemaValue(`{{${node.disabledWhen}}}`, bindings)) : undefined,
    children,
    slots,
    actions,
    binding,
  }]
}

function normalizeSchemaNodeList(
  nodes: Array<string | UniSchemaNode>,
  bindings: UniSchemaBindings,
  options: {
    allowedTags: Set<string>
  },
): Array<UniRenderedSchemaNode | string> {
  const output: Array<UniRenderedSchemaNode | string> = []
  let chainActive = false
  let chainMatched = false
  let switchActive = false
  let switchMatched = false
  let switchValue: unknown

  nodes.forEach((node) => {
    if (typeof node === 'string') {
      chainActive = false
      chainMatched = false
      switchActive = false
      switchMatched = false
      switchValue = undefined
      output.push(String(resolveTemplateString(node, bindings) ?? ''))
      return
    }

    if (isSwitchNode(node)) {
      if (typeof node.switch === 'string') {
        switchActive = true
        switchMatched = false
        switchValue = resolveSchemaValue(`{{${node.switch}}}`, bindings)
      }

      if (!switchActive) {
        return
      }

      if (node.defaultCase) {
        if (!switchMatched) {
          output.push(...normalizeSchemaNode(stripSwitchNode(node), bindings, options))
        }
        switchActive = false
        switchMatched = false
        switchValue = undefined
        return
      }

      if (typeof node.case !== 'undefined') {
        const caseValue = resolveSchemaValue(node.case, bindings)
        if (!switchMatched && compareSwitchValue(switchValue, caseValue)) {
          output.push(...normalizeSchemaNode(stripSwitchNode(node), bindings, options))
          switchMatched = true
        }
        return
      }
    }

    if (!isConditionalNode(node)) {
      chainActive = false
      chainMatched = false
      switchActive = false
      switchMatched = false
      switchValue = undefined
      output.push(...normalizeSchemaNode(node, bindings, options))
      return
    }

    if (node.else === true) {
      if (chainActive && !chainMatched) {
        output.push(...normalizeSchemaNode(stripConditionalNode(node), bindings, options))
      }
      chainActive = false
      chainMatched = false
      return
    }

    if (typeof node.elseIf === 'string') {
      if (!chainActive) {
        chainActive = true
        chainMatched = false
      }

      if (!chainMatched && checkSchemaCondition(node.elseIf, bindings)) {
        output.push(...normalizeSchemaNode(stripConditionalNode(node), bindings, options))
        chainMatched = true
      }
      return
    }

    chainActive = true
    chainMatched = false

    if (checkSchemaCondition(resolveConditionExpression(node), bindings)) {
      output.push(...normalizeSchemaNode(stripConditionalNode(node), bindings, options))
      chainMatched = true
    }
  })

  return output
}

function resolveSchemaComponent(
  tag: string | Component,
  components: UniSchemaComponentMap,
) {
  if (typeof tag !== 'string') {
    return markRaw(tag)
  }

  if (defaultAllowedTags.includes(tag)) {
    return tag
  }

  const localComponent = components[tag]
    || components[kebabCase(tag)]
    || components[pascalCase(tag)]
  if (localComponent) {
    return localComponent
  }

  return null
}

function createSchemaActionHandler(input: {
  actions?: UniRenderedSchemaNode['actions']
  node: UniRenderedSchemaNode
  app: UniAppContext
  bindings: UniSchemaBindings
}) {
  const { actions, app, node, bindings } = input

  async function execute(name: keyof NonNullable<UniRenderedSchemaNode['actions']>, eventPayload?: unknown) {
    const config = actions?.[name]
    if (!config) {
      return
    }

    await app.actions.execute(config.name, {
      app,
      node,
      payload: config.payload,
      scope: {
        bindings,
        event: eventPayload,
      },
    } as never)
  }

  return {
    onClick: actions?.tap ? () => execute('tap') : undefined,
    onChange: actions?.change ? (event: unknown) => execute('change', event) : undefined,
    onInput: actions?.change ? (event: unknown) => execute('change', event) : undefined,
    onSubmit: actions?.submit ? (event: unknown) => execute('submit', event) : undefined,
    'onUpdate:modelValue': actions?.change ? (value: unknown) => execute('change', value) : undefined,
  }
}

function createSchemaModelHandler(input: {
  node: UniRenderedSchemaNode
  bindings: UniSchemaBindings
}) {
  const { node, bindings } = input
  if (!node.model) {
    return {
      value: undefined,
      handlers: {},
    }
  }

  const currentValue = readModelPath(bindings, node.model)
  const assign = (payload: unknown) => {
    writeModelPath(bindings, node.model as string, extractModelValue(payload))
  }

  return {
    value: currentValue,
    handlers: {
      onInput: assign,
      onChange: assign,
      'onUpdate:modelValue': assign,
    },
  }
}

function composeHandler(
  primary?: (payload?: unknown) => void,
  secondary?: (payload?: unknown) => void,
) {
  if (primary && secondary) {
    return (payload?: unknown) => {
      primary(payload)
      secondary(payload)
    }
  }
  return primary || secondary
}

function renderVNodeChildren(
  children: Array<UniRenderedSchemaNode | string> | undefined,
  input: {
    app: UniAppContext
    bindings: UniSchemaBindings
    components: UniSchemaComponentMap
  },
): VNodeChild[] | undefined {
  if (!children?.length) {
    return undefined
  }

  return children.map((child) => {
    if (typeof child === 'string') {
      return child
    }
    return renderSchemaVNode(child, input)
  })
}

function renderSchemaVNode(
  node: UniRenderedSchemaNode,
  input: {
    app: UniAppContext
    bindings: UniSchemaBindings
    components: UniSchemaComponentMap
  },
) {
  const resolvedTag = resolveSchemaComponent(node.tag, input.components)
  if (!resolvedTag) {
    throw new Error(`Schema component "${String(node.tag)}" is not registered`)
  }

  const actionHandlers = createSchemaActionHandler({
    actions: node.actions,
    node,
    app: input.app,
    bindings: input.bindings,
  })
  const model = createSchemaModelHandler({
    node,
    bindings: input.bindings,
  })
  const modelProp = node.modelProp || 'modelValue'
  const props = {
    ...(node.props || {}),
    ...(node.class ? { class: node.class } : {}),
    ...(typeof node.style !== 'undefined' ? { style: node.style } : {}),
    ...(typeof node.disabled !== 'undefined' ? { disabled: node.disabled } : {}),
    ...(node.model
      ? {
          [modelProp]: model.value,
          ...((typeof resolvedTag === 'string' && ['input', 'textarea'].includes(resolvedTag))
            ? { value: model.value }
            : {}),
        }
      : {}),
    ...actionHandlers,
    onInput: composeHandler(model.handlers.onInput as any, actionHandlers.onInput as any),
    onChange: composeHandler(model.handlers.onChange as any, actionHandlers.onChange as any),
    'onUpdate:modelValue': composeHandler(model.handlers['onUpdate:modelValue'] as any, actionHandlers['onUpdate:modelValue'] as any),
  }

  const slotEntries = node.slots
    ? Object.entries(node.slots).reduce<Record<string, () => VNodeChild[] | undefined>>((output, [name, slotChildren]) => {
        output[name] = () => renderVNodeChildren(slotChildren, input)
        return output
      }, {})
    : undefined

  if (slotEntries && typeof resolvedTag !== 'string') {
    return h(resolvedTag, props, slotEntries)
  }

  const children = renderVNodeChildren(node.children, input)
  const fallbackChildren = children?.length
    ? children
    : typeof node.text !== 'undefined'
      ? [String(node.text)]
      : undefined

  if (typeof resolvedTag !== 'string') {
    return h(resolvedTag, props, fallbackChildren ? { default: () => fallbackChildren } : undefined)
  }

  return h(resolvedTag, props, fallbackChildren)
}

function mergeSchemaComponents(
  app: UniAppContext | undefined,
  components?: UniSchemaComponentInput,
) {
  return {
    ...normalizeComponentInput(app?.config.schema?.components),
    ...normalizeComponentInput(components),
  }
}

export function registerSchemaComponents(
  components: UniSchemaComponentInput,
  app?: UniAppContext,
) {
  const runtime = app || useUniApp()
  runtime.config.schema = runtime.config.schema || {}
  runtime.config.schema.components = {
    ...(runtime.config.schema.components || {}),
    ...normalizeComponentInput(components),
  }
  return runtime.config.schema.components
}

export function defineSchemaComponents(
  components: UniSchemaComponentInput,
) {
  return normalizeComponentInput(components)
}

function readSchemaSource(source?: UniSchemaData) {
  if (isRef(source)) {
    return (source.value || []) as UniSchemaNode[]
  }
  return (source || []) as UniSchemaNode[]
}

function readSchemaBindings(source?: UniSchemaSource<UniSchemaBindings | undefined>) {
  if (isRef(source)) {
    return (source.value || {}) as UniSchemaBindings
  }
  return (source || {}) as UniSchemaBindings
}

export function createSchemaRenderer(options?: UniSchemaRendererOptions) {
  const allowedTags = new Set([
    ...defaultAllowedTags,
    ...(options?.allowedComponents || []),
    ...Object.keys(normalizeComponentInput(options?.components)),
  ])

  return {
    render(schema: UniSchemaNode[], bindings: UniSchemaBindings = {}) {
      return normalizeSchemaNodeList(schema, bindings, {
        allowedTags,
      }).filter((item): item is UniRenderedSchemaNode => typeof item !== 'string')
    },
    isAllowed(tag: string) {
      return allowedTags.has(tag)
    },
    getAllowedComponents() {
      return [...allowedTags]
    },
  }
}

export function renderSchema(
  schema: UniSchemaNode[],
  bindings: UniSchemaBindings = {},
  options?: UniSchemaRendererOptions,
) {
  return createSchemaRenderer(options).render(schema, bindings)
}

export const UniSchemaRenderer = defineComponent({
  name: 'UniSchemaRenderer',
  props: {
    schema: {
      type: Array as PropType<UniSchemaNode[]>,
      required: true,
    },
    bindings: {
      type: Object as PropType<UniSchemaBindings>,
      default: () => ({}),
    },
    components: {
      type: [Object, Array] as PropType<UniSchemaComponentInput>,
      default: undefined,
    },
  },
  setup(props) {
    const app = useUniApp()

    return () => {
      const components = mergeSchemaComponents(app, props.components)
      const allowedComponents = [
        ...Object.keys(components),
      ]
      const nodes = renderSchema(props.schema, props.bindings, {
        components,
        allowedComponents,
      })

      return h(Fragment, null, nodes.map(node => renderSchemaVNode(node, {
        app,
        bindings: props.bindings || {},
        components,
      })))
    }
  },
})

export function useJsonSchema(props: UseJsonSchemaProps = {}) {
  const app = useUniApp()
  const schema = computed<UniSchemaNode[]>(() => readSchemaSource(props.data))
  const bindings = computed<UniSchemaBindings>(() => readSchemaBindings(props.bindings))
  const components = computed(() => mergeSchemaComponents(app, props.components))

  const render = defineComponent({
    name: 'JsonSchemaRenderer',
    setup() {
      return () => h(UniSchemaRenderer, {
        schema: schema.value,
        bindings: bindings.value,
        components: components.value,
      })
    },
  })

  function renderAsync(input: {
    data: UniSchemaNode[]
    bindings?: UniSchemaBindings
  }) {
    return defineComponent({
      name: 'DynamicJsonSchemaRenderer',
      setup() {
        return () => h(UniSchemaRenderer, {
          schema: input.data,
          bindings: {
            ...bindings.value,
            ...(input.bindings || {}),
          },
          components: components.value,
        })
      },
    })
  }

  return {
    render,
    renderAsync,
  }
}
