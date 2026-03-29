# 项目结构

这一页只从“应用使用者”的视角解释创建后的目录。

## 你真正要维护的目录

```text
src/
  App.vue
  main.ts
  dux.ts
  dux.config.ts
  modules/
    home/
    account/
    auth/
```

## 入口文件怎么理解

```text
main.ts        # 安装 Vue、Pinia 和 Dux Uni runtime
App.vue        # 绑定 uni-app 生命周期
dux.ts         # 创建应用 runtime
dux.config.ts  # 配应用级骨架参数
```

## 业务代码放哪里

```text
src/modules/
  home/
    pages/        # 真实页面
    components/   # 模块专属组件
    store/        # 模块状态
    index.ts      # 模块入口
```

## 自动生成目录是什么

```text
src/runtime/     # 扫描和编译后生成的运行时产物
src/pages/       # 为兼容 uni 页面目录自动生成的包装页
src/pages.json   # 根据最终 manifest 自动生成
```

这些文件不要手改。

如果生成结果不对，优先回去改：

- `src/modules/*`
- `src/dux.config.ts`
- 页面里的 `<route lang="json">`
- 模块的 `index.ts`

## 一句话判断

```text
写业务，去 src/modules/*
看运行时结果，去 src/runtime/* 和 src/pages/*
改应用骨架，去 dux.config.ts 和 dux.ts
```

## 下一步看什么

- [开发应用](/guide/development-flow)
- [第一个业务模块](/guide/first-module)
