<template>
  <div id="intro-section" class="intro-section section-block" :class="{ 'show': show }">
    <div class="section-container">
      <a-row :gutter="[48, 48]" type="flex" align="middle">
        <a-col :span="24" :lg="12">
          <div class="section-content">
            <div class="section-badge">{{ t('home.about') }}</div>
            <h2 class="section-title">{{ t('home.features') }}</h2>
            <p class="section-description">{{ t('home.description') }}</p>
          </div>
        </a-col>
        <a-col :span="24" :lg="12">
          <div class="container-model">
            <div class="container-box">
              <div class="container-top"></div>
              <div class="container-side"></div>
              <div class="container-front"></div>
              <div class="container-interior">
                <div class="cargo cargo-1"></div>
                <div class="cargo cargo-2"></div>
                <div class="cargo cargo-3"></div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
</script> 