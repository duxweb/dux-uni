# 安装与启动

项目创建出来后，先把它跑起来，再开始改业务代码。

## 最常用命令

```bash
# 进入项目目录
cd my-app

# 安装依赖
pnpm install

# 扫描 modules 和 pages，生成运行时产物
pnpm run sync:uni

# 启动开发服务
pnpm run dev
```

## 每条命令在做什么

```bash
# 重新扫描 src/modules/*，生成 src/runtime/*、src/pages/*、src/pages.json
pnpm run sync:uni

# 启动 uni-app 开发服务
pnpm run dev

# 生产构建
pnpm run build

# TypeScript 检查
pnpm run type-check

# 新建一个模块骨架
pnpm run module:new orders
```

## 推荐第一次启动顺序

```bash
# 1. 安装依赖
pnpm install

# 2. 先生成运行时产物
pnpm run sync:uni

# 3. 再启动开发服务
pnpm run dev
```

## 启动后先确认什么

- 首页是否正常打开
- 登录页或账户页是否能进入
- `src/runtime/*` 和 `src/pages/*` 是否已生成
- `src/modules/*` 中的页面是否被扫描进 `pages.json`

## 下一步看什么

- [项目结构](/guide/quick-start/project-structure)
- [最小可运行应用](/guide/minimal-app)
