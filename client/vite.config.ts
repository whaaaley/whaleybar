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
    sourcemap: true,
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
      $models: fileURLToPath(new URL('../server/models', import.meta.url)),
    },
    // Dedupe ensures the same instance of zod is used everywhere it's imported
    // in the build
    dedupe: ['zod'],
  },
  server: {
    port: 4200,
  },
})
