import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')//路径别名
    }
  },
  optimizeDeps: {
    include: ['date-fns/format'] // 显式包含依赖
  },
  server: {
    port: 3001,
    strictPort: true, // 如果端口被占用，则直接退出
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.svg'],//这些后缀文件作为静态资源
  publicDir: 'public',//公共目录
  build: {
    assetsDir: 'assets',//静态资源目录
    outDir: 'dist',//输出目录
    assetsInlineLimit: 4096//静态资源内联限制
  }
})