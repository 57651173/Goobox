<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { BgColorsOutlined, PlusOutlined } from '@ant-design/icons-vue';
import ColorPicker from './ColorPicker.vue';

const props = defineProps({
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
  isSmallScreen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['add-cargo']);

const { t } = useI18n();

// 动态计算表单标签和内容的布局
const labelCol = computed(() => {
  if (props.isSmallScreen) {
    return { span: 24 }
  }
  return { span: 4 }
});

const wrapperCol = computed(() => {
  if (props.isSmallScreen) {
    return { span: 24 }
  }
  return { span: 18 }
});

// 预定义常用尺寸
const commonSizes = [
  { name: 'EU托盘', enName: 'EU Pallet', length: 1.2, width: 0.8, height: 0.144 },
  { name: 'US托盘', enName: 'US Pallet', length: 1.219, width: 1.016, height: 0.144 },
  { name: '标准托盘', enName: 'Standard Pallet', length: 1.1, width: 1.1, height: 0.15 },
  { name: '半托盘', enName: 'Half Pallet', length: 0.8, width: 0.6, height: 0.144 },
  { name: '四分之一托盘', enName: 'Quarter Pallet', length: 0.6, width: 0.4, height: 0.144 },
  { name: '箱子-小', enName: 'Small Box', length: 0.3, width: 0.2, height: 0.2 },
  { name: '箱子-中', enName: 'Medium Box', length: 0.5, width: 0.4, height: 0.3 },
  { name: '箱子-大', enName: 'Large Box', length: 0.6, width: 0.5, height: 0.4 }
];

// 获取尺寸名称（根据当前语言）
const getSizeName = (size) => {
  const locale = localStorage.getItem('locale') || 'zh-CN';
  return locale.startsWith('zh') ? size.name : size.enName;
};

// 添加货物表单
const newCargo = ref({
  name: '',
  length: null,
  width: null,
  height: null,
  weight: null,
  quantity: 1,
  color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
  rotationAngle: 'auto' // 水平旋转角度：auto, 0, 90
});

// 表单引用，用于表单验证
const formRef = ref();

// 控制颜色选择器的显示/隐藏
const colorPickerVisible = ref(false);

// 颜色选择
const handleColorChange = (color) => {
  newCargo.value.color = color;
  colorPickerVisible.value = false;
};

// 应用预定义尺寸
const applyCommonSize = (size) => {
  newCargo.value.length = size.length;
  newCargo.value.width = size.width;
  newCargo.value.height = size.height;
};

// 添加货物
const addCargoDirectly = () => {
  try {
    // 验证名称
    const trimmedName = newCargo.value.name ? newCargo.value.name.trim() : '';
    if (!trimmedName) {
      message.error(t('container.nameRequired'));
      return;
    }

    // 验证尺寸
    const length = parseFloat(newCargo.value.length);
    if (isNaN(length) || length <= 0) {
      message.error(t('container.invalidLength'));
      return;
    }
    
    const width = parseFloat(newCargo.value.width);
    if (isNaN(width) || width <= 0) {
      message.error(t('container.invalidWidth'));
      return;
    }
    
    const height = parseFloat(newCargo.value.height);
    if (isNaN(height) || height <= 0) {
      message.error(t('container.invalidHeight'));
      return;
    }
    
    // 验证重量
    const weight = parseFloat(newCargo.value.weight);
    if (isNaN(weight) || weight <= 0) {
      message.error(t('container.invalidWeight'));
      return;
    }
    
    // 验证数量
    const quantity = parseInt(newCargo.value.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      message.error(t('container.quantityRequired'));
      return;
    }

    // 确保颜色是标准十六进制格式
    let colorValue = newCargo.value.color || '#ff5722';
    // 如果颜色不是以#开头，添加#前缀
    if (!colorValue.startsWith('#')) {
      colorValue = '#' + colorValue;
    }
    // 确保是6位十六进制（去掉透明度部分如果有）
    if (colorValue.length > 7) {
      colorValue = colorValue.substring(0, 7);
    }

    // 创建新货物数据（不设置ID，让父组件处理）
    const newCargoData = {
      name: trimmedName,
      length,
      width,
      height,
      weight,
      quantity,
      color: colorValue,
      rotationAngle: newCargo.value.rotationAngle
    };
    
    // 触发添加货物事件
    emit('add-cargo', newCargoData);
  } catch (error) {
    console.error("Error in addCargoDirectly:", error);
    message.error(t('container.addFailed') || '添加货物失败，请检查控制台错误信息');
  }
};

// 重置表单
const resetForm = () => {
  newCargo.value = {
    name: '',
    length: null,
    width: null,
    height: null,
    weight: null,
    quantity: 1,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    rotationAngle: 'auto'
  };
};

// 暴露给父组件的方法
defineExpose({
  resetForm
});
</script>

<template>
  <div>
    <a-form 
      ref="formRef"
      :model="newCargo" 
      :layout="isSmallScreen ? 'vertical' : 'horizontal'" 
      :label-col="labelCol" 
      :wrapper-col="wrapperCol" 
      :colon="false" 
      class="compact-form"
    >
      <a-form-item 
        :label="t('container.cargoName')" 
        name="name" 
        required
      >
        <a-input 
          :value="newCargo.name"
          @update:value="newCargo.name = $event"
          :placeholder="t('container.cargoName')" 
        />
      </a-form-item>

      <a-form-item :label="t('container.dimensions') + ' (m)'" required class="responsive-form-item">
        <a-row :gutter="[8, 8]">
          <a-col :xs="24" :sm="8">
            <a-input-number 
              :value="newCargo.length"
              @update:value="newCargo.length = $event"
              style="width: 100%" 
              :placeholder="t('container.length')" 
              :min="0.01" 
              :step="0.1" 
              :precision="2"
            />
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-input-number 
              :value="newCargo.width"
              @update:value="newCargo.width = $event"
              style="width: 100%" 
              :placeholder="t('container.width')" 
              :min="0.01" 
              :step="0.1" 
              :precision="2"
            />
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-input-number 
              :value="newCargo.height"
              @update:value="newCargo.height = $event"
              style="width: 100%" 
              :placeholder="t('container.height')" 
              :min="0.01" 
              :step="0.1" 
              :precision="2"
            />
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item 
        :label="t('container.weight') + ' (kg)'" 
        name="weight" 
        required
      >
        <a-row :gutter="[8, 8]">
          <a-col :xs="24" :sm="12">
            <a-input-number 
              :value="newCargo.weight"
              @update:value="newCargo.weight = $event"
              style="width: 100%" 
              :placeholder="t('container.weight')" 
              :min="0.1" 
              :step="0.1" 
              :precision="2"
            />
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item-rest>
              <a-select 
                :placeholder="t('container.selectCommonSize')" 
                style="width: 100%"
                @change="(value) => applyCommonSize(commonSizes[value])"
                :dropdown-match-select-width="false"
              >
                <a-select-option v-for="(size, index) in commonSizes" :key="index" :value="index">
                  {{ getSizeName(size) }} ({{ size.length }}×{{ size.width }}×{{ size.height }}m)
                </a-select-option>
              </a-select>
            </a-form-item-rest>
          </a-col>
        </a-row>
      </a-form-item>

      <!-- 数量和颜色字段 -->
      <a-form-item 
        :label="t('container.quantity')" 
        name="quantity" 
        required
      >
        <a-row :gutter="[8, 8]">
          <a-col :xs="24" :sm="8">
            <a-input-number 
              :value="newCargo.quantity"
              @update:value="newCargo.quantity = $event"
              style="width: 100%" 
              :placeholder="t('container.quantity')" 
              :min="1" 
              :precision="0"
            />
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-select 
              :value="newCargo.rotationAngle"
              @update:value="newCargo.rotationAngle = $event"
              style="width: 100%"
              :placeholder="t('container.rotationAngle') || '旋转角度'"
            >
              <a-select-option value="auto">{{ t('container.rotation.auto') || '自动' }}</a-select-option>
              <a-select-option value="0">{{ t('container.rotation.0deg') || '0°' }}</a-select-option>
              <a-select-option value="90">{{ t('container.rotation.90deg') || '90°' }}</a-select-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-input-group compact>
              <a-button type="default" style="width: 100%" class="color-selector-button" @click="colorPickerVisible = !colorPickerVisible">
                <div class="color-button-content">
                  <bg-colors-outlined />
                  <div class="color-preview-large" :style="{ backgroundColor: newCargo.color }"></div>
                </div>
              </a-button>
              <a-popover 
                trigger="click" 
                placement="bottomRight" 
                :open="colorPickerVisible"
                @update:open="(visible) => colorPickerVisible = visible"
                overlay-class-name="color-picker-popover"
              >
                <template #content>
                  <ColorPicker 
                    :value="newCargo.color" 
                    @change="handleColorChange"
                  />
                </template>
              </a-popover>
            </a-input-group>
          </a-col>
        </a-row>
      </a-form-item>

      <a-form-item :label=null>
        <a-space wrap>
          <a-button type="primary" @click="addCargoDirectly" :loading="isAddingCargo">
            <template #icon><plus-outlined v-if="!isAddingCargo" /></template>
            {{ isAddingCargo ? t('container.analyzing') || t('container.analyzing') : t('container.add') }}
          </a-button>  
        </a-space>
      </a-form-item>

      <!-- 装载结果提示 -->
      <a-alert 
        v-if="!lastAddingResult.success && lastAddingResult.message" 
        type="warning" 
        :message="lastAddingResult.message"
        showIcon 
        style="margin-bottom: 16px;"
        :description="t('container.addFailedDescription', { attempted: lastAddingResult.attempted, added: lastAddingResult.added }) || 
          `尝试添加 ${lastAddingResult.attempted} 件货物，成功装载 ${lastAddingResult.added} 件。`"
      />
    </a-form>
  </div>
</template>

<style scoped>
/* 表单紧凑样式 */
.compact-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.compact-form :deep(.ant-divider) {
  margin: 12px 0;
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

/* 响应式表单项样式 */
.responsive-form-item {
  margin-bottom: 16px;
}

/* 颜色按钮和预览样式 */
.color-selector-button {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-button-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.color-preview-large {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  margin-left: auto;
  overflow: hidden;
}

/* 原有按钮样式保留兼容 */
.color-button {
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-button-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* 响应式样式 */
@media (max-width: 576px) {
  /* 小屏幕上表单样式调整 */
  .compact-form :deep(.ant-form-item-label) {
    padding-bottom: 4px;
  }
  
  .compact-form :deep(.ant-form) {
    padding: 0 5px;
  }
  
  /* 按钮样式调整 */
  .compact-form :deep(.ant-btn) {
    font-size: 12px;
    padding: 0 8px;
  }
}

/* 移动设备上的特殊样式 */
@media (max-width: 768px) {
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
</style> 