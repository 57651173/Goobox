/**
 * SEO配置文件
 * 为应用中的每个路由定义元标签数据
 */

const baseSeo = {
  title: 'Container Loading Simulator',
  description: '高效的集装箱装载模拟和优化工具',
  keywords: 'container loading, cargo optimization, shipping simulation, logistics planning',
  author: 'Goobox',
  ogImage: '/logo.png',
  baseUrl: 'http://goobox.bangzone.net/'
};

// 每个路由的特定SEO配置
export const routeSeo = {
  home: {
    title: '首页 | Container Loading Simulator',
    description: '集装箱装载模拟器 - 高效规划和优化货物装载的专业工具',
    path: '/'
  },
  container: {
    title: '集装箱模拟 | Container Loading Simulator',
    description: '使用我们的3D集装箱装载模拟器优化您的货物装载方案',
    keywords: 'container loading simulation, 3D container loading, cargo optimization',
    path: '/container'
  },
  about: {
    title: '关于我们 | Container Loading Simulator',
    description: '了解我们的集装箱装载解决方案如何提高您的物流效率',
    path: '/about'
  },
  settings: {
    title: '系统设置 | Container Loading Simulator',
    description: '个性化配置您的集装箱装载模拟工具',
    path: '/settings'
  },
  auth: {
    title: '账户登录 | Container Loading Simulator',
    description: '登录您的集装箱装载模拟器账户',
    path: '/auth'
  }
};

// 获取指定路由的完整SEO配置
export const getSeoForRoute = (routeName) => {
  const routeConfig = routeSeo[routeName] || {};
  
  return {
    ...baseSeo,
    ...routeConfig,
    ogUrl: `${baseSeo.baseUrl}${routeConfig.path || ''}`,
  };
};

export default {
  baseSeo,
  routeSeo,
  getSeoForRoute
}; 