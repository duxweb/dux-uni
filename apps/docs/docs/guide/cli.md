# CLI 与命令

从用户角度看，你只需要记住两类命令：

1. 创建项目的命令
2. 进入项目后的开发命令

## 1. 创建项目

创建一个新应用：

```bash
npx @duxweb/uni-create my-app
```

如果你不传大部分参数，脚手架会直接进入交互式问答流程。

指定 UI 模式：

```bash
npx @duxweb/uni-create my-app --ui pro
npx @duxweb/uni-create my-app --ui base
npx @duxweb/uni-create my-app --ui pro --with-demo-module
```

常用附加参数：

```bash
npx @duxweb/uni-create my-app --ui pro --package-manager pnpm --no-git
```

说明：

- `pro`：带 `@duxweb/uni-pro`
- `base`：只保留 `@duxweb/uni`
- `--with-demo-module`：额外创建 `src/modules/demo`
- 没传关键参数时，终端里会继续询问：
  - 是否启用 `uni-pro`
  - 应用标题
  - 包管理器
  - 是否初始化 git
  - 是否创建 demo 模块

## 2. 进入项目后常用命令

```bash
pnpm install
pnpm run sync:uni
pnpm run dev
pnpm run build
pnpm run type-check
```

你通常只需要这样理解：

- `sync:uni`：扫描模块和页面，生成 uni-app 需要的静态产物
- `dev`：开发启动
- `build`：构建发布
- `type-check`：类型检查

## 3. `sync:uni` 到底生成了什么

执行后会更新这些自动生成内容：

- `src/runtime/generated/modules.ts`
- `src/runtime/generated/router-pages.ts`
- `src/runtime/router/manifest.ts`
- `src/runtime/router/page.ts`
- `src/pages/*`
- `src/pages.json`

所以你真正维护的是：

- `src/modules/*`
- `src/dux.config.ts`
- 页面里的 `<route lang="json">`

而不是生成目录本身。

## 4. 什么时候手动执行 `sync:uni`

这些场景建议手动跑一次：

- 新建了模块
- 新建了页面
- 改了页面 `<route>` 配置
- 改了模块入口 `index.ts`
- 改了 `src/dux.config.ts`

如果你跑的是 `dev`、`build`、`type-check`，脚本一般也会先同步一次。

## 5. 模块生成命令

如果你要快速新建一个标准模块，可以用：

```bash
pnpm run module:new orders
```

它会生成：

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

生成后会再次同步页面和运行时产物。

## 6. 关于平台命令

`dux-uni` 不替代 uni 官方工具链，它是在项目启动前，把你的模块化结构整理成 uni-app 能识别的静态页面与配置。

所以你可以把它理解成：

- `uni-app` 负责跨端运行
- `dux-uni` 负责把模块化应用结构桥接到 uni-app

## 下一步看什么

- 想继续理解项目应该怎么开发：看 [开发流程](/guide/development-flow)
- 想理解生成目录：看 [自动生成产物](/guide/generated-files)
- 想直接新增一个功能模块：看 [第一个业务模块](/guide/first-module)
