import { describe, expect, it } from 'vitest'
import { defineSchemaComponents, renderSchema } from '../src/schema/renderer'

describe('renderSchema', () => {
  it('renders visible nodes and expands forEach bindings', () => {
    const schema = [
      {
        component: 'section',
        visibleWhen: 'state.enabled',
        children: [
          {
            component: 'text',
            forEach: 'state.items',
            bind: 'item.label',
          },
        ],
      },
    ] as const

    const result = renderSchema(schema as any, {
      state: {
        enabled: true,
        items: [{ label: 'A' }, { label: 'B' }],
      },
    })

    expect(result).toHaveLength(1)
    expect(result[0].children).toEqual([
      {
        tag: 'text',
        key: undefined,
        props: {},
        class: undefined,
        style: undefined,
        text: 'A',
        disabled: undefined,
        children: undefined,
        slots: undefined,
        actions: undefined,
        binding: 'A',
      },
      {
        tag: 'text',
        key: undefined,
        props: {},
        class: undefined,
        style: undefined,
        text: 'B',
        disabled: undefined,
        children: undefined,
        slots: undefined,
        actions: undefined,
        binding: 'B',
      },
    ])
  })

  it('supports if / elseIf / else chains', () => {
    const schema = [
      {
        tag: 'text',
        if: 'state.modeA',
        text: 'A',
      },
      {
        tag: 'text',
        elseIf: 'state.modeB',
        text: 'B',
      },
      {
        tag: 'text',
        else: true,
        text: 'C',
      },
    ] as const

    const result = renderSchema(schema as any, {
      state: {
        modeA: false,
        modeB: true,
      },
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.text).toBe('B')
  })

  it('supports switch / case / defaultCase chains', () => {
    const schema = [
      {
        tag: 'text',
        switch: 'state.status',
        case: 'active',
        text: 'Active',
      },
      {
        tag: 'text',
        case: 'draft',
        text: 'Draft',
      },
      {
        tag: 'text',
        defaultCase: true,
        text: 'Other',
      },
    ] as const

    const result = renderSchema(schema as any, {
      state: {
        status: 'draft',
      },
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.text).toBe('Draft')
  })

  it('writes model values back through bindings', () => {
    const bindings = {
      state: {
        title: 'Before',
      },
    }

    const schema = [
      {
        tag: 'input',
        model: 'state.title',
      },
    ]

    const result = renderSchema(schema as any, bindings as any)

    expect(result[0]?.props).toEqual({})
    expect(result[0]?.model).toBe('state.title')
  })

  it('supports explicit component registration aliases', () => {
    const registry = defineSchemaComponents([
      {
        name: 'wd-button',
        component: {
          name: 'SchemaButton',
        } as any,
        aliases: ['schema-button'],
      },
    ])

    expect(registry['wd-button']).toBeTruthy()
    expect(registry['schema-button']).toBe(registry['wd-button'])
  })
})
