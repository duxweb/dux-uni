// @ts-nocheck
import { resolve } from 'node:path'
import UniPackage from '@dcloudio/vite-plugin-uni'
import { uniuseAutoImports } from '@uni-helper/uni-use'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import type { Alias, UserConfig } from 'vite'
import UniPolyfill from 'vite-plugin-uni-polyfill'

const uni = typeof UniPackage === 'function'
  ? UniPackage
  : UniPackage.default

const optimizeDepsInclude = ['@duxweb/uni', '@duxweb/uni-pro', 'lodash.merge', '@vueuse/shared']
const autoImportExcept = [
  'tryOnScopeDispose',
  'useNetwork',
  'useOnline',
  'usePreferredDark',
  'useQuery',
  'useStorage',
  'useStorageAsync',
]

function convertUniRpxPlaceholder(input: string) {
  return input.replace(/%\?(-?\d*\.?\d+)\?%/g, (_, rawValue: string) => {
    const value = Number(rawValue)
    if (!Number.isFinite(value)) {
      return rawValue
    }
    return `${(value / 7.5).toFixed(6).replace(/\.?0+$/u, '')}vw`
  })
}

function fixH5RpxPlaceholderPlugin(enabled: boolean) {
  return {
    name: 'dux-fix-h5-rpx-placeholder',
    enforce: 'post' as const,
    transform(code: string, id: string) {
      if (!enabled || !id.includes('.css') || !code.includes('%?')) {
        return null
      }

      return {
        code: convertUniRpxPlaceholder(code),
        map: null,
      }
    },
    generateBundle(_: unknown, bundle: Record<string, { type: string, source?: string | Uint8Array }>) {
      if (!enabled) {
        return
      }

      Object.values(bundle).forEach((chunk) => {
        if (chunk.type !== 'asset' || typeof chunk.source !== 'string' || !chunk.source.includes('%?')) {
          return
        }

        chunk.source = convertUniRpxPlaceholder(chunk.source)
      })
    },
  }
}

export function createUniAppViteConfig(options: {
  appRoot: string
  port: number
  withWotAlias?: boolean
  alias?: Alias[]
}): UserConfig {
  const alias: Alias[] = [...(options.alias || [])]
  const dedupe = ['vue']
  const platform = process.env.UNI_PLATFORM || process.env.VITE_UNI_PLATFORM || ''
  const isH5 = platform === 'h5'

  if (options.withWotAlias) {
    const wotPackagePath = resolve(options.appRoot, 'node_modules/wot-design-uni')
    dedupe.push('wot-design-uni')
    alias.push(
      {
        find: /^wot-design-uni$/,
        replacement: wotPackagePath,
      },
      {
        find: /^wot-design-uni\/(.*)$/,
        replacement: `${wotPackagePath}/$1`,
      },
    )
  }

  return {
    resolve: {
      preserveSymlinks: true,
      dedupe,
      alias,
    },
    optimizeDeps: {
      include: optimizeDepsInclude,
    },
    server: {
      host: '127.0.0.1',
      port: options.port,
      watch: {
        usePolling: true,
      },
    },
    plugins: [
      uni(),
      UniPolyfill(),
      AutoImport({
        imports: [
          'vue',
          '@vueuse/core',
          'uni-app',
          uniuseAutoImports({
            except: autoImportExcept,
          }),
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/modules/*/composables', 'src/modules/*/store'],
        vueTemplate: true,
      }),
      UnoCSS(),
      fixH5RpxPlaceholderPlugin(isH5),
    ],
  }
}
