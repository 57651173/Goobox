# Goobox 集装箱装载模拟系统

一个基于 Vue 3 和 Three.js 构建的3D集装箱装载模拟系统，帮助用户优化集装箱空间利用率和货物装载计划。

[English](./README.md)

## 功能特点

- **高度可视化的3D装载模拟**: 实时展示货物在集装箱中的摆放位置和空间占用情况
- **多种集装箱类型支持**: 包括标准干货集装箱(20GP/40GP/40HC)和冷藏集装箱(20RF/40RF/40RQHC)
- **实时装载统计数据**: 显示体积和重量利用率，帮助优化装载效率
- **智能装载算法**: 自动计算并优化货物摆放位置，最大化空间利用率
- **多语言支持**: 内置中文、英文、日文、德文和西班牙文界面
- **装载方案导出功能**: 支持导出详细的装载计划和报告
- **搜索引擎优化 (SEO)**: 提升网站在搜索引擎中的可见性
- **用户认证系统**: 支持用户注册和登录功能

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **UI组件库**: Ant Design Vue 4.x
- **3D渲染**: Three.js
- **国际化**: Vue I18n
- **路由管理**: Vue Router

## 系统要求

- Node.js >= 14.0.0
- Yarn >= 1.22.0 (推荐) 或 npm >= 6.0.0

## 快速开始

### 项目设置

```sh
# 克隆项目
git clone https://github.com/57651173/Goobox.git

# 安装依赖
yarn

# 启动开发服务器
yarn dev
```

### 生产环境构建

```sh
yarn build
```

构建完成后，生成的静态文件将会在 `dist` 目录中。

## 开发指南

### 推荐的IDE设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用 Vetur)。

### 代码风格检查

```sh
yarn lint
```

## 国际化 (i18n)

本项目已集成多语言支持，配置如下：

1. 语言文件位于 `src/locales/` 目录：
   - `zh.json` - 中文翻译
   - `en.json` - 英文翻译
   - `ja.json` - 日文翻译
   - `de.json` - 德文翻译
   - `es.json` - 西班牙文翻译

2. i18n 配置（已在 `src/main.js` 中设置）：
```js
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'
import ja from './locales/ja.json'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,  // 默认使用保存的语言设置或浏览器语言
  fallbackLocale: 'en',
  messages: { en, zh, de, es, ja }
})

app.use(i18n)
```

3. 应用右上角提供语言选择器，用户可以方便地切换语言。

## 项目结构

```
├── public/            # 静态资源目录
├── src/               # 源代码
│   ├── assets/        # 静态资源文件
│   ├── components/    # 通用组件
│   │   ├── container/ # 集装箱相关组件
│   │   ├── home/      # 首页相关组件
│   │   └── icons/     # 图标组件
│   ├── config/        # 全局配置
│   ├── locales/       # 国际化语言文件
│   ├── router/        # 路由配置
│   ├── views/         # 页面视图
│   ├── App.vue        # 主应用组件
│   └── main.js        # 应用入口
├── index.html         # HTML模板
├── vite.config.js     # Vite配置
├── .eslintrc.js       # ESLint配置
├── package.json       # 项目依赖
└── README.md          # 项目文档
```


## 贡献指南

我们欢迎任何形式的贡献，包括但不限于：

1. 提交Issue报告bug或提出新功能建议
2. 提交Pull Request改进代码或文档
3. 帮助翻译或完善多语言支持

## 许可证

[MIT License](LICENSE) 