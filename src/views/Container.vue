<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router' // 导入 useRouter
import { useAuthStore } from '../store/auth' // 导入 Auth Store
import ContainerScene from '../components/container/ContainerScene.vue'
import ContainerControlPanel from '../components/container/ContainerControlPanel.vue'
import config from '../config' // 导入配置模块
import { generateLoadingReport } from '../utils/reportGenerator' // 导入报告生成函数
import { Button as AButton, Card as ACard, TypographyText as ATypographyText, Empty as AEmpty } from 'ant-design-vue';

const { t } = useI18n()
const router = useRouter() // 获取 router 实例
const authStore = useAuthStore() // 获取 auth store 实例
const isLoggedIn = computed(() => authStore.isLoggedIn) // 获取登录状态

let nextInstanceId = 0; // 在<script setup>的顶层声明，用于生成唯一ID

// 装箱分析计时器相关变量
const loadingTimer = ref(null);  // 计时器引用
const loadingSeconds = ref(0);   // 已用时间（秒）
const loadingTimedOut = ref(false); // 是否已超时

// 装箱超时设置（从配置加载，默认180秒）
const loadingTimeout = config.features.containerCalculator.loadingTimeout || 180;

// 集装箱分组和类型数据
const containerGroups = [
  {
    key: 'dryContainer',
    types: ['20GP', '40GP', '40HC']
  },
  {
    key: 'reeferContainer',
    types: ['20RF', '40RF', '40RQHC']
  }
]

// 集装箱类型详细数据
const containerTypeDetails = {
  // 标准干货集装箱
  '20GP': { length: 5.9, width: 2.35, height: 2.39, maxWeight: 21770, volume: 33.2, color: '#4285F4' },
  '40GP': { length: 12.03, width: 2.35, height: 2.39, maxWeight: 26780, volume: 67.7, color: '#34A853' },
  '40HC': { length: 12.03, width: 2.35, height: 2.69, maxWeight: 26512, volume: 76.3, color: '#FBBC05' },
  // 冷藏集装箱
  '20RF': { length: 5.44, width: 2.29, height: 2.27, maxWeight: 27400, volume: 28.3, color: '#EA4335' },
  '40RF': { length: 11.56, width: 2.28, height: 2.25, maxWeight: 27700, volume: 59.3, color: '#9C27B0' },
  '40RQHC': { length: 11.56, width: 2.29, height: 2.55, maxWeight: 29520, volume: 67.3, color: '#00ACC1' },
}

// 货物列表 - 初始化为空数组
const cargoList = ref([])

const aggregatedCargoListForUITable = computed(() => {
  if (!cargoList.value || cargoList.value.length === 0) {
    return [];
  }

  const aggregationMap = new Map();

  cargoList.value.forEach(instance => {
    // 改进聚合逻辑：使用名称、尺寸和颜色作为聚合键
    // 这样即使原始ID不同，只要名称、尺寸和颜色相同，就会被视为同一类货物
    const originalLength = instance.originalLength !== undefined ? instance.originalLength : instance.length;
    const originalWidth = instance.originalWidth !== undefined ? instance.originalWidth : instance.width;
    const originalHeight = instance.originalHeight !== undefined ? instance.originalHeight : instance.height;
    
    // 组合键：name-dimensions-color
    const key = `${instance.name}-${originalLength}x${originalWidth}x${originalHeight}-${instance.color}`;

    if (aggregationMap.has(key)) {
      const existingEntry = aggregationMap.get(key);
      existingEntry.quantity += 1; 
    } else {
      const originalCargoId = instance.id.includes('-inst-') ? instance.id.split('-inst-')[0] : instance.id;
      
      aggregationMap.set(key, {
        name: instance.name,
        // 使用原始尺寸
        length: originalLength,
        width: originalWidth,
        height: originalHeight,
        weight: instance.weight, // 单个货物重量
        color: instance.color,   // 颜色
        id: `${originalCargoId}::color::${instance.color}`, // 保持原有ID格式以兼容现有更新/删除逻辑
        originalCargoTypeId: originalCargoId, // 存储原始ID以便需要时访问
        quantity: 1, 
      });
    }
  });

  return Array.from(aggregationMap.values());
});

const loadedCargoStats = computed(() => {
  let totalVolume = 0;
  let totalWeight = 0;

  cargoList.value.forEach(instance => { 
    // 确保所有值都是有效的数字，避免NaN出现
    const length = parseFloat(instance.length) || 0;
    const width = parseFloat(instance.width) || 0;
    const height = parseFloat(instance.height) || 0;
    const weight = parseFloat(instance.weight) || 0;
    
    // 计算单个货物体积并累加
    totalVolume += length * width * height;
    totalWeight += weight;
  });

  const containerDetails = containerTypeDetails[selectedContainer.value];
  // 确保有容器细节，否则使用默认值
  const containerVolume = (containerDetails && containerDetails.volume) ? containerDetails.volume : 1;
  const containerMaxWeight = (containerDetails && containerDetails.maxWeight) ? containerDetails.maxWeight : 1;

  // 计算使用率，确保不会超过100%
  const volumeUsageRate = Math.min(100, (totalVolume / containerVolume * 100)) || 0;
  const weightUsageRate = Math.min(100, (totalWeight / containerMaxWeight * 100)) || 0;

  // 调试信息
  console.log(`[loadedCargoStats] 总体积=${totalVolume}, 集装箱体积=${containerVolume}, 使用率=${volumeUsageRate}%`);
  console.log(`[loadedCargoStats] 总重量=${totalWeight}, 集装箱最大重量=${containerMaxWeight}, 使用率=${weightUsageRate}%`);

  // 返回格式化的数据，保留2位小数
  return {
    totalVolume: totalVolume.toFixed(2),
    totalWeight: totalWeight.toFixed(2),
    volumeUsageRate: volumeUsageRate.toFixed(2),
    weightUsageRate: weightUsageRate.toFixed(2),
    totalIndividualItems: cargoList.value.length
  };
});

// 选中的集装箱类型
const selectedContainer = ref('40GP')

// 添加货物的状态管理
const isAddingCargo = ref(false);
const lastAddingResult = ref({
  success: true,
  message: '',
  attempted: 0,
  added: 0
});

// 辅助函数，用于四舍五入到指定精度，避免浮点数问题
function roundToPrecision(value, precision) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

// 辅助函数：检查碰撞
function checkCollision(position, length, width, height, existingCargos) {
  // 添加详细日志
  console.log(`[checkCollision] 检查货物碰撞: position=(${position.x}, ${position.y}, ${position.z}), 尺寸=${length}x${width}x${height}`);
  
  for (const placedCargo of existingCargos) {
    if (!placedCargo.position) continue;
    
    const P_X = placedCargo.position.x;
    const P_Y = placedCargo.position.y;
    const P_Z = placedCargo.position.z;
    const P_L = placedCargo.length;
    const P_W = placedCargo.width;
    const P_H = placedCargo.height;
    
    const newCargoBox = {
      minX: position.x, maxX: roundToPrecision(position.x + length, 2),
      minY: position.y, maxY: roundToPrecision(position.y + width, 2),
      minZ: position.z, maxZ: roundToPrecision(position.z + height, 2),
    };
    
    const placedCargoBox = {
      minX: P_X, maxX: roundToPrecision(P_X + P_L, 2),
      minY: P_Y, maxY: roundToPrecision(P_Y + P_W, 2),
      minZ: P_Z, maxZ: roundToPrecision(P_Z + P_H, 2),
    };
    
    const overlapsX = !(newCargoBox.maxX <= placedCargoBox.minX || newCargoBox.minX >= placedCargoBox.maxX);
    const overlapsY = !(newCargoBox.maxY <= placedCargoBox.minY || newCargoBox.minY >= placedCargoBox.maxY);
    const overlapsZ = !(newCargoBox.maxZ <= placedCargoBox.minZ || newCargoBox.minZ >= placedCargoBox.maxZ);
    
    if (overlapsX && overlapsY && overlapsZ) {
      console.log(`  发现碰撞: 与货物(${P_X}, ${P_Y}, ${P_Z}), 尺寸=${P_L}x${P_W}x${P_H}`);
      console.log(`    X重叠: [${newCargoBox.minX}, ${newCargoBox.maxX}] 与 [${placedCargoBox.minX}, ${placedCargoBox.maxX}]`);
      console.log(`    Y重叠: [${newCargoBox.minY}, ${newCargoBox.maxY}] 与 [${placedCargoBox.minY}, ${placedCargoBox.maxY}]`);
      console.log(`    Z重叠: [${newCargoBox.minZ}, ${newCargoBox.maxZ}] 与 [${placedCargoBox.minZ}, ${placedCargoBox.maxZ}]`);
      return true; // 发现碰撞
    }
  }
  
  console.log(`  检查结果: 未发现碰撞`);
  return false; // 没有碰撞
}

// 辅助函数：检查支撑 (根据新的X-Y-Z策略，此函数在规则填充时可能不是主要依赖，但保留以备后用或用于非规则检查)
function checkSupport(position, length, width, height, existingCargos) {
  // 对于地面，z=0时自动有支撑
  if (position.z === 0) {
    return true;
  }
  
  const bottomArea = length * width;
  const minSupportRatio = 0.3; 
  let supportedArea = 0;
  
  console.log(`[checkSupport] 检查货物支撑 position=(${position.x}, ${position.y}, ${position.z}), 尺寸=${length}x${width}x${height}, 底面积=${bottomArea}`);
  
  for (const placedCargo of existingCargos) {
    if (!placedCargo.position) continue;
    
    const P_X = placedCargo.position.x;
    const P_Y = placedCargo.position.y;
    const P_Z = placedCargo.position.z;
    const P_L = placedCargo.length;
    const P_W = placedCargo.width;
    const P_H = placedCargo.height;
    
    const topOfSupportingCargo = roundToPrecision(P_Z + P_H, 2);
    const bottomOfNewCargo = position.z;
    
    if (Math.abs(topOfSupportingCargo - bottomOfNewCargo) < 0.01) {
      const overlapX = Math.max(0, Math.min(position.x + length, P_X + P_L) - Math.max(position.x, P_X));
      const overlapY = Math.max(0, Math.min(position.y + width, P_Y + P_W) - Math.max(position.y, P_Y));
      
      const areaSupported = overlapX * overlapY;
      supportedArea += areaSupported;
      
      console.log(`  找到支撑: 货物位置=(${P_X}, ${P_Y}, ${P_Z}), 尺寸=${P_L}x${P_W}x${P_H}, 重叠面积=${areaSupported}`);
      
      if (supportedArea / bottomArea >= minSupportRatio) {
        console.log(`  支撑充足：${supportedArea}/${bottomArea} = ${(supportedArea/bottomArea*100).toFixed(2)}%, 超过阈值${minSupportRatio*100}%`);
        return true;
      }
    }
  }
  
  const supportRatio = supportedArea / bottomArea;
  const isSupported = supportRatio >= minSupportRatio;
  
  console.log(`  支撑检查结果: ${isSupported ? '通过' : '失败'}, 支撑率=${(supportRatio*100).toFixed(2)}%, 阈值=${minSupportRatio*100}%`);
  
  return isSupported;
}

// 处理添加货物事件
const handleAddCargo = (cargoDataFromPanel) => {
  console.log(`[Container.vue] handleAddCargo (新策略): 添加货物 = ${JSON.stringify(cargoDataFromPanel)}`)
  const quantityToAdd = cargoDataFromPanel.quantity || 1;
  let successfullyAddedCount = 0;
  
  lastAddingResult.value = {
    success: true,
    message: '',
    attempted: quantityToAdd,
    added: 0
  };
  loadingSeconds.value = 0;
  loadingTimedOut.value = false;
  
  isAddingCargo.value = true;
  
  loadingTimer.value = setInterval(() => {
    loadingSeconds.value++;
    if (loadingSeconds.value >= loadingTimeout) {
      loadingTimedOut.value = true;
      clearInterval(loadingTimer.value);
      loadingTimer.value = null;
      lastAddingResult.value.success = false;
      lastAddingResult.value.message = `装柜分析超时（${loadingTimeout}秒）`;
      isAddingCargo.value = false;
    }
  }, 1000);
  
  setTimeout(async () => {
    try {
      if (loadingTimedOut.value) return;
      
      const containerDetails = containerTypeDetails[selectedContainer.value];
      if (!containerDetails) {
        alert(t('cargoAdd.error.containerNotFound'));
        throw new Error('未找到选中的集装箱类型详情');
      }
      const C_L = containerDetails.length;
      const C_W = containerDetails.width;
      const C_H = containerDetails.height;

      const initialCargoL = parseFloat(cargoDataFromPanel.length);
      const initialCargoW = parseFloat(cargoDataFromPanel.width);
      const initialCargoH = parseFloat(cargoDataFromPanel.height);

      if (isNaN(initialCargoL) || initialCargoL <= 0 || 
          isNaN(initialCargoW) || initialCargoW <= 0 || 
          isNaN(initialCargoH) || initialCargoH <= 0) {
        alert(t('cargoAdd.error.dimensionsMissing'));
        throw new Error('货物尺寸无效');
      }
      
      const orientations = [
        { L: initialCargoL, W: initialCargoW, H: initialCargoH },
        { L: initialCargoL, W: initialCargoH, H: initialCargoW },
        { L: initialCargoW, W: initialCargoL, H: initialCargoH },
        { L: initialCargoW, W: initialCargoH, H: initialCargoL },
        { L: initialCargoH, W: initialCargoL, H: initialCargoW },
        { L: initialCargoH, W: initialCargoW, H: initialCargoL },
      ];

      let maxTheoreticalFit = 0;
      let bestOrientationDetails = null;

      console.log(`集装箱尺寸: L=${C_L}, W=${C_W}, H=${C_H}`);
      console.log(`初始货物尺寸: L=${initialCargoL}, W=${initialCargoW}, H=${initialCargoH}`);

      for (const orientation of orientations) {
        const { L: o_L, W: o_W, H: o_H } = orientation;
        if (o_L <= 0 || o_W <= 0 || o_H <= 0) continue;
        if (o_L > C_L || o_W > C_W || o_H > C_H) { // 单个货物就超出集装箱
          console.log(`  方向 (${o_L}x${o_W}x${o_H}) 超出集装箱，跳过`);
          continue;
        }

        const num_x_orientation = Math.floor(C_L / o_L);
        const num_y_orientation = Math.floor(C_W / o_W);
        const num_z_orientation = Math.floor(C_H / o_H);
        const currentTheoreticalFit = num_x_orientation * num_y_orientation * num_z_orientation;
        
        console.log(`  测试方向: L=${o_L}, W=${o_W}, H=${o_H} -> nx=${num_x_orientation}, ny=${num_y_orientation}, nz=${num_z_orientation}, 总计=${currentTheoreticalFit}`);

        if (currentTheoreticalFit > maxTheoreticalFit) {
          maxTheoreticalFit = currentTheoreticalFit;
          bestOrientationDetails = { 
            L: o_L, W: o_W, H: o_H, 
            nx: num_x_orientation, ny: num_y_orientation, nz: num_z_orientation 
          };
        }
      }

      if (!bestOrientationDetails || maxTheoreticalFit === 0) {
        lastAddingResult.value.message = '货物尺寸过大，无法放入集装箱。';
        lastAddingResult.value.success = false;
        throw new Error(lastAddingResult.value.message);
      }
      
      console.log('最佳摆放方向:', bestOrientationDetails);
      const { L: cargoDimL, W: cargoDimW, H: cargoDimH, 
              nx: num_x_fit, ny: num_y_fit, nz: num_z_fit } = bestOrientationDetails;

      for (let itemLoopIndex = 0; itemLoopIndex < quantityToAdd; itemLoopIndex++) {
        if (loadingTimedOut.value) break;
        let spotFoundForItem = false;
        
        // 新的装载顺序: X (深->浅 A->C) -> Z (下->上 B->D) -> Y (两侧->中间 F,E->center)
        // k_x: 沿X轴 (长度, A面(0) -> C面(C_L))
        for (let k_x = 0; k_x < num_x_fit; k_x++) {
          // k_z: 沿Z轴 (高度, B地面(0) -> D顶部(C_H))
          for (let k_z = 0; k_z < num_z_fit; k_z++) {
            
            // k_y: 沿Y轴 (宽度), 实现两侧到中间的填充顺序
            const y_indices_order = [];
            let left_y_idx = 0;
            let right_y_idx = num_y_fit - 1;
            while (left_y_idx <= right_y_idx) {
              if (left_y_idx === right_y_idx) { // 中间位置
                y_indices_order.push(left_y_idx);
              } else {
                y_indices_order.push(left_y_idx);  // F面一侧 (或起始侧, y=0方向)
                y_indices_order.push(right_y_idx); // E面一侧 (或末端侧, y=max方向)
              }
              left_y_idx++;
              right_y_idx--;
            }

            for (const k_y of y_indices_order) {
              if (loadingTimedOut.value) { spotFoundForItem = true; break; } 

              const targetPos = {
                x: roundToPrecision(k_x * cargoDimL, 2),       // X坐标 (A->C)
                y: roundToPrecision(k_y * cargoDimW, 2),       // Y坐标 (两侧->中间)
                z: roundToPrecision(k_z * cargoDimH, 2)        // Z坐标 (下->上 B->D)
              };

              // 边界检查 
              if (targetPos.x + cargoDimL > C_L + 0.001 ||
                  targetPos.y + cargoDimW > C_W + 0.001 ||
                  targetPos.z + cargoDimH > C_H + 0.001) {
                continue; 
              }
              
              if (!checkCollision(targetPos, cargoDimL, cargoDimW, cargoDimH, cargoList.value)) {
                const singleCargoDataForItem = { ...cargoDataFromPanel };
                delete singleCargoDataForItem.quantity; 

                let colorValue = singleCargoDataForItem.color || '#FF5722';
                if (!colorValue.startsWith('#')) colorValue = '#' + colorValue;
                if (colorValue.length > 7) colorValue = colorValue.substring(0, 7);

                const currentStandardizedCargo = {
                  ...singleCargoDataForItem,
                  name: singleCargoDataForItem.name || `Cargo ${nextInstanceId}`,
                  color: colorValue,
                  originalLength: initialCargoL,
                  originalWidth: initialCargoW,
                  originalHeight: initialCargoH,
                };
                
                const newCargoInstance = {
                  ...currentStandardizedCargo,
                  length: cargoDimL, 
                  width: cargoDimW,
                  height: cargoDimH,
                  id: singleCargoDataForItem.id ? `${''}${singleCargoDataForItem.id}-inst-${nextInstanceId}` : `cargo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${nextInstanceId}`,
            instanceId: nextInstanceId++,
                  position: targetPos,
                  batchIndex: itemLoopIndex, 
                  batchSize: quantityToAdd
                };
                
                cargoList.value.push(newCargoInstance);
          successfullyAddedCount++;
                spotFoundForItem = true;
                console.log(`成功添加第 ${itemLoopIndex + 1}/${quantityToAdd} 个货物 (InstID: ${newCargoInstance.instanceId}) 位置:`, targetPos, `尺寸: ${cargoDimL}x${cargoDimW}x${cargoDimH}`);
                break; 
              }
            } // 结束 k_y 循环 (Y轴)
            if (spotFoundForItem || loadingTimedOut.value) break; 
          } // 结束 k_z 循环 (Z轴)
          if (spotFoundForItem || loadingTimedOut.value) break; 
        } // 结束 k_x 循环 (X轴)
        
        if (!spotFoundForItem && !loadingTimedOut.value) {
          console.warn(`无法为第 ${itemLoopIndex + 1}/${quantityToAdd} 个货物找到空余格点位置。`);
          lastAddingResult.value.message = `集装箱空间不足，部分货物 (${successfullyAddedCount}/${quantityToAdd}) 无法按当前策略装载。`;
          lastAddingResult.value.success = successfullyAddedCount > 0; 
          if(successfullyAddedCount === 0 && quantityToAdd > 0) lastAddingResult.value.success = false;
          break; 
        }
      }

      // 更新最终结果
      lastAddingResult.value.added = successfullyAddedCount;
      if (successfullyAddedCount === quantityToAdd) {
        lastAddingResult.value.message = `成功添加 ${successfullyAddedCount} 个货物。`;
        lastAddingResult.value.success = true;
      } else if (successfullyAddedCount > 0) {
        // 部分成功时，message已在循环内设置
        lastAddingResult.value.success = true; 
      } else { // successfullyAddedCount === 0 && quantityToAdd > 0
        lastAddingResult.value.message = lastAddingResult.value.message || '无法装载任何货物，可能空间已满或与现有货物冲突。';
        lastAddingResult.value.success = false;
      }

    } catch (error) {
      console.error('添加货物过程中发生错误 (新策略):', error);
      lastAddingResult.value.success = false;
      lastAddingResult.value.message = `添加货物失败: ${error.message || '未知错误'}`;
    } finally {
      if (loadingTimer.value) {
        clearInterval(loadingTimer.value);
        loadingTimer.value = null;
      }
      isAddingCargo.value = false;
      console.log('[handleAddCargo 新策略] 完成. 结果:', lastAddingResult.value);
    }
  }, 100); 
};

// 处理移除货物事件
const handleRemoveCargo = (idFromPanel) => {
  // idFromPanel is expected to be a composite key: "originalCargoId::color::colorValue"
  const parts = idFromPanel.split('::color::');

  if (parts.length === 2) {
    const originalIdToRemove = parts[0];
    const colorToRemove = parts[1];

    const initialCount = cargoList.value.length;
  cargoList.value = cargoList.value.filter(cargo => {
    const cargoOriginalId = cargo.id.includes('-inst-') ? cargo.id.split('-inst-')[0] : cargo.id;
      // Keep if it does NOT match both originalId and color
      return !(cargoOriginalId === originalIdToRemove && cargo.color === colorToRemove);
    });
    const removedCount = initialCount - cargoList.value.length;
    console.log(`移除了 ${removedCount} 个类型为 '${originalIdToRemove}' 且颜色为 '${colorToRemove}' 的货物实例。剩余 ${cargoList.value.length} 个货物。`);
  } else {
    // Fallback or error handling if the ID format is not as expected.
    // This might happen if an old system part or a different type of item calls this.
    // For now, log a warning. If necessary, could add old logic here as a fallback.
    console.warn(`[handleRemoveCargo] 接收到的ID格式不符合预期: ${idFromPanel}。未执行移除操作。`);
    // Original fallback behavior (removes all instances of an original ID type):
    // cargoList.value = cargoList.value.filter(cargo => {
    //   const cargoOriginalId = cargo.id.includes('-inst-') ? cargo.id.split('-inst-')[0] : cargo.id;
    //   return cargoOriginalId !== idFromPanel;
    // });
    // console.log(`移除ID为 ${idFromPanel} 的所有货物后 (回退逻辑)，剩余 ${cargoList.value.length} 个货物`);
  }
}

// 处理清空所有货物事件
const handleClearCargo = () => {
  cargoList.value = []
}

// 处理更新货物事件（例如更改颜色）
const handleUpdateCargo = (updatedCargoData) => {
  // 1. 标准化新颜色值
  let newColorToApply = updatedCargoData.color || '#FF5722'; // 未提供时的默认颜色
  if (!newColorToApply.startsWith('#')) {
    newColorToApply = '#' + newColorToApply;
  }
  if (newColorToApply.length > 7) { // 确保是有效的十六进制颜色（例如，#RRGGBB）
    newColorToApply = newColorToApply.substring(0, 7);
  }

  // 2. 解析复合ID，获取原始ID和旧颜色
  const compositeId = updatedCargoData.id; // 格式：'originalId::color::oldColorValue'
  const parts = compositeId.split('::color::');

  if (parts.length === 2) {
    const originalIdToMatch = parts[0];
    const oldColorToMatch = parts[1];
    
    // 3. 首先找到一个匹配的货物，用于获取尺寸信息
    const templateCargo = cargoList.value.find(cargo => {
      const cargoOriginalId = cargo.id.includes('-inst-') ? cargo.id.split('-inst-')[0] : cargo.id;
      return cargoOriginalId === originalIdToMatch && cargo.color === oldColorToMatch;
    });
    
    if (!templateCargo) {
      console.warn(`[handleUpdateCargo] 未找到匹配类型 '${originalIdToMatch}' 且颜色为 '${oldColorToMatch}' 的货物进行颜色更新。`);
      return;
    }
    
    // 4. 获取要匹配的原始尺寸
    const matchLength = templateCargo.originalLength !== undefined ? templateCargo.originalLength : templateCargo.length;
    const matchWidth = templateCargo.originalWidth !== undefined ? templateCargo.originalWidth : templateCargo.width;
    const matchHeight = templateCargo.originalHeight !== undefined ? templateCargo.originalHeight : templateCargo.height;
    const matchName = templateCargo.name;
    
    // 5. 更新所有具有相同名称、尺寸和颜色的货物
    let updatedCount = 0;
    cargoList.value.forEach((cargo, idx) => {
      const cargoOriginalLength = cargo.originalLength !== undefined ? cargo.originalLength : cargo.length;
      const cargoOriginalWidth = cargo.originalWidth !== undefined ? cargo.originalWidth : cargo.width;
      const cargoOriginalHeight = cargo.originalHeight !== undefined ? cargo.originalHeight : cargo.height;
      
      // 匹配名称、尺寸和旧颜色
      if (cargo.name === matchName && 
          cargoOriginalLength === matchLength && 
          cargoOriginalWidth === matchWidth && 
          cargoOriginalHeight === matchHeight && 
          cargo.color === oldColorToMatch) {
        
        // 更新颜色
        cargoList.value[idx] = {
          ...cargo,
          color: newColorToApply
        };
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      console.log(`更新了 ${updatedCount} 个类型为 '${matchName}' (尺寸: ${matchLength}×${matchWidth}×${matchHeight}, 原颜色: '${oldColorToMatch}') 的货物颜色为 '${newColorToApply}'`);
    } else {
      console.warn(`[handleUpdateCargo] 未找到匹配特征的货物进行颜色更新。`);
    }
  } else {
    console.warn(`[handleUpdateCargo] 接收到的待更新货物ID格式不正确: '${compositeId}'。未执行颜色更新。`);
  }
}

// 计算当前选中的集装箱数据
const currentContainer = computed(() => {
  const details = containerTypeDetails[selectedContainer.value];
  if (!details) return null;
  
  return {
    value: selectedContainer.value,
    ...details
  }
});

// 处理导出报告事件
const handleExportReport = async (options) => {
  console.log('[Container.vue] handleExportReport: 开始导出报告');
  
  // 创建一个标志，用于标记是否已取消
  let isCancelled = false;
  
  // 存储当前任务，以便可以取消
  const currentExportTask = {
    cancel: () => {
      isCancelled = true;
      console.log('[Container.vue] 导出报告已取消');
      if (options.onComplete) {
        options.onComplete(false, '用户取消了导出');
      }
    }
  };
  
  // 将当前任务存储在全局变量中，以便可以从其他方法访问
  window.currentExportTask = currentExportTask;

  try {
    // 首先回调一个初始进度，避免用户感觉没反应
    if (options.onProgress) {
      options.onProgress(0.05, t('container.report.preparingData'));
    }
    
    // 获取ContainerScene组件引用
    const containerSceneRef = ref(null);
    
    // 延迟执行主要操作，避免UI阻塞
    setTimeout(async () => {
      try {
        // 如果已经取消，则不执行后续操作
        if (isCancelled) return;
        
        // 等待下一个DOM更新周期
        await nextTick();
        
        // 如果已经取消，则不执行后续操作
        if (isCancelled) return;
        
        // 获取3D场景元素
        const sceneElement = document.getElementById('container3d');
        
        // 如果已经取消，则不执行后续操作
        if (isCancelled) return;
        
        // 使用工具函数生成报告
        const reportResult = await generateLoadingReport({
          containerData: currentContainer.value,
          cargoList: cargoList.value,
          cargoStats: loadedCargoStats.value,
          filename: `集装箱装载计划_${selectedContainer.value}_${new Date().toLocaleString().replace(/[/:]/g, '-')}.pdf`,
          sceneElement,
          t, // 传递翻译函数
          onProgress: (progress, status) => {
            // 如果已经取消，则不执行回调
            if (isCancelled) return;
            
            if (options.onProgress) {
              options.onProgress(progress, status);
            }
          },
          onComplete: (success, result) => {
            // 如果已经取消，则不执行回调
            if (isCancelled) return;
            
            // 清除当前任务
            window.currentExportTask = null;
            
            if (options.onComplete) {
              options.onComplete(success, result);
            }
          }
        });
        
        return reportResult;
      } catch (error) {
        // 只有在未取消的情况下才报告错误
        if (!isCancelled) {
          console.error('导出报告时发生错误:', error);
          if (options.onComplete) {
            options.onComplete(false, error.message || '未知错误');
          }
        }
        return false;
      }
    }, 100); // 设置短延迟，让UI有机会更新
    
    return true; // 立即返回，避免阻塞
  } catch (error) {
    console.error('导出报告前置处理时发生错误:', error);
    if (options.onComplete && !isCancelled) {
      options.onComplete(false, error.message || '未知错误');
    }
    return false;
  }
};

// 处理取消导出报告
const handleExportReportCancel = () => {
  console.log('[Container.vue] 收到取消导出报告请求');
  if (window.currentExportTask && window.currentExportTask.cancel) {
    window.currentExportTask.cancel();
    window.currentExportTask = null;
  }
};

// 全局应用配置
const appConfig = {
  enableExport: false,  // 是否启用导出报告功能
  maxCargosPerBatch: 100,  // 每批次最大货物数量
  maxLoadingAttempts: 5,   // 装载尝试最大次数
}
</script>

<template>
  <div class="container-layout">
    <a-row :gutter="[16, 12]">
      <a-col :xs="24" :lg="16">
        <div class="scene-container">
          <ContainerScene 
            :cargoList="cargoList" 
            :selectedContainer="selectedContainer" 
            :containerTypeDetails="containerTypeDetails" 
            :loadedCargoStats="loadedCargoStats"
          />
        </div>
      </a-col>
      <a-col :xs="24" :lg="8">
        <template v-if="isLoggedIn">
          <ContainerControlPanel 
            :cargoListForTable="aggregatedCargoListForUITable"
            :loadedCargoStats="loadedCargoStats"
            :selectedContainer="selectedContainer" 
            :containerGroups="containerGroups" 
            :containerTypeDetails="containerTypeDetails"
            :isAddingCargo="isAddingCargo"
            :lastAddingResult="lastAddingResult"
            :enableExport="appConfig.enableExport"
            @add-cargo="handleAddCargo"
            @remove-cargo="handleRemoveCargo"
            @clear-cargo="handleClearCargo"
            @update-cargo="handleUpdateCargo"
            @update:selectedContainer="selectedContainer = $event"
            @export-report="handleExportReport"
            @export-report-cancel="handleExportReportCancel"
          />
        </template>
        <template v-else>
          <a-card class="auth-prompt-card">
            <p class="auth-prompt-text">
              {{ t('auth.pleaseLoginOrRegister') }}
            </p>
              <img src="../assets/images/goobox.png" alt="Lock" style="width:100% ; margin-bottom: 16px;" />
              <div class="auth-prompt-buttons">
                <a-button type="primary" @click="router.push({ name: 'auth', query: { redirect: router.currentRoute.value.fullPath } })" style="margin-right: 8px;">
                  {{ t('auth.login') }}
                </a-button>
                <a-button @click="router.push({ name: 'auth', query: { view: 'register', redirect: router.currentRoute.value.fullPath } })">
                  {{ t('auth.register') }}
                </a-button>
              </div>
          </a-card>
        </template>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="scss" scoped>
.container-layout {
  padding: 16px;
}

.scene-container {
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f8f8f8;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.auth-prompt-card {
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 100%;
  min-height: 600px;
  color: #f0f0f0;
  background-color: #1C4468;
  border: 1px solid #f0f0f0;
  border-radius: 4px;

  .auth-prompt-text{
    position: absolute;
    top: 25%;
    left: 0;
    width: 100%;
    text-align: center;
  }

  .auth-prompt-buttons {
    position: absolute;
    bottom: 20%;
    left: 0;
    width: 100%;
    padding: 0 20px;
    text-align: center;
  }
  .ant-btn{
  margin: 0 15px;
  }
  
}

</style>