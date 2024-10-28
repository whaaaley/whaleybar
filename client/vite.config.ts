import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 4200,
  },
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      include: [/\.js$/, /\.jsx$/, /\.ts$/, /\.tsx$/, /\.vue$/],
      imports: [
        'vue',
        'vue-router',
        { 'class-variance-authority': ['cva'] },
        { from: 'class-variance-authority', type: true, imports: ['VariantProps'] },
      ],
      dirs: ['src/composables'],
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
    }),
    Components({
      extensions: ['js', 'jsx', 'ts', 'tsx', 'vue'],
      include: [/\.js$/, /\.jsx$/, /\.ts$/, /\.tsx$/, /\.vue$/],
      dirs: ['src/components'],
    }),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
