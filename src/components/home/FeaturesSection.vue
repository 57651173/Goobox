<template>
  <div id="features-section" class="features-section section-block" :class="{ 'show': show }">
    <div class="section-container">
      <h2 class="section-title center">{{ t('home.features') }}</h2>
      <div class="section-description center">
        <span>&nbsp;</span>
      </div>
      <div class="features-grid">
        <a-row :gutter="[32, 32]">
          <a-col :span="24" :md="12" :lg="8" v-for="(feature, index) in features" :key="index">
            <div class="feature-card" @mouseenter="activeTab = index" :class="{ 'active': activeTab === index }">
              <div class="card-pattern"></div>
              <div class="feature-icon">
                <component :is="feature.iconComponent" />
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <div class="feature-line"></div>
              <p class="feature-desc">{{ feature.description }}</p>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import {
  ContainerOutlined,
  ApartmentOutlined,
  FundOutlined,
  BarChartOutlined,
  SaveOutlined,
  CheckCircleOutlined // 默认/备用图标
} from '@ant-design/icons-vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const activeTab = ref(0)

// 将图标字符串映射到实际的组件
const iconComponents = {
  container: ContainerOutlined,
  apartment: ApartmentOutlined,
  fund: FundOutlined,
  'bar-chart': BarChartOutlined, // 注意 kebab-case
  save: SaveOutlined,
  'check-circle': CheckCircleOutlined // 默认图标
};

// 特性图标名称 (保持字符串，用于映射)
const featureIconNames = [
  'container', 'apartment', 'fund', 'bar-chart', 'save'
]

// 特性键名（用于i18n翻译）
const featureKeys = [
  'optimization',
  'visualPlanning',
  'efficiencyAnalysis',
  'statistics',
  'exportPlan'
]

// 特性列表
const features = computed(() => {
  return featureKeys.map((key, index) => {
    const iconName = featureIconNames[index] || 'check-circle';
    return {
      title: t(`home.featuresList.${key}.title`),
      description: t(`home.featuresList.${key}.description`),
      iconComponent: iconComponents[iconName] || CheckCircleOutlined // 获取对应的组件
    }
  })
})
</script>
<style lang="scss" scoped>
.features-section {
  position: relative;
  padding: 80px 0;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef1f5 100%);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(120, 120, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(90, 200, 255, 0.1) 0%, transparent 50%);
    z-index: 0;
  }
  
  .section-container {
    position: relative;
    z-index: 1;
  }
}

.section-badge {
  display: inline-block;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 18px;
  background: linear-gradient(135deg, #1a1a2e 0%, #384159 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  margin-top: 48px;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  font-size: 28px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #4f46e5;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.feature-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 14px;
  transition: all 0.3s ease;
}

.feature-line {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%);
  margin-bottom: 14px;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.feature-desc {
  font-size: 15px;
  line-height: 1.6;
  color: #4b5563;
  transition: all 0.3s ease;
}

.feature-card {
  position: relative;
  padding: 32px;
  border-radius: 16px;
  background-color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
  height: 100%;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }
  
  .card-pattern {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background-image: radial-gradient(circle at 85% 85%, rgba(79, 70, 229, 0.05) 0%, transparent 50%);
    z-index: -1;
    transition: all 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    
    &::after {
      transform: scaleX(1);
    }
    
    .feature-icon {
      background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%);
      color: #fff;
      transform: scale(1.05);
      box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
    }
    
    .feature-title {
      color: #4f46e5;
    }
    
    .feature-line {
      width: 60px;
    }
    
    .card-pattern {
      width: 200px;
      height: 200px;
    }
  }
  
  &.active {
    border-color: #4f46e5;
  }
}

.features-section.show {
  .feature-card {
    animation: fadeInUp 0.6s forwards;
    opacity: 0;
    
    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .features-section {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 30px;
  }
  
  .feature-card {
    padding: 24px;
  }
}
</style>