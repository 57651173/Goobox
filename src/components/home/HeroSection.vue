<template>
  <div class="hero-fullscreen" :class="{ 'show': show }">
    <div class="hero-background"></div>
    <div class="hero-overlay"></div>
    <!-- 集装箱背景图片 -->
    <div class="container-background"></div>
    <div class="content-overlay"></div>
    <div class="globe-animation">
      <div class="globe"></div>
      <div class="orbit orbit-1"></div>
      <div class="orbit orbit-2"></div>
      <div class="orbit orbit-3"></div>
      <div class="satellite satellite-1"></div>
      <div class="satellite satellite-2"></div>
      <div class="satellite satellite-3"></div>
    </div>
    <div class="hero-content">
      <!-- 永久免费标志 -->
      <div class="free-badge-container">
        <div class="free-badge">
          <span class="free-text">{{ t('home.freeForever') }}</span>
          <div class="badge-ribbon"></div>
        </div>
      </div>
      <div class="hero-actions">
        <div class="link-button">
          <a-button type="primary" size="large" class="cta-button" shape="round">
          <router-link to="/container">{{ t('home.tryNow') }}</router-link>
        </a-button>
          <a-button type="default" size="large" class="scroll-button">
            <router-link to="/about">{{ t('home.learnMore') }}</router-link>
          </a-button>
        </div>
      </div>
    </div>
    <div class="scroll-indicator" @click="emit('scroll', 'intro')">
      <span class="mouse">
        <span class="mouse-wheel"></span>
      </span>
      <span class="scroll-text">{{ t('home.scrollDown') }}</span>
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

const emit = defineEmits(['scroll'])
const { t } = useI18n()
</script>

<style scoped>
/* 内容遮罩层，确保文字清晰可见 */
.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 70%);
  z-index: -1;
  pointer-events: none;
}

/* 集装箱背景样式 */
.container-background {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 65%;
  height: 90%;
  background-image: url('../../assets/images/container-bg.svg');
  background-size: contain;
  background-position: bottom right;
  background-repeat: no-repeat;
  opacity: 0.6;
  z-index: -1;
  animation: float 4s ease-in-out infinite;
}

/* 调整hero-content位置，避免与背景图片重叠 */
.hero-content {
  position: relative;
  z-index: 2;
  text-align: left;
  max-width: 430px;
  margin-left: 15%;
  margin-right: auto;
  padding: 2rem 3rem;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 永久免费标志样式 */
.free-badge-container {
  margin: 1.5rem 0;
  position: relative;
  display: inline-block;
  animation: pulse 3s ease-in-out infinite;
}

.free-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff4081, #ff9b44);
  color: white;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 4px 15px rgba(255, 64, 129, 0.3);
  transform-origin: center;
  animation: wiggle 5s ease-in-out infinite;
}

.free-text {
  z-index: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 2rem;
}

.welcome-text{
  color: #fff;
  text-align: center; 
  font-family:Arial, Helvetica, sans-serif;
  font-size: 14px;
  margin: 0 auto;
}

.badge-ribbon {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent 70%);
  border-radius: 20px;
}

.free-description {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(-2deg);
  }
  25%, 75% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

/* 适配移动设备 */
@media (max-width: 768px) {
  .container-background {
    width: 100%;
    height: 60%;
    bottom: 5%;
    opacity: 0.5;
  }

  .hero-content {
    margin: 0 auto;
    text-align: center;
    max-width: 90%;
  }
}
</style> 