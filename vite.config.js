import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemapPlugin from 'vite-plugin-sitemap'
import path from 'path'

// 网站域名，应该根据实际部署环境修改
const SITE_URL = 'http://goobox.bangzone.net'

// 网站路由路径，用于生成sitemap
const routes = [
  '/',
  '/container',
  '/about',
  '/settings',
  '/auth'
]

// https://vite.dev/config/
export default defineConfig({
  base: '/', // 添加基础公共路径，默认为'/'，确保资源正确引用
  plugins: [
    vue(),
    vueDevTools(),
    sitemapPlugin({ 
      hostname: SITE_URL,
      lastmod: new Date().toISOString(),
      routes,
      // 为每个路由生成多语言链接
      generateRobotsTxt: true, // 同时生成robots.txt
      robots: [
        { 
          userAgent: '*',
          allow: '/',
          disallow: ['/auth', '/settings'], // 不索引登录和设置页面
          sitemap: `${SITE_URL}/sitemap.xml` // 指向sitemap
        }
      ],
      // 多语言sitemap设置
      sitemapXslUrl: '/sitemap.xsl',
      exclude: [],
      changefreq: 'weekly',
      priority: 0.8,
      lastmodDateOnly: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 使用新的Sass API解决弃用警告
        quietDeps: true,
        sassOptions: {
          outputStyle: 'expanded'
        }
      }
    }
  }
})
