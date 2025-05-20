<template>
  <div class="register-form-container">
    <a-form 
    :labelCol="{ span: 4 }"
    :wrapperCol="{ span: 20 }"
    autocomplete="off"
    layout="horizontal"
    :model="formState" @finish="handleRegister">
      <a-form-item
       v-if="captchaType !== 'phone'"
        :label="t('auth.email')"
        name="email"
        :rules="[{ required: true, message: t('auth.validation.emailRequired') }, { type: 'email', message: t('auth.validation.invalidEmail') }]"
      >
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <a-input 
          v-model:value="formState.email" 
          :placeholder="t('auth.validation.emailExample')"
          size="large"
        >
          <template #prefix>
            <mail-outlined />
          </template>
        </a-input>
      </a-form-item>

      <!-- 手机号输入框，仅在使用短信验证码时显示 -->
      <a-form-item
        v-if="captchaType === 'phone'"
        :label="t('auth.phoneNumber')"
        name="phone"
        :rules="[
          { required: captchaType === 'phone', message: t('auth.phoneNumberRequired') },
          { pattern: /^1[3-9]\d{9}$/, message: t('auth.phoneNumberInvalid') }
        ]"
      >
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <a-input 
          v-model:value="formState.phone" 
          :placeholder="t('auth.phoneNumberRequired')"
          size="large"
        >
          <template #prefix>
            <phone-outlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        :label="t('auth.password')"
        name="password"
        :rules="[{ required: true, message: t('auth.validation.passwordRequired') }, { min: 6, message: t('auth.validation.passwordLength') }]"
        has-feedback
      >
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <a-input-password 
          v-model:value="formState.password" 
          :placeholder="t('auth.validation.passwordLength')"
          size="large"
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
        :label="t('auth.confirmPassword')"
        name="confirmPassword"
        :dependencies="['password']"
        has-feedback
        :rules="[
          { required: true, message: t('auth.validation.confirmPasswordRequired') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t('auth.validation.passwordsMismatch')));
            },
          }),
        ]"
      >
        <!-- eslint-disable-next-line vue/no-v-model-argument -->
        <a-input-password 
          v-model:value="formState.confirmPassword" 
          :placeholder="t('auth.validation.confirmPasswordPlaceholder')"
          size="large"
        >
          <template #prefix>
            <safety-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
        :label="t('auth.captcha')"
        name="captcha"
        :rules="[{ required: true, message: t('auth.validation.captchaRequired') }]"
      >
        <a-row :gutter="8">
          <a-col :span="16">
            <!-- eslint-disable-next-line vue/no-v-model-argument -->
            <a-input 
              v-model:value="formState.captcha" 
              :placeholder="t('auth.validation.captchaRequired')"
              size="large"
              :maxlength="6"
              @keyup.enter="handleRegister"
            >
              <template #prefix>
                <safety-certificate-outlined />
              </template>
            </a-input>
          </a-col>
          <a-col :span="8">
            <div class="captcha-wrapper">
              <div v-if="captchaType === 'phone'">
                <!--- 手机短信验证码 -->
                <a-button 
                  size="small" 
                  block
                  @click="sendSmsCaptcha" 
                  :loading="captchaLoading"
                  :disabled=" captchaLoading || countdown > 0"
                >
                  <span v-if="countdown > 0">{{ t('auth.captchaCooldown', { seconds: countdown }) }}</span>
                  <span v-else-if="captchaLoading">{{ t('auth.sendingSms') }}</span>
                  <span v-else>{{ t('auth.getCaptcha') }}</span>
                </a-button>
              </div>
              <div v-else class="image-captcha-container">
                <!--- 图片验证码 -->
                <canvas ref="captchaCanvas" class="captcha-canvas" @click="regenerateImageCaptcha"></canvas>
                <a-button
                  class="refresh-captcha-btn"
                  size="large"
                  :icon="h(ReloadOutlined)"
                  @click="regenerateImageCaptcha"
                  :disabled="captchaLoading || countdown > 0"
                  :title="countdown > 0 ? t('auth.waitToRefresh', { seconds: countdown }) : ''"
                />
                <!-- 倒计时显示 -->
                <div v-if="countdown > 0" class="countdown-indicator">{{ countdown }}s</div>
              </div>
            </div>
          </a-col>
        </a-row>
        <!-- 验证码切换按钮 -->
        <div v-if="false" class="captcha-switch" >
          <a @click="switchCaptchaType">
            {{ captchaType === 'phone' ? t('auth.switchToImage') : t('auth.switchToSms') }}
          </a>
        </div>
      </a-form-item>

      <a-form-item v-if="errorMessage">
        <a-alert :message="errorMessage" type="error" show-icon />
      </a-form-item>

      <a-form-item :wrapper-col=" { span: 24 }">
        <a-button type="primary" html-type="submit" :loading="loading" block size="large">
          {{ t('auth.register') }}
        </a-button>
      </a-form-item>

      <div class="form-footer">
        <a-divider>{{ t('auth.otherOptions') }}</a-divider>
        <a-button type="default" block size="large" @click="$emit('switch-to-login')">
          {{ t('auth.haveAccount') }}
        </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, h } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message as antMessage } from 'ant-design-vue';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined, SafetyCertificateOutlined, ReloadOutlined, PhoneOutlined } from '@ant-design/icons-vue';
import { getCaptcha, sendSmsCaptcha as sendSmsCaptchaApi } from '@/api/user';

const emit = defineEmits(['switch-to-login', 'register-success']);
const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const formState = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  phone: ''
});
const loading = ref(false);   
const errorMessage = ref('');
const captchaId = ref('');
const captchaType = ref('image'); // 'image' 或 'phone'
const countdown = ref(0);
const countdownTimer = ref(null);
const captchaLoading = ref(false);
const captchaCanvas = ref(null);
const captchaText = ref(''); // 存储图片验证码文本

// 清除倒计时函数
const clearCountdownTimer = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
};

// 开始倒计时函数
const startCountdown = () => {
  clearCountdownTimer();
  countdown.value = 60;
  
  countdownTimer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1;
    } else {
      clearCountdownTimer();
    }
  }, 1000);
};

// 切换验证码类型
const switchCaptchaType = () => {
  captchaType.value = captchaType.value === 'image' ? 'phone' : 'image';
  formState.captcha = ''; // 清除验证码输入
  
  // 如果切换到图片验证码，则生成新的图片验证码
  if (captchaType.value === 'image') {
    // 等待 DOM 更新后生成验证码
    setTimeout(() => {
      generateImageCaptcha();
    }, 100);
  }
};

// 生成随机验证码文本
const generateCaptchaText = (length = 4) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 绘制干扰线
const drawInterferenceLine = (ctx, width, height) => {
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.3)`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }
};

// 绘制干扰点
const drawInterferencePoints = (ctx, width, height) => {
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.3)`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 生成图片验证码
const generateImageCaptcha = () => {
  if (!captchaCanvas.value) return;
  
  const canvas = captchaCanvas.value;
  // 设置画布尺寸
  canvas.width = 120;
  canvas.height = 40;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // 生成随机验证码文本
  captchaText.value = generateCaptchaText();
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  // 设置背景
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  // 绘制干扰线
  drawInterferenceLine(ctx, width, height);
  
  // 添加文字
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textWidth = width / captchaText.value.length;
  
  // 为每个字符设置不同颜色和旋转
  for (let i = 0; i < captchaText.value.length; i++) {
    const x = textWidth * (i + 0.5);
    const y = height / 2 + Math.random() * 6 - 3;
    const angle = Math.random() * 0.4 - 0.2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 80)},${Math.floor(Math.random() * 80)},${Math.floor(Math.random() * 80)})`;
    ctx.fillText(captchaText.value[i], 0, 0);
    ctx.restore();
  }
  
  // 绘制干扰点
  drawInterferencePoints(ctx, width, height);
};

// 重新生成图片验证码
const regenerateImageCaptcha = () => {
  // if (countdown.value > 0) return;
  // startCountdown();
  generateImageCaptcha();
};

// 发送短信验证码
const sendSmsCaptcha = async () => {
  if (!formState.phone) {
    antMessage.error(t('auth.phoneNumberRequired'));
    return;
  }
  
  // 验证手机号码格式
  if (!/^1[3-9]\d{9}$/.test(formState.phone)) {
    antMessage.error(t('auth.phoneNumberInvalid'));
    return;
  }
  
  // 如果正在倒计时，阻止重复发送
  if (countdown.value > 0) return;
  
  captchaLoading.value = true;
  try {
    await sendSmsCaptchaApi(formState.phone);
    antMessage.success(t('auth.smsSent'));
    startCountdown();
  } catch (error) {
    console.error('发送短信验证码失败:', error);
    antMessage.error(error.message || t('auth.smsSendFailed'));
  } finally {
    captchaLoading.value = false;
  }
};

// 组件初始化和销毁
onMounted(() => {
  if (captchaType.value === 'image') {
    // 等待 DOM 更新后生成验证码
    setTimeout(() => {
      generateImageCaptcha();
    }, 100);
  }
});

onUnmounted(() => {
  clearCountdownTimer();
});

// 处理注册
const handleRegister = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  // 验证图片验证码
  if (captchaType.value === 'image' && formState.captcha.toLowerCase() !== captchaText.value.toLowerCase()) {
    errorMessage.value = t('auth.captchaError');
    antMessage.error(errorMessage.value);
    loading.value = false;
    
    // 如果冷却时间已过，生成新的图片验证码
    if (countdown.value <= 0) {
      regenerateImageCaptcha();
    }
    
    return;
  }
  
  try {
    // 根据验证码类型构建注册数据
    const registerData = {
      username: formState.username,
      email: formState.email,
      password: formState.password,
    };
    
    // 根据验证码类型添加不同的验证码信息
    if (captchaType.value === 'phone') {
      registerData.captchaType = 'phone';
      registerData.phone = formState.phone;
      registerData.captcha = formState.captcha;
    } else {
      registerData.captchaType = 'image';
      registerData.captcha = formState.captcha;
      registerData.captchaText = captchaText.value; // 前端验证码文本用于后端对比，实际系统应由后端生成
    }
    
    await authStore.register(registerData);
    antMessage.success(t('auth.registerSuccess'));
    emit('register-success');
  } catch (error) {
    console.error("注册失败:", error);
    errorMessage.value = error.message || t('auth.registerFailed');
    
    // 验证码错误处理
    if (error.message && (error.message.includes('验证码') || error.message.includes('captcha'))) {
      if (captchaType.value === 'image') {
        // 如果冷却时间已过，生成新的图片验证码
        if (countdown.value <= 0) {
          regenerateImageCaptcha();
        } else {
          antMessage.warning(t('auth.waitToRefresh', { seconds: countdown.value }));
        }
      }
    }
    
    antMessage.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-form-container {
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
  
  :deep(.ant-input-password .ant-input) {
    border-radius: 6px;
  }

  :deep(.ant-input-password) {
    border-radius: 6px;
    
    &:hover, &:focus {
      border-color: #1C4468;
    }
  }
  
  .captcha-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
  }
  
  .image-captcha-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    
    .captcha-canvas {
      width: 120px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      cursor: pointer;
      flex-grow: 1;
      
      &:hover {
        border-color: #40a9ff;
      }
    }
    
    .refresh-captcha-btn {
      height: 40px;
      min-width: 40px;
      padding: 0 8px;
      margin-left: 8px;
      flex-shrink: 0;
    }
    
    .countdown-indicator {
      position: absolute;
      right: 50px;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;
      pointer-events: none;
    }
  }
  
  .captcha-switch {
    margin-top: 8px;
    text-align: right;
    font-size: 14px;
    
    a {
      color: #1890ff;
      cursor: pointer;
      
      &:hover {
        color: #40a9ff;
      }
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