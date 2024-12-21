import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const outDir = process.env.BUILD_ENV === 'local'
  ? '/mnt/c/Users/dustin/.glzr/zebar/whaleybar-build'
  : undefined

export const createSchemaAliases = async () => {
  const files = await glob('../server/modules/**/*.schema.ts')

  return files.reduce((aliases, filePath) => {
    const aliasName = path.parse(filePath).name
    const url = new URL(filePath, import.meta.url)

    aliases[`$schemas/${aliasName}`] = fileURLToPath(url)

    return aliases
  }, {})
}

export default defineConfig(async () => {
  const schemaAliases = await createSchemaAliases()

  return {
    build: {
      outDir,
      sourcemap: !!process.env.DEV, // Ensure sourcemap is a boolean
    },
    plugins: [
      vue(),
      vueJsx(),
      viteSingleFile(),
    ],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
        $: fileURLToPath(new URL('..', import.meta.url)),
        ...schemaAliases,
      },
      // Ensure the same instance of zod is used everywhere it's imported
      dedupe: ['zod'],
    },
    server: {
      port: 4200,
    },
  }
})
