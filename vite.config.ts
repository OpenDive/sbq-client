import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import mix from 'vite-plugin-mix'
import mix$ from 'vite-plugin-mix'

const mix = mix$.default ?? mix$

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mix({
      handler: './api.js',
    }),
  ],
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: resolve(__dirname, 'index.html'),
  //       nested: resolve(__dirname, 'nested/index.html'),
  //     },
  //   },
  // },
})
