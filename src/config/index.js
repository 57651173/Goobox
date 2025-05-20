/**
 * 系统全局配置文件
 * 用于集中管理系统配置项，支持不同环境配置
 */

// 基础配置，所有环境通用
const baseConfig = {
  // 应用信息
  app: {
    name: 'Goobox Container Loading',
    version: '1.0.0',
  },
  
  // UI配置
  ui: {
    themes: false,
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#10b981',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      infoColor: '#3b82f6',
      borderRadius: 8,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      darkMode: false,
      animation: true,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    },
    layout: {
      showBackToTop: true,
      headerFixed: true,
      maxContentWidth: 1600,
      containerPadding: '24px',
      cardBorderRadius: '12px',
    }
  },
  
  // 国际化配置
  i18n: {
    defaultLocale: 'en',
    availableLocales: ['zh', 'en', 'de', 'es', 'ja'],
    fallbackLocale: 'en',
    persistLocale: true,
    autoDetect: true,
    showLocaleName: true,
    showLocaleFlag: true,
  },
  
  // API配置
  api: {
    baseURL: '/api',
    timeout: 10000,
    retry: 2,
    mockEnabled: process.env.NODE_ENV !== 'production',
  },
  
  // 功能配置
  features: {
    containerRegister: false,
    containerCalculator: {
      enabled: true,
      maxItems: 100,
      allowCustomDimensions: true,
      loadingTimeout: 180,
    },
  },
}

// 环境特定配置
const envConfigs = {
  development: {
    api: {
      baseURL: '/dev-api',
      mockEnabled: true,
    },
    debug: true,
  },
  
  production: {
    api: {
      baseURL: '/api',
      mockEnabled: false,
    },
    debug: false,
  },
  
  test: {
    api: {
      baseURL: '/test-api',
      mockEnabled: true,
    },
    debug: true,
  }
}

// 获取当前环境
const env = import.meta.env.MODE || 'development'

// 合并基础配置与当前环境配置
const config = {
  ...baseConfig,
  ...(envConfigs[env] || {}),
  // 添加配置工具方法
  isDev: env === 'development',
  isProd: env === 'production',
  isTest: env === 'test',
  env,
}

export default config 