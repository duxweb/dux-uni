# 模块生成器

`dux-uni` 内置了一个非常克制的模块生成器。

目标不是做复杂脚手架，而是帮你快速生成一个符合当前架构约定的模块骨架。

## 命令

```bash
dux-uni module new orders
```

在 workspace 里通常会通过脚本调用：

```bash
pnpm module:new orders
```

例如 template 项目里：

- `apps/template/package.json`

## 会生成什么

执行后会生成：

```text
src/modules/orders/
  index.ts
  pages/
    index.vue
  components/
    index.ts
  store/
    index.ts
```

同时会自动执行一次 `sync`，把：

- `src/runtime/*`
- `src/pages/*`
- `src/pages.json`

一起更新。

## 生成的 index.ts

生成器会产出一个最小模块入口：

```ts
import { defineUniModule } from '@duxweb/uni'

export const ordersModule = defineUniModule({
  name: 'orders',
  defaultLayout: 'default',
})

export default ordersModule
```

这个默认值足够让模块先接入应用。

## 生成的首页页面

还会生成一个最小 `pages/index.vue`：

- 带 `<route lang="json">`
- 默认 `auth: true`
- 带一个简单起始内容

也就是说，你生成完模块后，马上就已经有一个可被扫描和包装的真实业务页面。

## 适合什么时候用

推荐用在：

- 新建标准业务模块
- 想快速搭一个功能骨架
- 团队里统一模块目录约定

## 不适合什么时候用

不适合：

- 你要创建非常特殊的模块结构
- 你要一次生成复杂业务页、接口层、测试、schema 组件等大量内容

当前生成器刻意保持简单，不做过度模板化。

## 生成后第一步该改什么

通常建议马上改这几个地方：

1. `index.ts` 里的中间件、默认 layout、schema 注册
2. `pages/index.vue` 的 `<route lang="json">`
3. 页面里的真实列表、表单或详情逻辑

## 推荐后续扩展顺序

生成模块后，推荐按这个顺序继续：

1. 把首页内容换成真实业务
2. 再加二级页面，例如 `detail.vue`
3. 再加 `components/*`
4. 再加 `store/*`
5. 最后再考虑中间件、事件、socket bridge

## 和手写目录的区别

你当然可以手动创建这些目录。

生成器的价值主要在于：

- 保证目录一致
- 保证命名一致
- 保证模块入口格式一致
- 自动触发一次 `sync`

## 最佳实践

- 把生成器当“起点”，不是当“完整业务脚手架”
- 不要指望它替你决定业务结构
- 模块复杂度上来后，还是应该由你自己继续内聚设计
