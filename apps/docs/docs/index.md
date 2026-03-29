---
layout: home

hero:
  subtitle: DuxWeb
  name: Dux Uni
  text: 针对 uni-app 开发的 Headless 应用框架
  tagline: Dux Uni 把路由、数据请求、查询缓存、表单、登录鉴权、弹层、实时连接和 Schema 渲染这些高频重复能力统一成应用层能力，让你把精力放回业务模块本身。
  qrCodeSize: 156
  qrCodes:
    - title: 小程序体验
      image: /mini-program-qrcode.jpg
      description: 扫码打开 Dux Uni 小程序示例
  actions:
    - theme: brand
      text: 先看概述
      link: /guide/overview
    - theme: alt
      text: 创建项目
      link: /guide/getting-started
    - theme: alt
      text: 应用生命周期
      link: /guide/runtime-entry

featuresConfig:
  badge: Why Dux Uni
  title: 围绕 uni-app 业务开发
  subtitle: 先把基础层做好
  description: 它不是再包一层 UI，而是先把 Headless 运行时、模块装配、数据查询、鉴权流程和 JSON 渲染器这些复杂且重复的基础能力收敛起来。
  extraSection:
    title: 模块可以沉淀，能力可以复用
    description: 模块入口、hooks、events、middlewares、schema 组件和 layout 注册都已经进入同一套运行时，后续更容易做累计复用和可插拔扩展。
    tags:
      - "@duxweb/uni"
      - "@duxweb/uni-pro"
      - "uni-app"
      - "hooks first"
      - "modules first"

features:
  - icon: heroicons--rocket-launch
    color: cyan
    title: Headless 应用框架
    details: "路由、导航、请求、会话、登录鉴权、查询缓存、表单、选择器、上传下载、实时连接和弹层逻辑都在 @duxweb/uni 内统一提供。"
    link: /guide/getting-started
  - icon: heroicons--squares-plus
    color: blue
    title: 模块化应用架构
    details: "真实业务代码按 src/modules/* 组织，一个模块可以自带 pages、components、store、index.ts，并注册 hooks、middleware、layout 和事件。"
    link: /guide/app-architecture
  - icon: heroicons--shield-check
    color: green
    title: 登录鉴权与权限收敛
    details: "useLogin、useLogout、useCheck、useCan 配合 auth middleware 和页面 meta 一起工作，把 uni-app 场景下的登录状态和权限控制统一下来。"
    link: /uni/auth
  - icon: heroicons--circle-stack
    color: purple
    title: 基于 Query 的数据能力
    details: "useList、useOne、useMany、useInfiniteList、mutation 和 invalidate 全部建立在 @tanstack/vue-query 之上，查询层可以直接复用。"
    link: /uni/data
  - icon: heroicons--cloud-arrow-up
    color: blue
    title: 上传下载与原生能力
    details: "上传、下载、定位、扫码、剪贴板、图片选择、分享、拨号、地图打开等常见 uni 原生能力都已经有统一 Hook 封装。"
    link: /uni/device
  - icon: heroicons--signal
    color: green
    title: 事件与实时连接
    details: "内置 events、listener、WebSocket 和 SSE 运行时，模块和页面之间可以通过统一事件机制扩展实时业务能力。"
    link: /uni/socket
  - icon: heroicons--sparkles
    color: amber
    title: 增强的 JSON Schema 渲染器
    details: "Schema 渲染器支持组件注册、bindings、条件、循环、switch、actions 和 model 绑定，可以直接基于后端提供的 JSON 动态渲染界面。"
    link: /uni/schema
  - icon: heroicons--shopping-bag
    color: pink
    title: 模块市场与云端复用友好
    details: "模块入口、页面、状态和扩展注册都按功能块沉淀，后续更适合通过云市场分享和下载模块，减少重复开发和重复封装。"
    link: /guide/app-architecture
  - icon: heroicons--swatch
    color: indigo
    title: uni-pro 接管 Wot 集成
    details: "@duxweb/uni-pro 提供 Wot UI 的 Root、Overlay 展示层和主题映射，让组件库能直接承接异步数据能力，并减少 UnoCSS 与主题风格割裂。"
    link: /uni-pro/

quickStart:
  badge: 5 Minutes
  title: 快速把 Dux Uni
  subtitle: 跑起来
  description: 如果你第一次接触 Dux Uni，先按下面三步走。先起一个模板，再跑起来，然后从模块目录开始写第一个功能。
  steps:
    - step: 01
      icon: heroicons--rocket-launch
      color: cyan
      title: 创建项目
      description: 直接通过 npx 创建新应用。脚手架会询问是否启用 uni-pro、应用标题、包管理器、git 初始化和 demo 模块。
      code: npx @duxweb/uni-create my-app
    - step: 02
      icon: heroicons--command-line
      color: blue
      title: 安装并启动
      description: 进入项目后安装依赖，先同步模块和页面生成产物，再启动开发服务。你真正维护的是 modules，不是 pages 包装层。
      code: pnpm install && pnpm run sync:uni && pnpm run dev
    - step: 03
      icon: heroicons--squares-2x2
      color: teal
      title: 从模块开始写业务
      description: 真实业务代码都放在 src/modules/*。如果要扩展页面能力、事件、layout、schema 组件或 middleware，就在模块入口里继续注册。
      code: src/modules/orders/pages/index.vue
  helpText: 想先理解这套框架到底解决什么问题？
  helpLinkText: 阅读概述
  helpLink: /guide/overview
---
