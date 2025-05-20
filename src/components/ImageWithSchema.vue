<template>
  <div class="image-with-schema">
    <img 
      :src="src" 
      :alt="alt" 
      :width="width" 
      :height="height"
      :loading="loading" 
      :class="classes"
      @error="handleError"
      ref="imageRef"
    />
    <script v-if="enableSchema" type="application/ld+json">
      {{schemaJsonString}}
    </script>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: null
  },
  height: {
    type: [Number, String],
    default: null
  },
  loading: {
    type: String,
    default: 'lazy'
  },
  classes: {
    type: String,
    default: ''
  },
  enableSchema: {
    type: Boolean,
    default: true
  },
  schemaName: {
    type: String,
    default: ''
  },
  schemaCaption: {
    type: String,
    default: ''
  },
  publisherName: {
    type: String,
    default: 'Goobox Container Loading'
  },
  publisherLogo: {
    type: String,
    default: '/logo.png'
  }
});

const imageRef = ref(null);
const hasError = ref(false);
const isLoaded = ref(false);

// 处理图片加载错误
const handleError = () => {
  hasError.value = true;
  emit('error');
};

// 事件
const emit = defineEmits(['load', 'error']);

// 结构化数据JSON字符串
const schemaJsonString = computed(() => {
  if (!props.enableSchema) return '{}';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": props.src,
    "description": props.alt,
    "name": props.schemaName || props.alt,
    "caption": props.schemaCaption || props.alt,
    "width": props.width,
    "height": props.height,
    "publisher": {
      "@type": "Organization",
      "name": props.publisherName,
      "logo": {
        "@type": "ImageObject",
        "url": props.publisherLogo
      }
    }
  };
  
  return JSON.stringify(schema);
});

onMounted(() => {
  if (imageRef.value) {
    imageRef.value.addEventListener('load', () => {
      isLoaded.value = true;
      emit('load');
    });
  }
});
</script>

<style scoped>
.image-with-schema {
  display: inline-block;
  position: relative;
  max-width: 100%;
}

.image-with-schema img {
  max-width: 100%;
  height: auto;
}
</style> 