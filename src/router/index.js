import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/About.vue'),
    },
  ],
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

export default router
