# @duxweb/uni-pro

`@duxweb/uni-pro` 是 `dux-uni` 里的 UI 适配层。

它负责：

- Wot UI 集成
- 主题 token 映射
- UnoCSS 主题对齐
- Root Provider
- Overlay 展示层
- 页面壳组件

运行时、路由、请求、鉴权、查询、Schema 渲染不放在这里，这些能力都在 `@duxweb/uni`。

## 文档

完整文档统一放在仓库里的 `apps/docs`：

```bash
pnpm docs:dev
pnpm docs:open
```

建议优先看：

- `apps/docs/docs/uni-pro/index.md`
- `apps/docs/docs/uni-pro/api-reference.md`
- `apps/docs/docs/uni-pro/theme.md`
- `apps/docs/docs/uni-pro/components.md`
- `apps/docs/docs/guide/scenarios.md`

## 当前导出

包根导出：

- 主题函数
- dux config helpers
- 类型透传

组件走子路径导出，例如：

```ts
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
import ProPageShell from '@duxweb/uni-pro/components/ProPageShell.vue'
```

## 边界

- `@duxweb/uni`：运行时和数据层
- `@duxweb/uni-pro`：UI 适配层

不要把业务逻辑和运行时逻辑继续堆到 `uni-pro`。
