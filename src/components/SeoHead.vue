<script setup>
import { computed, watch } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import seoConfig, { getSeoForRoute } from '../config/seo'

const props = defineProps({
  // 可选，覆盖默认路由名称
  routeName: {
    type: String,
    default: null
  },
  // 可选，额外的元数据
  meta: {
    type: Object,
    default: () => ({})
  }
})

const route = useRoute()
const { t, locale } = useI18n()

// 获取当前路由名称
const currentRouteName = computed(() => props.routeName || route.name)

// 合并SEO配置和传入的元数据
const seoData = computed(() => {
  const baseSeoData = getSeoForRoute(currentRouteName.value)
  return {
    ...baseSeoData,
    ...props.meta
  }
})

// 生成伪静态URL格式
const getStaticUrl = (path) => {
  if (!path) return '/'
  
  // 移除前导斜杠
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  
  // 如果是首页，直接返回
  if (cleanPath === '') return '/'
  
  // 转换为伪静态格式
  return `/${cleanPath}.html`
}

// 构建当前URL的伪静态版本
const currentStaticUrl = computed(() => {
  const path = seoData.value.path || route.path
  return `${seoConfig.baseSeo.baseUrl}${getStaticUrl(path).substring(1)}`
})

// 生成多语言备选URL
const alternateUrls = computed(() => {
  const languages = ['en', 'zh', 'de', 'es', 'ja']
  const path = seoData.value.path || route.path
  const staticPath = getStaticUrl(path)
  
  return languages.map(lang => ({
    lang,
    url: `${seoConfig.baseSeo.baseUrl}${staticPath.substring(1)}?lang=${lang}`
  }))
})

// 使用useHead设置页面头部
useHead({
  title: computed(() => seoData.value.title),
  meta: computed(() => [
    { 
      name: 'description', 
      content: seoData.value.description 
    },
    { 
      name: 'keywords', 
      content: seoData.value.keywords || seoConfig.baseSeo.keywords
    },
    { 
      name: 'author', 
      content: seoData.value.author || seoConfig.baseSeo.author
    },
    { 
      property: 'og:title', 
      content: seoData.value.title 
    },
    { 
      property: 'og:description', 
      content: seoData.value.description 
    },
    { 
      property: 'og:type', 
      content: 'website' 
    },
    { 
      property: 'og:url', 
      content: currentStaticUrl.value 
    },
    { 
      property: 'og:image', 
      content: seoData.value.ogImage || seoConfig.baseSeo.ogImage
    },
    // 添加语言信息
    { 
      property: 'og:locale', 
      content: locale.value === 'zh' ? 'zh_CN' : 
               locale.value === 'ja' ? 'ja_JP' :
               locale.value === 'de' ? 'de_DE' :
               locale.value === 'es' ? 'es_ES' : 'en_US'
    },
    // 移动端优化
    { 
      name: 'viewport', 
      content: 'width=device-width, initial-scale=1, maximum-scale=5' 
    },
    // 如果是移动应用可添加
    { 
      name: 'apple-mobile-web-app-capable', 
      content: 'yes' 
    },
    // 主题颜色
    { 
      name: 'theme-color', 
      content: '#1890ff' 
    },
    // 结构化数据提示
    {
      name: 'format-detection',
      content: 'telephone=no'
    }
  ]),
  link: computed(() => [
    // canonical链接使用伪静态URL
    { 
      rel: 'canonical', 
      href: currentStaticUrl.value
    },
    // 多语言备选链接
    ...alternateUrls.value.map(alt => ({
      rel: 'alternate',
      hreflang: alt.lang,
      href: alt.url
    }))
  ])
})

// 监听路由变化，重新设置SEO
watch(() => route.path, () => {
  // 路由变化时SEO数据会自动更新，这里可以添加其他逻辑
  console.log('Route changed, SEO updated to:', currentStaticUrl.value)
})
</script>

<template>
  <div class="seo-head"></div>
</template> 