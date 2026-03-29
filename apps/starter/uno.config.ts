import process from 'node:process'
import { resolveDuxConfig } from '@duxweb/uni'
import { createUnoTheme } from '@duxweb/uni-pro'
import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetWeapp } from 'unocss-preset-weapp'
import { transformerClass } from 'unocss-preset-weapp/transformer'
import duxConfig from './src/dux.config.ts'

const dux = resolveDuxConfig(duxConfig)
const platform = process.env.UNI_PLATFORM || process.env.VITE_UNI_PLATFORM || ''
const isH5 = platform === 'h5'
const weappTransformInclude = [
  /[\\/]src[\\/].*\.[jt]sx?$/,
  /[\\/]src[\\/].*\.vue(?:\?vue)?$/,
  /[\\/]packages[\\/]uni[\\/].*\.vue(?:\?vue)?$/,
  /[\\/]packages[\\/]uni-pro[\\/].*\.vue(?:\?vue)?$/,
  /[\\/]node_modules[\\/]@duxweb[\\/]uni[\\/].*\.vue(?:\?vue)?$/,
  /[\\/]node_modules[\\/]@duxweb[\\/]uni-pro[\\/].*\.vue(?:\?vue)?$/,
]

export default defineConfig({
  theme: {
    ...createUnoTheme(dux.ui.tokens, dux.ui.radius, dux.ui.spacing),
    preflightRoot: ['page', 'root-portal-content'],
  },
  presets: [
    presetWeapp({
      platform: 'uniapp',
      isH5,
    }) as any,
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
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
    transformerClass({
      include: weappTransformInclude,
      exclude: [/[\\/]\.git[\\/]/],
    }) as any,
  ],
})
