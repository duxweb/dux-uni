import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { createUniAppViteConfig } from '../../scripts/vite/createUniAppViteConfig'

const rootDir = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(createUniAppViteConfig({
  appRoot: rootDir,
  port: 5174,
  withWotAlias: true,
}))
