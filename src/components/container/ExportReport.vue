<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  isExporting: {
    type: Boolean,
    default: false
  },
  isEnabled: {
    type: Boolean,
    default: false // 默认功能被禁用
  }
});

const emit = defineEmits(['update:modelValue', 'export', 'cancel']);

const { t } = useI18n();

// 导出进度
const exportProgress = ref(0);
// 导出状态消息
const exportStatus = ref('');
// 添加本地导出状态，避免与父组件状态不同步
const localExporting = ref(false);
// 添加超时计时器
const timeoutTimer = ref(null);

// 取消导出
const cancelExport = () => {
  clearTimeout(timeoutTimer.value);
  localExporting.value = false;
  emit('cancel');
  emit('update:modelValue', false);
};

// 设置超时检测
const setupTimeout = () => {
  // 清除之前的计时器
  clearTimeout(timeoutTimer.value);
  
  // 设置新的超时计时器 (一分钟)
  timeoutTimer.value = setTimeout(() => {
    if (localExporting.value && exportProgress.value < 100) {
      exportStatus.value = t('container.exportTimeout') || '导出超时，请重试';
      message.error(t('container.exportTimeout') || '导出超时，请重试');
      localExporting.value = false;
    }
  }, 60000);
};

// 开始导出
const startExport = () => {
  // 如果功能被禁用，则提示并关闭
  if (!props.isEnabled) {
    message.warning(t('container.report.featureDisabled'));
    cancelExport();
    return;
  }
  
  // 重置状态
  exportProgress.value = 0;
  exportStatus.value = t('container.report.preparingData');
  localExporting.value = true;
  
  // 设置超时检测
  setupTimeout();
  
  // 通知父组件开始导出
  emit('export', {
    // 进度回调函数
    onProgress: (progress, status) => {
      exportProgress.value = Math.round(progress * 100);
      exportStatus.value = status;
      
      // 每次进度更新时重置超时计时器
      setupTimeout();
    },
    // 完成回调函数
    onComplete: (success, result) => {
      clearTimeout(timeoutTimer.value);
      localExporting.value = false;
      
      if (success) {
        exportStatus.value = t('container.report.exportSuccess');
        message.success(t('container.report.exportSuccess'));
        
        // 短暂延迟后关闭模态框
        setTimeout(() => {
          emit('update:modelValue', false);
        }, 1500);
      } else {
        exportStatus.value = `${t('container.report.exportFailed')}: ${result}`;
        message.error(t('container.report.exportFailed'));
      }
    }
  });
};

// 清理资源
onUnmounted(() => {
  clearTimeout(timeoutTimer.value);
});

// 暴露给父组件的方法
defineExpose({
  updateProgress: (progress, status) => {
    exportProgress.value = Math.round(progress * 100);
    exportStatus.value = status;
  }
});

// 当显示状态变化且变为 true 时，自动开始导出
watch(() => props.modelValue, (newValue) => {
  if (newValue && !localExporting.value) {
    startExport();
  }
});

// 监听导出状态
watch(() => props.isExporting, (newValue) => {
  if (!newValue) {
    // 导出结束，关闭对话框
    cancelExport();
  }
});
</script>

<template>
  <a-modal
    :open="modelValue"
    :title="t('container.report.exportingReport')"
    :footer="null"
    :closable="true"
    :maskClosable="false"
    @update:open="value => emit('update:modelValue', value)"
    @cancel="cancelExport"
    :width="400"
  >
    <!-- 功能禁用提示 -->
    <div v-if="!isEnabled">
      <a-result
        status="warning"
        :title="t('container.report.featureDisabled')"
        :sub-title="t('container.report.featureDisabledDesc')"
      >
        <template #extra>
          <a-button type="primary" @click="cancelExport">
            {{ t('container.close') || 'Close' }}
          </a-button>
        </template>
      </a-result>
    </div>
    
    <!-- 正常导出进度 -->
    <div v-else>
      <div class="export-progress-container">
        <a-progress :percent="Math.floor(exportProgress * 100)" :status="isExporting ? 'active' : 'success'" />
        <div class="export-step-description">
          {{ exportStatus }}
        </div>
      </div>
      
      <div class="export-action-buttons">
        <a-button 
          type="default" 
          :disabled="!isExporting" 
          @click="cancelExport"
        >
          {{ t('container.report.cancelExport') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
/* 导出报告进度相关样式 */
.export-progress-container {
  margin: 24px 0;
}

.export-step-description {
  margin-top: 12px;
  text-align: center;
  color: rgba(0, 0, 0, 0.65);
}

.export-action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style> 