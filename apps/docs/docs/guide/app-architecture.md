# 应用架构

`Dux Uni` 的模块化指的是“应用内部的业务模块化”，不是 workspace 级 package 切分。

## 推荐目录结构

```text
src/
  modules/
    home/
      pages/
      components/
      store/
      index.ts
    orders/
      pages/
      components/
      store/
      index.ts
```

## 每个目录放什么

```text
modules/*/pages        => 真实页面
modules/*/components   => 模块专属组件
modules/*/store        => 模块状态
modules/*/index.ts     => 模块入口注册
```

模块内还可以继续加：

```text
layouts/
services/
schema/
composables/
```

前提是它们只服务当前模块，而不是重新做一层全局。

## 页面包装层是什么

```text
src/pages/* => 自动生成的薄包装页
```

它的职责是：

- 接路由
- 跑页面运行时
- 再渲染模块里的真实页面

所以：

```text
写页面 => 去 modules/*/pages/*
不要手写 src/pages/*
```

## 模块入口负责什么

```text
注册 hooks
注册中间件
注册 schema 组件
合并模块配置
注册事件或 socket bridge
```

这也是为什么推荐一个模块一个 `index.ts`。

## 为什么不要把逻辑堆在全局

如果所有逻辑都塞进 `main.ts`、全局路由、全局 middleware，会很快出现这些问题：

```text
模块边界消失
页面和能力分散
复用困难
后续无法做模块化沉淀
```

`Dux Uni` 的目标不是让全局更强，而是让全局更薄。
