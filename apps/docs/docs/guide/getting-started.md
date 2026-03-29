# 快速开始

这一组文档只站在“应用使用者”的角度，目标是让你尽快把一个 `Dux Uni` 项目创建出来、跑起来，并看懂项目结构。

## 推荐阅读顺序

### 1. 创建项目

```bash
# 通过脚手架创建一个新的 Dux Uni 应用
npx @duxweb/uni-create my-app
```

继续看：[创建项目](/guide/quick-start/create-project)

### 2. 安装并启动

```bash
# 安装依赖
pnpm install

# 生成运行时产物
pnpm run sync:uni

# 启动开发服务
pnpm run dev
```

继续看：[安装与启动](/guide/quick-start/run-project)

### 3. 认识项目结构

```text
src/
  modules/        # 真实业务代码
  runtime/        # 自动生成的运行时产物
  pages/          # 自动生成的 uni 页面包装层
  dux.ts          # 应用 runtime 入口
  dux.config.ts   # 应用骨架配置
```

继续看：[项目结构](/guide/quick-start/project-structure)

## 你最先需要理解的四个文件

```text
main.ts        # 安装 Vue、Pinia 和 Dux Uni
App.vue        # 绑定 uni-app 生命周期
dux.ts         # 创建应用 runtime
dux.config.ts  # 配置应用级能力
```

如果你想先把这四个文件的关系看明白，继续看：

- [最小可运行应用](/guide/minimal-app)
- [应用生命周期](/guide/runtime-entry)

## 什么时候选 `base`，什么时候选 `pro`

### `base`

```text
只使用 @duxweb/uni，自行接 UI 库
```

### `pro`

```text
使用 @duxweb/uni + @duxweb/uni-pro，直接接入 Wot UI 和主题能力
```

## 下一步

项目已经跑起来后，继续看：

- [开发应用](/guide/development-flow)
- [模块开发](/guide/develop/modules)
