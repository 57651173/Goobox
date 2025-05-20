<script setup>
import { ref, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { Modal, message } from 'ant-design-vue'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  cargoList: {
    type: Array,
    required: true
  },
  enableExport: {
    type: Boolean,
    default: false // 默认禁用导出功能
  }
})

const emit = defineEmits(['remove-cargo', 'clear-cargo', 'update-cargo', 'export-report'])

const { t } = useI18n()

// 计算表格数据
const tableData = computed(() => {
  return props.cargoList.map(cargo => {
    // 计算单个货物的体积
    const volume = parseFloat((cargo.length * cargo.width * cargo.height).toFixed(2))
    
    // 确保ID格式正确（包含颜色信息）
    let formattedId = cargo.id;
    if (!formattedId.includes('::color::')) {
      formattedId = `${cargo.id}::color::${cargo.color}`;
    }
    
    console.log('表格数据处理 - 货物:', cargo.name, '格式化ID:', formattedId);
    
    return {
      ...cargo,
      // 使用格式化后的ID
      id: formattedId,
      key: formattedId, // 确保key也是唯一的
      size: `${cargo.length}×${cargo.width}×${cargo.height}`,
      volume: volume,
      totalVolume: volume * cargo.quantity,
      totalWeight: cargo.weight * cargo.quantity
    }
  })
})

// 颜色展示组件 - 直接渲染颜色方块
const ColorDisplay = (props) => {
  return h('div', {
    class: 'color-display',
    style: {
      backgroundColor: props.color,
      width: '28px',
      height: '28px',
      borderRadius: '4px',
      border: '1px solid #e8e8e8',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'inline-block',
      position: 'relative',
      verticalAlign: 'middle',
      marginRight: '8px'
    },
    title: props.color
  });
};

// 表格列定义
const columns = computed(() => [
  {
    title: t('container.name'),
    dataIndex: 'name',
    key: 'name',
    width: '15%'
  },
  {
    title: t('container.size'),
    dataIndex: 'size',
    key: 'size',
    width: '20%'
  },
  {
    title: t('container.weight'),
    dataIndex: 'weight',
    key: 'weight',
    width: '10%',
    customRender: ({ text }) => `${text}kg`
  },
  {
    title: t('container.quantity'),
    dataIndex: 'quantity',
    key: 'quantity',
    width: '10%'
  },
  {
    title: t('container.volume'),
    dataIndex: 'totalVolume',
    key: 'totalVolume',
    width: '10%',
    customRender: ({ text }) => `${text.toFixed(2)}m³`
  },
  {
    title: t('container.color'),
    dataIndex: 'color',
    key: 'color',
    width: '15%',
    align: 'center',
    customRender: ({ text, record }) => {
      return h('div', { 
        class: 'color-cell' 
      }, [
        // 内联样式的颜色块
        h('span', {
          style: {
            display: 'inline-block',
            width: '28px',
            height: '28px',
            backgroundColor: text,
            border: '1px solid #ddd',
            borderRadius: '4px',
            verticalAlign: 'middle',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
            cursor: 'pointer',
          },
          title: text,
          onClick: () => handleColorChange(record.id, text)
        })
      ]);
    }
  },
  {
    title: t('container.action'),
    key: 'action',
    width: '15%',
    align: 'center',
    customRender: ({ record }) => {
      console.log('移除按钮 - 货物ID:', record.id);
      return h('div', { 
        class: 'action-cell' 
      }, [
        h('a', {
          class: 'remove-btn',
          onClick: (e) => {
            e.preventDefault();
            console.log('点击移除按钮，货物ID:', record.id);
            confirmRemove(record.id);
          }
        }, [
          h('span', { class: 'remove-icon' }, ''),
          h('span', {}, [
            t('container.remove') || '移除全部',
            h('span', { class: 'cargo-quantity' })
          ])
        ])
      ]);
    }
  }
])

// 当前编辑的颜色和ID
const currentEditColorId = ref(null);
const colorPickerVisible = ref(false);
const colorPickerValue = ref('#ffffff');

// 生成随机颜色
const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

// 确认删除对话框
const confirmRemove = (id) => {
  console.log('[CargoList] 确认对话框 - 要移除的货物ID:', id);
  
  // 确保ID包含颜色信息
  if (!id || !id.includes('::color::')) {
    console.error('[CargoList] 移除失败：ID格式不正确，缺少颜色信息', id);
    message.error('移除失败：货物ID格式不正确');
    return;
  }
  
  // 找到对应的货物记录
  const cargoToRemove = tableData.value.find(item => item.id === id);
  if (!cargoToRemove) {
    console.error('[CargoList] 未找到要移除的货物记录:', id);
    message.error('移除失败：未找到对应货物');
    return;
  }
  
  // 构建确认信息
  const cargoInfo = `${cargoToRemove.name} (${cargoToRemove.size}，${cargoToRemove.quantity}个)`;
  
  Modal.confirm({
    title: t('container.confirmRemove') || '确认移除所有同类货物',
    content: h('div', {}, [
      h('p', {}, t('container.confirmRemoveContent') || '您确定要移除所有同类货物吗？（相同名称、尺寸和颜色的货物都将被移除）'),
      h('p', { class: 'remove-cargo-info' }, [
        '货物信息: ',
        h('span', { class: 'cargo-name' }, cargoToRemove.name),
        h('span', { class: 'cargo-size' }, `, 尺寸: ${cargoToRemove.size}`),
        h('span', { class: 'cargo-color' }, [
          ', 颜色: ',
          h('span', { 
            class: 'color-dot',
            style: { backgroundColor: cargoToRemove.color }
          }),
        ]),
        h('span', { class: 'cargo-quantity' }, `, 数量: ${cargoToRemove.quantity}`)
      ])
    ]),
    okText: t('container.confirm') || '确认',
    cancelText: t('container.cancel') || '取消',
    okType: 'danger',
    icon: h('span', { class: 'modal-icon warning-icon' }, ''),
    onOk: () => {
      console.log('[CargoList] 用户确认移除同类货物，发送ID:', id);
      emit('remove-cargo', id);
      message.success(t('container.removeAllSuccess') || '已移除所有同类货物');
    }
  });
};

// 确认清空所有对话框
const confirmClearAll = () => {
  if (props.cargoList.length === 0) return;
  
  Modal.confirm({
    title: t('container.confirmClearAll'),
    content: t('container.confirmClearAllContent'),
    okText: t('container.confirm'),
    cancelText: t('container.cancel'),
    okType: 'danger',
    icon: h('span', { class: 'modal-icon warning-icon' }, '⚠️'),
    onOk: () => {
      emit('clear-cargo');
      message.success(t('container.clearAllSuccess'));
    }
  });
};

// 处理颜色更改
const handleColorChange = (id, currentColor) => {
  currentEditColorId.value = id;
  colorPickerValue.value = currentColor;
  colorPickerVisible.value = true;
};

// 确认颜色更改
const confirmColorChange = (newColor) => {
  if (currentEditColorId.value) {
    emit('update-cargo', { id: currentEditColorId.value, color: newColor });
    colorPickerVisible.value = false;
    currentEditColorId.value = null;
    message.success(t('container.colorUpdated') || '颜色已更新');
  }
};

// 取消颜色更改
const cancelColorChange = () => {
  colorPickerVisible.value = false;
  currentEditColorId.value = null;
};

// 处理导出报告
const handleExportReport = () => {
  emit('export-report')
}
</script>

<template>
  <div class="cargo-list-container">
    <!-- 货物数量和操作按钮 -->
    <div class="list-header">
      <span class="cargo-count">
        {{ t('container.loadedCargo', { count: cargoList.length }) }}
      </span>
      <div class="actions">
        <a-button
          size="small"
          type="primary"
          danger
          @click="confirmClearAll"
          :disabled="cargoList.length === 0"
        >
          {{ t('container.clearAll') }}
        </a-button>
        
        <!-- 仅在启用时显示导出按钮 -->
        <a-button
          v-if="enableExport"
          size="small"
          type="primary"
          @click="handleExportReport"
          :disabled="cargoList.length === 0"
          class="export-button"
        >
          {{ t('container.report.exportReport') }}
        </a-button>
      </div>
    </div>
    
    <!-- 货物表格 -->
    <a-table
      :dataSource="tableData"
      :columns="columns"
      size="small"
      :pagination="false"
      :scroll="{ y: 300 }"
      :bordered="true"
      :rowKey="(record) => record.id"
    />
    
    <!-- 颜色选择对话框 -->
    <a-modal
      v-model:open="colorPickerVisible"
      :title="t('container.selectColor')"
      :width="320"
      :footer="null"
      :destroyOnClose="true"
      @cancel="cancelColorChange"
      class="color-picker-modal-container"
    >
      <div class="color-picker-modal">
        <div class="color-picker-preview" :style="{ backgroundColor: colorPickerValue }">
          <div class="color-value">{{ colorPickerValue.toUpperCase() }}</div>
        </div>
        <div class="color-picker-container">
          <div class="predefined-colors">
            <div 
              v-for="color in ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
                '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', 
                '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b', '#000000', '#ffffff']" 
              :key="color"
              class="color-item"
              :style="{ backgroundColor: color }"
              :class="{ active: colorPickerValue === color }"
              @click="colorPickerValue = color"
            ></div>
          </div>
          <div class="custom-color">
            <input 
              type="color" 
              v-model="colorPickerValue" 
              class="color-input"
            />
          </div>
        </div>
        <div class="buttons">
          <div class="quick-actions">
            <a-button size="small" @click="colorPickerValue = generateRandomColor()">
              {{ t('container.randomColor') || '随机色' }}
            </a-button>
          </div>
          <div class="main-actions">
            <a-button @click="cancelColorChange">{{ t('container.cancel') }}</a-button>
            <a-button type="primary" @click="confirmColorChange(colorPickerValue)">{{ t('container.confirm') }}</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.cargo-list-container {
  margin-top: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cargo-count {
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
}

.export-button {
  margin-left: 8px;
}

.color-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-preview {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  position: relative;
  cursor: default;
  display: inline-block;
  vertical-align: middle;
}

.color-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 3px;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

/* 确保颜色显示在表格中居中 */
:deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px;
  vertical-align: middle;
}

:deep(.color-cell) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-table-thead > tr > th) {
  padding: 8px 12px;
  background-color: #f0f5ff;
}

/* 颜色选择对话框样式 */
:deep(.color-picker-modal-container .ant-modal-content) {
  overflow: hidden;
  border-radius: 8px;
}

:deep(.color-picker-modal-container .ant-modal-header) {
  background-color: #f5f5f5;
}

.color-picker-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-picker-preview {
  height: 64px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  margin-bottom: 4px;
  transition: all 0.3s;
}

.color-value {
  background: rgba(255, 255, 255, 0.9);
  padding: 3px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-family: monospace;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.predefined-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.color-item {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.color-item.active {
  transform: scale(1.1);
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #1890ff;
  z-index: 2;
}

.color-item.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.custom-color {
  margin-top: 8px;
}

.color-input {
  width: 100%;
  height: 36px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.buttons {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.main-actions {
  display: flex;
  gap: 8px;
}

.action-cell {
  display: flex;
  justify-content: center;
}

.remove-btn {
  color: #ff4d4f;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.remove-btn:hover {
  color: #ff7875;
}

.remove-icon {
  font-size: 16px;
  font-weight: bold;
}

.cargo-quantity {
  font-size: 12px;
  color: #888;
  margin-left: 4px;
}

/* 确认对话框样式 */
:deep(.ant-modal-confirm-btns) {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.ant-modal-confirm-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-icon {
  font-size: 18px;
  margin-right: 8px;
}

.warning-icon {
  color: #faad14;
}

.remove-cargo-info {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 13px;
}

.cargo-name {
  font-weight: bold;
}

.cargo-size,
.cargo-quantity {
  font-family: monospace;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 4px;
  border: 1px solid #ddd;
  vertical-align: middle;
}
</style> 