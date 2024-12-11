import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const outDir = process.env.NODE_ENV === 'development'
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
    },
  },
  server: {
    port: 4200,
  },
})
