# 创建项目

这一页只回答一件事：如何从零创建一个可运行的 `Dux Uni` 应用。

## 使用脚手架创建

```bash
# 创建一个新应用
npx @duxweb/uni-create my-app
```

脚手架会交互式询问这些信息：

- 是否启用 `@duxweb/uni-pro`
- 应用标题
- 包管理器
- 是否初始化 Git
- 是否创建演示模块

## 常用创建方式

### 创建 `base` 模板

```bash
# 只生成 @duxweb/uni，不接 UI 适配层
npx @duxweb/uni-create my-app --ui base
```

适合：

- 你要自己接 UI 库
- 你先只想使用 Headless 运行时

### 创建 `pro` 模板

```bash
# 生成 @duxweb/uni + @duxweb/uni-pro
npx @duxweb/uni-create my-app --ui pro
```

适合：

- 你要直接用 Wot UI
- 你希望 root provider、overlay host、主题映射一并准备好

### 连同演示模块一起创建

```bash
# 附带一个 demo 模块，便于直接看页面落地方式
npx @duxweb/uni-create my-app --ui pro --with-demo-module
```

## 推荐选择

### 什么时候选 `base`

```text
只要运行时，不要 UI 适配层
```

### 什么时候选 `pro`

```text
直接做完整 App，希望 Wot UI 和主题能力已经接好
```

## 创建后的下一步

项目创建完成后，下一步直接看：

- [安装与启动](/guide/quick-start/run-project)
- [项目结构](/guide/quick-start/project-structure)
