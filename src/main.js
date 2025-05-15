import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入 Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
// 导入Ant Design样式修复
import './assets/ant-fixes.css'

// 导入 Vue I18n
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'

// 获取默认语言：先从本地存储获取，再从浏览器语言获取，最后默认英语
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0]
  return ['zh', 'en', 'de', 'es'].includes(browserLang) ? browserLang : 'en'
}

const savedLocale = localStorage.getItem('locale') || getBrowserLanguage()

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, zh, de, es }
})

const app = createApp(App)

app.use(router)
app.use(Antd)
app.use(i18n)

app.mount('#app')
