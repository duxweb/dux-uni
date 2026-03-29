import { presetUni } from '@uni-helper/unocss-preset-uni'
import { resolveDuxConfig } from '@duxweb/uni'
import { createUnoTheme } from '@duxweb/uni-pro'
import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import duxConfig from './src/dux.config.ts'

const dux = resolveDuxConfig(duxConfig)

export default defineConfig({
  theme: createUnoTheme(dux.ui.tokens, dux.ui.radius, dux.ui.spacing),
  presets: [
    presetUni(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
      // HBuilderX 必须针对要使用的 Collections 做异步导入
      // collections: {
      //   carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
      // },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
