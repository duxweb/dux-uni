import { describe, expect, it } from 'vitest'
import { useTree } from '../src/hooks/tree'

describe('useTree', () => {
  it('converts flat data into tree items', async () => {
    const app = {
      config: {
        dataProvider: {
          async getList() {
            return {
              data: [
                { id: 1, parent_id: 0, name: 'Root', sort: 1 },
                { id: 2, parent_id: 1, name: 'Child', sort: 1 },
              ],
            }
          },
        },
      },
      session: {
        getAuth() {
          return null
        },
      },
    } as any

    const tree = useTree(app, {
      path: 'demo/tree',
    })

    await tree.refresh()

    expect(tree.items.value).toHaveLength(1)
    expect((tree.items.value[0] as any).children).toHaveLength(1)
    expect(tree.flatItems.value).toHaveLength(2)
  })
})
