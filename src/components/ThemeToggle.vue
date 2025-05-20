<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckOutlined } from '@ant-design/icons-vue';
import useConfig from '../config/useConfig';

const { t } = useI18n();
const { config, updateConfig } = useConfig();

// 当前是否为暗色模式
const isDarkMode = ref(false);

// 监听系统主题变化
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 初始设置
  if (localStorage.getItem('theme') === null) {
    isDarkMode.value = mediaQuery.matches;
    applyTheme();
  }
  
  // 监听变化
  mediaQuery.addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === null) {
      isDarkMode.value = e.matches;
      applyTheme();
    }
  });
};

// 应用主题
const applyTheme = () => {
  // 更新配置
  updateConfig('ui.theme.darkMode', isDarkMode.value);
  
  // 应用到HTML元素
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
  
  // 存储主题设置
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  applyTheme();
};

// 监听配置中的主题设置变化
watch(() => config.ui.theme.darkMode, (newVal) => {
  if (newVal !== isDarkMode.value) {
    isDarkMode.value = newVal;
    applyTheme();
  }
});

// 组件挂载时，从localStorage读取主题设置
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
    applyTheme();
  } else {
    watchSystemTheme();
  }
});
</script>

<template>
  <div class="theme-toggle">
    <a-tooltip :title="isDarkMode ? t('common.lightMode') : t('common.darkMode')">
      <a-button 
        type="text" 
        class="theme-toggle-button" 
        @click="toggleTheme"
        :class="{ 'dark': isDarkMode }"
      >
        <span v-if="!isDarkMode" class="theme-icon sun-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </span>
        <span v-else class="theme-icon moon-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </span>
      </a-button>
    </a-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  margin-left: var(--spacing-2);
}

.theme-toggle-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-white);
  border-radius: var(--border-radius-full);
  background-color: rgba(255, 255, 255, 0.1);
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: rotate(30deg);
  }
  
  &.dark {
    background-color: rgba(0, 0, 0, 0.2);
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
}

.theme-icon {
  font-size: 16px;
  line-height: 1;
  display: flex;
}

.sun-icon {
  color: #ffb100;
}

.moon-icon {
  color: #ffffff;
}
</style> 