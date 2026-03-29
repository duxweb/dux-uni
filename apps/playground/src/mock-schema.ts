import { createActionRegistry, renderSchema } from '@duxweb/uni'

const actions = createActionRegistry({
  toast: ({ payload }) => payload,
})

export const renderedSchema = renderSchema([
  {
    component: 'section',
    visibleWhen: 'state.ready',
    children: [
      {
        component: 'text',
        text: 'hello',
        actions: {
          tap: {
            name: 'toast',
            payload: 'ok',
          },
        },
      },
    ],
  },
], {
  state: {
    ready: true,
  },
}, {
  actions,
})
