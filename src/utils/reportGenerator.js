import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * 生成装载计划报告
 * @param {Object} options - 报告配置选项
 * @param {Object} options.containerData - 集装箱数据
 * @param {Array} options.cargoList - 货物列表
 * @param {Object} options.cargoStats - 装载统计数据 
 * @param {String} options.filename - 文件名
 * @param {HTMLElement} options.sceneElement - 3D场景DOM元素(可选，用于截图)
 * @param {Function} options.onProgress - 进度回调函数(可选)
 * @param {Function} options.onComplete - 完成回调函数(可选)
 * @param {Function} options.t - 翻译函数，从组件中传入(必须)
 */
export const generateLoadingReport = async (options) => {
  const {
    containerData,
    cargoList,
    cargoStats,
    filename = `loadingPlan_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`,
    sceneElement = null,
    onProgress = null,
    onComplete = null,
    t // 从参数中获取翻译函数
  } = options;

  // 确保传入了翻译函数
  if (!t) {
    console.error('缺少翻译函数 t');
    if (onComplete) onComplete(false, '生成报告失败: 缺少翻译函数');
    return false;
  }

  try {
    // 定义页面配置
    const pageConfig = {
      orientation: 'portrait', // 纵向
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    };

    // 创建PDF文档
    const doc = new jsPDF(pageConfig);
    
    // 在继续之前检查并注册autoTable
    if (typeof doc.autoTable !== 'function') {
      console.warn('警告: autoTable方法未检测到，使用简化报告');
      createSimpleReport(doc, t, containerData, cargoList, cargoStats, filename);
      if (onComplete) onComplete(true, '已创建简化报告');
      return true;
    }
    
    // 进度更新
    if (onProgress) onProgress(0.1, t('container.report.creatingDocument'));
    
    // 添加中文字体支持
    doc.setFont('helvetica', 'normal');
    
    // 添加标题
    doc.setFontSize(18);
    doc.text(t('container.report.title'), 105, 15, null, null, 'center');
    
    // 添加生成日期
    doc.setFontSize(10);
    doc.text(`${t('container.report.generatedOn')}: ${new Date().toLocaleString()}`, 105, 22, null, null, 'center');
    
    // 添加分割线
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // 进度更新
    if (onProgress) onProgress(0.2, t('container.report.addingContainerInfo'));
    
    // 添加集装箱信息部分
    doc.setFontSize(14);
    doc.text(t('container.report.containerInfo'), 20, 35);
    
    doc.setFontSize(10);
    
    // 集装箱信息表格
    const containerTableData = [
      [t('container.containerType'), containerData.value || t('container.unknown')],
      [t('container.internalDimensions'), `${containerData.length}m × ${containerData.width}m × ${containerData.height}m`],
      [t('container.volume'), `${containerData.volume}m³`],
      [t('container.maxWeight'), `${(containerData.maxWeight / 1000).toFixed(2)}${t('ton')}`]
    ];
    
    // 使用表格
    let currentY = 40;
    try {
      doc.autoTable({
        startY: currentY,
        head: [[t('container.attribute'), t('container.value')]],
        body: containerTableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto'
      });
      
      // 安全获取表格结束位置
      currentY = doc.lastAutoTable && doc.lastAutoTable.finalY ? 
                 doc.lastAutoTable.finalY + 15 : currentY + 40;
    } catch (tableError) {
      console.error('创建表格失败:', tableError);
      // 文本替代表格
      currentY = 45;
      containerTableData.forEach(row => {
        doc.text(`${row[0]}: ${row[1]}`, 25, currentY);
        currentY += 10;
      });
      currentY += 15;
    }
    
    // 进度更新
    if (onProgress) onProgress(0.3, t('container.report.addingLoadingStats'));
    
    // 添加装载统计信息
    doc.setFontSize(14);
    doc.text(t('container.report.loadingStats'), 20, currentY);
    
    const loadingStatsData = [
      [t('container.loadedCargoVolume'), `${cargoStats.totalVolume}m³`, `${cargoStats.volumeUsageRate}%`],
      [t('container.loadedCargoWeight'), `${cargoStats.totalWeight}kg`, `${cargoStats.weightUsageRate}%`],
      [t('container.totalItems'), cargoStats.totalIndividualItems.toString(), ""]
    ];
    
    try {
      doc.autoTable({
        startY: currentY + 5,
        head: [[t('container.attribute'), t('container.value'), t('container.usageRate')]],
        body: loadingStatsData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto'
      });
      
      // 安全获取表格结束位置
      currentY = doc.lastAutoTable && doc.lastAutoTable.finalY ? 
                 doc.lastAutoTable.finalY + 15 : currentY + 40;
    } catch (tableError) {
      console.error('创建表格失败:', tableError);
      // 文本替代表格
      currentY += 10;
      loadingStatsData.forEach(row => {
        doc.text(`${row[0]}: ${row[1]} ${row[2]}`, 25, currentY);
        currentY += 10;
      });
      currentY += 15;
    }
    
    // 进度更新
    if (onProgress) onProgress(0.4, t('container.report.addingCargoList'));
    
    // 添加货物清单
    doc.setFontSize(14);
    doc.text(t('container.report.cargoList'), 20, currentY);
    currentY += 5;
    
    // 先按照尺寸类型和颜色聚合相同的货物
    const aggregatedCargoMap = new Map();
    
    cargoList.forEach(cargo => {
      const originalId = cargo.id.includes('-inst-') ? cargo.id.split('-inst-')[0] : cargo.id;
      // 按原始ID和颜色分组
      const key = `${originalId}::color::${cargo.color}`;
      
      if (aggregatedCargoMap.has(key)) {
        aggregatedCargoMap.get(key).quantity += 1;
      } else {
        aggregatedCargoMap.set(key, {
          name: cargo.name,
          length: cargo.originalLength || cargo.length,
          width: cargo.originalWidth || cargo.width, 
          height: cargo.originalHeight || cargo.height,
          weight: cargo.weight,
          color: cargo.color,
          quantity: 1,
          totalVolume: parseFloat((cargo.length * cargo.width * cargo.height).toFixed(2)),
          totalWeight: parseFloat(cargo.weight)
        });
      }
    });
    
    // 转换为数组并添加总体积、总重量
    const cargoListData = Array.from(aggregatedCargoMap.values()).map(item => {
      // 计算单个物品的体积
      const volumeSingle = item.length * item.width * item.height;
      // 计算总体积和总重量
      const volumeTotal = volumeSingle * item.quantity;
      const weightTotal = item.weight * item.quantity;
      
      return [
        item.name,
        `${item.length}×${item.width}×${item.height}m`,
        `${item.weight}kg`,
        item.quantity,
        `${volumeTotal.toFixed(2)}m³`,
        `${weightTotal.toFixed(2)}kg`,
        item.color
      ];
    });
    
    // 添加颜色演示
    const addColorCell = (data, cell, row) => {
      if(cell.section === 'body' && cell.column.index === 6) {
        cell.styles.fillColor = data[row.index][6];
        cell.styles.textColor = [255, 255, 255];
        cell.text = "■"; // 使用方块字符
      }
    };
    
    try {
      doc.autoTable({
        startY: currentY,
        head: [[
          t('container.name'), 
          t('container.size'), 
          t('container.weight') + '(' + t('container.perItem') + ')', 
          t('container.quantity'), 
          t('container.volume') + '(' + t('container.total') + ')', 
          t('container.weight') + '(' + t('container.total') + ')',
          t('container.color')
        ]],
        body: cargoListData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto',
        didDrawCell: (data) => addColorCell(cargoListData, data.cell, data.row)
      });
      
      // 安全获取表格结束位置
      currentY = doc.lastAutoTable && doc.lastAutoTable.finalY ? 
                 doc.lastAutoTable.finalY + 15 : currentY + 40;
    } catch (tableError) {
      console.error('创建表格失败:', tableError);
      currentY += 10;
      doc.text(t('container.report.cargoListSimplified'), 20, currentY);
      currentY += 10;
      
      cargoListData.forEach((row, index) => {
        if (index < 10) { // 限制显示前10个货物
          doc.text(`${index+1}. ${row[0]} - ${row[2]} x${row[3]} (${row[1]})`, 25, currentY);
          currentY += 8;
        }
      });
    }
    
    // 进度更新
    if (onProgress) onProgress(0.6, t('container.report.addingLoadingPlan'));
    
    // 添加装载计划 - 第二页开始
    doc.addPage();
    currentY = 20;
    
    doc.setFontSize(14);
    doc.text(t('container.report.loadingPlan'), 20, currentY);
    currentY += 10;
    
    const loadingProcedure = [
      // 一般装载原则说明
      t('container.report.generalPrinciples'),
      
      `1. ${t('container.report.principle1')}`, // 从深到浅 (A→C)
      `2. ${t('container.report.principle2')}`, // 从下到上 (B→D)
      `3. ${t('container.report.principle3')}`, // 两侧平衡 (F,E→中间)
      `4. ${t('container.report.principle4')}`, // 从重到轻
      
      // 集装箱六个面的标识说明 (A-F)
      t('container.report.facesExplanation'),
      
      `•  ${t('container.report.faceA')}`, // A面-最深端（集装箱内部最远端）
      `•  ${t('container.report.faceB')}`, // B面-地面
      `•  ${t('container.report.faceC')}`, // C面-开门端（装货入口）
      `•  ${t('container.report.faceD')}`, // D面-顶部
      `•  ${t('container.report.faceE')}`, // E面-左侧墙面（从C面看进去左边）
      `•  ${t('container.report.faceF')}`, // F面-右侧墙面（从C面看进去右边）
    ];
    
    // 添加装载指南文本
    for (let i = 0; i < loadingProcedure.length; i++) {
      const line = loadingProcedure[i];
      
      // 针对标题和普通内容使用不同字体大小
      if (i === 0 || i === 5) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        currentY += 5; // 添加额外空间
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      }
      
      // 添加文本
      doc.text(line, 20, currentY);
      currentY += 7; // lineHeight
      
      // 在段落之间添加额外空间
      if (i === 4) currentY += 10;
    }
    
    // 进度更新
    if (onProgress) onProgress(0.7, t('container.report.preparingSceneImage'));
    
    // 如果提供了场景元素，添加3D截图
    if (sceneElement) {
      try {
        // 截图
        const canvas = await html2canvas(sceneElement, {
          scale: 2, // 提高截图质量
          useCORS: true,
          logging: false
        });
        
        // 进度更新
        if (onProgress) onProgress(0.8, t('container.report.processingImage'));
        
        // 将截图添加到PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        
        // 截图标题
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(t('container.report.loadingVisualization'), 105, currentY + 10, null, null, 'center');
        
        // 添加截图 - 计算图片尺寸以适应页面
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const maxWidth = pageWidth - 40;  // 左右各留20mm
        const maxHeight = pageHeight - currentY - 50;  // 底部留20mm
        
        // 计算等比例缩放后的尺寸
        const imgRatio = canvas.width / canvas.height;
        let imgWidth = maxWidth;
        let imgHeight = imgWidth / imgRatio;
        
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = imgHeight * imgRatio;
        }
        
        // 在页面中央添加图像
        const imgX = (pageWidth - imgWidth) / 2;
        doc.addImage(imgData, 'JPEG', imgX, currentY + 15, imgWidth, imgHeight);
      } catch (error) {
        console.error('生成3D场景截图失败:', error);
        
        // 添加错误提示
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        doc.text(t('container.report.sceneImageFailed') || '生成3D场景截图失败', 20, currentY + 15);
        doc.setTextColor(0, 0, 0);
      }
    }
    
    // 进度更新
    if (onProgress) onProgress(0.9, t('container.report.finalizing'));
    
    // 添加页脚
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `${t('container.report.page') || 'Page'} ${i} / ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        null, null, 'center'
      );
    }
    
    // 保存文档
    doc.save(filename);
    
    // 完成回调
    if (onComplete) onComplete(true, filename);
    
    return true;
  } catch (error) {
    console.error('生成装载报告失败:', error);
    if (onComplete) onComplete(false, error.message);
    return false;
  }
};

/**
 * 创建简化版报告 - 当autoTable不可用时的备选方案
 */
function createSimpleReport(doc, t, containerData, cargoList, cargoStats, filename) {
  // 添加标题
  doc.setFontSize(18);
  doc.text(t('container.report.title') || 'Container Loading Report', 105, 15, null, null, 'center');
  
  // 添加生成日期
  doc.setFontSize(10);
  doc.text(`${t('container.report.generatedOn') || 'Generated On'}: ${new Date().toLocaleString()}`, 105, 22, null, null, 'center');
  
  // 添加分割线
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);
  
  // 添加集装箱信息
  let currentY = 35;
  doc.setFontSize(14);
  doc.text(t('container.report.containerInfo') || 'Container Information', 20, currentY);
  currentY += 10;
  doc.setFontSize(10);
  
  // 基本信息文本
  doc.text(`${t('container.containerType') || 'Container Type'}: ${containerData.value || 'Unknown'}`, 25, currentY);
  currentY += 8;
  doc.text(`${t('container.internalDimensions') || 'Internal Dimensions'}: ${containerData.length}m × ${containerData.width}m × ${containerData.height}m`, 25, currentY);
  currentY += 8;
  doc.text(`${t('container.volume') || 'Volume'}: ${containerData.volume}m³`, 25, currentY);
  currentY += 8;
  doc.text(`${t('container.maxWeight') || 'Max Weight'}: ${(containerData.maxWeight / 1000).toFixed(2)}t`, 25, currentY);
  currentY += 15;
  
  // 添加装载统计
  doc.setFontSize(14);
  doc.text(t('container.report.loadingStats') || 'Loading Statistics', 20, currentY);
  currentY += 10;
  doc.setFontSize(10);
  
  doc.text(`${t('container.loadedCargoVolume') || 'Loaded Cargo Volume'}: ${cargoStats.totalVolume}m³ (${cargoStats.volumeUsageRate}%)`, 25, currentY);
  currentY += 8;
  doc.text(`${t('container.loadedCargoWeight') || 'Loaded Cargo Weight'}: ${cargoStats.totalWeight}kg (${cargoStats.weightUsageRate}%)`, 25, currentY);
  currentY += 8;
  doc.text(`${t('container.totalItems') || 'Total Items'}: ${cargoStats.totalIndividualItems}`, 25, currentY);
  currentY += 15;
  
  // 添加货物清单
  doc.setFontSize(14);
  doc.text(t('container.report.cargoList') || 'Cargo List', 20, currentY);
  currentY += 10;
  doc.setFontSize(10);
  
  // 按名称和尺寸聚合货物
  const cargoMap = new Map();
  cargoList.forEach(cargo => {
    const key = `${cargo.name}-${cargo.length}x${cargo.width}x${cargo.height}`;
    if (cargoMap.has(key)) {
      cargoMap.get(key).quantity += 1;
    } else {
      cargoMap.set(key, {
        name: cargo.name,
        length: cargo.length,
        width: cargo.width,
        height: cargo.height,
        weight: cargo.weight,
        quantity: 1
      });
    }
  });
  
  // 输出货物列表
  let index = 1;
  for (const cargo of cargoMap.values()) {
    if (currentY > 250) {
      // 添加新页
      doc.addPage();
      currentY = 20;
      doc.setFontSize(14);
      doc.text(t('container.report.cargoList') || 'Cargo List (continued)', 20, currentY);
      currentY += 10;
      doc.setFontSize(10);
    }
    
    const volumeTotal = cargo.length * cargo.width * cargo.height * cargo.quantity;
    const weightTotal = cargo.weight * cargo.quantity;
    
    doc.text(`${index}. ${cargo.name} - ${cargo.quantity}x (${cargo.length}×${cargo.width}×${cargo.height}m)`, 25, currentY);
    currentY += 6;
    doc.text(`   ${t('container.weight') || 'Weight'}: ${cargo.weight}kg/item, ${t('container.total') || 'Total'}: ${weightTotal}kg`, 25, currentY);
    currentY += 6;
    doc.text(`   ${t('container.volume') || 'Volume'}: ${(cargo.length * cargo.width * cargo.height).toFixed(2)}m³/item, ${t('container.total') || 'Total'}: ${volumeTotal.toFixed(2)}m³`, 25, currentY);
    currentY += 10;
    
    index++;
  }
  
  // 添加页脚
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `${t('container.report.page') || 'Page'} ${i} / ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      null, null, 'center'
    );
  }
  
  // 保存文档
  doc.save(filename);
}

/**
 * 生成货物位置的文字描述
 * @param {Object} position - 货物位置坐标
 * @param {Object} containerData - 集装箱数据
 * @returns {String} 位置描述
 */
const getPositionDescription = (position, containerData) => {
  const { x, y, z } = position;
  const { width, length, height } = containerData;
  
  // 水平面位置描述
  let horizontalPos = '';
  
  // X轴描述 (深度)
  if (x < length * 0.2) {
    horizontalPos += `A面附近, `;
  } else if (x > length * 0.8) {
    horizontalPos += `C面附近, `;
  } else {
    horizontalPos += `距A面 ${x.toFixed(2)}m, `;
  }
  
  // Y轴描述 (宽度)
  const middleY = width / 2;
  const distFromMiddle = Math.abs(y - middleY);
  
  if (distFromMiddle < width * 0.2) {
    horizontalPos += `中间位置, `;
  } else if (y < middleY) {
    horizontalPos += `F面侧, `;
  } else {
    horizontalPos += `E面侧, `;
  }
  
  // Z轴描述 (高度)
  let verticalPos = '';
  if (z < 0.01) {
    verticalPos = `底层(B面)`;
  } else if (z > height * 0.75) {
    verticalPos = `顶层附近(D面方向)`;
  } else if (z > height * 0.5) {
    verticalPos = `上层部分`;
  } else if (z > height * 0.25) {
    verticalPos = `中层部分`;
  } else {
    verticalPos = `下层部分`;
  }
  
  return horizontalPos + verticalPos;
}; 