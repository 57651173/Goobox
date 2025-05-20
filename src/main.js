import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia' // 导入 Pinia
import App from './App.vue'
import router from './router'
import { createHead } from '@vueuse/head' // 导入 createHead

// 导入 Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
// 导入Ant Design样式修复
import './assets/ant-fixes.css'

// 导入自定义组件
import GButton from './components/GButton.vue'

// 导入 Ant Design Icons 并创建批量注册函数
import * as AntIcons from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'; // 导入消息组件

// 导入全局配置
import config from './config'

// 导入 Vue I18n
import { createI18n } from 'vue-i18n'

// 获取默认语言：先从本地存储获取，再从浏览器语言获取，最后默认英语
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0]
  return config.i18n.availableLocales.includes(browserLang) ? browserLang : config.i18n.defaultLocale
}

const savedLocale = localStorage.getItem('locale') || getBrowserLanguage()


async function loadLocaleMessages() {
  
  const locales = import.meta.glob('./locales/*.json', { eager: true });
  const messages = {};
  
  for (const path in locales) {
    const matched = path.match(/([A-Za-z0-9-_]+)\.json$/i);
    if (matched && matched.length > 1) {
      const localeKey = matched[1];
      // 直接访问导入的模块内容，不再使用异步加载
      const moduleContent = locales[path].default || locales[path];
      messages[localeKey] = moduleContent;
      // 添加调试日志
      // console.log(`加载语言: ${localeKey}`, '键数量:', Object.keys(moduleContent).length);
    }
  }
  // console.log('语言文件加载完成.');
  return messages;
}

// 在原有 setupI18n 函数前添加备用翻译数据
const fallbackTranslations = {
  zh: {
    common: {
      backToTop: '返回顶部',
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      apply: '应用',
      reset: '重置',
      goBack: '返回'
    }
  },
  en: {
    common: {
      backToTop: 'Back to Top',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      apply: 'Apply',
      reset: 'Reset',
      goBack: 'Go Back'
    }
  }
};

async function setupI18n() {
  const messages = await loadLocaleMessages();
  
  // 合并备用翻译数据
  for (const locale in fallbackTranslations) {
    if (!messages[locale]) {
      messages[locale] = {};
    }
    
    // 深度合并，确保备用翻译不覆盖已存在的项
    messages[locale] = deepMerge(messages[locale], fallbackTranslations[locale]);
  }
  
  // // 添加日志输出最终结果中的特定翻译
  // if (messages.zh && messages.zh.common) {
  //   console.log('最终合并后的zh.common.backToTop:', messages.zh.common.backToTop);
  // }
  
  const i18n = createI18n({
    legacy: false,
    locale: savedLocale, // 使用之前获取的 savedLocale
    fallbackLocale: config.i18n.fallbackLocale,
    messages,
    missing: (locale, key) => { 
      // 只在开发环境显示警告
      if (import.meta.env.DEV) {
        console.warn(`[i18n] 缺少翻译: ${locale}.${key}`)
      }
      
      // 检查错误类型并尝试合理处理
      if (key.includes('common.backToTop')) {
        // 针对特定的backToTop键提供硬编码的值
        if (locale === 'zh') return '返回顶部';
        if (locale === 'en') return 'Back to Top';
        if (locale === 'ja') return '上へ';
        if (locale === 'de') return 'Nach oben';
        if (locale === 'es') return 'Arriba';
      }
      
      // 生产环境中返回更友好的内容或空字符串
      if (import.meta.env.PROD) {
        // 仅对common命名空间的键返回空字符串，避免UI不友好
        if (key.startsWith('common.')) {
          return '';
        }
        
        // 对于其他键，返回最后一部分作为缺省值
        const parts = key.split('.');
        return parts[parts.length - 1] || '';
      }
      
      return key;
    },
    numberFormats: { // 保留 numberFormats
      'en': { percent: { style: 'percent', minimumFractionDigits: 2 } },
      'zh': { percent: { style: 'percent', minimumFractionDigits: 2 } },
      'ja': { percent: { style: 'percent', minimumFractionDigits: 2 } },
      'de': { percent: { style: 'percent', minimumFractionDigits: 2 } },
      'es': { percent: { style: 'percent', minimumFractionDigits: 2 } }
    },
    // 控制警告的展示
    silentTranslationWarn: import.meta.env.PROD, // 生产环境中静默翻译警告
    silentFallbackWarn: true, // 静默回退警告
  })
  return i18n
}

// 添加深度合并工具函数
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (!(key in target)) {
      // 只有在目标中不存在该键时才进行覆盖
      result[key] = source[key];
    }
  }
  
  return result;
}

// 异步初始化函数
async function initializeApp() {

  const app = createApp(App)
  const pinia = createPinia()
  const head = createHead()
  const i18n = await setupI18n() // 等待 i18n 配置完成

  // 全局注册自定义组件
  app.component('GButton', GButton)

  // 全局注册配置
  app.provide('config', config)

  // 将消息组件挂载到window，方便全局访问
  window.$message = message;

  // 添加全局错误处理
  app.config.errorHandler = (err, vm, info) => {
    console.error('全局错误:', err)
    console.info('错误信息:', info)
    
    const component = vm?.$options?.name || '未知组件'
    const stack = err.stack || '无堆栈信息'
    
    const errorDetails = {
      message: err.message,
      component,
      info,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      stack: stack.split('\\n').slice(0, 5).join('\\n') 
    }
    
    console.group('详细错误信息')
    console.error(JSON.stringify(errorDetails, null, 2))
    console.groupEnd()
    
    const currentLocale = i18n.global.locale.value // 使用正确的 i18n 实例
    const errorMessage = currentLocale === 'zh' 
      ? '应用发生错误，请刷新页面重试' 
      : 'An error occurred, please refresh the page'
    
    message.error(errorMessage)
  }

  // 利用插件批量注册所有图标组件
  app.use({
    install: (currentApp) => {
      for (const [key, component] of Object.entries(AntIcons)) {
        currentApp.component(key, component)
      }
      
      currentApp.config.globalProperties.$formatDate = (date, format = 'YYYY-MM-DD') => {
        if (!date) return ''
        const d = new Date(date)
        return format
          .replace('YYYY', d.getFullYear())
          .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
          .replace('DD', String(d.getDate()).padStart(2, '0'))
      }
      
      currentApp.config.globalProperties.$formatNumber = (num, options = {}) => {
        const { 
          decimals = 2, 
          format = 'decimal' 
        } = options
        
        const number = parseFloat(num)
        if (isNaN(number)) return '0'
        
        const currentLocale = i18n.global.locale.value // 使用正确的 i18n 实例
        
        try {
          if (format === 'percent') {
            return new Intl.NumberFormat(currentLocale, { 
              style: 'percent', 
              minimumFractionDigits: decimals 
            }).format(number/100)
          } else if (format === 'currency') {
            return new Intl.NumberFormat(currentLocale, { 
              style: 'currency', 
              currency: 'CNY', 
              minimumFractionDigits: decimals 
            }).format(number)
          } else {
            return new Intl.NumberFormat(currentLocale, { 
              minimumFractionDigits: decimals 
            }).format(number)
          }
        } catch (e) {
          console.warn('格式化数字失败:', e)
          return number.toFixed(decimals)
        }
      }
    }
  })

  // 使用路由和UI库
  app.use(router)
  app.use(Antd)
  app.use(i18n) // 使用异步加载后的 i18n 实例
  app.use(pinia)
  app.use(head)

  // 挂载应用
  app.mount('#app')

  console.timeEnd('应用初始化时间')

  // 开发环境提示
  if (import.meta.env.DEV) {
    console.log(
      '%cGoobox Container Loading Simulator - 开发模式',
      'color: #0984e3; font-size: 14px; font-weight: bold; padding: 4px 8px; background: #f1f2f6; border-radius: 4px;'
    )
    
    console.group('系统信息')
    console.log('浏览器: ' + navigator.userAgent)
    console.log('语言: ' + i18n.global.locale.value) // 使用正确的 i18n 实例
    console.log('分辨率: ' + window.screen.width + 'x' + window.screen.height)
    console.log('设备像素比: ' + window.devicePixelRatio)
    console.groupEnd()
  }
}

// 调用异步初始化函数
initializeApp().catch(error => {
  console.error("应用初始化失败:", error);
  // 可以在这里向用户显示一个全局的错误提示
  const rootElement = document.getElementById('app');
  if (rootElement) {
    rootElement.innerHTML = '<div style="text-align: center; padding: 50px; font-family: sans-serif; color: #cc0000;"><h3>应用加载失败</h3><p>请检查网络连接或稍后重试。</p></div>';
  }
});

// // 以下是被注释掉的旧的 loadLocaleMessages 和 setupI18n 函数，因为它们的功能已经合并到新的 setupI18n 中了
// async function loadLocaleMessages() {
//   const locales = import.meta.glob('./locales/*.json') // Vite-specific way to import multiple files
//   const messages = {}
//   for (const path in locales) {
//     const matched = path.match(/([A-Za-z0-9-_]+)\\.json$/i)
//     if (matched && matched.length > 1) {
//       const locale = matched[1]
//       messages[locale] = (await locales[path]()).default // Make sure to get .default
//     }
//   }
//   return messages
// }

// export async function setupI18n() {
//   const messages = await loadLocaleMessages()
//   const i18n = createI18n({
//     legacy: false, // Important for Vue 3
//     locale: localStorage.getItem('locale') || 'zh', // Default locale
//     fallbackLocale: 'en',
//     messages,
//     // silentTranslationWarn: true, // 可以临时打开看是否有其他警告
//     // missingWarn: false, // 临时关闭特定警告
//     // fallbackWarn: false, // 临时关闭特定警告
//   })
//   return i18n
// }
