# Goobox 集装箱装载模拟器

本项目是一个集装箱装载模拟应用，允许用户模拟将不同尺寸的货物装入标准集装箱的过程，并可视化装载结果和相关统计数据。

## 主要功能模块

1.  **集装箱选择与可视化**:
    *   用户可以选择不同类型的标准集装箱（如20GP, 40GP, 40HC, 冷藏箱等）。
    *   3D 可视化显示集装箱和已装载的货物。
2.  **货物管理**:
    *   添加货物：用户可以定义货物的名称、尺寸（长、宽、高）、重量、数量和颜色。
    *   货物列表：显示已添加货物的聚合列表，包括类型、尺寸、数量等。
    *   更新与移除：可以修改货物的颜色或从列表中移除货物。
    *   清空货物：一键清除所有已添加的货物。
3.  **自动装箱算法**:
    *   当用户添加货物时，系统会自动计算最佳摆放方向，并尝试按照一定的策略（例如，从集装箱深处开始，逐层逐行填充）将货物放入集装箱。
    *   碰撞检测：确保新添加的货物不会与已放置的货物发生重叠。
    *   （可选）支撑检测：确保货物有足够的支撑（此功能可能在简化策略中被调整）。
    *   超时处理：如果装箱分析过程过长，会触发超时。
4.  **装载统计与报告**:
    *   实时统计：显示已装载货物的总体积、总重量、空间利用率、重量利用率以及单个货物的数量。
    *   导出报告：用户可以将当前的装载计划（包括3D视图快照、货物列表、统计数据）导出为PDF文件。
5.  **用户认证 (新功能)**:
    *   用户注册：新用户可以创建账户。
    *   用户登录：已注册用户可以登录系统。
    *   访问控制：
        *   未登录用户可以查看3D场景，但不能进行集装箱操作（如添加/移除货物）。
        *   未登录用户在操作区域会看到登录/注册提示。
        *   登录用户可以使用所有集装箱操作功能。
    *   会话保持：用户登录状态会通过本地存储的Token进行保持。
6.  **国际化 (i18n)**:
    *   支持多种语言（如中文、英文等），用户可以切换界面语言。
7.  **系统设置**:
    *   （当前为占位或基础设置）可用于配置应用参数，例如语言切换。

## 页面结构

*   **首页 (`/`)**: 应用的入口页面或欢迎页。
*   **装柜模拟页 (`/container`)**: 核心功能页面，包含3D场景和控制面板。受登录保护。
*   **认证页 (`/auth`)**: 用于用户登录和注册。
*   **关于页 (`/about`)**: 应用介绍页面。
*   **设置页 (`/settings`)**: 应用设置页面。可能受登录保护。

## 技术栈

*   **前端框架**: Vue 3 (Composition API, `<script setup>`)
*   **UI 组件库**: Ant Design Vue
*   **3D 渲染**: Three.js (通过 `ContainerScene.vue` 组件集成)
*   **状态管理**: Pinia (用于管理用户认证状态等)
*   **路由**: Vue Router
*   **国际化**: Vue I18n
*   **图表/可视化辅助**: (可能，例如用于报告)
*   **PDF 生成**: jsPDF, html2canvas (用于报告导出功能)
*   **构建工具**: Vite (推测，基于 `import.meta.env`)

## 数据流简述

1.  **用户操作**: 用户在 `ContainerControlPanel.vue` 中输入货物信息、选择集装箱或触发操作（添加、移除、导出等）。
2.  **状态更新**: 
    *   货物列表 (`cargoList` in `Container.vue`) 被更新。
    *   选中的集装箱类型 (`selectedContainer` in `Container.vue`) 被更新。
    *   用户认证状态通过 `useAuthStore` (Pinia store) 管理和更新。
3.  **组件通信**: 
    *   `ContainerControlPanel.vue` 通过事件 (`@add-cargo`, `@remove-cargo`等) 将用户操作传递给父组件 `Container.vue`。
    *   `Container.vue` 处理这些事件，更新 `cargoList`，并执行装箱逻辑。
    *   `cargoList`, `selectedContainer`, `containerTypeDetails`, `loadedCargoStats` 等数据作为 props 传递给 `ContainerScene.vue` 和 `ContainerControlPanel.vue` 进行展示。
4.  **3D场景渲染**: `ContainerScene.vue` 监听 `cargoList` 和 `selectedContainer` 的变化，使用 Three.js 动态渲染集装箱和货物。
5.  **路由导航**: Vue Router 管理页面间的跳转。导航守卫基于 `useAuthStore` 中的登录状态进行访问控制。
6.  **认证流程**:
    *   用户在 `/auth` 页面的 `Login.vue` 或 `Register.vue` 组件中输入凭据。
    *   组件调用 `useAuthStore` 中的 `login` 或 `register` action。
    *   Store 更新认证状态 ( `isAuthenticated`, `user`, `token`) 并将 token 存入 `localStorage`。
    *   成功后，用户被重定向到目标页面或首页。
    *   应用启动时或路由切换时，导航守卫调用 `authStore.checkAuth()` 尝试从 `localStorage` 恢复会话。

## 开发与运行

(假设基于 Vite)

1.  **安装依赖**: 
    ```bash
    npm install
    # 或者
    yarn install
    ```
2.  **启动开发服务器**:
    ```bash
    npm run dev
    # 或者
    yarn dev
    ```
3.  **构建生产版本**:
    ```bash
    npm run build
    # 或者
    yarn build
    ```

## 后续可能的优化和功能点

*   更复杂的装箱算法和策略选择。
*   货物堆叠稳定性分析。
*   多用户数据隔离（如果引入后端）。
*   与后端API集成，实现用户数据持久化和真实的用户认证。
*   更详细的单元测试和集成测试。
*   PWA 支持。
*   优化大型货物列表和复杂场景下的性能。
