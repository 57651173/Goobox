<template>
  <div class="settings-container">
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-page-header
          :title="t('settings.title')"
          :subtitle="t('settings.subtitle')"
          @back="goBack"
        />
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="24" :md="6" :lg="6" :xl="5">
        <a-card :bordered="false" class="settings-menu">
          <a-menu
            mode="inline"
            v-model:selectedKeys="selectedMenuKeys"
            style="height: 100%"
          >
            <a-menu-item key="general">
              <template #icon><setting-outlined /></template>
              {{ t('settings.menu.general') }}
            </a-menu-item>
            <a-menu-item key="appearance">
              <template #icon><skin-outlined /></template>
              {{ t('settings.menu.appearance') }}
            </a-menu-item>
            <a-menu-item key="language">
              <template #icon><global-outlined /></template>
              {{ t('settings.menu.language') }}
            </a-menu-item>
            <a-menu-item key="advanced">
              <template #icon><tool-outlined /></template>
              {{ t('settings.menu.advanced') }}
            </a-menu-item>
          </a-menu>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="24" :md="18" :lg="18" :xl="19">
        <a-card :bordered="false" class="settings-content">
          <!-- 通用设置 -->
          <div v-show="selectedMenuKeys.includes('general')">
            <h2>{{ t('settings.general.title') }}</h2>
            
            <a-form :model="formState" layout="vertical">
              <a-form-item :label="t('settings.general.appName')">
                <a-input
                  v-model:value="formState.app.name"
                  @change="() => updateSetting('app.name', formState.app.name)"
                />
              </a-form-item>
              
              <a-form-item :label="t('settings.general.version')">
                <a-input
                  v-model:value="formState.app.version"
                  disabled
                />
              </a-form-item>
              
              <a-divider />
              
              <a-form-item :label="t('settings.general.features')">
                <a-space direction="vertical" style="width: 100%">
                  <a-card size="small" :bordered="true">
                    <a-row :gutter="[16, 0]" align="middle">
                      <a-col :span="18">
                        <div>
                          <div class="feature-title">{{ t('settings.general.containerCalculator') }}</div>
                          <div class="feature-description">{{ t('settings.general.containerCalculatorDesc') }}</div>
                        </div>
                      </a-col>
                      <a-col :span="6" style="text-align: right">
                        <a-switch
                          v-model:checked="formState.features.containerCalculator.enabled"
                          @change="(checked) => updateSetting('features.containerCalculator.enabled', checked)"
                        />
                      </a-col>
                    </a-row>
                  </a-card>
                  
                  <a-collapse v-model:activeKey="activeCollapse" ghost>
                    <a-collapse-panel key="containerDetails" :header="t('settings.general.containerDetails')">
                      <a-form-item :label="t('settings.general.maxItems')">
                        <a-input-number
                          v-model:value="formState.features.containerCalculator.maxItems"
                          :min="1"
                          :max="1000"
                          @change="(value) => updateSetting('features.containerCalculator.maxItems', value)"
                          style="width: 100%"
                        />
                      </a-form-item>
                      
                      <a-form-item>
                        <a-checkbox
                          v-model:checked="formState.features.containerCalculator.allowCustomDimensions"
                          @change="(e) => updateSetting('features.containerCalculator.allowCustomDimensions', e.target.checked)"
                        >
                          {{ t('settings.general.allowCustomDimensions') }}
                        </a-checkbox>
                      </a-form-item>
                    </a-collapse-panel>
                  </a-collapse>
                </a-space>
              </a-form-item>
            </a-form>
          </div>
          
          <!-- 外观设置 -->
          <div v-show="selectedMenuKeys.includes('appearance')">
            <h2>{{ t('settings.appearance.title') }}</h2>
            
            <a-form :model="formState" layout="vertical">
              <a-form-item :label="t('settings.appearance.primaryColor')">
                <a-row :gutter="[16, 0]" align="middle">
                  <a-col :span="20">
                    <a-select
                      v-model:value="formState.ui.theme.primaryColor"
                      @change="(value) => updateSetting('ui.theme.primaryColor', value)"
                    >
                      <a-select-option value="#1890ff">#1890ff (默认蓝)</a-select-option>
                      <a-select-option value="#722ed1">#722ed1 (紫色)</a-select-option>
                      <a-select-option value="#52c41a">#52c41a (绿色)</a-select-option>
                      <a-select-option value="#fa8c16">#fa8c16 (橙色)</a-select-option>
                      <a-select-option value="#f5222d">#f5222d (红色)</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="4">
                    <div class="color-preview" :style="{backgroundColor: formState.ui.theme.primaryColor}"></div>
                  </a-col>
                </a-row>
              </a-form-item>
              
              <a-form-item :label="t('settings.appearance.darkMode')">
                <a-switch
                  v-model:checked="formState.ui.theme.darkMode"
                  @change="(checked) => updateSetting('ui.theme.darkMode', checked)"
                />
              </a-form-item>
              
              <a-form-item :label="t('settings.appearance.animation')">
                <a-switch
                  v-model:checked="formState.ui.theme.animation"
                  @change="(checked) => updateSetting('ui.theme.animation', checked)"
                />
              </a-form-item>
              
              <a-divider />
              
              <a-form-item :label="t('settings.appearance.layout')">
                <a-checkbox
                  v-model:checked="formState.ui.layout.showBackToTop"
                  @change="(e) => updateSetting('ui.layout.showBackToTop', e.target.checked)"
                >
                  {{ t('settings.appearance.showBackToTop') }}
                </a-checkbox>
              </a-form-item>
              
              <a-form-item>
                <a-checkbox
                  v-model:checked="formState.ui.layout.headerFixed"
                  @change="(e) => updateSetting('ui.layout.headerFixed', e.target.checked)"
                >
                  {{ t('settings.appearance.headerFixed') }}
                </a-checkbox>
              </a-form-item>
              
              <a-form-item :label="t('settings.appearance.maxContentWidth')">
                <a-slider
                  v-model:value="formState.ui.layout.maxContentWidth"
                  :min="1000"
                  :max="2000"
                  :step="100"
                  @change="(value) => updateSetting('ui.layout.maxContentWidth', value)"
                />
              </a-form-item>
            </a-form>
          </div>
          
          <!-- 语言设置 -->
          <div v-show="selectedMenuKeys.includes('language')">
            <h2>{{ t('settings.language.title') }}</h2>
            
            <a-form :model="formState" layout="vertical">
              <a-form-item :label="t('settings.language.currentLanguage')">
                <a-radio-group
                  v-model:value="currentLocale"
                  @change="onLanguageChange"
                  button-style="solid"
                >
                  <a-radio-button value="zh">
                    <span class="flag-icon">🇨🇳</span> 中文
                  </a-radio-button>
                  <a-radio-button value="en">
                    <span class="flag-icon">🇬🇧</span> English
                  </a-radio-button>
                  <a-radio-button value="de">
                    <span class="flag-icon">🇩🇪</span> Deutsch
                  </a-radio-button>
                  <a-radio-button value="es">
                    <span class="flag-icon">🇪🇸</span> Español
                  </a-radio-button>
                </a-radio-group>
              </a-form-item>
              
              <a-form-item>
                <a-checkbox
                  v-model:checked="formState.i18n.persistLocale"
                  @change="(e) => updateSetting('i18n.persistLocale', e.target.checked)"
                >
                  {{ t('settings.language.persistLocale') }}
                </a-checkbox>
              </a-form-item>
            </a-form>
          </div>
          
          <!-- 高级设置 -->
          <div v-show="selectedMenuKeys.includes('advanced')">
            <h2>{{ t('settings.advanced.title') }}</h2>
            
            <a-form :model="formState" layout="vertical">
              <a-form-item :label="t('settings.advanced.api')">
                <a-input
                  v-model:value="formState.api.baseURL"
                  @change="() => updateSetting('api.baseURL', formState.api.baseURL)"
                  addon-before="API URL"
                />
              </a-form-item>
              
              <a-form-item :label="t('settings.advanced.timeout')">
                <a-input-number
                  v-model:value="formState.api.timeout"
                  :min="1000"
                  :max="60000"
                  :step="1000"
                  @change="(value) => updateSetting('api.timeout', value)"
                  style="width: 100%"
                  addon-after="ms"
                />
              </a-form-item>
              
              <a-form-item :label="t('settings.advanced.retry')">
                <a-input-number
                  v-model:value="formState.api.retry"
                  :min="0"
                  :max="5"
                  @change="(value) => updateSetting('api.retry', value)"
                  style="width: 100%"
                />
              </a-form-item>
              
              <a-form-item>
                <a-checkbox
                  v-model:checked="formState.api.mockEnabled"
                  @change="(e) => updateSetting('api.mockEnabled', e.target.checked)"
                >
                  {{ t('settings.advanced.mockEnabled') }}
                </a-checkbox>
              </a-form-item>
              
              <a-divider />
              
              <div class="settings-actions">
                <a-space>
                  <a-button danger @click="resetAllSettings">
                    {{ t('settings.advanced.resetAll') }}
                  </a-button>
                  <a-button @click="exportSettings">
                    {{ t('settings.advanced.export') }}
                  </a-button>
                  <a-button @click="importSettingsPrompt">
                    {{ t('settings.advanced.import') }}
                  </a-button>
                </a-space>
              </div>
            </a-form>
          </div>
          
          <!-- 重置和保存按钮 -->
          <a-divider />
          
          <div class="settings-footer">
            <a-space>
              <a-button @click="resetCurrentSection">
                {{ t('settings.actions.reset') }}
              </a-button>
              <a-button type="primary" @click="saveSettings" :disabled="!isConfigModified">
                {{ t('settings.actions.save') }}
              </a-button>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { 
  SettingOutlined, 
  SkinOutlined, 
  GlobalOutlined, 
  ToolOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import useConfig from '../config/useConfig'

const router = useRouter()
const { t, locale } = useI18n()
const { 
  config, 
  isConfigModified, 
  updateConfig, 
  getConfig, 
  resetConfig, 
  saveToLocalStorage 
} = useConfig()

// 菜单项选择
const selectedMenuKeys = ref(['general'])
const activeCollapse = ref(['containerDetails'])

// 当前语言
const currentLocale = computed({
  get: () => locale.value,
  set: (value) => { locale.value = value }
})

// 表单状态初始化为当前配置的深拷贝
const formState = reactive(JSON.parse(JSON.stringify(config)))

// 监听配置变化
watch(() => config, (newConfig) => {
  Object.assign(formState, JSON.parse(JSON.stringify(newConfig)))
}, { deep: true })

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 更新设置
const updateSetting = (path, value) => {
  updateConfig(path, value)
}

// 语言切换
const onLanguageChange = (e) => {
  const newLocale = e.target.value
  locale.value = newLocale
  updateConfig('i18n.defaultLocale', newLocale)
  
  if (config.i18n.persistLocale) {
    localStorage.setItem('locale', newLocale)
  }
}

// 重置当前区域的设置
const resetCurrentSection = () => {
  const section = selectedMenuKeys.value[0]
  
  if (section === 'general') {
    resetConfig('app')
    resetConfig('features')
  } else if (section === 'appearance') {
    resetConfig('ui')
  } else if (section === 'language') {
    resetConfig('i18n')
    locale.value = config.i18n.defaultLocale
  } else if (section === 'advanced') {
    resetConfig('api')
  }
  
  // 更新表单状态
  Object.assign(formState, JSON.parse(JSON.stringify(config)))
  
  message.success(t('settings.messages.resetSuccess'))
}

// 重置所有设置
const resetAllSettings = () => {
  resetConfig()
  locale.value = config.i18n.defaultLocale
  Object.assign(formState, JSON.parse(JSON.stringify(config)))
  message.success(t('settings.messages.resetAllSuccess'))
}

// 保存设置
const saveSettings = () => {
  saveToLocalStorage()
  message.success(t('settings.messages.saveSuccess'))
}

// 导出设置
const exportSettings = () => {
  try {
    const configStr = JSON.stringify(config, null, 2)
    const blob = new Blob([configStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'goobox_config.json'
    document.body.appendChild(a)
    a.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
    
    message.success(t('settings.messages.exportSuccess'))
  } catch (error) {
    message.error(t('settings.messages.exportError'))
    console.error('导出设置失败:', error)
  }
}

// 导入设置提示
const importSettingsPrompt = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedConfig = JSON.parse(event.target.result)
        
        // 更新配置
        Object.keys(importedConfig).forEach(key => {
          if (key in config) {
            updateConfig(key, importedConfig[key])
          }
        })
        
        // 更新表单状态
        Object.assign(formState, JSON.parse(JSON.stringify(config)))
        
        // 更新语言
        if (importedConfig.i18n && importedConfig.i18n.defaultLocale) {
          locale.value = importedConfig.i18n.defaultLocale
        }
        
        message.success(t('settings.messages.importSuccess'))
      } catch (error) {
        message.error(t('settings.messages.importError'))
        console.error('导入设置失败:', error)
      }
    }
    
    reader.readAsText(file)
  }
  
  input.click()
}
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.settings-menu {
  height: 100%;
}

.settings-content {
  min-height: 600px;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.settings-actions {
  display: flex;
  justify-content: flex-start;
  margin: 20px 0;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.feature-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.feature-description {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.flag-icon {
  font-size: 16px;
  margin-right: 6px;
}
</style> 