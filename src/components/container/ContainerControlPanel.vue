<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import CargoForm from './CargoForm.vue'
import CargoList from './CargoList.vue'
import ExportReport from './ExportReport.vue'

const props = defineProps({
  cargoListForTable: {
    type: Array,
    default: () => []
  },
  selectedContainer: {
    type: String,
    default: '40GP'
  },
  containerGroups: {
    type: Array,
    required: true
  },
  containerTypeDetails: {
    type: Object,
    required: true
  },
  isAddingCargo: {
    type: Boolean,
    default: false
  },
  lastAddingResult: {
    type: Object,
    default: () => ({
      success: true,
      message: '',
      attempted: 0,
      added: 0
    })
  },
  enableExport: {
    type: Boolean,
    default: false // 默认禁用导出功能
  }
})

const emit = defineEmits([
  'add-cargo', 
  'remove-cargo', 
  'update:selectedContainer', 
  'clear-cargo', 
  'update-cargo', 
  'export-report', 
  'export-report-cancel'
])

// 本地状态，用于跟踪选中的集装箱类型
const localSelectedContainer = ref(props.selectedContainer)

// 监听 props 变化，同步到本地状态
watch(() => props.selectedContainer, (newValue) => {
  localSelectedContainer.value = newValue
})

const { t } = useI18n()

// 响应式布局控制
const isSmallScreen = ref(false)
const windowWidth = ref(window.innerWidth)

// 动态计算表单标签和内容的布局
const labelCol = computed(() => {
  if (isSmallScreen.value) {
    return { span: 24 }
  }
  return { span: 4 }
})

const wrapperCol = computed(() => {
  if (isSmallScreen.value) {
    return { span: 24 }
  }
  return { span: 18 }
})

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
  isSmallScreen.value = windowWidth.value <= 768
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 计算当前选中的集装箱数据
const currentContainer = computed(() => {
  const details = props.containerTypeDetails[props.selectedContainer]
  if (!details) return null
  
  return {
    value: props.selectedContainer,
    ...details
  }
})

// 计算当前已装载货物的信息
const loadedCargoStats = computed(() => {
  // 计算总体积和总重量
  let totalVolume = 0
  let totalWeight = 0
  
  props.cargoListForTable.forEach(cargo => {
    const volume = cargo.length * cargo.width * cargo.height * cargo.quantity
    totalVolume += volume
    totalWeight += cargo.weight * cargo.quantity
  })
  
  // 计算装载率
  const volumeUsageRate = currentContainer.value ? 
    Math.min(100, (totalVolume / currentContainer.value.volume * 100).toFixed(2)) : 0
  const weightUsageRate = currentContainer.value ? 
    Math.min(100, (totalWeight / currentContainer.value.maxWeight * 100).toFixed(2)) : 0
    
  return {
    totalVolume: totalVolume.toFixed(2),
    totalWeight: totalWeight.toFixed(2),
    volumeUsageRate,
    weightUsageRate,
    totalIndividualItems: props.cargoListForTable.reduce((total, cargo) => total + cargo.quantity, 0)
  }
})

// 处理集装箱类型变化
const handleContainerChange = (value) => {
  // 更新本地状态
  localSelectedContainer.value = value
  // 触发父组件更新
  emit('update:selectedContainer', value)
}

// 添加货物
const handleAddCargo = (cargoData) => {
  emit('add-cargo', cargoData)
}

// 移除货物
const handleRemoveCargo = (id) => {
  console.log('[ContainerControlPanel] 收到移除货物请求，ID:', id);
  // 校验ID格式 
  if (!id || !id.includes('::color::')) {
    console.error('[ContainerControlPanel] ID格式错误:', id);
    return;
  }
  emit('remove-cargo', id);
  console.log('[ContainerControlPanel] 已发送移除请求到Container组件');
}

// 清空所有货物
const handleClearCargo = () => {
  emit('clear-cargo')
}

// 更新货物
const handleUpdateCargo = (cargo) => {
  emit('update-cargo', cargo)
}

// 货物表单引用
const cargoFormRef = ref(null)

// 监听添加货物状态，在成功添加后重置表单
watch(
  () => props.isAddingCargo,
  (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      // 添加操作完成，检查结果
      if (props.lastAddingResult && props.lastAddingResult.added > 0) {
        // 至少成功添加了一个货物，重置表单
        if (cargoFormRef.value) {
          cargoFormRef.value.resetForm()
        }
        
        // 提示添加成功
        if (props.lastAddingResult.success) {
          message.success(t('container.addSuccess'))
        } else if (props.lastAddingResult.attempted > props.lastAddingResult.added) {
          // 部分成功
          message.warning(`${t('container.partialAddSuccess')} (${props.lastAddingResult.added}/${props.lastAddingResult.attempted})`)
        }
      }
    }
  }
)

// 导出报告相关状态
const isExportingReport = ref(false) // 是否正在导出
const showExportModal = ref(false) // 是否显示导出进度模态框

// 处理导出报告请求
const handleExportReport = () => {
  // 如果货物列表为空，提示并退出
  if (props.cargoListForTable.length === 0) {
    message.warning(t('container.report.noCargoToExport') || '没有货物可导出')
    return
  }
  
  // 打开导出进度模态框
  showExportModal.value = true
  isExportingReport.value = true
}

// 开始实际导出过程
const startExport = (options) => {
  isExportingReport.value = true;
  
  try {
    // 通知父组件开始导出报告
    emit('export-report', {
      // 进度回调函数
      onProgress: options.onProgress,
      // 完成回调函数
      onComplete: (success, result) => {
        isExportingReport.value = false;
        options.onComplete(success, result);
      }
    });
  } catch (error) {
    console.error('导出报告错误:', error);
    isExportingReport.value = false;
    options.onComplete(false, error.message || '导出过程中发生未知错误');
  }
}

// 取消导出
const cancelExport = () => {
  showExportModal.value = false;
  isExportingReport.value = false;
  // 通知父组件取消操作（如有需要）
  emit('export-report-cancel');
}
</script>

<template>
  <div>
    <div class="container-control-panel">
      <a-card size="small" :title="t('container.settings')" :bordered="true" class="control-panel">
        <!-- 集装箱选择部分 -->
        <a-form 
          :layout="isSmallScreen ? 'vertical' : 'horizontal'" 
          :label-col="labelCol" 
          :wrapper-col="wrapperCol" 
          :colon="false" 
          class="compact-form"
        >
          <a-form-item :label="t('container.containerType')">
            <a-select 
              :value="localSelectedContainer" 
              @change="handleContainerChange" 
              :dropdown-match-select-width="false"
            >
              <a-select-opt-group 
                v-for="group in containerGroups" 
                :key="group.key" 
                :label="t(`container.containerGroups.${group.key}`)"
              >
                <a-select-option 
                  v-for="typeKey in group.types" 
                  :key="typeKey" 
                  :value="typeKey"
                >
                  {{ t(`container.containerTypes.${typeKey}`) }}
                  <span class="container-size">
                    ({{ containerTypeDetails[typeKey].length }}m×{{ containerTypeDetails[typeKey].width }}m×{{ containerTypeDetails[typeKey].height }}m, {{ containerTypeDetails[typeKey].volume }}m³)
                  </span>
                </a-select-option>
              </a-select-opt-group>
            </a-select>
          </a-form-item>
        </a-form>

        <!-- 添加货物表单部分 -->
        <a-divider>{{ t('container.addCargo') }}</a-divider>
        
        <CargoForm
          ref="cargoFormRef"
          :is-adding-cargo="isAddingCargo"
          :last-adding-result="lastAddingResult"
          :is-small-screen="isSmallScreen"
          @add-cargo="handleAddCargo"
        />
        
        <!-- 货物列表部分 -->
        <a-divider>{{ t('container.cargoList') }}</a-divider>
        
        <CargoList
          :cargo-list="cargoListForTable"
          :enable-export="enableExport"
          @remove-cargo="handleRemoveCargo"
          @clear-cargo="handleClearCargo"
          @update-cargo="handleUpdateCargo"
          @export-report="handleExportReport"
        />
      </a-card>
    </div>
  
    <!-- 导出报告进度模态框 -->
    <ExportReport
      v-model="showExportModal"
      :is-exporting="isExportingReport"
      :is-enabled="enableExport"
      @export="startExport"
      @cancel="cancelExport"
    />
  </div>
</template>

<style scoped>
/* 响应式卡片样式 */
.control-panel {
  overflow-y: auto;
  max-height: 800px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

/* 隐藏默认错误信息 */
:deep(.ant-form-item-explain) {
  display: none !important;
}

:deep(.ant-form-item-has-error) .ant-input,
:deep(.ant-form-item-has-error) .ant-input-number {
  border-color: #d9d9d9 !important;
}

:deep(.ant-form-item-has-error) .ant-input:focus,
:deep(.ant-form-item-has-error) .ant-input-number:focus {
  border-color: #40a9ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
}

:deep(.ant-form-item-has-error) .ant-input:hover,
:deep(.ant-form-item-has-error) .ant-input-number:hover {
  border-color: #40a9ff !important;
}

/* 表单紧凑样式 */
.compact-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.compact-form :deep(.ant-divider) {
  margin: 12px 0;
}

/* 常用尺寸选择器样式 */
:deep(.ant-select-selection-item) {
  font-size: 12px;
}

/* 移动设备上的特殊样式 */
@media (max-width: 768px) {
  .control-panel {
    max-height: none;
    padding: 12px;
  }
  
  .compact-form :deep(.ant-form-item-label) {
    text-align: left;
  }
  
  .compact-form :deep(.ant-form-horizontal .ant-form-item-label) {
    width: 100%;
    padding: 0 0 4px;
  }
  
  .compact-form :deep(.ant-form-horizontal .ant-form-item-control) {
    width: 100%;
  }
}

/* 集装箱尺寸样式 */
.container-size {
  font-size: 12px;
  color: #999;
}
</style> 