import { createSocketBridge, defineUniModule } from '@duxweb/uni'

export const featureModule = defineUniModule({
  name: 'feature',
  defaultLayout: 'home',
  ...createSocketBridge({
    status: 'feature:socket-status',
    messages: {
      'chat.message': 'feature:chat-message',
    },
  }),
})
