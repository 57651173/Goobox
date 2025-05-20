import { defineStore } from 'pinia'
import { register, login, logout } from '@/api/user'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('authToken') || null,
    checkedInitialAuth: false,
  }),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated || !!state.token,
    currentUser: (state) => state.user,
  },
  actions: {
    // 模拟登录
    async login(credentials) {
      // 在实际应用中，这里会调用API进行验证
      // 为演示目的，我们假设 credentials 包含 { username, password }
      // 并简单地设置状态
      console.log('[AuthStore] Attempting login with:', credentials);

      try {
        const res = await login(credentials);
        console.log('[login-AuthStore] Login successful:', res);
        return res;
      } catch (err) {
        console.log('[login-AuthStore] Login failed:', err);
        // 将错误向上抛出，以便被Login.vue中的try/catch捕获
        throw err;
      }
    },

    // 模拟注册
    async register(userInfo) {
      // 在实际应用中，这里会调用API进行注册
      console.log('[AuthStore] Attempting registration with:', userInfo);
      //todo  调用API进行注册
      register(userInfo).then(res => {
        console.log('[AuthStore] Registration successful:', res);
        // 假设注册成功后自动登录
        // 实际应用中可能需要跳转到登录页或发送验证邮件等
        // this.isAuthenticated = true;
        // this.user = { name: userInfo.username, email: userInfo.email };
        // const fakeToken = 'fake-jwt-token-reg-' + Date.now();
        // this.token = fakeToken;
        // localStorage.setItem('authToken', fakeToken);
        // console.log('[AuthStore] Registration successful and logged in. Token:', fakeToken);

      }).catch(err => {
        console.log('[AuthStore] Registration failed:', err);
      })
    },

    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      localStorage.removeItem('authToken');
      console.log('[AuthStore] Logged out.');
      // 根据需要，可能需要重定向到登录页
      // router.push('/auth'); 
    },

    // 检查本地存储的token并尝试恢复会话
    checkAuth() {
      const token = localStorage.getItem('authToken');
      if (token) {
        // 在实际应用中，这里应该验证token的有效性
        // 为演示目的，我们简单地认为存在token即为已认证
        this.token = token;
        this.isAuthenticated = true;
        //todo 理想情况下，还会根据token去获取用户信息
        // this.user = { name: 'Restored User' }; // 假设从API获取
        // console.log('[AuthStore] Session restored with token:', token);
      } else {
        console.log('[AuthStore] No active session found.');
      }
      this.checkedInitialAuth = true;
    }
  },
}) 