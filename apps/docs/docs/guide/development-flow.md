# 开发应用

这一组文档不再从“框架内部”切入，而是从“如何按 `modules` 开发业务应用”切入。

## 推荐开发顺序

### 1. 先确认应用骨架

```text
确认首页、登录页、tabBar、应用标题、主题、存储 key
```

继续看：

- [初始化配置](/guide/dux-ts)
- [应用配置](/guide/configuration)

### 2. 再按模块开发业务

```text
真实页面、模块组件、模块 store、模块入口都放在 src/modules/*
```

继续看：[模块开发](/guide/develop/modules)

### 3. 页面里统一使用 Hook

```ts
import {
  useRouter,
  useAuth,
  useList,
  useForm,
} from '@duxweb/uni'
```

你应该尽量站在 Hook 层开发业务，而不是把 runtime 单例手动透传到各个页面。

### 4. 生成层只看，不手改

```text
src/runtime/*   # 自动生成
src/pages/*     # 自动生成
src/pages.json  # 自动生成
```

这些目录只看结果，不写业务代码。

继续看：[自动生成产物](/guide/generated-files)

## 先读哪几页最有效

- [模块开发](/guide/develop/modules)
- [页面与路由](/guide/develop/routes-and-pages)
- [模块入口与生命周期](/guide/develop/module-entry)
- [第一个业务模块](/guide/first-module)

## 典型开发链路

```text
1. 改 dux.config.ts
2. 新建 src/modules/orders
3. 新建 index.ts
4. 新建 pages/index.vue
5. 在页面里写 <route> 和 Hook
6. 执行 sync:uni
7. 再检查生成出来的 runtime / pages / pages.json
```

## 常见分工

```text
全局骨架      => dux.config.ts / dux.ts
模块业务      => src/modules/*
生成运行时    => src/runtime/*
页面包装层    => src/pages/*
```

## 下一步

- [模块开发](/guide/develop/modules)
- [第一个业务模块](/guide/first-module)
- [按场景找能力](/guide/scenarios)
