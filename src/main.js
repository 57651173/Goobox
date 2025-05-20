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
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'
import ja from './locales/ja.json'

// 获取默认语言：先从本地存储获取，再从浏览器语言获取，最后默认英语
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0]
  return config.i18n.availableLocales.includes(browserLang) ? browserLang : config.i18n.defaultLocale
}

const savedLocale = localStorage.getItem('locale') || getBrowserLanguage()

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: config.i18n.fallbackLocale,
  messages: { en, zh, de, es, ja },
  // 添加缺失翻译的警告和回退处理
  missing: (locale, key) => {
    console.warn(`[i18n] 缺少翻译: ${locale}.${key}`)
    return key
  },
  // 添加日期和数字格式化功能
  numberFormats: {
    'en': { percent: { style: 'percent', minimumFractionDigits: 2 } },
    'zh': { percent: { style: 'percent', minimumFractionDigits: 2 } },
    'ja': { percent: { style: 'percent', minimumFractionDigits: 2 } },
    'de': { percent: { style: 'percent', minimumFractionDigits: 2 } },
    'es': { percent: { style: 'percent', minimumFractionDigits: 2 } }
  }
})

// 创建应用实例
const app = createApp(App)
const pinia = createPinia() // 创建 Pinia 实例
const head = createHead() // 创建 head 实例

// 全局注册自定义组件
app.component('GButton', GButton)

// 添加全局错误处理和性能监控
console.time('应用初始化时间')

// 全局注册配置
app.provide('config', config)

// 将消息组件挂载到window，方便全局访问
window.$message = message;

// 添加全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  console.info('错误信息:', info)
  
  // 获取更多错误上下文信息
  const component = vm?.$options?.name || '未知组件'
  const stack = err.stack || '无堆栈信息'
  
  // 格式化错误信息用于日志
  const errorDetails = {
    message: err.message,
    component,
    info,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    stack: stack.split('\n').slice(0, 5).join('\n') // 只记录前5行堆栈
  }
  
  // 日志输出到控制台
  console.group('详细错误信息')
  console.error(JSON.stringify(errorDetails, null, 2))
  console.groupEnd()
  
  // 展示用户友好的错误消息
  const locale = i18n.global.locale.value
  const errorMessage = locale === 'zh' 
    ? '应用发生错误，请刷新页面重试' 
    : 'An error occurred, please refresh the page'
  
  message.error(errorMessage)
  
  // 如果需要，这里可以添加错误上报服务
  // errorReportingService.report(errorDetails)
}

// 利用插件批量注册所有图标组件
app.use({
  install: (app) => {
    // 注册所有图标为全局组件
    for (const [key, component] of Object.entries(AntIcons)) {
      app.component(key, component)
    }
    
    // 添加全局属性
    app.config.globalProperties.$formatDate = (date, format = 'YYYY-MM-DD') => {
      // 简单日期格式化函数
      if (!date) return ''
      const d = new Date(date)
      return format
        .replace('YYYY', d.getFullYear())
        .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(d.getDate()).padStart(2, '0'))
    }
    
    // 添加数字格式化函数
    app.config.globalProperties.$formatNumber = (num, options = {}) => {
      const { 
        decimals = 2, 
        format = 'decimal' // 可选：decimal, percent, currency
      } = options
      
      // 确保输入是数字
      const number = parseFloat(num)
      if (isNaN(number)) return '0'
      
      const locale = i18n.global.locale.value
      
      try {
        if (format === 'percent') {
          return new Intl.NumberFormat(locale, { 
            style: 'percent', 
            minimumFractionDigits: decimals 
          }).format(number/100)
        } else if (format === 'currency') {
          return new Intl.NumberFormat(locale, { 
            style: 'currency', 
            currency: 'CNY', // 默认人民币，可根据需要调整
            minimumFractionDigits: decimals 
          }).format(number)
        } else {
          return new Intl.NumberFormat(locale, { 
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
app.use(i18n)
app.use(pinia) // 使用 Pinia
app.use(head) // 使用 head 插件

// 挂载应用
app.mount('#app')

// 性能标记 - 应用初始化完成
console.timeEnd('应用初始化时间')

// 开发环境提示
if (import.meta.env.DEV) {
  console.log(
    '%cGoobox Container Loading Simulator - 开发模式',
    'color: #0984e3; font-size: 14px; font-weight: bold; padding: 4px 8px; background: #f1f2f6; border-radius: 4px;'
  )
  
  // 记录系统信息
  console.group('系统信息')
  console.log('浏览器: ' + navigator.userAgent)
  console.log('语言: ' + i18n.global.locale.value)
  console.log('分辨率: ' + window.screen.width + 'x' + window.screen.height)
  console.log('设备像素比: ' + window.devicePixelRatio)
  console.groupEnd()
}
