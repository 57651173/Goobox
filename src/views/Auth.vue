<template>
  <div class="auth-view-container">
    <a-card class="auth-card">
      <template #title>
        <div class="auth-header">
          <img src="../assets/images/goobox.png" alt="GooBox Logo" class="auth-logo" />
          <div style="margin-left: 25px;padding-bottom: 15px;">
            <h2>{{ currentView === 'login' ? t('auth.welcomeBack') : t('auth.createAccount') }}</h2>
            <div v-if="currentView === 'login'" class="auth-subtitle">{{ t('auth.loginToAccount') }}</div>
            <div v-else class="auth-subtitle">{{ t('auth.startUsingSystem') }}</div>
          </div>
        </div>
      </template>
      <Login 
        v-if="currentView === 'login'" 
        @switch-to-register="switchToRegister"
        @login-success="handleAuthSuccess"
      />
      <Register 
        v-else 
        @switch-to-login="switchToLogin"
        @register-success="handleAuthSuccess"
      />
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Login from './auth/Login.vue';
import Register from './auth/Register.vue';
import { useAuthStore } from '../store/auth';

const { t } = useI18n();
const currentView = ref('login');
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 根据路由参数设置初始视图
onMounted(() => {
  if (route.query.view === 'register') {
    currentView.value = 'register';
  }
});

const switchToRegister = () => {
  currentView.value = 'register';
  // 更新URL，但不触发页面刷新
  router.replace({ query: { ...route.query, view: 'register' } });
};

const switchToLogin = () => {
  currentView.value = 'login';
  // 更新URL，但不触发页面刷新
  router.replace({ query: { ...route.query, view: 'login' } });
};

const handleAuthSuccess = () => {
  // 检查是否有重定向历史，否则跳转到首页或Container页
  const redirectPath = route.query.redirect || '/container';
  router.push(redirectPath);
};

// 如果用户已登录，尝试直接跳转
if (authStore.isLoggedIn) {
  const redirectPath = route.query.redirect || '/container';
  router.push(redirectPath);
}
</script>

<style lang="scss" scoped>
.auth-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: auto 0;
  background: linear-gradient(135deg, #1C4468 0%, #2C5C8A 100%);
  height: calc(100vh - 64px);
  overflow: hidden;
}

:deep(.ant-card-head-title){
  padding-top: 20px;
  height: 100px;
  .auth-header {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
  width: 100%;
  
  
  .auth-logo {
    height: 80px;
    margin-bottom: 16px;
    border-radius: 6px;
  }
  
  h2 {
    color: #1C4468;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .auth-subtitle {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}
}

.auth-card {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 0;

}


.ant-layout-footer{
  display: none !important;
}

:deep(.ant-card-head) {
  border-bottom: none;
  padding: 0;
}

:deep(.ant-card-body) {
  padding: 18px 32px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

:deep(.ant-btn-primary) {
  height: 40px;
  font-size: 16px;
  background: #1C4468;
  border-color: #1C4468;
  
  &:hover {
    background: #2C5C8A;
    border-color: #2C5C8A;
  }
}

:deep(.ant-btn-default) {
  height: 40px;
  font-size: 16px;
  border-color: #1C4468;
  color: #1C4468;
  
  &:hover {
    border-color: #2C5C8A;
    color: #2C5C8A;
  }
}
</style> 