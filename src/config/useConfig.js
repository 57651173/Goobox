import { ref, reactive, watchEffect } from 'vue'
import defaultConfig from './index'

/**
 * 系统配置Hook
 * 用于在Vue组件中获取和更新配置
 * 
 * @param {Object} initialOverrides - 可选的初始配置覆盖
 * @returns {Object} 配置对象和工具函数
 */
export function useConfig(initialOverrides = {}) {
  // 创建本地响应式配置
  const config = reactive({
    ...defaultConfig,
    ...initialOverrides
  })
  
  // 配置是否已修改
  const isConfigModified = ref(false)
  
  // 原始配置备份，用于重置
  const originalConfig = { ...defaultConfig }
  
  /**
   * 更新配置
   * @param {String} path - 配置路径，如 'ui.theme.darkMode'
   * @param {Any} value - 新值
   */
  const updateConfig = (path, value) => {
    if (!path) return
    
    const parts = path.split('.')
    let current = config
    
    // 遍历路径直到倒数第二级
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }
    
    // 设置最后一级的值
    const lastPart = parts[parts.length - 1]
    current[lastPart] = value
    
    // 标记配置已修改
    isConfigModified.value = true
    
    // 保存到localStorage (可选)
    saveToLocalStorage()
  }
  
  /**
   * 获取指定路径的配置值
   * @param {String} path - 配置路径
   * @param {Any} defaultValue - 默认值
   * @returns {Any} 配置值
   */
  const getConfig = (path, defaultValue = undefined) => {
    if (!path) return config
    
    const parts = path.split('.')
    let current = config
    
    for (const part of parts) {
      if (current === undefined || current === null || !current[part]) {
        return defaultValue
      }
      current = current[part]
    }
    
    return current
  }
  
  /**
   * 重置配置到默认值
   * @param {String} path - 可选，指定要重置的配置路径
   */
  const resetConfig = (path) => {
    if (path) {
      const parts = path.split('.')
      let currentDefault = originalConfig
      let current = config
      
      // 遍历路径直到倒数第二级
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!currentDefault[part]) break
        
        currentDefault = currentDefault[part]
        current = current[part]
      }
      
      // 重置最后一级的值
      const lastPart = parts[parts.length - 1]
      if (currentDefault && lastPart in currentDefault) {
        current[lastPart] = currentDefault[lastPart]
      }
    } else {
      // 重置所有配置
      Object.keys(originalConfig).forEach(key => {
        config[key] = originalConfig[key]
      })
    }
    
    isConfigModified.value = false
    saveToLocalStorage()
  }
  
  /**
   * 将配置保存到localStorage
   */
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('app_config', JSON.stringify(config))
    } catch (error) {
      console.error('Failed to save config to localStorage:', error)
    }
  }
  
  /**
   * 从localStorage加载配置
   */
  const loadFromLocalStorage = () => {
    try {
      const savedConfig = localStorage.getItem('app_config')
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        Object.keys(parsed).forEach(key => {
          config[key] = parsed[key]
        })
        isConfigModified.value = true
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error)
    }
  }
  
  // 首次加载时尝试从localStorage恢复配置
  loadFromLocalStorage()
  
  return {
    config,
    isConfigModified,
    updateConfig,
    getConfig,
    resetConfig,
    saveToLocalStorage,
    loadFromLocalStorage
  }
}

export default useConfig 