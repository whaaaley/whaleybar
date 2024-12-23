import fs from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const outDir = process.env.BUILD_ENV === 'local'
  ? '/mnt/c/Users/dustin/.glzr/zebar/whaleybar-build'
  : undefined

export default defineConfig({
  build: {
    outDir,
    sourcemap: Boolean(process.env.DEV),
  },
  plugins: [
    vue(),
    vueJsx(),
    viteSingleFile(),
    // Plugin to emit whaleybar.zebar.json alongside the bundled app.
    // This config file needs to be separate since it's loaded at runtime
    // by the Zebar platform to configure the app instance and its features.
    {
      name: 'zebar-config',
      generateBundle: async (_options, bundle) => {
        bundle['whaleybar.zebar.json'] = {
          type: 'asset',
          fileName: 'whaleybar.zebar.json',
          name: 'whaleybar.zebar.json',
          needsCodeReference: false,
          source: await fs.readFile('./whaleybar.zebar.json', 'utf-8'),
          names: [],
          originalFileName: 'whaleybar.zebar.json',
          originalFileNames: ['whaleybar.zebar.json'],
        }
      },
    },
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      $: fileURLToPath(new URL('..', import.meta.url)),
      $schemas: fileURLToPath(new URL('../server/src/modules/schemas.ts', import.meta.url)),
    },
    // Ensure the same instance of zod is used everywhere it's imported
    dedupe: ['zod'],
  },
  server: {
    port: 4200,
  },
})
