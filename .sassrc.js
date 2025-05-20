/**
 * Sass配置文件
 * 解决弃用警告：Deprecation Warning [legacy-js-api]
 */
module.exports = {
  // 静默依赖项的弃用警告
  quietDeps: true,
  // 使用新的JavaScript API
  api: 'modern',
  // 其他编译选项
  sassOptions: {
    outputStyle: 'expanded',
    includePaths: ['node_modules']
  }
} 