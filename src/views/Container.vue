<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 集装箱类型数据
const containerTypes = [
  { value: '20GP', label: '20尺标准集装箱', length: 5.9, width: 2.35, height: 2.39 },
  { value: '40GP', label: '40尺标准集装箱', length: 12.03, width: 2.35, height: 2.39 },
  { value: '40HC', label: '40尺高箱集装箱', length: 12.03, width: 2.35, height: 2.7 },
]

// 货物列表
const cargoList = ref([
  { id: 1, name: '箱子A', length: 1.2, width: 0.8, height: 1.0, weight: 500, quantity: 1, color: '#FF5722' },
  { id: 2, name: '箱子B', length: 0.6, width: 0.4, height: 0.5, weight: 200, quantity: 2, color: '#2196F3' }
])

// 选中的集装箱类型
const selectedContainer = ref(containerTypes[0].value)

// 添加货物表单
const newCargo = ref({
  name: '',
  length: 0,
  width: 0,
  height: 0,
  weight: 0,
  quantity: 1,
  color: '#' + Math.floor(Math.random()*16777215).toString(16)
})

// 添加新货物
const addCargo = () => {
  if (!newCargo.value.name || 
      newCargo.value.length <= 0 || 
      newCargo.value.width <= 0 || 
      newCargo.value.height <= 0 || 
      newCargo.value.weight <= 0) {
    return
  }
  
  const id = cargoList.value.length > 0 ? Math.max(...cargoList.value.map(c => c.id)) + 1 : 1
  
  cargoList.value.push({
    id,
    name: newCargo.value.name,
    length: parseFloat(newCargo.value.length),
    width: parseFloat(newCargo.value.width),
    height: parseFloat(newCargo.value.height),
    weight: parseFloat(newCargo.value.weight),
    quantity: parseInt(newCargo.value.quantity),
    color: newCargo.value.color
  })
  
  // 重置表单
  newCargo.value = {
    name: '',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    quantity: 1,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  }
  
  // 重新渲染3D场景
  renderScene()
}

// 移除货物
const removeCargo = (id) => {
  cargoList.value = cargoList.value.filter(cargo => cargo.id !== id)
  // 重新渲染3D场景
  renderScene()
}

// 处理集装箱类型变化
const handleContainerChange = () => {
  // 更新3D渲染
  renderScene()
}

// 3D场景相关变量
let scene, camera, renderer, controls, container3d

// 初始化3D场景
const initScene = () => {
  container3d = document.getElementById('container3d')
  if (!container3d) return
  
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    45, 
    container3d.clientWidth / container3d.clientHeight, 
    0.1, 
    1000
  )
  camera.position.set(15, 15, 15)
  camera.lookAt(0, 0, 0)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container3d.clientWidth, container3d.clientHeight)
  container3d.appendChild(renderer.domElement)
  
  // 添加轨道控制
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  
  // 添加网格辅助线
  const gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)
  
  // 添加坐标轴辅助线
  const axesHelper = new THREE.AxesHelper(10)
  scene.add(axesHelper)
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 15)
  scene.add(directionalLight)
  
  // 启动动画循环
  animate()
  
  // 处理窗口大小变化
  window.addEventListener('resize', onWindowResize)
}

// 适应窗口大小变化
const onWindowResize = () => {
  if (!container3d || !camera || !renderer) return
  
  camera.aspect = container3d.clientWidth / container3d.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container3d.clientWidth, container3d.clientHeight)
}

// 渲染场景
const renderScene = () => {
  if (!scene) return
  
  // 清除现有内容
  while(scene.children.length > 0) { 
    scene.remove(scene.children[0]); 
  }
  
  // 重新添加基础元素
  const gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)
  
  const axesHelper = new THREE.AxesHelper(10)
  scene.add(axesHelper)
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 15)
  scene.add(directionalLight)
  
  // 获取选中的集装箱数据
  const containerData = containerTypes.find(c => c.value === selectedContainer.value)
  
  // 渲染集装箱
  if (containerData) {
    const { length, width, height } = containerData
    
    // 创建集装箱线框
    const containerGeometry = new THREE.BoxGeometry(length, height, width)
    const edges = new THREE.EdgesGeometry(containerGeometry)
    const containerMesh = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    )
    
    // 将集装箱定位在坐标原点，底部与地面对齐
    containerMesh.position.set(length/2, height/2, width/2)
    scene.add(containerMesh)
    
    // 渲染地板
    const floorGeometry = new THREE.PlaneGeometry(length, width)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = Math.PI / 2
    floor.position.set(length/2, 0.01, width/2)
    scene.add(floor)
    
    // 简单的货物放置算法（仅演示用）
    let currentX = 0.1
    let currentY = 0
    let currentZ = 0.1
    let maxHeightInRow = 0
    
    // 添加所有货物
    cargoList.value.forEach(cargo => {
      // 处理多个相同货物
      for(let i = 0; i < cargo.quantity; i++) {
        // 检查是否需要换行
        if (currentX + cargo.length > containerData.length - 0.1) {
          currentX = 0.1
          currentZ += maxHeightInRow + 0.1
          maxHeightInRow = 0
          
          // 检查是否超出宽度
          if (currentZ + cargo.width > containerData.width - 0.1) {
            currentZ = 0.1
            currentY += maxHeightInRow
            maxHeightInRow = 0
            
            // 检查是否超出高度
            if (currentY + cargo.height > containerData.height) {
              // 装不下了，跳过
              continue
            }
          }
        }
        
        // 创建货物几何体
        const cargoGeometry = new THREE.BoxGeometry(
          cargo.length,
          cargo.height,
          cargo.width
        )
        
        const cargoMaterial = new THREE.MeshStandardMaterial({
          color: cargo.color,
          transparent: true,
          opacity: 0.8
        })
        
        const cargoMesh = new THREE.Mesh(cargoGeometry, cargoMaterial)
        
        // 定位货物，底部与地面对齐
        cargoMesh.position.set(
          currentX + cargo.length/2,
          currentY + cargo.height/2,
          currentZ + cargo.width/2
        )
        
        scene.add(cargoMesh)
        
        // 更新位置和最大高度
        currentX += cargo.length + 0.1
        maxHeightInRow = Math.max(maxHeightInRow, cargo.width)
      }
    })
  }
}

// 动画循环
const animate = () => {
  requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

// 组件挂载后初始化3D场景
onMounted(() => {
  initScene()
  renderScene()
})
</script>

<template>
  <div class="container-loading">
    <a-row :gutter="16">
      <a-col :span="5">
        <a-card title="装载设置" :bordered="true">
          <a-form layout="vertical">
            <a-form-item label="集装箱类型">
              <a-select 
                v-model:value="selectedContainer" 
                @change="handleContainerChange"
              >
                <a-select-option v-for="container in containerTypes" :key="container.value" :value="container.value">
                  {{ container.label }} ({{ container.length }}m×{{ container.width }}m×{{ container.height }}m)
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-divider>添加货物</a-divider>
            
            <a-form-item label="货物名称">
              <a-input v-model:value="newCargo.name" placeholder="输入货物名称" />
            </a-form-item>
            
            <a-form-item label="尺寸 (米)">
              <a-input-group compact>
                <a-input-number 
                  v-model:value="newCargo.length" 
                  style="width: 33%" 
                  placeholder="长" 
                  :min="0.01"
                  :step="0.1"
                />
                <a-input-number 
                  v-model:value="newCargo.width" 
                  style="width: 33%" 
                  placeholder="宽" 
                  :min="0.01"
                  :step="0.1"
                />
                <a-input-number 
                  v-model:value="newCargo.height" 
                  style="width: 34%" 
                  placeholder="高" 
                  :min="0.01"
                  :step="0.1"
                />
              </a-input-group>
            </a-form-item>
            
            <a-form-item label="重量 (千克)">
              <a-input-number 
                v-model:value="newCargo.weight" 
                style="width: 100%" 
                placeholder="输入货物重量" 
                :min="0.1"
              />
            </a-form-item>
            
            <a-form-item label="数量">
              <a-input-number 
                v-model:value="newCargo.quantity" 
                style="width: 100%" 
                placeholder="货物数量" 
                :min="1"
              />
            </a-form-item>
            
            <a-form-item label="颜色">
              <a-input v-model:value="newCargo.color" placeholder="颜色代码" />
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" block @click="addCargo">添加货物</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
      
      <a-col :span="18">
        <a-card :title="null" :bordered="true">
          <div id="container3d" class="container-3d"></div>
        </a-card>
        
        <a-card title="货物列表" style="margin-top: 16px">
          <a-table :dataSource="cargoList" :columns="cargoColumns" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'size'">
                {{ record.length }}×{{ record.width }}×{{ record.height }}m
              </template>
              <template v-if="column.key === 'volume'">
                {{ (record.length * record.width * record.height).toFixed(2) }}m³
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" danger @click="removeCargo(record.id)">移除</a-button>
              </template>
              <template v-if="column.key === 'color'">
                <div class="color-box" :style="{ backgroundColor: record.color }"></div>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cargoColumns: [
        { title: '名称', dataIndex: 'name', key: 'name' },
        { title: '尺寸', key: 'size' },
        { title: '重量', dataIndex: 'weight', key: 'weight', customRender: (text) => `${text}kg` },
        { title: '体积', key: 'volume' },
        { title: '数量', dataIndex: 'quantity', key: 'quantity' },
        { title: '颜色', key: 'color' },
        { title: '操作', key: 'action' }
      ]
    }
  }
}
</script>

<style scoped>
.container-loading {
  padding: 20px;
  height: 100%;
}

.container-3d {
  width: 100%;
  height: 600px;
  background-color: #f8f8f8;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
</style> 