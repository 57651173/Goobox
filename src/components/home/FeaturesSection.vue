<template>
  <div id="features-section" class="features-section section-block" :class="{ 'show': show }">
    <div class="section-container">
      <div class="section-badge center">{{ t('home.solutions') }}</div>
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