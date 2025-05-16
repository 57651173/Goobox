<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DownOutlined, SettingOutlined } from '@ant-design/icons-vue'
import useConfig from './config/useConfig'

const { t, locale } = useI18n()
const route = useRoute()
const { config } = useConfig()

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
</script>

<template>
  <a-layout class="layout">
    <a-layout-header class="header" :class="{ 'header-fixed': config.ui.layout.headerFixed }">
      <div class="header-content" :style="{ maxWidth: `${config.ui.layout.maxContentWidth}px` }">
        <div class="logo">{{ t('app.title') }}</div>
        <a-menu
          mode="horizontal"
          theme="dark"
          :selectedKeys="selectedKeys"
          :style="{ lineHeight: '64px' }"
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
        <div class="language-switch">
          <a-dropdown :trigger="['click']" :destroyPopupOnHide="true" placement="bottomRight" @openChange="(visible) => visible || $event.stopPropagation()">
            <a-button type="link" class="language-button">
              <span class="flag-icon">{{ currentLanguage.flag }}</span>
              <span class="language-name">{{ currentLanguage.name }}</span>
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu class="language-menu">
                <a-menu-item v-for="lang in languages" :key="lang.code" @click="changeLanguage(lang.code)">
                  <span class="flag-icon">{{ lang.flag }}</span>
                  <span class="language-name">{{ lang.name }}</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>
    <a-layout-content class="content" :class="{ 'content-fixed-header': config.ui.layout.headerFixed }">
      <RouterView />
    </a-layout-content>
    <a-layout-footer class="footer">
      {{ t('app.footer') }}
    </a-layout-footer>
    
    <!-- 全局返回顶部按钮 -->
    <div 
      class="global-back-to-top" 
      v-show="showBackToTop && config.ui.layout.showBackToTop" 
      @click="scrollToTop"
      :style="{ 
        backgroundColor: config.ui.theme.primaryColor
      }"
    >
      <div class="back-to-top-inner">
        <div class="back-to-top-arrow">↑</div>
        <div class="back-to-top-text">顶部</div>
      </div>
    </div>
  </a-layout>
</template>

<style>

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
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.header-content {
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.logo {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-right: 30px;
  white-space: nowrap;
}

/* 确保菜单展开状态保持稳定 */
.ant-menu-horizontal {
  min-width: 300px;
  flex: 1;
  white-space: nowrap;
  /* 防止菜单项布局受到语言切换的影响 */
  transition: none;
}

.ant-menu-horizontal > .ant-menu-item {
  /* 防止菜单项在语言切换时发生位移 */
  transition: background-color 0.3s, color 0.3s;
}

.language-switch {
  margin-left: auto;
  /* 避免干扰其他菜单元素 */
  position: relative;
  z-index: 1001;
}

.language-button {
  color: white;
  display: flex;
  align-items: center;
  height: 40px;
}

.flag-icon {
  font-size: 18px;
  margin-right: 6px;
}

.language-name {
  margin-right: 6px;
}

.language-menu {
  min-width: 120px;
}

.content {
  padding: 0;
  background: #fff;
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

.content-fixed-header {
  margin-top: 64px; /* 导航栏高度 */
}

.footer {
  text-align: center;
  width: 100%;
  padding: 20px 0;
  background-color: #fff !important;
}

/* 全局返回顶部按钮样式 */
.global-back-to-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 9999;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.back-to-top-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  color: white;
}

.back-to-top-arrow {
  font-size: 24px;
  font-weight: bold;
}

.back-to-top-text {
  font-size: 12px;
  margin-top: -5px;
}

/* 动画过渡效果 */
.global-back-to-top:hover {
  transform: translateY(calc(var(--animation-enabled) * -5px));
  box-shadow: 0 calc(var(--animation-enabled) * 3px + 2px) calc(var(--animation-enabled) * 5px + 10px) rgba(0, 0, 0, 0.4);
}

/* 黑暗模式支持 */
.theme-dark {
  background-color: #141414 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}
</style>
