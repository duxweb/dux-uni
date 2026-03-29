# 自动生成产物

`Dux Uni` 的核心思路是：

```text
真实业务代码     => src/modules/*
自动生成运行时   => src/runtime/* / src/pages/* / src/pages.json
```

## 执行 sync 后会生成什么

```text
src/
  pages.json
  runtime/
    generated/
      modules.ts
      router-pages.ts
    router/
      manifest.ts
      page.ts
  pages/
    home/index.vue
    auth/login.vue
```

## runtime/generated/modules.ts

```ts
import { homeModule } from '../../modules/home/index.ts'
import { authModule } from '../../modules/auth/index.ts'

export const duxModules = [homeModule, authModule]
```

作用：

- 收集模块入口
- 统一导出模块数组

## runtime/generated/router-pages.ts

作用：

- 保存扫描后的页面 meta 列表
- 给 router manifest 提供输入

这些数据来自：

- 页面里的 `<route lang="json">`
- 文件路径推导
- 模块默认 layout

## runtime/router/manifest.ts

作用：

- 合并 `dux.config.ts` 和扫描到的页面
- 输出最终路由 manifest

最终会包含：

```text
pages
pagesByName
pagesByModule
homePage
loginPage
tabBarPages
```

## runtime/router/page.ts

作用：

- 提供 `definePage()`
- 提供 `usePageRuntime()`
- 在进入真实页面前执行页面运行时

## src/pages/*

这里是自动生成的 uni 页面包装层。

```text
真实页面: src/modules/feature/pages/secure.vue
生成页面: src/pages/feature/secure.vue
```

包装页会：

```text
1. 导入页面运行时
2. 导入真实模块页面
3. 导入 layout
4. 调用 definePage()
5. 调用 usePageRuntime()
6. ready 后再渲染真实页面
```

## src/pages.json

这个文件会根据最终 manifest 自动生成。

它会收敛：

```text
easycom
globalStyle
pages
tabBar
```

## 可以手改吗

原则上不要手改：

```text
src/runtime/*
src/pages/*
src/pages.json
```

如果结果不对，应该回头改：

- `src/modules/*`
- `<route lang="json">`
- `src/modules/*/index.ts`
- `src/dux.config.ts`

## 一个简单判断

```text
改业务 => 回 modules
看结果 => 看 runtime / pages / pages.json
```
