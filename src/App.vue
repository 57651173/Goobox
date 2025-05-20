<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DownOutlined, SettingOutlined, GlobalOutlined } from '@ant-design/icons-vue'
import useConfig from './config/useConfig'
import { useHead } from '@vueuse/head'
import ThemeToggle from './components/ThemeToggle.vue'

const { t, locale } = useI18n()
const route = useRoute()
const { config } = useConfig()

// 设置页面元数据
useHead({
  title: computed(() => t('app.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('app.description')),
    },
    {
      name: 'keywords',
      content: '集装箱装载, 货物优化, 3D模拟, Goobox'
    }
  ],
})

// 根据当前路径获取菜单选中项
const getMenuKeyFromPath = (path) => {
  if (path === '/') return '1'
  if (path.startsWith('/container')) return '2'
  if (path.startsWith('/about')) return '3'
  if (path.startsWith('/settings')) return '4'
  return '1' // 默认选中首页
}

// 菜单选中项使用计算属性，直接根据当前路由计算
const selectedKeys = computed(() => {
  return [getMenuKeyFromPath(route.path)]
})

// 返回顶部功能
const showBackToTop = ref(false)

// 防止语言切换导致菜单收缩的标志
const isChangingLanguage = ref(false)

// 切换到指定语言
const changeLanguage = (lang) => {
  if (locale.value === lang) return
  
  // 设置切换标志，防止菜单状态变化
  isChangingLanguage.value = true
  
  // 切换语言
  locale.value = lang
  localStorage.setItem('locale', lang)
  
  // 显示切换成功的消息通知
  const langName = languages.find(l => l.code === lang)?.name || lang
  
  // 使用Ant Design Vue的消息通知组件
  window.$message?.success?.(
    `${t('common.languageChanged')}: ${langName}`,
    2  // 显示2秒
  )
  
  // 延迟重置标志，确保DOM已更新
  setTimeout(() => {
    isChangingLanguage.value = false
  }, 300)
}

// 语言配置
const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

// 获取当前语言对象
const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === locale.value) || languages[0]
})

// 返回顶部函数
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 滚动检测函数
const checkScroll = () => {
  showBackToTop.value = window.scrollY > 100
}

// 监听路由变化来滚动到顶部
watch(() => route.fullPath, () => {
  // 路由变化时自动滚动到顶部
  scrollToTop()
}, { immediate: true })

onMounted(() => {
  // 添加滚动监听
  window.addEventListener('scroll', checkScroll)
  checkScroll() // 初始检查
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', checkScroll)
})

// 判断当前是否为登录/注册页
const hideFooter = computed(() => {
  // 假设登录页路由为 /auth 或 /login，注册页为 /register
  // 你可以根据实际路由调整
  return ['/auth', '/login', '/register','/container'].includes(route.path);
});
</script>

<template>
  <a-layout class="layout">
    <a-layout-header class="header" :class="{ 'header-fixed': config.ui.layout.headerFixed }">
      <div class="header-content" :style="{ maxWidth: `${config.ui.layout.maxContentWidth}px` }">
        <div class="logo logo-box">
          <img src="./assets/images/logo.png" :alt="t('app.title')">
        </div>
        <a-menu
          mode="horizontal"
          theme="dark"
          :selectedKeys="selectedKeys"
          :style="{ lineHeight: '64px' }"
          :class="{ 'menu-with-transition': !isChangingLanguage }"
        >
          <a-menu-item key="1">
            <router-link to="/">{{ t('app.menu.home') }}</router-link>
          </a-menu-item>
          <a-menu-item key="2">
            <router-link to="/container">{{ t('app.menu.container') }}</router-link>
          </a-menu-item>
          <a-menu-item key="3">
            <router-link to="/about">{{ t('app.menu.about') }}</router-link>
          </a-menu-item>
        </a-menu>
        <div class="header-actions">
          <ThemeToggle v-if="config.ui.themes" />
          <div class="language-switch">
            <a-dropdown :trigger="['click']" :destroyPopupOnHide="true" placement="bottomRight" @openChange="(visible) => visible || $event.stopPropagation()">
              <a-button type="text" class="language-button">
                <GlobalOutlined class="language-icon" />
                <span class="flag-icon">{{ currentLanguage.flag }}</span>
                <span class="language-name">{{ currentLanguage.name }}</span>
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu class="language-menu">
                  <a-menu-item v-for="lang in languages" :key="lang.code" @click="changeLanguage(lang.code)"
                    :class="{ 'active-language': lang.code === locale }">
                    <div class="language-item">
                    <span class="flag-icon">{{ lang.flag }}</span>
                    <span class="language-name">{{ lang.name }}</span>
                      <a-tag v-if="lang.code === locale" color="success" size="small">{{ t('common.current') }}</a-tag>
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
    </a-layout-header>
    <a-layout-content class="content" :class="{ 'content-fixed-header': config.ui.layout.headerFixed }">
      <RouterView />
    </a-layout-content>
    <a-layout-footer v-if="!hideFooter" class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="./assets/images/logo.png" alt="Goobox Logo" height="40">
        </div>
        <div class="footer-links">
          <a href="/">{{ t('app.menu.home') }}</a>
          <a href="/container">{{ t('app.menu.container') }}</a>
          <a href="/about">{{ t('app.menu.about') }}</a>
        </div>
        <div class="footer-language">
          <span>{{ t('app.language') }}: </span>
          <a-select :value="locale" style="width: 120px" @change="changeLanguage">
            <a-select-option v-for="lang in languages" :key="lang.code">
              {{ lang.flag }} {{ lang.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="footer-copyright">
          {{ t('app.footer') }}
        </div>
      </div>
    </a-layout-footer>
    
    <!-- 全局返回顶部按钮 -->
    <div 
      class="global-back-to-top" 
      v-show="showBackToTop && config.ui.layout.showBackToTop" 
      @click="scrollToTop"
    >
      <div class="back-to-top-inner">
        <div class="back-to-top-arrow">↑</div>
        <div class="back-to-top-text">{{ t('common.backToTop') }}</div>
      </div>
    </div>
  </a-layout>
</template>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

#app {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

.layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.header {
  padding: 0;
  width: 100%;
  z-index: var(--z-index-fixed);
  box-shadow: var(--shadow-md);
  background-color: var(--bg-header) !important;
}

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.header-content {
  margin: 0 auto;
  padding: 0 var(--spacing-5);
  display: flex;
  align-items: center;
}

.logo {
  color: white;
  font-size: var(--font-size-lg);
  font-weight: bold;
  margin-right: 30px;
  white-space: nowrap;
}

.logo-box{
  height: 60px;
  img{
    height: 100%;
    opacity: 0.8;
    transition: opacity var(--transition-fast);
    &:hover {
      opacity: 1;
    }
  }
}

/* 确保菜单展开状态保持稳定 */
.ant-menu-horizontal {
  min-width: 300px;
  flex: 1;
  white-space: nowrap;
  background-color: transparent !important;
  border-bottom: none !important;
}

.ant-menu-item-selected {
  color: white !important;
  background-color: var(--primary-color) !important;
  border-radius: var(--border-radius-md) !important;
}

/* 只有在非语言切换状态下才使用过渡效果 */
.menu-with-transition {
  transition: all var(--transition-normal);
}

.ant-menu-horizontal > .ant-menu-item {
  /* 防止菜单项在语言切换时发生位移 */
  transition: background-color var(--transition-fast), color var(--transition-fast);
  border-radius: var(--border-radius-md);
  margin: 0 var(--spacing-2);
}

.header-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.language-switch {
  /* 避免干扰其他菜单元素 */
  position: relative;
  z-index: var(--z-index-dropdown);
}

.language-button {
  color: white;
  display: flex;
  align-items: center;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-3);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
}

.language-icon {
  margin-right: var(--spacing-2);
  font-size: var(--font-size-base);
}

.flag-icon {
  margin-right: var(--spacing-1);
  font-size: var(--font-size-base);
}

.language-name {
  margin-right: var(--spacing-1);
  font-size: var(--font-size-base);
}

.language-menu {
  min-width: 160px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.language-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) 0;
}

.active-language {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 0;
}

.content-fixed-header {
  padding-top: 64px;
}

.footer {
  padding: var(--spacing-8) 0;
  background-color: var(--bg-footer);
  color: var(--text-secondary);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
}

.footer-logo {
  margin-bottom: var(--spacing-4);
}

.footer-links {
  display: flex;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-4);
  
  a {
    color: var(--text-secondary);
    font-weight: 500;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.footer-language {
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.footer-copyright {
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

/* 返回顶部按钮样式 */
.global-back-to-top {
  position: fixed;
  bottom: 50px;
  right: 50px;
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-full);
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 999;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-fast);
}

.back-to-top-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.back-to-top-arrow {
  font-size: var(--font-size-xl);
  font-weight: bold;
  line-height: 1;
}

.back-to-top-text {
  font-size: var(--font-size-xs);
  margin-top: 2px;
}

.global-back-to-top:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 var(--spacing-3);
  }
  
  .logo {
    margin-right: var(--spacing-3);
    font-size: var(--font-size-base);
  }
  
  .language-name {
    display: none;
  }
  
  .footer-content {
    padding: 0 var(--spacing-4);
  }
  
  .footer-links {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: center;
  }
  
  .global-back-to-top {
    bottom: 30px;
    right: 30px;
    width: 40px;
    height: 40px;
  }
  
  .back-to-top-text {
    display: none;
  }
  
  .header-actions {
    gap: var(--spacing-1);
  }
}
</style>
