import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { useAuthStore } from '../store/auth.js' // 导入Auth store

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/container',
    name: 'container',
    // 集装箱装柜模拟页面
    component: () => import('../views/Container.vue'),
    meta: { requiresAuth: false } // 需要登录才能访问
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/About.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    // 系统设置页面
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true } // 假设设置页也需要登录
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/Auth.vue'),
    meta: { requiresGuest: true } // 如果已登录，访问此页面应重定向
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置，则恢复到保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 如果是导航到首页，则滚动到顶部
    if (to.name === 'home') {
      return { top: 0 }
    }
    // 默认行为，滚动到页面顶部
    return { top: 0 }
  }
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // 在守卫函数内部获取store实例
  
  // 在应用启动时检查本地认证状态
  // 确保只在authStore未进行初始检查时调用，或者提供一种方式来标记已检查
  if (!authStore.checkedInitialAuth) { // 假设我们将在authStore中添加一个标志
    authStore.checkAuth(); // 尝试从localStorage恢复会话
    // authStore.checkedInitialAuth = true; // 标记已检查，或者在checkAuth内部处理
  }

  const isLoggedIn = authStore.isLoggedIn;

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 如果目标路由需要认证但用户未登录，则重定向到登录页
    // 同时将目标路径作为查询参数传递，以便登录后可以重定向回来
    next({ name: 'auth', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresGuest && isLoggedIn) {
    // 如果目标路由是为访客准备的（例如登录/注册页），但用户已登录
    // 则重定向到首页或来源页（如果存在）
    next(from.fullPath && from.fullPath !== to.fullPath ? from.fullPath : '/');
  } else {
    // 其他情况正常导航
    next();
  }
});

export default router
