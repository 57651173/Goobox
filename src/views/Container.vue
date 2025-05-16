<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ContainerScene from '../components/container/ContainerScene.vue'
import ContainerControlPanel from '../components/container/ContainerControlPanel.vue'
import config from '../config' // 导入配置模块

const { t } = useI18n()

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
    // 更可靠的聚合key：使用原始传入的cargo的id（如果它代表类型），或者名称+尺寸+重量的组合
    // 假设原始cargo对象（在被handleAddCargo处理前）有一个唯一的类型标识符，如 originalId 或 typeKey
    // 这里我们暂时使用一个组合键，如果原始cargo对象有更稳定的类型ID，应优先使用那个
    const originalCargoId = instance.id.includes('-inst-') ? instance.id.split('-inst-')[0] : instance.id;

    const key = `${instance.name}-${instance.length}x${instance.width}x${instance.height}-${instance.weight}-${originalCargoId}`;

    if (aggregationMap.has(key)) {
      const existingEntry = aggregationMap.get(key);
      existingEntry.quantity += 1; // 数量是每个独立实例的数量，这里我们是在计算总数
    } else {
      // 复制实例的属性，但数量初始化为1。确保UI显示的是单个货物的重量，而不是总重量
      aggregationMap.set(key, {
        // 我们需要原始的、未被修改的单个货物信息用于表格显示
        // 因此，最好是基于 standardizedCargoInput 或 singleCargoData 来创建条目，而不是 instance
        // 但为了简单起见，暂时从instance复制，并确保数量正确
        name: instance.name,
        length: instance.length,
        width: instance.width,
        height: instance.height,
        weight: instance.weight, // 单个货物的重量
        color: instance.color,
        id: originalCargoId, // 使用处理过的原始ID
        // 其他需要显示在表格中的属性...
        quantity: 1, // 这个quantity是此聚合条目的计数器
      });
    }
  });

  // 返回Map中的值，这些值现在代表聚合后的货物及其总数量
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

// 核心摆放逻辑函数 - 摆放策略
function findPlacementPosition(newCargo, existingCargos, container) {
  const C_L = container.length;
  const C_W = container.width;
  const C_H = container.height;

  const N_L = newCargo.length;
  const N_W = newCargo.width;
  const N_H = newCargo.height;

  if (N_L <= 0 || N_W <= 0 || N_H <= 0) {
    console.error('货物尺寸必须为正数:', newCargo);
    return null;
  }

  // 动态计算步长：基于货物最小尺寸的比例，同时设置上下限
  // 对于大货物，使用较大步长可减少不必要计算
  // 对于小货物，使用较小步长可提高装载精度
  const minCargoSize = Math.min(N_L, N_W, N_H);
  const minContainerSize = Math.min(C_L, C_W, C_H);
  
  // 基本步长：货物最小尺寸的5%，同时不超过集装箱最小尺寸的1%
  let step = Math.min(minCargoSize * 0.05, minContainerSize * 0.01);
  
  // 确保步长在合理范围内：最小0.01，最大0.2
  step = Math.max(0.01, Math.min(step, 0.2));
  
  // 四舍五入到小数点后两位，避免浮点精度问题
  step = roundToPrecision(step, 2);
  
  console.log(`根据货物尺寸(${N_L}x${N_W}x${N_H})计算的步长: ${step}`);

  // 修改遍历顺序：z轴优先(沿宽度)，然后是y轴(沿高度)，最后是x轴(沿长度)
  for (let x = 0; roundToPrecision(x + N_L, 2) <= C_L; x = roundToPrecision(x + step, 2)) {
    for (let y = 0; roundToPrecision(y + N_H, 2) <= C_H; y = roundToPrecision(y + step, 2)) {
      for (let z = 0; roundToPrecision(z + N_W, 2) <= C_W; z = roundToPrecision(z + step, 2)) {
        const currentPosition = { 
          x: roundToPrecision(x, 2), 
          y: roundToPrecision(y, 2), 
          z: roundToPrecision(z, 2) 
        };

        // 1. 边界检查 (虽然循环条件已处理，再次确认更安全)
        // (此处的直接边界检查已包含在循环条件中，确保 x + N_L <= C_L 等)

        // 2. 检查是否与已摆放货物重叠
        let collision = false;
        for (const placedCargo of existingCargos) {
          if (!placedCargo.position || !placedCargo.length || !placedCargo.width || !placedCargo.height) {
            // console.warn('碰撞检测跳过: 已摆放货物信息不完整:', JSON.stringify(placedCargo));
            continue;
          }
          
          const P_X = placedCargo.position.x;
          const P_Y = placedCargo.position.y;
          const P_Z = placedCargo.position.z;
          const P_L = placedCargo.length;
          const P_W = placedCargo.width;
          const P_H = placedCargo.height;

          const newCargoBox = {
            minX: currentPosition.x, maxX: roundToPrecision(currentPosition.x + N_L, 2),
            minY: currentPosition.y, maxY: roundToPrecision(currentPosition.y + N_H, 2),
            minZ: currentPosition.z, maxZ: roundToPrecision(currentPosition.z + N_W, 2),
          };

          const placedCargoBox = {
            minX: P_X, maxX: roundToPrecision(P_X + P_L, 2),
            minY: P_Y, maxY: roundToPrecision(P_Y + P_H, 2),
            minZ: P_Z, maxZ: roundToPrecision(P_Z + P_W, 2),
          };
          
          const overlapsX = !(newCargoBox.maxX <= placedCargoBox.minX || newCargoBox.minX >= placedCargoBox.maxX);
          const overlapsY = !(newCargoBox.maxY <= placedCargoBox.minY || newCargoBox.minY >= placedCargoBox.maxY);
          const overlapsZ = !(newCargoBox.maxZ <= placedCargoBox.minZ || newCargoBox.minZ >= placedCargoBox.maxZ);

          const currentIterationCollision = overlapsX && overlapsY && overlapsZ;
          
          if (currentIterationCollision) {
            console.log('碰撞检测! New@(' + currentPosition.x + ',' + currentPosition.y + ',' + currentPosition.z + ') Dim:(' + N_L + ',' + N_W + ',' + N_H + ') VS Placed@(' + P_X + ',' + P_Y + ',' + P_Z + ') Dim:(' + P_L + ',' + P_W + ',' + P_H + ')');
            console.log('NewBox:', JSON.stringify(newCargoBox));
            console.log('PlacedBox:', JSON.stringify(placedCargoBox));
            console.log(`Overlap details: X:${overlapsX}, Y:${overlapsY}, Z:${overlapsZ}`);
            collision = true;
            break; 
          }
        }

        if (!collision) {
          // 在返回前添加最终日志
          console.log(`找到可用位置: (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.z}) for New Cargo Dim:(${N_L}, ${N_W}, ${N_H}). Existing cargos: ${existingCargos.length}`);
          return currentPosition;
        }
      }
    }
  }
  return null; // 没有找到合适的位置
}

// 处理添加货物事件
const handleAddCargo = (cargoDataFromPanel) => {
  console.log(`[Container.vue] handleAddCargo: 添加货物 = ${JSON.stringify(cargoDataFromPanel)}`)
  const quantityToAdd = cargoDataFromPanel.quantity || 1;
  let successfullyAddedCount = 0;
  
  // 重置添加结果和计时相关状态
  lastAddingResult.value = {
    success: true,
    message: '',
    attempted: quantityToAdd,
    added: 0
  };
  loadingSeconds.value = 0;
  loadingTimedOut.value = false;
  
  // 启用loading状态
  isAddingCargo.value = true;
  
  // 启动计时器，每秒更新一次
  loadingTimer.value = setInterval(() => {
    loadingSeconds.value++;
    
    // 检查是否超时
    if (loadingSeconds.value >= loadingTimeout) {
      loadingTimedOut.value = true;
      
      // 清除计时器
      clearInterval(loadingTimer.value);
      loadingTimer.value = null;
      
      // 更新结果状态
      lastAddingResult.value.success = false;
      lastAddingResult.value.message = `装柜分析超时（${loadingTimeout}秒）`;
      
      // 关闭loading状态
      isAddingCargo.value = false;
    }
  }, 1000);
  
  // 使用setTimeout确保UI能及时更新loading状态
  setTimeout(async () => {
    try {
      // 如果已经超时，不执行后续操作
      if (loadingTimedOut.value) return;
      
      for (let i = 0; i < quantityToAdd; i++) {
        // 如果过程中超时，停止继续添加
        if (loadingTimedOut.value) break;
        
        // 为每个实例创建独立的输入对象，避免引用问题
        // 并从原始数据（可能包含quantity）中提取单个货物的属性
        const singleCargoData = { ...cargoDataFromPanel };
        delete singleCargoData.quantity; // 确保单个货物实例不携带quantity属性

        let colorValue = singleCargoData.color || '#FF5722';
        if (!colorValue.startsWith('#')) {
          colorValue = '#' + colorValue;
        }
        if (colorValue.length > 7) {
          colorValue = colorValue.substring(0, 7);
        }

        const standardizedCargoInput = {
          ...singleCargoData,
          color: colorValue
        };

        // console.log(`尝试添加第 ${i + 1}/${quantityToAdd} 个货物: ${standardizedCargoInput.name || '未命名'}, 颜色处理: ${singleCargoData.color} -> ${standardizedCargoInput.color}`);

        if (typeof standardizedCargoInput.length !== 'number' || standardizedCargoInput.length <= 0 ||
            typeof standardizedCargoInput.width !== 'number' || standardizedCargoInput.width <= 0 ||
            typeof standardizedCargoInput.height !== 'number' || standardizedCargoInput.height <= 0) {
            // console.error('货物尺寸信息不完整或无效:', standardizedCargoInput);
          alert(t('cargoAdd.error.dimensionsMissing'));
          if (quantityToAdd > 1) continue; // 如果是批量添加，跳过这个坏的，继续下一个
          break;
        }

        const containerDetails = containerTypeDetails[selectedContainer.value];
        if (!containerDetails) {
          console.error('未找到选中的集装箱类型详情');
          alert(t('cargoAdd.error.containerNotFound'));
          break; // 容器错误则停止
        }

        const position = findPlacementPosition(standardizedCargoInput, cargoList.value, containerDetails);

        if (position) {
          const newCargoWithPositionInstance = {
            ...standardizedCargoInput,
            id: singleCargoData.id ? `${singleCargoData.id}-inst-${i}` : `cargo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
            instanceId: nextInstanceId++,
            position
          };
          cargoList.value.push(newCargoWithPositionInstance);
          successfullyAddedCount++;
          console.log(`  成功添加第 ${i + 1} 个货物 (InstID: ${newCargoWithPositionInstance.instanceId}) 位置:`, position, '尺寸:', `${newCargoWithPositionInstance.length}x${newCargoWithPositionInstance.width}x${newCargoWithPositionInstance.height}`);
        } else {
          console.warn(`  无法为第 ${i + 1} 个货物 (名称: ${standardizedCargoInput.name || '未命名'}) 找到位置。空间不足或无合适位置。`);
          // 批量添加时不再弹窗，而是记录结果
          // break; 
        }
      }

      // 处理添加结果
      lastAddingResult.value.added = successfullyAddedCount;
      if (successfullyAddedCount > 0) {
        console.log(`--- 批量添加操作完成。成功添加 ${successfullyAddedCount} / ${quantityToAdd} 个货物件 ---`);
        console.log(`[Container.vue] Current full cargoList (total ${cargoList.value.length} items):`);
        console.table(cargoList.value.map(c => ({ instId: c.instanceId, name: c.name, pos: c.position, color: c.color })));
        console.log('已装载货物:', aggregatedCargoListForUITable.value);
        
        // 如果没有全部添加成功，更新结果信息
        if (successfullyAddedCount < quantityToAdd) {
          lastAddingResult.value.success = false;
          lastAddingResult.value.message = `集装箱空间不足，部分货物无法装载`;
        }
      } else if (quantityToAdd > 0) {
        // 全部添加失败的情况
        lastAddingResult.value.success = false;
        lastAddingResult.value.message = `集装箱已满或无法装载此货物`;
      }
    } catch (error) {
      console.error('添加货物过程中发生错误:', error);
      lastAddingResult.value.success = false;
      lastAddingResult.value.message = `添加货物失败: ${error.message || '未知错误'}`;
    } finally {
      // 清除计时器
      if (loadingTimer.value) {
        clearInterval(loadingTimer.value);
        loadingTimer.value = null;
      }
      
      // 无论成功与否，都关闭loading状态
      isAddingCargo.value = false;
    }
  }, 100); // 延迟100ms，确保UI渲染loading状态
};

// 处理移除货物事件
const handleRemoveCargo = (id) => {
  // id参数是表格中的聚合记录ID（原始ID），需要匹配实际货物列表中的带有-inst-后缀的ID
  cargoList.value = cargoList.value.filter(cargo => {
    // 从实例ID中提取原始ID部分
    const cargoOriginalId = cargo.id.includes('-inst-') ? cargo.id.split('-inst-')[0] : cargo.id;
    return cargoOriginalId !== id;
  });
  console.log(`移除ID为${id}的货物后，剩余${cargoList.value.length}个货物`);
}

// 处理清空所有货物事件
const handleClearCargo = () => {
  cargoList.value = []
}

// 处理更新货物事件（例如更改颜色）
const handleUpdateCargo = (updatedCargo) => {
  // 标准化颜色
  let colorValue = updatedCargo.color || '#FF5722'
  if (!colorValue.startsWith('#')) {
    colorValue = '#' + colorValue
  }
  if (colorValue.length > 7) {
    colorValue = colorValue.substring(0, 7)
  }
  
  const standardizedCargo = {
    ...updatedCargo,
    color: colorValue
  }
  
  // 需要更新两种情况：
  // 1. 聚合表格视图中的货物（使用原始ID）
  // 2. 3D视图中的所有实例（相同原始ID的多个实例）
  
  // 找出所有对应的货物实例
  const updatedIds = []
  
  // 更新所有匹配原始ID的实例（处理3D视图中的所有相同类型货物）
  cargoList.value.forEach((cargo, idx) => {
    // 从实例ID中提取原始ID部分
    const cargoOriginalId = cargo.id.includes('-inst-') ? cargo.id.split('-inst-')[0] : cargo.id
    
    if (cargoOriginalId === standardizedCargo.id) {
      // 保存更新前的ID，供调试使用
      updatedIds.push(cargo.id)
      
      // 只更新颜色属性，保留其他属性不变
      cargoList.value[idx] = {
        ...cargo,
        color: standardizedCargo.color
      }
    }
  })
  
  if (updatedIds.length > 0) {
    // 触发响应式更新（通过创建新数组强制Vue重新渲染）
    cargoList.value = [...cargoList.value]
    console.log(`更新货物颜色: ${updatedCargo.id} 从 ${updatedCargo.color} 到 ${standardizedCargo.color}，影响了 ${updatedIds.length} 个实例`)
  } else {
    console.warn(`未找到ID为 ${standardizedCargo.id} 的货物实例`)
  }
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
        <ContainerControlPanel 
          :cargoListForTable="aggregatedCargoListForUITable"
          :loadedCargoStats="loadedCargoStats"
          :selectedContainer="selectedContainer" 
          :containerGroups="containerGroups" 
          :containerTypeDetails="containerTypeDetails"
          :isAddingCargo="isAddingCargo"
          :lastAddingResult="lastAddingResult"
          @add-cargo="handleAddCargo"
          @remove-cargo="handleRemoveCargo"
          @clear-cargo="handleClearCargo"
          @update-cargo="handleUpdateCargo"
          @update:selectedContainer="selectedContainer = $event"
        />
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.container-layout {
  padding: 16px;
}

.scene-container {
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f8f8f8;
  height: 600px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}
</style>