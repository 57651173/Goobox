<script setup>
import { ref, watch, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// 菜单选中项
const selectedKeys = ref(['1'])

// 切换到指定语言
const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

// 语言配置
const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

// 获取当前语言对象
const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === locale.value) || languages[0]
})
</script>

<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="header-content">
        <div class="logo">{{ t('app.title') }}</div>
        <a-menu
          mode="horizontal"
          theme="dark"
          :selectedKeys="selectedKeys"
          @select="({ selectedKeys: keys }) => selectedKeys = keys"
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
          <a-dropdown :trigger="['click']">
            <a-button type="link" class="language-button">
              <span class="flag-icon">{{ currentLanguage.flag }}</span>
              <span class="language-name">{{ currentLanguage.name }}</span>
              <a-icon type="down" />
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
    <a-layout-content class="content">
      <RouterView />
    </a-layout-content>
    <a-layout-footer class="footer">
      {{ t('app.footer') }}
    </a-layout-footer>
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

@media (min-width: 1600px) {
  .header-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 40px;
  }
}

.logo {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-right: 30px;
  white-space: nowrap;
}

.language-switch {
  margin-left: auto;
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
  margin-top: 64px; /* 导航栏高度 */
}

.footer {
  text-align: center;
  width: 100%;
  padding: 20px 0;
  background-color: #fff !important;
}

/* 使用深度选择器修复Ant Design布局 */
:deep(.ant-layout),
:deep(.ant-layout-header),
:deep(.ant-layout-content),
:deep(.ant-layout-footer) {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
}

:deep(.ant-layout) {
  min-height: 100vh !important;
}

:deep(.ant-row) {
  width: 100% !important;
}

@media (max-width: 768px) {
  .logo {
    font-size: 16px;
    margin-right: 15px;
  }
  
  .header-content {
    padding: 0 10px;
  }
  
  .language-name {
    display: none;
  }
}
</style>
