<template>
  <div class="login-form-container">
    <a-form :model="formState"
    :labelCol="{ span: 4 }"
    :wrapperCol="{ span: 20 }"
    autocomplete="off"
    layout="horizontal" @finish="handleLogin">
      <a-form-item
        :label="t('auth.username')"
        name="username"
        :rules="[{ required: true, message: t('auth.validation.usernameRequired') }]"
      >
        <a-input 
          v-model:value="formState.username" 
          :placeholder="t('auth.validation.usernameOrEmail')"
          size="large"
        >
          <template #prefix>
            <user-outlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        :label="t('auth.password')"
        name="password"
        :rules="[{ required: true, message: t('auth.validation.passwordRequired') }]"
      >
        <a-input-password 
          v-model:value="formState.password" 
          :placeholder="t('auth.validation.password')"
          size="large"
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item v-if="errorMessage">
        <a-alert :message="errorMessage" type="error" show-icon />
      </a-form-item>

      <a-form-item :wrapper-col=" { span: 24 }">
        <a-button type="primary" html-type="submit" :loading="loading" block size="large">
          {{ t('auth.login') }}
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <a-divider>{{ t('auth.otherOptions') }}</a-divider>
        <a-button type="default" block size="large" @click="$emit('switch-to-register')">
          {{ t('auth.noAccount') }}
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message as antMessage } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';

const emit = defineEmits(['switch-to-register', 'login-success']);
const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const formState = reactive({
  username: '',
  password: ''
});
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login({ username: formState.username, password: formState.password });
    antMessage.success('登录成功！');
    emit('login-success');
  } catch (error) {
    // console.error("登录失败:", error);
    errorMessage.value = error.message || '登录失败，请检查您的凭据或稍后再试。';
    setTimeout(() => {
      errorMessage.value = '';
    }, 1000);
    // 已在request.js中处理了错误消息，这里不需要再处理
    // antMessage.error({
    //   content: errorMessage.value,
    //   duration: 0,
    //   onClick: () => {
    //     antMessage.destroy();
    //   }
    // });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-form-container {
  width: 100%;
  padding: 0;
  margin: 0;
  
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.ant-input-affix-wrapper) {
    border-radius: 6px;
    
    &:hover, &:focus {
      border-color: #1C4468;
    }
  }
  
  :deep(.ant-input-password) {
    border-radius: 6px;
    
    &:hover, &:focus {
      border-color: #1C4468;
    }
  }
  
  :deep(.ant-btn) {
    border-radius: 6px;
  }
}

.form-footer {
  margin-top: 24px;
  margin-bottom: 0;
  
  :deep(.ant-divider) {
    color: #666;
    font-size: 14px;
    margin: 16px 0;
  }
}
</style> 