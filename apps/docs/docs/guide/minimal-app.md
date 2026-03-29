# 最小可运行应用

如果你只想先看“一个新应用最少要有哪些文件”，先看这一页。

## 最小文件集合

```text
src/
  App.vue
  main.ts
  dux.ts
  dux.config.ts
  modules/
    base/
      index.ts
      layouts/
        default.vue
        home.vue
    home/
      index.ts
      pages/
        index.vue
    auth/
      index.ts
      pages/
        login.vue
    account/
      index.ts
      pages/
        index.vue
    system/
      index.ts
      pages/
        forbidden/index.vue
```

再加上自动生成目录：

```text
src/
  runtime/
  pages/
```

## main.ts

```ts
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { installUniApp } from '@duxweb/uni'
import App from './App.vue'
import { dux } from './dux'
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia) // 安装 Pinia
  installUniApp(app, dux) // 安装 Dux Uni runtime

  return {
    app,
  }
}
```

## App.vue

```vue
<script setup lang="ts">
import { setupUniAppLifecycle } from '@duxweb/uni'
import { dux } from './dux'

setupUniAppLifecycle(dux) // 绑定 uni-app 生命周期到 dux runtime
</script>
```

## dux.config.ts

```ts
import { defineDuxConfig } from '@duxweb/uni'
import { duxModules } from './runtime/generated/modules'

export default defineDuxConfig({
  app: {
    name: 'template',
    title: 'Dux Uni Template',
  },
  router: {
    home: 'home.index',
    login: 'auth.login',
    tabBar: ['home', 'account'],
  },
  runtime: {
    storageKey: 'template-session',
  },
  modules: duxModules,
})
```

## dux.ts

```ts
import { createUni, defineUniConfig, resolveDuxConfig } from '@duxweb/uni'
import duxConfig from './dux.config'
import { routerManifest } from './runtime/router/manifest'

const config = resolveDuxConfig(duxConfig)

export const dux = createUni(defineUniConfig({
  ...config.runtime,
  appName: config.app.name,
  tabBarMode: routerManifest.config.router.tabBarMode,
  pages: routerManifest.pages,
  modules: config.modules,
}))
```

在真实项目里，你通常会在这里继续接：

```text
authProvider
dataProvider
permission
request 拦截器
```

## base 模块

```ts
import { defineUniModule } from '@duxweb/uni'

export const baseModule = defineUniModule({
  name: 'base',
  layouts: {
    default: '@/modules/base/layouts/default.vue',
    home: '@/modules/base/layouts/home.vue',
  },
})
```

它负责提供布局壳。

## 一个简单判断

```text
装应用 => main.ts / App.vue
配骨架 => dux.config.ts
接能力 => dux.ts
写业务 => src/modules/*
```

## 下一步

- [应用生命周期](/guide/runtime-entry)
- [初始化配置](/guide/dux-ts)
- [第一个业务模块](/guide/first-module)
