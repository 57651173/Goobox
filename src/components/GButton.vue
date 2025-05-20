<script setup>
import { computed } from 'vue';

// 定义组件属性
const props = defineProps({
  // 按钮类型：primary, secondary, success, warning, danger, info, ghost, text
  type: {
    type: String,
    default: 'primary'
  },
  // 按钮尺寸：small, medium, large
  size: {
    type: String,
    default: 'medium'
  },
  // 是否为图标按钮
  icon: {
    type: Boolean,
    default: false
  },
  // 是否为圆形按钮
  round: {
    type: Boolean,
    default: false
  },
  // 是否为块级按钮
  block: {
    type: Boolean,
    default: false
  },
  // 是否为幽灵按钮
  ghost: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 点击事件
  onClick: {
    type: Function,
    default: null
  }
});

// 触发点击事件
const handleClick = (event) => {
  if (props.disabled || props.loading) return;
  props.onClick && props.onClick(event);
};

// 计算按钮类名
const buttonClasses = computed(() => {
  return {
    'g-button': true,
    [`g-button-${props.type}`]: true,
    [`g-button-${props.size}`]: true,
    'g-button-icon': props.icon,
    'g-button-round': props.round,
    'g-button-block': props.block,
    'g-button-ghost': props.ghost,
    'g-button-disabled': props.disabled,
    'g-button-loading': props.loading
  };
});
</script>

<template>
  <button 
    :class="buttonClasses"
    @click="handleClick"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="g-button-loading-icon">
      <span class="g-button-spinner"></span>
    </span>
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.g-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-4);
  height: 40px;
  font-size: var(--font-size-base);
  font-weight: 500;
  line-height: 1.5;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  gap: var(--spacing-2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    transition: background-color var(--transition-fast);
    pointer-events: none;
  }
  
  &:hover::before {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:active::before {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  &-primary {
    background-color: var(--primary-color);
    color: var(--text-white);
    box-shadow: 0 2px 0 rgba(var(--primary-color-rgb), 0.1);
  }
  
  &-secondary {
    background-color: var(--secondary-color);
    color: var(--text-white);
    box-shadow: 0 2px 0 rgba(var(--secondary-color-rgb), 0.1);
  }
  
  &-success {
    background-color: var(--success-color);
    color: var(--text-white);
    box-shadow: 0 2px 0 rgba(var(--success-color-rgb), 0.1);
  }
  
  &-warning {
    background-color: var(--warning-color);
    color: var(--text-white);
    box-shadow: 0 2px 0 rgba(var(--warning-color-rgb), 0.1);
  }
  
  &-danger {
    background-color: var(--error-color);
    color: var(--text-white);
    box-shadow: 0 2px 0 rgba(var(--error-color-rgb), 0.1);
  }
  
  &-info {
    background-color: var(--info-color);
    color: var(--text-white);
    box-shadow: 0 2px 0 rgba(var(--info-color-rgb), 0.1);
  }
  
  &-ghost {
    background-color: transparent;
    border: 1px solid currentColor;
    box-shadow: none;
    
    &.g-button-primary {
      color: var(--primary-color);
    }
    
    &.g-button-secondary {
      color: var(--secondary-color);
    }
    
    &.g-button-success {
      color: var(--success-color);
    }
    
    &.g-button-warning {
      color: var(--warning-color);
    }
    
    &.g-button-danger {
      color: var(--error-color);
    }
    
    &.g-button-info {
      color: var(--info-color);
    }
  }
  
  &-text {
    background-color: transparent;
    color: var(--text-primary);
    box-shadow: none;
    
    &:hover::before {
      background-color: rgba(var(--text-primary-rgb), 0.05);
    }
  }
  
  &-small {
    height: 32px;
    padding: 0 var(--spacing-3);
    font-size: var(--font-size-sm);
  }
  
  &-large {
    height: 48px;
    padding: 0 var(--spacing-5);
    font-size: var(--font-size-lg);
  }
  
  &-icon {
    width: 40px;
    padding: 0;
    
    &.g-button-small {
      width: 32px;
    }
    
    &.g-button-large {
      width: 48px;
    }
  }
  
  &-round {
    border-radius: var(--border-radius-full);
  }
  
  &-block {
    display: flex;
    width: 100%;
  }
  
  &-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &::before {
      display: none;
    }
  }
  
  &-loading {
    cursor: default;
    
    &::before {
      display: none;
    }
  }
  
  &-loading-icon {
    margin-right: var(--spacing-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  &-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-top-color: transparent;
    animation: g-button-spin 0.8s linear infinite;
  }
}

@keyframes g-button-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 