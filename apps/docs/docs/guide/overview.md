# 概述

`Dux Uni` 是一个针对 `uni-app` 开发的 Headless 应用框架。

## 它是什么

```text
@duxweb/uni      => Headless 应用框架核心层
@duxweb/uni-pro  => Wot UI 适配层
```

它不是替代 `uni-app`，而是在 `uni-app` 之上补齐应用层能力。

## 它解决什么问题

```text
请求、鉴权、会话、权限每个项目都重复封装
页面、组件、状态、监听器散在全局目录里
列表、详情、表单、选择器每个项目写法都不统一
UI 库只解决界面，不解决应用运行时
想做模块复用或 JSON 渲染，但项目结构不支持
```

## 它能直接提供什么

```text
模块化应用架构
统一路由与页面运行时
请求与数据查询
登录鉴权与权限控制
表单、异步选项、树数据
Overlay 逻辑
事件、WebSocket、SSE
上传下载和原生能力
JSON Schema 渲染
```

## 和原生 uni-app 的关系

```text
uni-app    => 跨端能力、页面体系、原生 API、编译体系
Dux Uni    => 应用层架构、请求层、鉴权层、查询层、模块系统
```

所以正确理解应该是：

- 你仍然在开发 uni-app
- 只是不用每个项目都从零搭应用层框架

## 典型项目结构

```text
src/
  App.vue
  main.ts
  dux.ts
  dux.config.ts
  modules/
    home/
      pages/
      components/
      store/
      index.ts
    account/
      pages/
      components/
      store/
      index.ts
  runtime/
  pages/
  pages.json
```

可以按三层理解：

```text
入口层   => main.ts / App.vue / dux.ts / dux.config.ts
业务层   => src/modules/*
生成层   => src/runtime/* / src/pages/* / pages.json
```

## 什么时候适合用

更适合：

- 有登录、权限、列表、表单、详情、账户中心的业务型 App
- 需要长期维护和沉淀模块
- 想统一多个 uni 项目的基础层
- 想做模块复用、模块市场或 JSON 驱动页面

不太适合：

- 一次性活动页
- 极轻的纯展示页
- 只想找一个 UI 库，不需要应用层能力的项目

## 推荐阅读顺序

1. [快速开始](/guide/getting-started)
2. [开发应用](/guide/development-flow)
3. [功能概览](/guide/feature-overview)
