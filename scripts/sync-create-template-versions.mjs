import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(currentDir, '..')
const uniPackagePath = resolve(rootDir, 'packages/uni/package.json')
const uniProPackagePath = resolve(rootDir, 'packages/uni-pro/package.json')
const createPackagePath = resolve(rootDir, 'packages/create/package.json')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

const uniPackage = readJson(uniPackagePath)
const uniProPackage = readJson(uniProPackagePath)
const createPackage = readJson(createPackagePath)

createPackage.duxTemplate = {
  ...(createPackage.duxTemplate || {}),
  uniVersion: uniPackage.version,
  uniProVersion: uniProPackage.version,
}

writeJson(createPackagePath, createPackage)

console.log(
  [
    'Synced create template versions:',
    `- @duxweb/uni => ${uniPackage.version}`,
    `- @duxweb/uni-pro => ${uniProPackage.version}`,
  ].join('\n'),
)
