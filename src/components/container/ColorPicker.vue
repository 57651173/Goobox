<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  value: {
    type: String,
    default: '#f44336'
  },
  predefinedColors: {
    type: Array,
    default: () => [
      // 主要颜色
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      // 次要颜色
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#607d8b', '#000000', '#ffffff'
    ]
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value', 'change']);

const { t } = useI18n();

// 颜色选择器弹窗显示控制
const colorPickerVisible = ref(false);

// 选择颜色
const selectColor = (color) => {
  emit('update:value', color);
  emit('change', color);
  colorPickerVisible.value = false;
};

// 处理颜色变化
const handleColorChange = (e) => {
  emit('update:value', e.target.value);
  emit('change', e.target.value);
};
</script>

<template>
  <div class="color-picker-wrapper">
    <!-- 紧凑模式下显示一个小按钮来触发颜色选择器 -->
    <template v-if="compact">
      <a-button 
        type="text" 
        size="small" 
        class="color-trigger-button"
        @click="colorPickerVisible = !colorPickerVisible"
        :title="t('container.editColor')"
      >
        <edit-outlined />
      </a-button>
      
      <a-popover 
        trigger="click" 
        placement="bottomRight" 
        v-model:open="colorPickerVisible"
        overlay-class-name="color-picker-popover"
      >
        <template #content>
          <div class="color-picker-container">
            <transition-group name="color-fade" tag="div" class="color-grid">
              <div 
                v-for="color in predefinedColors" 
                :key="color" 
                class="color-swatch" 
                :class="{ 'active': value === color }"
                :style="{ backgroundColor: color }" 
                @click="selectColor(color)"
              >
                <check-outlined v-if="value === color" class="color-selected-icon" />
              </div>
            </transition-group>
            <div class="color-custom">
              <input 
                type="color" 
                :value="value"
                class="color-input" 
                @change="handleColorChange" 
                :title="t('container.customColor')"
              />
            </div>
          </div>
        </template>
      </a-popover>
    </template>
    
    <!-- 非紧凑模式 - 直接显示完整的颜色选择器 -->
    <div v-else class="color-picker-container">
      <transition-group name="color-fade" tag="div" class="color-grid">
        <div 
          v-for="color in predefinedColors" 
          :key="color" 
          class="color-swatch" 
          :class="{ 'active': value === color }"
          :style="{ backgroundColor: color }" 
          @click="selectColor(color)"
        >
          <check-outlined v-if="value === color" class="color-selected-icon" />
        </div>
      </transition-group>
      <div class="color-custom">
        <input 
          type="color" 
          :value="value"
          class="color-input" 
          @change="handleColorChange" 
          :title="t('container.customColor')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 颜色选择器包装容器 */
.color-picker-wrapper {
  display: inline-block;
}

/* 颜色触发按钮样式 */
.color-trigger-button {
  padding: 2px;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #f5f5f5;
}

.color-trigger-button:hover {
  background: #e6f7ff;
  border-color: #1890ff;
}

/* 颜色选择器样式 */
.color-picker-container {
  width: 240px;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.color-swatch.active {
  transform: scale(1.1);
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px var(--primary-color);
  z-index: 2;
}

.color-selected-icon {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.color-custom {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  border-top: 1px dashed #eee;
  padding-top: 12px;
}

.color-input {
  width: 100%;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

/* 颜色过渡动画 */
.color-fade-enter-active,
.color-fade-leave-active {
  transition: all 0.3s ease;
}

.color-fade-enter-from,
.color-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.color-fade-move {
  transition: transform 0.3s ease;
}

/* 移动设备上的特殊样式 */
@media (max-width: 768px) {
  .color-picker-container {
    width: 200px;
    padding: 8px;
  }
  
  /* 颜色选择器调整 */
  .color-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  
  .color-swatch {
    width: 28px;
    height: 28px;
  }
}
</style> 