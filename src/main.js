import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入 Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
// 导入Ant Design样式修复
import './assets/ant-fixes.css'

// 导入 Ant Design Icons (全局注册常用图标)
import {
  AimOutlined,
  BorderOutlined,
  CameraOutlined,
  GithubOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  DownOutlined,
  CreditCardOutlined,
  WalletOutlined,
  SettingOutlined,
  GlobalOutlined,
  SkinOutlined,
  ToolOutlined
} from '@ant-design/icons-vue'

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
  messages: { en, zh, de, es, ja }
})

const app = createApp(App)

// 全局注册配置
app.provide('config', config)

app.use(router)
app.use(Antd)
app.use(i18n)

// 全局注册常用图标组件
app.component('BorderOutlined', BorderOutlined)
app.component('AimOutlined', AimOutlined)
app.component('GithubOutlined', GithubOutlined)
app.component('CheckCircleOutlined', CheckCircleOutlined)
app.component('DollarOutlined', DollarOutlined)
app.component('DownOutlined', DownOutlined)
app.component('CreditCardOutlined', CreditCardOutlined)
app.component('WalletOutlined', WalletOutlined)
app.component('SettingOutlined', SettingOutlined)
app.component('GlobalOutlined', GlobalOutlined)
app.component('SkinOutlined', SkinOutlined)
app.component('ToolOutlined', ToolOutlined)

app.mount('#app')
