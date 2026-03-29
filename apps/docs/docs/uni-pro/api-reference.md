# API Reference

这一页只索引 `@duxweb/uni-pro` 当前对外能力。

每个 API 后面都带一行中文说明和跳转链接，方便快速查找。

## 包根导出

| API | 说明 | 跳转 |
| --- | --- | --- |
| `defineDuxConfig()` | 定义 `dux.config.ts`，通常来自 `@duxweb/uni` 的配置能力 | [应用配置](/guide/configuration) |
| `resolveDuxConfig()` | 解析带默认值的 dux 配置 | [初始化配置](/guide/dux-ts) |
| `createDuxRouterManifest()` | 生成路由 manifest | [初始化配置](/guide/dux-ts) |
| `createUniPagesEntries()` | 生成 uni-app 页面 entries | [自动生成产物](/guide/generated-files) |
| `createUniTabBar()` | 生成 uni tabBar 配置 | [应用配置](/guide/configuration) |
| `createUniGlobalStyle()` | 生成 uni globalStyle 配置 | [应用配置](/guide/configuration) |
| `getDuxPages()` | 读取页面列表 | [页面 Route](/uni/page-route) |
| `getDuxPageByName()` | 按名称读取页面 | [页面 Route](/uni/page-route) |
| `getDuxTabBarPages()` | 读取 tabBar 页面列表 | [应用配置](/guide/configuration) |
| `createWotThemeVars()` | 把语义 token 转成 Wot UI `theme-vars` | [createWotThemeVars](/uni-pro/theme#createwotthemevars) |
| `createUnoTheme()` | 把语义 token 转成 UnoCSS 可消费的主题对象 | [createUnoTheme](/uni-pro/theme#createunotheme) |
| `createUniTheme()` | 创建统一基础主题对象 | [createUniTheme](/uni-pro/theme#createunitheme) |
| `defaultThemeTokens` | 默认颜色 token | [defaultThemeTokens](/uni-pro/theme#defaultthemetokens) |
| `defaultRadiusTokens` | 默认圆角 token | [defaultRadiusTokens](/uni-pro/theme#defaultradiustokens) |
| `defaultSpacingTokens` | 默认间距 token | [defaultSpacingTokens](/uni-pro/theme#defaultspacingtokens) |

## 组件子路径导出

| 导入路径 | 说明 | 跳转 |
| --- | --- | --- |
| `@duxweb/uni-pro/components/DuxRoot.vue` | 根 provider，负责接 Wot UI、portal 和 overlay host | [DuxRoot](/uni-pro/components#duxroot) |
| `@duxweb/uni-pro/components/ProAppProvider.vue` | `DuxRoot` 的轻包装，更适合直接挂全局 | [ProAppProvider](/uni-pro/components#proappprovider) |
| `@duxweb/uni-pro/components/DuxOverlayHost.vue` | 读取 overlay 队列并渲染 | [DuxOverlayHost](/uni-pro/components#duxoverlayhost) |
| `@duxweb/uni-pro/components/DuxOverlayPresenter.vue` | 把单个 overlay entry 渲染成 Wot UI 弹层 | [DuxOverlayPresenter](/uni-pro/components#duxoverlaypresenter) |
| `@duxweb/uni-pro/components/ProPageShell.vue` | 页面壳组件，统一边距、间距和安全区 | [ProPageShell](/uni-pro/components#propageshell) |
| `@duxweb/uni-pro/components/ProSection.vue` | 区块容器组件，适合能力卡片和分组表单 | [ProSection](/uni-pro/components#prosection) |
| `@duxweb/uni-pro/components/ProEmpty.vue` | 空状态组件 | [ProEmpty](/uni-pro/components#proempty) |
| `@duxweb/uni-pro/components/AsyncForm.vue` | 异步表单根组件 | [AsyncForm](/uni-pro/components#asyncform) |
| `@duxweb/uni-pro/components/AsyncPicker.vue` | 异步远程选择器 | [AsyncPicker](/uni-pro/components#asyncpicker) |
| `@duxweb/uni-pro/components/AsyncColPicker.vue` | 异步级联选择器 | [AsyncColPicker](/uni-pro/components#asynccolpicker) |
| `@duxweb/uni-pro/components/AsyncPickerView.vue` | 异步滚筒选择器 | [AsyncPickerView](/uni-pro/components#asyncpickerview) |
| `@duxweb/uni-pro/components/AsyncUpload.vue` | 异步上传组件 | [AsyncUpload](/uni-pro/components#asyncupload) |

## 推荐导入方式

```ts
import { createWotThemeVars, createUnoTheme } from '@duxweb/uni-pro'
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
import ProPageShell from '@duxweb/uni-pro/components/ProPageShell.vue'
import AsyncForm from '@duxweb/uni-pro/components/AsyncForm.vue'
```

## 继续阅读

- [组件总览](/uni-pro/components)
- [主题与 Token](/uni-pro/theme)
