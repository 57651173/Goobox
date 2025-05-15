# Goobox 集装箱装载模拟系统

基于 Vue 3 和 Vite 构建的 3D 集装箱装载模拟系统。

[English](./README.md)

## 功能特点

- 集装箱装载的 3D 可视化
- 支持多种集装箱类型
- 实时装载数据统计
- 智能空间优化算法
- 装载方案导出功能

## 推荐的 IDE 设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用 Vetur）。

## 项目设置

```sh
yarn
```

### 开发环境编译和热重载

```sh
yarn dev
```

### 生产环境编译和压缩

```sh
yarn build
```

## 国际化 (i18n)

本项目已集成国际化功能，支持多种语言切换。以下是国际化实现方式：

1. 使用 vue-i18n 库：
```sh
yarn add vue-i18n@next
```

2. 语言文件位于 `src/locales/` 目录：
   - `zh.json` - 中文翻译
   - `en.json` - 英文翻译
   - `de.json` - 德文翻译
   - `es.json` - 西班牙文翻译
   - 可根据需要添加其他语言

3. i18n 配置（已在 `src/main.js` 中设置）：
```js
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'

const i18n = createI18n({
  legacy: false,
  locale: 'zh',  // 默认使用中文
  fallbackLocale: 'en',
  messages: { en, zh, de, es }
})

app.use(i18n)
```

4. 应用右上角提供带有国旗图标的语言选择器。

## 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 组件
├── locales/       # 国际化语言文件
├── router/        # 路由配置
├── views/         # 页面视图
├── App.vue        # 主应用组件
└── main.js        # 应用入口
```

## 技术栈

- Vue 3：前端框架
- Vite：构建工具
- Vue Router：路由管理
- Vue I18n：国际化
- Ant Design Vue：UI 组件库
- Three.js：3D 渲染 