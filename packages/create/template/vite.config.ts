// @ts-nocheck
import UniPackage from '@dcloudio/vite-plugin-uni'
import { uniuseAutoImports } from '@uni-helper/uni-use'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import UniPolyfill from 'vite-plugin-uni-polyfill'

const uni = typeof UniPackage === 'function'
  ? UniPackage
  : UniPackage.default

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ['@duxweb/uni', '@duxweb/uni-pro', 'lodash.merge', '@vueuse/shared'],
  },
  server: {
    host: '127.0.0.1',
    port: 5184,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    uni(),
    UniPolyfill(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        'uni-app',
        uniuseAutoImports({
          except: [
            'tryOnScopeDispose',
            'useNetwork',
            'useOnline',
            'usePreferredDark',
            'useQuery',
            'useStorage',
            'useStorageAsync',
          ],
        }),
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/modules/*/composables', 'src/modules/*/store'],
      vueTemplate: true,
    }),
    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    UnoCSS(),
  ],
})
