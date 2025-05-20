<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useI18n } from 'vue-i18n'
import { BorderOutlined, AimOutlined, CameraOutlined, TagOutlined } from '@ant-design/icons-vue'

// 添加中等间距变量
const middle = 12

const props = defineProps({
  cargoList: {
    type: Array,
    default: () => []
  },
  selectedContainer: {
    type: String,
    default: '40GP'
  },
  containerTypeDetails: {
    type: Object,
    required: true
  },
  loadedCargoStats: {
    type: Object,
    default: () => ({
      totalVolume: '0.00',
      totalWeight: '0.00',
      volumeUsageRate: '0.00',
      weightUsageRate: '0.00',
      totalIndividualItems: 0
    })
  }
})

// 触发父组件事件
const emit = defineEmits(['update-scene'])

const { t } = useI18n()

// 将 createTextSprite 函数移到顶层作用域
const createTextSprite = (text, color, position, size = 6) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, 128, 128);
  
  ctx.font = 'bold 100px Arial';
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.copy(position);
  sprite.scale.set(size, size, 1);
  
  return sprite;
};

// 显示控制选项
const showGrid = ref(true)
const showAxes = ref(true)
const showCameraPosition = ref(true) // 显示相机位置的控制变量
const showFaceLabels = ref(true) // 新增：显示六面标签的控制变量

// 计算当前选中的集装箱数据
const currentContainer = computed(() => {
  const details = props.containerTypeDetails[props.selectedContainer]
  if (!details) return null
  
  return {
    value: props.selectedContainer,
    ...details
  }
})

// 3D场景相关变量
let scene, camera, renderer, controls, container3d

// 监听容器大小变化
let resizeObserver = null

// 设置相机初始位置
const setCameraInit = (currentContainer) => {
  // 获取当前集装箱尺寸以便调整相机位置
  const containerData = currentContainer.value
  if (containerData) {
    const { length, width, height } = containerData
    
    // 调整相机位置，严格按照截图位置
    // 从更高的角度俯视，同时让坐标轴更加明显
    camera.position.set(
      length * 1.5,     // X轴位置向右偏移
      width * 4.5,      // Y轴位置向前偏移
      height * 8      // Z轴位置更高，提供俯视角度
    )
    // 相机朝向集装箱的中心
    camera.lookAt(length/2, width/2, height/2)
    
    // 如果有控制器，重置控制器目标
    if (controls) {
      controls.target.set(length / 2, width / 2, height / 2)
      controls.update()
    }
  } else {
    // 默认相机位置
    camera.position.set(20, 10, 15)
    // 相机默认朝向原点(0,0,0)，即三维空间的中心点
    camera.lookAt(0, 0, 0)
    
    // 重置控制器
    if (controls) {
      controls.target.set(0, 0, 0)
      controls.update()
    }
  }
}

// 初始化3D场景
const initScene = () => {
  try {
    container3d = document.getElementById('container3d')
    if (!container3d) {
      console.warn('容器元素container3d未找到，跳过初始化')
      return
    }

    // 创建场景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5) // 更浅的背景色，与截图一致

    // 创建相机
    camera = new THREE.PerspectiveCamera(
      45,
      container3d.clientWidth / container3d.clientHeight,
      0.1,
      1000
    )
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      preserveDrawingBuffer: true // 允许截图 
    })
    renderer.setSize(container3d.clientWidth, container3d.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // 设置渲染器阴影
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container3d.appendChild(renderer.domElement)

    // 添加轨道控制
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    
    // 设置相机初始位置
    setCameraInit(currentContainer)

    // 添加光源 - 增强效果
    // 环境光 - 提高亮度
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    // 主方向光 - 增加亮度
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    // 调整阴影相机参数
    directionalLight.shadow.camera.left = -50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.bottom = -50
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)
    
    // 添加辅助方向光，从另一个角度照射，减少阴影
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight2.position.set(-10, 15, -10)
    scene.add(directionalLight2)
    
    // 添加顶部点光源，进一步减少暗角
    const pointLight = new THREE.PointLight(0xffffff, 0.5)
    pointLight.position.set(0, 30, 0)
    scene.add(pointLight)

    // 添加基础元素
    renderScene()

    // 启动动画循环
    animate()

    // 使用ResizeObserver监听容器大小变化
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        onWindowResize()
      })
      resizeObserver.observe(container3d)
    } else {
      // 回退到传统方法处理窗口大小变化
      window.addEventListener('resize', onWindowResize)
    }
  } catch (error) {
    console.error('初始化3D场景时发生错误:', error)
  }
}

// 适应窗口大小变化
const onWindowResize = () => {
  if (!container3d || !camera || !renderer) return

  // 获取容器新尺寸
  const width = container3d.clientWidth
  const height = container3d.clientHeight

  // 更新相机
  camera.aspect = width / height
  camera.updateProjectionMatrix()

  // 更新渲染器
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 重新渲染场景
  renderer.render(scene, camera)
}

// 全局变量用于存储更新函数
let updateCameraInfo = null

// 添加相机位置信息标签的函数
const addCameraPositionMarker = () => {
  if (!camera || !scene) return
  
  // 创建表示相机位置的小球体
  const cameraMarker = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffff00 }) // 黄色小球
  )
  
  // 更新相机标记位置
  const updateMarker = () => {
    if (camera) {
      cameraMarker.position.copy(camera.position)
    }
  }
  
  // 初始化位置
  updateMarker()
  scene.add(cameraMarker)
  
  // 创建相机信息标签
  const createCameraPositionLabel = () => {
    // 创建画布
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    
    // 清空画布
    ctx.clearRect(0, 0, 256, 128)
    
    // 设置背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, 256, 128)
    
    // 设置文本样式
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    // 显示相机位置信息
    const pos = camera.position
    ctx.fillText(`相机位置:`, 10, 10)
    ctx.fillText(`X: ${pos.x.toFixed(2)}`, 10, 30)
    ctx.fillText(`Y: ${pos.y.toFixed(2)}`, 10, 50)
    ctx.fillText(`Z: ${pos.z.toFixed(2)}`, 10, 70)
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }
  
  // 创建位置信息面板
  const infoTexture = createCameraPositionLabel()
  const infoMaterial = new THREE.SpriteMaterial({ map: infoTexture })
  const infoSprite = new THREE.Sprite(infoMaterial)
  infoSprite.scale.set(10, 5, 1)
  
  // 将信息面板放置在相机标记上方
  infoSprite.position.copy(camera.position)
  infoSprite.position.y += 5
  scene.add(infoSprite)
  
  // 设置全局更新函数
  updateCameraInfo = () => {
    // 更新标记位置
    updateMarker()
    
    // 更新信息面板位置
    infoSprite.position.copy(camera.position)
    infoSprite.position.y += 5
    
    // 更新信息内容
    infoMaterial.map = createCameraPositionLabel()
    infoMaterial.needsUpdate = true
  }
  
  return () => {
    // 返回清理函数
    scene.remove(cameraMarker)
    scene.remove(infoSprite)
    updateCameraInfo = null
  }
}

// 渲染场景
const renderScene = () => {
  if (!scene) return

  // console.log(`[ContainerScene.vue] renderScene: Received props.cargoList with ${props.cargoList.length} items.`);
  if (props.cargoList.length > 0) {
      console.log(`[ContainerScene.vue] Full props.cargoList:`);
      console.table(props.cargoList.map(c => ({ instId: c.instanceId, pos: c.position, color: c.color, name: c.name })));
  }

  // 清除现有内容
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // 更新全局函数为null，避免引用已删除的对象
  updateCameraInfo = null

  // 重新添加基础元素
  // 根据控制选项添加网格辅助线
  if (showGrid.value) {
    // 增大网格尺寸以匹配截图
    const gridHelper = new THREE.GridHelper(80, 80, 0x888888, 0xDDDDDD)
    gridHelper.position.y = -0.01 // 稍微下移避免z-fighting
    scene.add(gridHelper)
  }

  // 显示相机位置
  if (showCameraPosition.value && camera) {
    addCameraPositionMarker()
  }

  // 根据控制选项添加坐标轴辅助线
  if (showAxes.value) {
    try {
      // 先获取集装箱数据
      const containerData = currentContainer.value;
      
      // 创建更大、更明显的坐标轴
      const axisLength = Math.max(40, 
        containerData ? Math.max(containerData.length || 0, containerData.width || 0, containerData.height || 0) * 1.5 : 40
      );
      
      // 手动创建三条坐标轴线，这样可以更好地控制每条线的颜色和粗细
      // X轴 - 红色 - 指向右侧（长度方向）
      const xAxisGeometry = new THREE.BufferGeometry();
      xAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        0, 0, 0, axisLength, 0, 0
      ], 3));
      const xAxis = new THREE.Line(
        xAxisGeometry,
        new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 4 })
      );
      scene.add(xAxis);
      
      // Y轴 - 绿色 - 指向上方（宽度方向）
      const yAxisGeometry = new THREE.BufferGeometry();
      yAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        0, 0, 0, 0, 0, axisLength
      ], 3));
      const yAxis = new THREE.Line(
        yAxisGeometry,
        new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 4 })
      );
      scene.add(yAxis);
      
      // Z轴 - 蓝色 - 指向前方（高度方向）
      const zAxisGeometry = new THREE.BufferGeometry();
      zAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        0, 0, 0, 0, axisLength, 0
      ], 3));
      const zAxis = new THREE.Line(
        zAxisGeometry,
        new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 4 })
      );
      scene.add(zAxis);
      
      // 添加坐标轴标签，使用try-catch防止标签创建失败影响主功能
      try {
        // X轴标签
        // const createTextSprite = (text, color, position, size = 6) => { ... MOVED TO TOP ... };
        
        // 添加 X, Y, Z 标签 - 位置与截图一致
        scene.add(createTextSprite('X', 0xff0000, new THREE.Vector3(axisLength + 2, 0, 0), 8));
        scene.add(createTextSprite('Y', 0x00ff00, new THREE.Vector3(0, 0, axisLength + 2), 8));
        scene.add(createTextSprite('Z', 0x0000ff, new THREE.Vector3(0, axisLength + 2, 0), 8));
      } catch (labelError) {
        console.warn('创建坐标轴标签时发生错误:', labelError);
        // 错误不应阻止主要功能
      }
    } catch (axisError) {
      console.error('创建坐标轴时发生错误:', axisError);
      // 降级为使用简单的坐标轴
      try {
        const simpleAxisHelper = new THREE.AxesHelper(40);
        scene.add(simpleAxisHelper);
      } catch (simpleAxisError) {
        console.error('创建简单坐标轴也失败:', simpleAxisError);
      }
    }
  }

  // 获取选中的集装箱数据
  const containerData = currentContainer.value

  // 渲染集装箱
  if (containerData) {
    const { length, width, height, color } = containerData
    
    // 创建集装箱组 - 用于存放所有集装箱相关的元素
    const containerGroup = new THREE.Group()
    
    // 为了使集装箱底角与虚线集装箱的底角重合，虚线集装箱位于原点
    // 彩色集装箱的位置也应该是从原点开始
    
    // 创建集装箱主体
    const containerGeometry = new THREE.BoxGeometry(length, width, height)
    
    // 创建半透明材质的集装箱
    const containerMaterial = new THREE.MeshStandardMaterial({ 
      color: color || 0xA8CFFF, // 更改为更浅的蓝色
      opacity: 0.2,
      transparent: true,
      side: THREE.DoubleSide
    })
    
    const containerMesh = new THREE.Mesh(containerGeometry, containerMaterial)
    // 按照截图位置，调整集装箱的位置，确保一个角位于坐标原点
    containerMesh.position.set(length / 2, width / 2, height / 2)
    containerGroup.add(containerMesh)
    
    // 创建虚线集装箱（边框）
    const edges = new THREE.EdgesGeometry(containerGeometry)
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ 
        color: 0x000000, 
        linewidth: 2,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
      })
    )
    // 虚线框的位置与彩色集装箱一致
    line.position.copy(containerMesh.position)
    containerGroup.add(line)
    
    // 添加内部网格线（辅助参考线）
    // 水平方向的网格线
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0x888888, 
      opacity: 0.3, 
      transparent: true 
    })
    
    const horizontalStep = height / 4
    for (let y = horizontalStep; y < height; y += horizontalStep) {
      const actualY = y + containerMesh.position.y - height / 2
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        0, actualY, 0,
        length, actualY, 0,
        length, actualY, width,
        0, actualY, width,
        0, actualY, 0
      ])
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const gridLine = new THREE.Line(geometry, gridMaterial)
      containerGroup.add(gridLine)
    }
    
    // 竖直方向的网格线 (长度方向)
    const lengthStep = length / 4
    for (let x = lengthStep; x < length; x += lengthStep) {
      const actualX = x
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        actualX, 0, 0,
        actualX, height, 0,
        actualX, height, width,
        actualX, 0, width
      ])
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const gridLine = new THREE.Line(geometry, gridMaterial)
      containerGroup.add(gridLine)
    }
    
    // 竖直方向的网格线 (宽度方向)
    const widthStep = width / 4
    for (let z = widthStep; z < width; z += widthStep) {
      const actualZ = z
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        0, 0, actualZ,
        0, height, actualZ,
        length, height, actualZ,
        length, 0, actualZ
      ])
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const gridLine = new THREE.Line(geometry, gridMaterial)
      containerGroup.add(gridLine)
    }
    
    // 创建门
    // 门的材质
    const doorMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide
    })
    
    // 创建门的几何形状
    const doorWidth = width / 2
    const doorGeometry = new THREE.PlaneGeometry(doorWidth, height * 0.9)
    
    // 左门 - 调整位置使其与集装箱对齐
    const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial)
    leftDoor.position.set(length, height / 2 * 0.95, width / 4)
    leftDoor.rotation.y = Math.PI / 2
    containerGroup.add(leftDoor)
    
    // 右门 - 调整位置使其与集装箱对齐
    const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial)
    rightDoor.position.set(length, height / 2 * 0.95, width * 3 / 4)
    rightDoor.rotation.y = Math.PI / 2
    containerGroup.add(rightDoor)
    
    // 添加门把手 - 调整位置使其与门对齐
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xCCCCCC })
    
    // 左门把手
    const leftHandleGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1)
    const leftHandle = new THREE.Mesh(leftHandleGeometry, handleMaterial)
    leftHandle.position.set(length * 1.01, height / 2, width / 4)
    containerGroup.add(leftHandle)
    
    // 右门把手
    const rightHandleGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1)
    const rightHandle = new THREE.Mesh(rightHandleGeometry, handleMaterial)
    rightHandle.position.set(length * 1.01, height / 2, width * 3 / 4)
    containerGroup.add(rightHandle)
    
    // 添加集装箱纹理线条（模拟金属板条纹）
    const linesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x555555, 
      opacity: 0.5, 
      transparent: true 
    })
    
    // 侧面纹理线条
    const sideStep = height / 8
    for (let side = 0; side <= 1; side++) {
      const sideZ = side * width
      for (let y = sideStep; y < height; y += sideStep) {
        const actualY = y
        const geometry = new THREE.BufferGeometry()
        const vertices = new Float32Array([
          0, actualY, sideZ,
          length, actualY, sideZ
        ])
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        const line = new THREE.Line(geometry, linesMaterial)
        containerGroup.add(line)
      }
    }
    
    // 顶部纹理线条
    const roofStep = width / 10
    for (let z = roofStep; z < width; z += roofStep) {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        0, height, z,
        length, height, z
      ])
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const line = new THREE.Line(geometry, linesMaterial)
      containerGroup.add(line)
    }
    
    // 创建集装箱标识
    const createContainerLabel = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 128
      const context = canvas.getContext('2d')
      
      // 绘制背景
      context.fillStyle = '#FFFFFF'
      context.fillRect(0, 0, 256, 128)
      
      // 添加边框
      context.strokeStyle = '#000000'
      context.lineWidth = 3
      context.strokeRect(3, 3, 250, 122)
      
      // 绘制文字
      context.font = 'bold 40px Arial'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = '#000000'
      
      // 注意：由于THREE.js纹理映射的原因，这里反向绘制文字
      // 当应用到3D对象上时，这样可以显示正确方向的文字
      context.scale(-1, 1)
      context.fillText('CONTAINER', -128, 90)
      
      // 创建纹理
      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide
      })
      
      return labelMaterial
    }
    
    const labelMaterial = createContainerLabel()
    
    // 仅创建一个前侧标识，删除后侧标识
    const frontLabelGeometry = new THREE.PlaneGeometry(width * 0.4, width * 0.2)
    const frontLabel = new THREE.Mesh(frontLabelGeometry, labelMaterial)
    frontLabel.position.set(0, height * 0.7, width / 2)
    // 水平翻转180度，使文字方向正确显示
    frontLabel.rotation.y = -Math.PI / 2
    // 不需要再翻转网格，因为已经在绘制时处理了
    // frontLabel.scale.x = -1
    containerGroup.add(frontLabel)
    
    // 创建地板
    const floorGeometry = new THREE.PlaneGeometry(length, width)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0xEEEEEE,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.set(length / 2, 0.01, width / 2) // 略高于底部，避免z-fighting
    containerGroup.add(floor)

    // 调整整个集装箱组的位置，按照截图所示
    // 在截图中，集装箱的一个角位于坐标原点附近
    containerGroup.position.set(0, 0, 0)
    scene.add(containerGroup)

    // 添加六面标签 A, B, C, D, E, F
    if (showFaceLabels.value) {
      const labelOffset = 1; // 标签从表面向外的偏移量
      const labelColor = 0x333333; // 深灰色
      const labelSize = Math.min(length, width, height) * 0.4; // 动态调整标签大小

      // 修正坐标轴方向定义，确保与系统保持一致
      // 注意: Three.js中:
      // - X轴指向右侧(红色)
      // - Y轴指向上方(绿色) - 这与我们系统中Z轴对应
      // - Z轴指向前方(蓝色) - 这与我们系统中Y轴对应
      
      // A (前壁, X=0)
      scene.add(createTextSprite('A', labelColor, 
        new THREE.Vector3(0 - labelOffset, height / 2, width / 2), labelSize));
      // C (后门, X=length)
      scene.add(createTextSprite('C', labelColor, 
        new THREE.Vector3(length + labelOffset, height / 2, width / 2), labelSize));
      // F (底部, Y=0)
      scene.add(createTextSprite('F', labelColor, 
        new THREE.Vector3(length / 2, 0 - labelOffset, width / 2), labelSize));
      // E (顶部, Y=height)
      scene.add(createTextSprite('E', labelColor, 
        new THREE.Vector3(length / 2, height + labelOffset, width / 2), labelSize));
      // B (右侧壁, Z=0)
      scene.add(createTextSprite('B', labelColor, 
        new THREE.Vector3(length / 2, height / 2, 0 - labelOffset), labelSize));
      // D (左侧壁, Z=width)
      scene.add(createTextSprite('D', labelColor, 
        new THREE.Vector3(length / 2, height / 2, width + labelOffset), labelSize));
    }

    // 添加所有货物 - 现在直接使用 cargo.position
    props.cargoList.forEach(cargo => {
      // console.log(`[ContainerScene.vue] renderScene forEach: Processing cargo with instId: ${cargo.instanceId}`, JSON.parse(JSON.stringify(cargo)));
      // 确保 cargo.position 存在且有效
      if (!cargo.position || typeof cargo.position.x !== 'number' || typeof cargo.position.y !== 'number' || typeof cargo.position.z !== 'number') {
        console.warn('货物缺少有效的位置信息，跳过渲染:', cargo);
        return; // 或处理错误
      }

      // console.log(`渲染货物: ${cargo.name || '未命名'} (InstID: ${cargo.instanceId}), 颜色: ${cargo.color}, 计算位置 (角点):`, cargo.position);

      // 创建货物网格
      const cargoMesh = createCargoMesh(cargo)
    
      // 定位货物 - 将 findPlacementPosition 计算的角点转换为中心点
      // cargo.position 是货物的最小角点 (minX, minY, minZ) 在集装箱坐标系中的位置。
      // Three.js BoxGeometry 的中心是 (0,0,0) 在其局部坐标系中。
      // 我们需要根据修正的坐标系设置 Mesh 的世界坐标位置
      // 系统坐标映射到Three.js坐标：X→X, Y→Z, Z→Y
      const centerX = cargo.position.x + cargo.length / 2;
      const centerY = cargo.position.z + cargo.height / 2;  // Z轴在Three.js中对应Y轴(高度)
      const centerZ = cargo.position.y + cargo.width / 2;   // Y轴在Three.js中对应Z轴(宽度)

      cargoMesh.position.set(
        centerX,
        centerY, // Three.js的Y轴(上)对应系统的Z轴(高度)
        centerZ  // Three.js的Z轴(前)对应系统的Y轴(宽度)
      );

      console.log(`  设置网格中心点位置(Three.js坐标系): (${centerX.toFixed(2)}, ${centerY.toFixed(2)}, ${centerZ.toFixed(2)})`);
      console.log(`  原始位置(系统坐标系): (${cargo.position.x.toFixed(2)}, ${cargo.position.y.toFixed(2)}, ${cargo.position.z.toFixed(2)})`);

      // 添加货物标签，确保标签参数顺序符合Three.js坐标系
      addItemLabel(cargoMesh, cargo.name || '货物', cargo.width, cargo.height, cargo.length);

      scene.add(cargoMesh)
    })
    
    // 调整相机位置，目标对准集装箱中心
    if (camera && controls) {
      controls.target.set(length / 2, width / 2, height / 2)
      controls.update()
    }
  }
}

// 切换网格显示
const toggleGrid = () => {
  showGrid.value = !showGrid.value
  renderScene()
}

// 切换坐标轴显示
const toggleAxes = () => {
  showAxes.value = !showAxes.value
  renderScene()
}

// 切换相机位置显示
const toggleCameraPosition = () => {
  // 恢复相机初始视角
  setCameraInit(currentContainer)
  renderScene()
}

// 新增：切换六面标签显示
const toggleFaceLabels = () => {
  showFaceLabels.value = !showFaceLabels.value
  renderScene()
}

// 动画循环
const animate = () => {
  requestAnimationFrame(animate)
  
  if (controls) controls.update()
  if (renderer && scene && camera) {
    // 在每一帧渲染时更新相机信息
    updateCameraInfo && updateCameraInfo()
    
    renderer.render(scene, camera)
  }
}

// 监视属性变化，重新渲染场景
watch(() => props.selectedContainer, () => {
  renderScene()
  emit('update-scene')
})

// 更深层次地监视货物列表，尤其是颜色变化
watch(() => props.cargoList, (newList, oldList) => {
  // 当货物列表或货物属性变化时完全重新渲染场景
  // 清除旧场景中的货物，重新创建
  if (scene) {
    // 移除所有非容器、坐标轴和网格的对象（即所有货物）
    const objectsToRemove = []
    scene.traverse(object => {
      // 识别货物对象 - 通过检查物体是否具有标签来判断
      if (object instanceof THREE.Mesh && 
          (object.material instanceof THREE.MeshStandardMaterial || 
           object.material instanceof THREE.MeshBasicMaterial ||
           object.material instanceof THREE.MeshLambertMaterial) && 
          object.children.some(child => child instanceof THREE.LineSegments)) {
        objectsToRemove.push(object)
      }
    })
    
    // 移除所有货物对象
    objectsToRemove.forEach(obj => {
      scene.remove(obj)
      // 释放几何体和材质资源
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })
  }
  
  // 完全重新渲染场景
  renderScene()
  emit('update-scene')
}, { deep: true })

// 在组件挂载和卸载时添加/移除窗口大小变化监听
onMounted(() => {
  try {
    initScene()
    renderScene()
    
    // 如果不支持ResizeObserver，使用window.resize事件
    if (!window.ResizeObserver) {
      window.addEventListener('resize', onWindowResize)
    }
  } catch (error) {
    console.error('组件挂载时发生错误:', error)
  }
})

// 在组件卸载时清理
onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', onWindowResize)
  
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  
  // 清理THREE.js资源
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement = null
  }
  
  if (scene) {
    scene.clear()
  }
})

// 暴露方法给父组件
defineExpose({
  renderScene
})

// 创建货物几何体和材质
const createCargoMesh = (cargo) => {
  // 重要：修正Three.js坐标系与我们系统坐标系的对应关系
  // Three.js中: X(右)，Y(上)，Z(前)
  // 我们系统：X(长度)，Y(宽度)，Z(高度)
  
  // 检查货物是否有水平旋转标记
  const isRotated = cargo.isRotatedHorizontally || false;
  
  console.log(`创建货物网格: id=${cargo.id}`);
  console.log(`  摆放尺寸: length=${cargo.length} (X轴), width=${cargo.width} (Y轴), height=${cargo.height} (Z轴)`);
  console.log(`  原始尺寸: origL=${cargo.originalLength}, origW=${cargo.originalWidth}, origH=${cargo.originalHeight}`);
  console.log(`  水平旋转状态: ${isRotated ? '已水平旋转90度' : '原始方向'}`);
  
  // 创建正确的BoxGeometry，确保三维方向正确对应
  // Three.js BoxGeometry参数顺序是(width, height, depth)
  // 我们需要将系统坐标(X:长度, Y:宽度, Z:高度)正确映射到Three.js坐标(X:右, Y:上, Z:前)
  const cargoGeometry = new THREE.BoxGeometry(
    cargo.length,  // Three.js的X轴对应系统的X轴(长度)
    cargo.height,  // Three.js的Y轴对应系统的Z轴(高度)
    cargo.width    // Three.js的Z轴对应系统的Y轴(宽度)
  );

  // 确保颜色值有效
  let colorValue = cargo.color
  if (!colorValue || colorValue === '') {
    // 如果颜色无效，使用随机颜色
    colorValue = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    console.warn(`货物 ${cargo.id} (${cargo.name}) 没有有效颜色，使用随机颜色: ${colorValue}`)
  }

  // 使用MeshBasicMaterial，完全不受光照影响，确保颜色100%精确显示
  const cargoMaterial = new THREE.MeshBasicMaterial({
    color: colorValue, // 直接使用颜色字符串，避免通过THREE.Color转换
    transparent: true,
    opacity: 0.95, // 增加不透明度，让颜色更明显
  })

  const cargoMesh = new THREE.Mesh(cargoGeometry, cargoMaterial)
  
  // 添加货物边框
  const cargoEdges = new THREE.EdgesGeometry(cargoGeometry)
  const cargoLine = new THREE.LineSegments(
    cargoEdges,
    new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 1,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    })
  )
  cargoMesh.add(cargoLine)
  
  // 将原始颜色值和尺寸信息存储在网格对象上，以便于调试
  cargoMesh.userData.originalColor = colorValue;
  cargoMesh.userData.dimensions = {
    length: cargo.length,
    width: cargo.width,
    height: cargo.height,
    originalLength: cargo.originalLength,
    originalWidth: cargo.originalWidth,
    originalHeight: cargo.originalHeight,
    isRotated: isRotated
  };
  
  return cargoMesh
}

// 添加货物标签
const addItemLabel = (mesh, name, width, height, length) => {
  // width - 在Three.js中是Z轴(前)
  // height - 在Three.js中是Y轴(上)
  // length - 在Three.js中是X轴(右)
  
  // 创建标签
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')

  // 清除背景
  context.fillStyle = '#FFFFFF'
  context.fillRect(0, 0, 256, 128)

  // 添加边框
  context.strokeStyle = '#000000'
  context.lineWidth = 4
  context.strokeRect(4, 4, 248, 120)

  // 添加文字
  context.font = 'bold 32px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#000000'

  // 文字自动换行
  const words = name.split(' ')
  let y = 64
  const lineHeight = 32

  if (words.length > 1) {
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i]
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > 230) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }

    lines.push(currentLine)

    // 计算起始Y坐标，以便文本垂直居中
    y = 64 - ((lines.length - 1) * lineHeight) / 2

    // 绘制每行文本
    for (let i = 0; i < lines.length; i++) {
      context.fillText(lines[i], 128, y + i * lineHeight)
    }
  } else {
    // 单行文本直接绘制
    context.fillText(name, 128, 64)
  }

  // 创建纹理和材质
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  })

  // 创建标签平面几何体 - 使用适当的尺寸
  const labelWidth = Math.min(width, length) * 0.8
  const labelHeight = labelWidth * 0.5
  const geometry = new THREE.PlaneGeometry(labelWidth, labelHeight)

  // 创建标签网格
  const label = new THREE.Mesh(geometry, material)

  // 将标签放置在物品顶部
  // 在Three.js中，Y轴是高度方向
  label.position.set(0, height / 2 + 0.05, 0)
  label.rotation.x = -Math.PI / 2

  // 添加到物品中
  mesh.add(label)
}
</script>

<template>
  <div class="container-scene">
    <a-card size="small" :title="t('container.simulation')" :bordered="true" class="main-container">
      <template #extra>
        <a-space>
          <a-tooltip placement="bottom">
            <template #title>{{ showGrid ? t('container.hideGrid') : t('container.showGrid') }}</template>
            <a-button type="text" @click="toggleGrid">
              <template #icon><BorderOutlined :style="{ color: showGrid ? '#1890ff' : '#999' }" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template #title>{{ showAxes ? t('container.hideAxes') : t('container.showAxes') }}</template>
            <a-button type="text" @click="toggleAxes">
              <template #icon><AimOutlined :style="{ color: showAxes ? '#1890ff' : '#999' }" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template #title>{{ t('container.resetCamera') }}</template>
            <a-button type="text" @click="toggleCameraPosition">
              <template #icon><CameraOutlined :style="{ color: '#1890ff' }" /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template #title>{{ showFaceLabels ? t('container.hideFaceLabels') : t('container.showFaceLabels') }}</template>
            <a-button type="text" @click="toggleFaceLabels">
              <template #icon><TagOutlined :style="{ color: showFaceLabels ? '#1890ff' : '#999' }" /></template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>
      <div id="container3d" class="container-3d">
      <a-row :gutter="0" class="flex-container-info">
        <a-col :span="12">
          <div class="info-item container-info">
            <template v-if="currentContainer">
              <p><strong>{{ t('container.internalDimensions') }}:</strong> {{ currentContainer.length }}m × {{ currentContainer.width }}m × {{ currentContainer.height }}m</p>
              <a-flex :gap="middle" justify="space-between">
                <p><strong>{{ t('container.volume') }}:</strong> {{ currentContainer.volume }}m³</p>
                <p style="padding-right: 25px;"><strong>{{ t('container.maxWeight') }}:</strong> {{ (currentContainer.maxWeight / 1000).toFixed(2) }}{{ t('ton') }}</p>
              </a-flex>
            </template>
          </div>
        </a-col>
        <a-col :span="12">
          <div v-if="cargoList.length > 0" class="info-item loading-stats">
            <a-flex :gap="middle" justify="space-between" class="loading-stats-item">
              <p><strong>{{ t('container.loadedCargoVolume') }}:</strong> {{ loadedCargoStats.totalVolume }}m³</p>
              <a-progress :percent="parseFloat(loadedCargoStats.volumeUsageRate)" size="small" status="active" />
            </a-flex>
            <a-flex :gap="middle" justify="space-between" class="loading-stats-item">
              <p><strong>{{ t('container.loadedCargoWeight') }}:</strong> {{ loadedCargoStats.totalWeight }}kg</p>
              <a-progress :percent="parseFloat(loadedCargoStats.weightUsageRate)" size="small" status="active" />
            </a-flex>
          </div>
        </a-col>
      </a-row>
  
      </div>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
/* 响应式3D容器 */
.container-3d {
  width: 100%;
  height: 600px;
  background-color: #f8f8f8;
}

/* 响应式卡片样式 */
.main-container {
  height: 100%;
  transition: all 0.3s ease;
}

/* 信息区域样式 */
.flex-container-info {
  width: 100%;
  margin:0 auto;

  .info-item{
    max-height: 80px;
  }

  .loading-stats-item{
    .ant-progress{
      width: 120px;
    }

  }
}

.container-info {
  padding: 10px;
  background-color: #f5f5ff;
  border-radius: 4px;
  margin-bottom: 10px;
}
  
.loading-stats {
  padding: 10px;
  background-color: #e6f7ff; /* 将背景颜色改为浅蓝色，便于阅读 */
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.loading-stats h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

/* 移动设备上的特殊样式 */
@media (max-width: 768px) {
  .container-3d {
    height: 500px;
  }
}

/* 大屏幕上的特殊样式 */
@media (min-width: 1600px) {
  .container-3d {
    height: 800px;
  }
}
</style>