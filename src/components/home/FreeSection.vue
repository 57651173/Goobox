<template>
  <div id="free-section" class="free-section section-block" :class="{ 'show': show }">
    <div class="section-container">
      <h2 class="section-title center">{{ t('home.alwaysFree') }}</h2>
      <p class="section-description center">{{ t('home.alwaysFreeDesc') }}</p>
      
      <div class="free-features">
        <a-row :gutter="[32, 32]">
          <a-col :span="24" :md="8">
            <div class="free-feature-card">
              <div class="card-pattern"></div>
              <div class="free-feature-icon">
                <GithubFilled />
              </div>
              <h3 class="free-feature-title">{{ t('home.solemnPromise') }}</h3>
              <div class="feature-line"></div>
              <p class="free-feature-desc">{{ t('home.alwaysFreeDesc') }}</p>
            </div>
          </a-col>
          <a-col :span="24" :md="8">
            <div class="free-feature-card">
              <div class="card-pattern"></div>
              <div class="free-feature-icon">
                <CheckCircleFilled />
              </div>
              <h3 class="free-feature-title">{{ t('home.freeForever') }}</h3>
              <div class="feature-line"></div>
              <p class="free-feature-desc">{{ t('home.alwaysFreeDesc') }}</p>
            </div>
          </a-col>
          <a-col :span="24" :md="8">
            <div class="free-feature-card">
              <div class="card-pattern"></div>
              <div class="free-feature-icon">
                <DollarCircleFilled />
              </div>
              <h3 class="free-feature-title">{{ t('home.noHiddenFees') }}</h3>
              <div class="feature-line"></div>
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

<style lang="scss" scoped>
.free-section {
  position: relative;
  padding: 100px 0;
  background: linear-gradient(180deg, #eef1f5 0%, #f7f9fc 100%);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
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

.section-description {
  font-size: 18px;
  line-height: 1.6;
  color: #4b5563;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 48px;
}

.center {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.free-features {
  margin-bottom: 60px;
}

.free-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  font-size: 32px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #10b981;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.free-feature-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 14px;
  transition: all 0.3s ease;
}

.feature-line {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  margin-bottom: 14px;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.free-feature-desc {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  transition: all 0.3s ease;
}

.free-feature-card {
  position: relative;
  padding: 40px 32px;
  border-radius: 16px;
  background-color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
  height: 100%;
  text-align: center;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
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
    background-image: radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
    z-index: -1;
    transition: all 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    
    &::after {
      transform: scaleX(1);
    }
    
    .free-feature-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      transform: scale(1.05);
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
    }
    
    .free-feature-title {
      color: #10b981;
    }
    
    .feature-line {
      width: 60px;
    }
    
    .card-pattern {
      width: 200px;
      height: 200px;
    }
  }
}

.free-cta {
  text-align: center;
  margin-top: 20px;
  
  .cta-button {
    height: 52px;
    padding: 0 32px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px rgba(16, 185, 129, 0.3);
    }
    
    a {
      color: #fff;
      text-decoration: none;
    }
  }
}

.free-section.show {
  .free-feature-card {
    animation: fadeInUp 0.6s forwards;
    opacity: 0;
    
    @for $i from 1 through 3 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
    }
  }
  
  .free-cta {
    animation: fadeInUp 0.6s 0.4s forwards;
    opacity: 0;
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
  .free-section {
    padding: 70px 0;
  }
  
  .section-title {
    font-size: 30px;
  }
  
  .section-description {
    font-size: 16px;
    margin-bottom: 40px;
  }
  
  .free-feature-card {
    padding: 30px 24px;
    margin-bottom: 20px;
  }
}
</style> 