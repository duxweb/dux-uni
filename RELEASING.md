# 发布与版本管理

这份文档面向仓库维护者，不面向 `Dux Uni` 的应用开发者。

## 发布流程

仓库使用 `changesets` 管理多包版本与 npm 发布。

```bash
pnpm changeset
pnpm version
pnpm release
```

### `pnpm changeset`

记录本次改动要发布哪些包，以及版本类型：

- `patch`
- `minor`
- `major`

执行后会生成 `.changeset/*.md` 文件。

### `pnpm version`

统一更新版本号，并同步脚手架模板版本元数据：

```bash
changeset version
pnpm run sync:create-template-versions
pnpm install --no-frozen-lockfile
```

### `pnpm release`

先校验，再发布：

```bash
pnpm run release:check
pnpm run sync:create-template-versions
changeset publish
```

## `sync:create-template-versions` 的作用

`@duxweb/uni-create` 在创建项目时，不是直接原样复制模板，而是会读取 `packages/create/package.json` 里的版本元数据，再注入到用户新项目的依赖中。

对应字段：

```json
{
  "duxTemplate": {
    "uniVersion": "0.1.0",
    "uniProVersion": "0.1.0"
  }
}
```

`sync:create-template-versions` 会把：

- `packages/uni/package.json` 的 `version`
- `packages/uni-pro/package.json` 的 `version`

同步回：

- `packages/create/package.json` 的 `duxTemplate.uniVersion`
- `packages/create/package.json` 的 `duxTemplate.uniProVersion`

不做这一步的话，`@duxweb/uni-create` 可能会继续生成旧版本依赖。

脚本位置：

- `scripts/sync-create-template-versions.mjs`

## 当前包发布内容

### `@duxweb/uni`

发布：

- `dist/`
- `bin/`
- `README.md`

### `@duxweb/uni-pro`

当前发布：

- `src/`
- `README.md`

### `@duxweb/uni-create`

发布：

- `bin/`
- `template/`
- `README.md`

## GitHub Actions

自动发版工作流：

- `.github/workflows/release.yml`

需要在仓库 Secrets 中配置：

- `NPM_TOKEN`

工作流会在 `main` 分支 push 后运行，并通过 `changesets/action` 处理版本 PR 和 npm 发布。
