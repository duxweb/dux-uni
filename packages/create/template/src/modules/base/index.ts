import { defineUniModule } from '@duxweb/uni'

export const baseModule = defineUniModule({
  name: 'base',
  layouts: {
    default: '@/modules/base/layouts/default.vue',
    home: '@/modules/base/layouts/home.vue',
  },
})
