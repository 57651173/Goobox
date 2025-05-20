import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义要生成静态HTML的路由列表
const routes = [
  '/container',
  '/about'
];

// 源HTML文件
const sourceHtmlPath = path.resolve(__dirname, '../dist/index.html');
console.log('正在读取源HTML文件:', sourceHtmlPath);

// 读取index.html文件内容
const htmlContent = fs.readFileSync(sourceHtmlPath, 'utf8');

// 为每个路由创建对应的静态HTML文件
routes.forEach(route => {
  // 清理路径并构建文件名
  const routePath = route.startsWith('/') ? route.substring(1) : route;
  const targetFilePath = path.resolve(__dirname, `../dist/${routePath}.html`);
  
  console.log(`正在生成静态HTML文件: ${targetFilePath}`);
  
  try {
    // 修改HTML内容，添加预渲染标记和路由信息
    const routeHtml = htmlContent
      .replace(/<div id="app"><\/div>/, `<div id="app" data-server-rendered="true" data-route="${route}"></div>`)
      .replace(/<title>Container Loading<\/title>/, `<title>Container Loading - ${route.substring(1)}</title>`);
    
    // 确保目录存在
    const targetDir = path.dirname(targetFilePath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(targetFilePath, routeHtml);
    console.log(`✅ 成功生成静态HTML文件: ${routePath}.html`);
  } catch (error) {
    console.error(`❌ 生成静态HTML文件失败: ${routePath}.html`, error);
  }
});

console.log('静态HTML文件生成完成！'); 