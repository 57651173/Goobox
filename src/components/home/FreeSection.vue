<template>
  <div id="free-section" class="free-section section-block" :class="{ 'show': show }">
    <div class="section-container">
      <div class="section-badge center">{{ t('home.freeForever') }}</div>
      <h2 class="section-title center">{{ t('home.alwaysFree') }}</h2>
      <p class="section-description center">{{ t('home.alwaysFreeDesc') }}</p>
      
      <div class="free-features">
        <a-row :gutter="[32, 32]">
          <a-col :span="24" :md="8">
            <div class="free-feature-card">
              <div class="free-feature-icon">
                <GithubFilled />
              </div>
              <h3 class="free-feature-title">{{ t('home.solemnPromise') }}</h3>
              <p class="free-feature-desc">{{ t('home.alwaysFreeDesc') }}</p>
            </div>
          </a-col>
          <a-col :span="24" :md="8">
            <div class="free-feature-card">
              <div class="free-feature-icon">
                <CheckCircleFilled />
              </div>
              <h3 class="free-feature-title">{{ t('home.freeForever') }}</h3>
              <p class="free-feature-desc">{{ t('home.alwaysFreeDesc') }}</p>
            </div>
          </a-col>
          <a-col :span="24" :md="8">
            <div class="free-feature-card">
              <div class="free-feature-icon">
                <DollarCircleFilled />
              </div>
              <h3 class="free-feature-title">{{ t('home.noHiddenFees') }}</h3>
              <p class="free-feature-desc">{{ t('home.alwaysFreeDesc') }}</p>
            </div>
          </a-col>
        </a-row>
      </div>

      <div class="free-cta">
        <a-button type="primary" size="large" class="cta-button" shape="round">
          <router-link to="/container">{{ t('home.startSimulation') }}</router-link>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { GithubFilled, CheckCircleFilled, DollarCircleFilled } from '@ant-design/icons-vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
</script> 