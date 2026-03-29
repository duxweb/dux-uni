# @duxweb/uni-create

`@duxweb/uni-create` 用于基于官方 `template` 模板创建一个新的 Dux Uni 项目。

## 用法

```bash
npx @duxweb/uni-create my-app
```

也可以指定选项：

```bash
npx @duxweb/uni-create my-app --ui base --package-manager pnpm --no-git
npx @duxweb/uni-create my-app --ui pro --with-demo-module
```

说明：

- `--ui pro`：生成 `@duxweb/uni + @duxweb/uni-pro` 模板。
- `--ui base`：只生成 `@duxweb/uni` 基础模板。
- `--with-demo-module`：额外生成 `src/modules/demo`，并在首页注入一个入口卡片。
- 未传关键参数且终端可交互时，会提示你依次选择：
  - 是否启用 `uni-pro`
  - 应用标题
  - 包管理器
  - 是否初始化 git
  - 是否创建演示模块

## 当前能力

- 复制官方模板
- 支持 `base` / `pro` 两种 UI 模式
- 支持交互式脚手架问答
- 重写项目名、应用名、标题、存储 key
- 把 workspace 脚本改成可独立运行的脚本
- 可选直接生成 demo 模块
- 可选自动安装依赖
- 可选自动 `git init`
- 安装后自动执行一次 `sync:uni`

## 模板来源

当前内置模板来自 `dux-uni` workspace 里的官方 `apps/template` 快照。
