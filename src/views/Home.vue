<template>
  <div class="home-container">
    <HeroSection 
      :show="showContent"
      @scroll="scrollToSection"
    />

    <IntroSection 
      v-if="activeSections.intro"
    />

    <FeaturesSection 
      :show="activeSections.features"
    />

    <FreeSection 
      :show="activeSections.free"
    />
    
    <!-- 返回顶部悬浮球 -->
    <div class="back-to-top" v-show="showBackToTop" @click="scrollToTop">
      <a-button type="primary" shape="circle" size="large">
        <template #icon><up-outlined /></template>
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UpOutlined } from '@ant-design/icons-vue'
import '../assets/css/home.css'

// 导入组件
import HeroSection from '../components/home/HeroSection.vue'
import IntroSection from '../components/home/IntroSection.vue'
import FeaturesSection from '../components/home/FeaturesSection.vue'
import FreeSection from '../components/home/FreeSection.vue'

const { t, locale } = useI18n()
const route = useRoute()
const showContent = ref(false)
const sections = ref([])
const showBackToTop = ref(false)
const activeSections = ref({
  hero: true,
  intro: false,
  features: true,
  free: true,
  global: true,
  demo: true
})

// 修改语言
const changeLanguage = (lang) => {
  locale.value = lang
}

// 返回顶部函数
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 滚动检测函数
const checkScroll = () => {
  const scrollPosition = window.scrollY
  const windowHeight = window.innerHeight
  
  // 显示/隐藏返回顶部按钮
  showBackToTop.value = scrollPosition > windowHeight / 2
  
  sections.value.forEach(section => {
    const sectionEl = section.el
    if (!sectionEl) return
    
    const sectionTop = sectionEl.getBoundingClientRect().top + window.scrollY
    const sectionHeight = sectionEl.offsetHeight
    
    // 当section的顶部进入视口底部前200px时，或者section已经在视口中间时
    if (
      (scrollPosition > sectionTop - windowHeight + 200) ||
      (scrollPosition + windowHeight / 2 > sectionTop && 
       scrollPosition < sectionTop + sectionHeight)
    ) {
      activeSections.value[section.id] = true
    }
  })
}

// 滚动到指定区域
const scrollToSection = (sectionId) => {
  const section = sections.value.find(s => s.id === sectionId)
  if (section && section.el) {
    window.scrollTo({
      top: section.el.offsetTop - 80, // 导航栏高度的补偿
      behavior: 'smooth'
    })
  }
}

// 监听路由变化，返回顶部
watch(() => route.fullPath, () => {
  if (route.name === 'home') {
    scrollToTop()
  }
}, { immediate: true })

onMounted(() => {
  // 初始化hero区域
  setTimeout(() => {
    showContent.value = true
  }, 100)
  
  // 路由跳转到首页时返回顶部
  scrollToTop()
  
  // 注册各区域
  sections.value = [
    { id: 'hero', el: document.querySelector('.hero-fullscreen'), animated: false },
    { id: 'intro', el: document.querySelector('.intro-section'), animated: false },
    { id: 'features', el: document.querySelector('.features-section'), animated: false },
    { id: 'free', el: document.querySelector('.free-section'), animated: false },
    { id: 'global', el: document.querySelector('.global-section'), animated: false },
    { id: 'demo', el: document.querySelector('.demo-section'), animated: false }
  ]
  
  // 添加滚动监听
  window.addEventListener('scroll', checkScroll)
  
  // 初始检查一次
  checkScroll()
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', checkScroll)
})
</script> 

<style scoped>
.back-to-top {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 999;
  cursor: pointer;
  transition: all 0.3s;
}

@media (max-width: 768px) {
  .back-to-top {
    right: 20px;
    bottom: 20px;
  }
}
</style> 