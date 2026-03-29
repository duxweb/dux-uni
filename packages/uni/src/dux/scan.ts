import type { Expression, ObjectExpression, Statement } from '@babel/types'
import type { UniPageMeta } from '../types'
import type { DuxConfig, DuxPageMeta } from './types.ts'
import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { parse } from '@babel/parser'
import { parse as parseSFC } from '@vue/compiler-sfc'
import fg from 'fast-glob'

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function stripExt(path: string) {
  return path.replace(/\.(vue|nvue|uvue)$/u, '')
}

function deriveModuleFromPath(path: string) {
  const segments = normalizePath(path).split('/').filter(Boolean)
  if (segments[0] === 'pages' && segments[1]) {
    return segments[1]
  }
  return 'app'
}

function derivePagePath(filePath: string, root: string) {
  const relativePath = stripExt(relative(root, filePath)).replace(/\\/g, '/')
  if (relativePath.startsWith('modules/')) {
    const [, moduleName, , ...rest] = relativePath.split('/')
    return normalizePath(`pages/${moduleName}/${rest.join('/')}`)
  }
  return normalizePath(relativePath)
}

function derivePageName(pagePath: string) {
  const segments = normalizePath(pagePath).split('/').filter(Boolean)
  if (segments[0] === 'pages' && segments[1]) {
    const moduleName = segments[1]
    const pageSegments = segments.slice(2)
    return `${moduleName}.${(pageSegments.length ? pageSegments : ['index']).join('.')}`
  }
  return segments.join('.') || 'index'
}

function readDefineObjectArgument(code: string, calleeName: string) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  })

  for (const statement of ast.program.body) {
    const expression = getDefineObjectArgument(statement, calleeName)
    if (expression) {
      return expression
    }
  }
  return undefined
}

function getDefineObjectArgument(statement: Statement, calleeName: string) {
  const expression = statement.type === 'ExpressionStatement'
    ? statement.expression
    : statement.type === 'ExportDefaultDeclaration'
      ? statement.declaration
      : statement.type === 'VariableDeclaration'
        ? statement.declarations[0]?.init
        : statement.type === 'ExportNamedDeclaration' && statement.declaration?.type === 'VariableDeclaration'
          ? statement.declaration.declarations[0]?.init
          : undefined
  if (!expression) {
    return undefined
  }
  if (expression.type !== 'CallExpression') {
    return undefined
  }
  if (expression.callee.type !== 'Identifier' || expression.callee.name !== calleeName) {
    return undefined
  }
  const [argument] = expression.arguments
  if (!argument || argument.type !== 'ObjectExpression') {
    return undefined
  }
  return argument
}

function parseLiteral(node: Expression): unknown {
  switch (node.type) {
    case 'StringLiteral':
    case 'BooleanLiteral':
    case 'NumericLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'TemplateLiteral':
      return node.expressions.length === 0 ? node.quasis[0]?.value.cooked || '' : undefined
    case 'ArrayExpression':
      return node.elements.map((item) => {
        if (!item || item.type === 'SpreadElement') {
          return undefined
        }
        return parseLiteral(item)
      })
    case 'ObjectExpression':
      return parseObject(node)
    case 'UnaryExpression':
      if (node.operator === '-') {
        const value = parseLiteral(node.argument)
        return typeof value === 'number' ? -value : undefined
      }
      return undefined
    default:
      return undefined
  }
}

function parseObject(node: ObjectExpression) {
  const output: Record<string, unknown> = {}
  node.properties.forEach((property) => {
    if (property.type !== 'ObjectProperty' || property.computed) {
      return
    }
    const key = property.key.type === 'Identifier'
      ? property.key.name
      : property.key.type === 'StringLiteral'
        ? property.key.value
        : undefined
    if (!key) {
      return
    }
    const value = property.value.type === 'TSAsExpression'
      ? property.value.expression
      : property.value.type === 'TSSatisfiesExpression'
        ? property.value.expression
        : property.value
    output[key] = parseLiteral(value as Expression)
  })
  return output
}

function parsePageMeta(filePath: string) {
  const source = readFileSync(filePath, 'utf-8')
  const sfc = parseSFC(source, { filename: filePath }).descriptor
  const routeBlock = sfc.customBlocks.find(block => block.type === 'route' && (!block.lang || block.lang === 'json'))
  let routeMeta: Record<string, unknown> = {}

  if (routeBlock?.content.trim()) {
    try {
      routeMeta = JSON.parse(routeBlock.content) as Record<string, unknown>
    }
    catch (error) {
      throw new Error(`Invalid <route lang="json"> in ${filePath}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const script = sfc.scriptSetup?.content || sfc.script?.content
  if (!script) {
    return routeMeta
  }
  const statement = readDefineObjectArgument(script, 'definePage')
  if (!statement) {
    return routeMeta
  }
  return {
    ...(parseObject(statement) as Record<string, unknown>),
    ...routeMeta,
  }
}

export function parseDuxConfigSync(filePath: string) {
  const source = readFileSync(filePath, 'utf-8')
  const statement = readDefineObjectArgument(source, 'defineDuxConfig')
  if (!statement) {
    throw new Error(`Missing defineDuxConfig() in ${filePath}`)
  }

  const config = parseObject(statement) as Partial<DuxConfig>
  return {
    ...config,
    modules: [],
  } as DuxConfig
}

function uniquePages(pages: DuxPageMeta[]) {
  const pageMap = new Map<string, DuxPageMeta>()
  pages.forEach((page) => {
    pageMap.set(normalizePath(page.path), {
      ...page,
      path: normalizePath(page.path),
    })
  })
  return [...pageMap.values()]
}

function deriveModuleNameFromEntry(filePath: string, root: string) {
  const relativePath = relative(root, filePath).replace(/\\/g, '/')
  const matched = relativePath.match(/^modules\/([^/]+)\/index\.ts$/u)
  if (!matched) {
    throw new Error(`Unsupported module entry path: ${relativePath}`)
  }
  return matched[1]
}

function createModuleExportName(name: string) {
  const camelName = name
    .replace(/(^\w)|[-_/](\w)/g, (_, first: string, nested: string) => (first || nested).toUpperCase())
  return `${camelName.charAt(0).toLowerCase()}${camelName.slice(1)}Module`
}

export function scanDuxPagesSync(input: {
  cwd?: string
  patterns?: string[]
  extraPages?: UniPageMeta[]
  modules?: DuxScannedModule[]
}) {
  const cwd = input.cwd || process.cwd()
  const patterns = input.patterns || ['src/pages/**/*.{vue,nvue,uvue}']
  const moduleMap = new Map((input.modules || []).map(module => [module.name, module]))
  const files = fg.sync(patterns, {
    cwd,
    absolute: true,
    onlyFiles: true,
  })

  const pages = files.map((filePath) => {
    const meta = parsePageMeta(filePath)
    const pagePath = typeof meta.path === 'string' && meta.path
      ? normalizePath(meta.path)
      : derivePagePath(filePath, resolve(cwd, 'src'))
    const moduleName = typeof meta.module === 'string' && meta.module
      ? meta.module
      : deriveModuleFromPath(pagePath)
    const module = moduleMap.get(moduleName)

    return {
      ...meta,
      path: pagePath,
      module: moduleName,
      layout: typeof meta.layout === 'string' && meta.layout
        ? meta.layout
        : module?.defaultLayout,
      name: String(meta.name || derivePageName(pagePath)),
    } as DuxPageMeta
  })

  return uniquePages([
    ...pages,
    ...((input.extraPages || []) as DuxPageMeta[]),
  ])
}

export interface DuxScannedModule {
  name: string
  exportName: string
  importPath: string
  filePath: string
  layouts: Record<string, string>
  defaultLayout?: string
}

export interface DuxScannedOverlayComponent {
  key: string
  name: string
  importName: string
  importPath: string
  filePath: string
}

function createOverlayImportName(name: string) {
  return name
    .replace(/(^\w)|[-_/](\w)/g, (_, first: string, nested: string) => (first || nested).toUpperCase())
    .replace(/[^A-Za-z0-9_]/g, '')
}

function toKebabCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

function parseModuleMeta(filePath: string) {
  const source = readFileSync(filePath, 'utf-8')
  const statement = readDefineObjectArgument(source, 'defineUniModule')
  if (!statement) {
    return {
      layouts: {},
      defaultLayout: undefined,
    }
  }
  const parsed = parseObject(statement) as Record<string, unknown>
  return {
    layouts: typeof parsed.layouts === 'object' && parsed.layouts
      ? parsed.layouts as Record<string, string>
      : {},
    defaultLayout: typeof parsed.defaultLayout === 'string'
      ? parsed.defaultLayout
      : undefined,
  }
}

export function scanDuxModulesSync(input: {
  cwd?: string
  patterns?: string[]
}) {
  const cwd = input.cwd || process.cwd()
  const patterns = input.patterns || ['src/modules/*/index.ts']
  const root = resolve(cwd, 'src')
  const files = fg.sync(patterns, {
    cwd,
    absolute: true,
    onlyFiles: true,
  })

  const modules = files.map((filePath) => {
    const name = deriveModuleNameFromEntry(filePath, root)
    const meta = parseModuleMeta(filePath)
    return {
      name,
      exportName: createModuleExportName(name),
      importPath: `@/modules/${name}/index`,
      filePath,
      layouts: meta.layouts,
      defaultLayout: meta.defaultLayout,
    } satisfies DuxScannedModule
  })

  return modules.sort((a, b) => a.name.localeCompare(b.name))
}

export function scanDuxOverlayComponentsSync(input: {
  cwd?: string
  patterns?: string[]
}) {
  const cwd = input.cwd || process.cwd()
  const patterns = input.patterns || ['src/modules/*/components/**/*Overlay.vue']
  const root = resolve(cwd, 'src')
  const files = fg.sync(patterns, {
    cwd,
    absolute: true,
    onlyFiles: true,
  })

  const components = files.map((filePath) => {
    const relativePath = relative(root, filePath).replace(/\\/g, '/')
    const name = relativePath.split('/').pop()?.replace(/\.vue$/u, '') || 'OverlayComponent'

    return {
      key: toKebabCase(name),
      name,
      importName: createOverlayImportName(name),
      importPath: `@/${relativePath}`,
      filePath,
    } satisfies DuxScannedOverlayComponent
  })

  return components.sort((a, b) => a.key.localeCompare(b.key))
}
