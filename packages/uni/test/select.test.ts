import { describe, expect, it } from 'vitest'
import { useSelect } from '../src/hooks/select'

describe('useSelect', () => {
  it('maps list data into options and hydrates selected values', async () => {
    const app = {
      config: {
        dataProvider: {
          async getList() {
            return {
              data: [
                { id: 1, name: 'Alpha' },
              ],
              meta: { total: 2 },
            }
          },
          async getMany() {
            return {
              data: [
                { id: 2, name: 'Beta' },
              ],
            }
          },
          getTotal(result: any) {
            return result.meta?.total || 0
          },
        },
      },
      session: {
        getAuth() {
          return null
        },
      },
    } as any

    const select = useSelect(app, {
      path: 'demo/options',
      defaultValue: 2,
      optionLabel: 'name',
      optionValue: 'id',
    })

    await select.refresh()
    await select.hydrateSelected()

    expect(select.options.value.map(item => item.label)).toEqual(['Beta', 'Alpha'])
    expect(select.total.value).toBe(2)
  })
})
