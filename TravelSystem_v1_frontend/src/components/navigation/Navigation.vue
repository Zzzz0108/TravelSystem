<template>
  <div class="navigation-page">
    <!-- 顶部搜索栏 -->
    <div class="search-section">
      <div class="search-container">
        <div class="location-input">
          <div class="input-group">
            <div class="input-item">
              <span class="label">📍 起点</span>
              <input 
                v-model="startLocation" 
                placeholder="当前位置"
                readonly
                class="location-input-field"
              />
              <button class="locate-btn" @click="getCurrentLocation">
                <svg class="locate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
              </button>
      </div>

            <div class="input-item">
              <span class="label">🎯 终点</span>
            <input 
                v-model="destination" 
                placeholder="输入目的地"
                class="location-input-field"
                @input="handleDestinationInput"
                @focus="showDestinationSuggestions = true"
                @blur="hideDestinationSuggestions"
              />
              <button class="search-btn" @click="searchRoute" :disabled="isSearching">
                <svg v-if="!isSearching" class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span v-else class="loading-spinner">⏳</span>
                {{ isSearching ? '搜索中...' : '' }}
              </button>
            </div>
          </div>
          
          <!-- 搜索建议下拉框 -->
          <div v-if="showDestinationSuggestions && destinationSuggestions.length > 0" class="suggestions-dropdown">
            <div
              v-for="suggestion in destinationSuggestions"
              :key="suggestion.id"
              class="suggestion-item"
              @click="selectDestination(suggestion)"
            >
              <div class="suggestion-name">{{ suggestion.name }}</div>
              <div class="suggestion-address">{{ suggestion.address }}</div>
            </div>
          </div>
        </div>
            </div>
          </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 地图区域 -->
      <div class="map-container">
        <div id="map" class="map"></div>
        <div class="map-controls">
          <button class="control-btn" @click="resetMap">
            <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </div>
        </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <!-- 路线信息 -->
        <div class="route-info" v-if="routeInfo">
          <h3 class="panel-title">📍 路线信息</h3>
          <div class="route-stats">
            <div class="stat-item">
              <span class="stat-label">总距离</span>
              <span class="stat-value">{{ routeInfo.distance }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">预计时间</span>
              <span class="stat-value">{{ routeInfo.duration }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">交通方式</span>
              <span class="stat-value">{{ getTransportModeLabel(routeInfo.mode) }}</span>
        </div>
      </div>

          <!-- 开始导航按钮 -->
          <button class="start-navigation-btn" @click="startNavigation">
            🚗 开始导航
          </button>
        </div>

        <!-- 交通方式选择 -->
        <div class="transport-modes">
          <h3 class="panel-title">🚗 交通方式</h3>
          <div class="mode-buttons">
              <button 
              v-for="mode in transportModes" 
              :key="mode.value"
              :class="['mode-btn', { active: selectedMode === mode.value }]"
              @click="selectTransportMode(mode.value)"
            >
              {{ mode.icon }} {{ mode.label }}
              </button>
            </div>
          </div>

        <!-- 沿途设施 -->
        <div class="facilities">
          <h3 class="panel-title">🏪 沿途设施</h3>
          <div class="facility-list">
            <div class="facility-item">
              <span class="facility-icon">⛽</span>
              <span class="facility-name">加油站</span>
                </div>
            <div class="facility-item">
              <span class="facility-icon">🅿️</span>
              <span class="facility-name">停车场</span>
              </div>
            <div class="facility-item">
              <span class="facility-icon">🍽️</span>
              <span class="facility-name">餐厅</span>
                </div>
            <div class="facility-item">
              <span class="facility-icon">🚻</span>
              <span class="facility-name">卫生间</span>
              </div>
            </div>
          </div>

        <!-- 路线详情 -->
        <div class="route-details" v-if="routeSteps.length > 0">
          <h3 class="panel-title">📋 路线详情</h3>
          <div class="steps-list">
            <div 
              v-for="(step, index) in routeSteps" 
              :key="index"
              class="step-item"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-instruction">{{ step.instruction }}</div>
                <div class="step-distance">{{ step.distance }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 高德地图 Key 配置
const AMAP_JS_KEY = '0d2dd776876f7864f7a92e79efd1a8b8'  // Web端 Key - 地图显示
const AMAP_REST_KEY = 'af8c374c9ff24f82225595bf3fecd161'  // Web服务端 Key - 地理编码服务
const AMAP_SECRET_KEY = '01ddbb74c50cc41ccef104b3b3520307'  // 安全密钥 - 签名验证

// 响应式数据
const startLocation = ref('正在获取位置...')
const destination = ref('')
const destinationSuggestions = ref([])
const showDestinationSuggestions = ref(false)
const isSearching = ref(false)
const routeInfo = ref(null)
const routeSteps = ref([])
const selectedMode = ref('driving')
const startCoords = ref(null) // [lng, lat]
const destinationCoords = ref(null) // [lng, lat]


// 地图实例
let map = null
let driving = null
let walking = null
let transit = null

// 交通方式配置
const transportModes = [
  { value: 'driving', label: '驾车', icon: '🚗' },
  { value: 'walking', label: '步行', icon: '🚶' },
  { value: 'transit', label: '公交', icon: '🚌' },
  { value: 'bicycling', label: '骑行', icon: '🚴' }
]

// 获取当前位置
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    startLocation.value = '浏览器不支持定位'
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      startCoords.value = [longitude, latitude]
      
      // 逆地理编码获取地址
      await reverseGeocode(latitude, longitude)
      
      // 如果已经有目的地坐标，延迟自动搜索路线
      if (destinationCoords.value && destination.value) {
        setTimeout(() => {
          if (map && startCoords.value && destinationCoords.value) {
            searchRoute();
          }
        }, 1000); // 延迟1秒，确保地图完全加载
      }
    },
    (error) => {
      console.error('定位失败:', error)
      startLocation.value = '定位失败，请手动输入起点'
    }
  )
}

// 逆地理编码 - 使用 Web服务端 Key 的 REST API
const reverseGeocode = async (lat, lng) => {
  try {
    // 使用 Web服务端 Key 调用 REST API
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_REST_KEY}&location=${lng},${lat}&extensions=base&output=json`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.regeocode) {
      const address = data.regeocode.formatted_address
      startLocation.value = address
  } else {
      startLocation.value = `坐标: ${lat.toFixed(4)}, ${lng.toFixed(4)} (逆地理编码失败: ${data.info})`
    }
  } catch (error) {
    startLocation.value = `坐标: ${lat.toFixed(4)}, ${lng.toFixed(4)} (网络请求失败)`
  }
}

// 获取模拟地址（基于坐标范围）
const getMockAddress = (lat, lng) => {
  // 根据坐标范围返回模拟地址
  if (lat >= 31.0 && lat <= 32.0 && lng >= 104.0 && lng <= 105.0) {
    return '四川省绵阳市涪城区'
  } else if (lat >= 39.8 && lat <= 40.0 && lng >= 116.3 && lng <= 116.5) {
    return '北京市东城区'
  } else if (lat >= 39.9 && lat <= 40.0 && lng >= 116.3 && lng <= 116.4) {
    return '北京市海淀区'
  } else {
    return `坐标: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

// 获取模拟坐标（为常见地点提供坐标）
const getMockCoordinates = (address) => {
  const mockPlaces = {
    '北京邮电大学': [116.358381, 39.960444],
    '北京邮电大学(海淀校区)': [116.358381, 39.960444],
    '颐和园': [116.275544, 39.999001],
    '故宫': [116.397428, 39.90923],
    '故宫博物院': [116.397428, 39.90923],
    '天安门': [116.397428, 39.90923],
    '天安门广场': [116.397428, 39.90923],
    '清华大学': [116.3264, 40.0004],
    '北京大学': [116.3109, 39.9928],
    '中关村': [116.3074, 39.9847],
    '西单': [116.3740, 39.9134],
    '王府井': [116.4180, 39.9150],
    '三里屯': [116.4550, 39.9390],
    '鸟巢': [116.3974, 39.9928],
    '水立方': [116.3890, 39.9928],
    '首都机场': [116.6010, 40.0799],
    '北京南站': [116.3785, 39.8652],
    '北京西站': [116.3219, 39.8944],
    '北京站': [116.4270, 39.9025]
  }
  
  // 模糊匹配
  for (const [name, coords] of Object.entries(mockPlaces)) {
    if (address.includes(name) || name.includes(address)) {
      return coords
    }
  }
  
  return null
}

// 处理目的地输入 - 使用 Web服务端 Key 的 REST API
const handleDestinationInput = async () => {
  if (destination.value.length > 1) {
    try {
      // 显示搜索建议
      showDestinationSuggestions.value = true
      
      // 使用 Web服务端 Key 调用 REST API
      const response = await fetch(
        `https://restapi.amap.com/v3/place/text?key=${AMAP_REST_KEY}&keywords=${encodeURIComponent(destination.value)}&city=北京&output=json&offset=10&page=1&extensions=base`
      )
      const data = await response.json()
      
      if (data.status === '1' && data.pois) {
        destinationSuggestions.value = data.pois.map(poi => ({
          id: poi.id || Math.random(),
          name: poi.name,
          address: poi.address || poi.pname + poi.cityname + poi.adname,
          location: poi.location
        }))
      } else {
        // 使用模拟数据作为备选
        const mockSuggestions = getMockSuggestions(destination.value)
        destinationSuggestions.value = mockSuggestions
      }
      } catch (error) {
      destinationSuggestions.value = []
    }
  } else {
    destinationSuggestions.value = []
    showDestinationSuggestions.value = false
  }
}

// 选择目的地，保存坐标
const selectDestination = (suggestion) => {
  destination.value = suggestion.name
  if (suggestion.location) {
    // poi.location: 'lng,lat'
    const parts = String(suggestion.location).split(',')
    if (parts.length === 2) {
      destinationCoords.value = [Number(parts[0]), Number(parts[1])]
    }
  }
  showDestinationSuggestions.value = false
  destinationSuggestions.value = []
}

// 隐藏目的地搜索建议
const hideDestinationSuggestions = () => {
  // 延迟隐藏，让用户有时间点击建议项
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

// 选择交通方式
const selectTransportMode = (mode) => {
  selectedMode.value = mode
  if (startLocation.value && destination.value) {
    searchRoute()
  }
}

// 搜索路线
const searchRoute = async () => {
  if (!startLocation.value || !destination.value) {
    alert('请先设置起点和终点')
    return
  }

  try {
    isSearching.value = true
    
    // 直接调用地图路线规划，不使用模拟数据
    await showRouteOnMap()
  } catch (error) {
    alert('路线规划失败，请稍后重试')
  } finally {
    isSearching.value = false
  }
}

// 在地图上显示路线
const showRouteOnMap = async () => {
  if (!map || !startLocation.value || !destination.value) return
  
  try {
    // 清除之前的路线
    clearMap()
    
    // 根据选择的交通方式显示路线
    switch (selectedMode.value) {
      case 'driving':
        await showDrivingRoute()
        break
      case 'walking':
        await showWalkingRoute()
        break
      case 'transit':
        await showTransitRoute()
        break
      case 'bicycling':
        await showBicyclingRoute()
        break
    }
      } catch (error) {
    console.error('显示路线失败:', error)
  }
}

// 地理编码 - 使用 JS SDK 内置功能
const geocode = async (addressOrCoords) => {
  // 已是坐标数组
  if (Array.isArray(addressOrCoords) && addressOrCoords.length === 2) {
    return addressOrCoords
  }
  // 已是 'lng,lat' 字符串
  if (typeof addressOrCoords === 'string' && /\s*\d+\.?\d*\s*,\s*\d+\.?\d*\s*/.test(addressOrCoords)) {
    const [lng, lat] = addressOrCoords.split(',').map(s => Number(s.trim()))
    return [lng, lat]
  }
  
  // 使用 Web服务端 Key 调用 REST API
  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_REST_KEY}&address=${encodeURIComponent(addressOrCoords)}&output=json`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const location = data.geocodes[0].location
      return location.split(',').map(Number)
  } else {
      // 尝试使用模拟坐标
      const mockCoords = getMockCoordinates(addressOrCoords)
      if (mockCoords) {
        return mockCoords
      }
      return null
    }
  } catch (error) {
    // 尝试使用模拟坐标
    const mockCoords = getMockCoordinates(addressOrCoords)
    if (mockCoords) {
      return mockCoords
    }
    return null
  }
}

// 在路线规划中优先使用缓存的坐标
const showDrivingRoute = async () => {
  if (!driving) return
  try {
    const start = startCoords.value || await geocode(startLocation.value)
    const end = destinationCoords.value || await geocode(destination.value)
    if (!start || !end) return alert('无法获取起终点坐标')
    
    // 使用 Web服务端 Key 的 REST API 进行路线规划
    const response = await fetch(
      `https://restapi.amap.com/v3/direction/driving?key=${AMAP_REST_KEY}&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&extensions=all&output=json`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0]
      
      // 在地图上绘制路径
      await drawRouteOnMap(start, end, path.steps, 'driving')
      
      // 构造高德地图 JS SDK 期望的数据格式
      const mockResult = {
        routes: [{
          distance: path.distance,
          time: path.duration,
          steps: path.steps.map(step => ({
            instruction: step.instruction,
            distance: step.distance
          }))
        }]
      }
      
      updateRouteInfo(mockResult, 'driving')
    } else {
      alert('路线规划失败: ' + (data.info || '未知错误'))
    }
  } catch (e) {
    alert('路线规划出错: ' + e.message)
  }
}

const showWalkingRoute = async () => {
  if (!walking) return
  try {
    const start = startCoords.value || await geocode(startLocation.value)
    const end = destinationCoords.value || await geocode(destination.value)
    if (!start || !end) return alert('无法获取起终点坐标')
    
    // 使用 Web服务端 Key 的 REST API 进行路线规划
    const response = await fetch(
      `https://restapi.amap.com/v3/direction/walking?key=${AMAP_REST_KEY}&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&extensions=all&output=json`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0]
      
      // 在地图上绘制路径
      await drawRouteOnMap(start, end, path.steps, 'walking')
      
      // 构造高德地图 JS SDK 期望的数据格式
      const mockResult = {
        routes: [{
          distance: path.distance,
          time: path.duration,
          steps: path.steps.map(step => ({
            instruction: step.instruction,
            distance: step.distance
          }))
        }]
      }
      
      updateRouteInfo(mockResult, 'walking')
    } else {
      alert('路线规划失败: ' + (data.info || '未知错误'))
    }
  } catch (e) {
    alert('路线规划出错: ' + e.message)
  }
}

const showTransitRoute = async () => {
  if (!transit) return
  try {
    const start = startCoords.value || await geocode(startLocation.value)
    const end = destinationCoords.value || await geocode(destination.value)
    if (!start || !end) return alert('无法获取起终点坐标')
    
    // 使用 Web服务端 Key 的 REST API 进行路线规划
    const response = await fetch(
      `https://restapi.amap.com/v3/direction/transit/integrated?key=${AMAP_REST_KEY}&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&city=北京&extensions=all&output=json`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.route && data.route.transits && data.route.transits.length > 0) {
      const transit = data.route.transits[0]
      
      // 在地图上绘制路径
      await drawRouteOnMap(start, end, transit.segments, 'transit')
      
      // 构造高德地图 JS SDK 期望的数据格式
      const mockResult = {
        routes: [{
          distance: transit.distance,
          time: transit.duration,
          steps: transit.segments.map(segment => ({
            instruction: segment.bus?.buslines?.[0]?.name || '步行',
            distance: segment.walking?.distance || 0
          }))
        }]
      }
      
      updateRouteInfo(mockResult, 'transit')
    } else {
      alert('路线规划失败: ' + (data.info || '未知错误'))
    }
  } catch (e) {
    alert('路线规划出错: ' + e.message)
  }
}

// 显示骑行路线（使用步行插件模拟）
const showBicyclingRoute = async () => {
  try {
    const start = startCoords.value || await geocode(startLocation.value)
    const end = destinationCoords.value || await geocode(destination.value)
    if (!start || !end) return alert('无法获取起终点坐标')
    
    // 自行车路线规划（使用步行路线作为替代）
    const response = await fetch(
      `https://restapi.amap.com/v3/direction/walking?key=${AMAP_REST_KEY}&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&extensions=all&output=json`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0]
      
      // 在地图上绘制路径
      await drawRouteOnMap(start, end, path.steps, 'bicycling')
      
      // 构造高德地图 JS SDK 期望的数据格式
      const mockResult = {
        routes: [{
          distance: path.distance,
          time: Math.round(path.duration * 0.4), // 自行车速度约为步行的2.5倍
          steps: path.steps.map(step => ({
            instruction: step.instruction,
            distance: step.distance
          }))
        }]
      }
      
      updateRouteInfo(mockResult, 'bicycling')
    } else {
      alert('路线规划失败: ' + (data.info || '未知错误'))
    }
  } catch (e) {
    alert('路线规划出错: ' + e.message)
  }
}

    // 更新路线信息
const updateRouteInfo = (result, mode) => {
  if (!result || !result.routes || result.routes.length === 0) return
  
  const route = result.routes[0]
  
  // 更新路线信息
  routeInfo.value = {
    distance: formatDistance(route.distance),
    duration: formatDuration(route.time),
    mode: mode
  }
  
  // 更新路线步骤
  routeSteps.value = route.steps.map(step => ({
    instruction: step.instruction,
    distance: formatDistance(step.distance)
  }))
  
  // 调整地图视野
  if (map) {
    try {
      // 如果有起点和终点坐标，调整视野
      if (startCoords.value && destinationCoords.value) {
        const bounds = new AMap.Bounds(startCoords.value, destinationCoords.value);
        map.setBounds(bounds, true, [50, 50, 50, 50]);
      }
  } catch (error) {
      // 如果调整视野失败，忽略错误
      console.warn('调整地图视野失败:', error);
    }
  }
}

// 格式化距离
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} 米`
  } else {
    return `${(meters / 1000).toFixed(1)} 公里`
  }
}

// 格式化时间
const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} 分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} 小时 ${remainingMinutes} 分钟`
  }
}

// 开始导航使用缓存的目的地坐标
const startNavigation = async () => {
  if (!routeInfo.value) return alert('请先规划路线')
  try {
    const end = destinationCoords.value || await geocode(destination.value)
    if (!end) return alert('无法获取目的地坐标，导航失败')
    const [lng, lat] = end
    const navigationUrl = `amapuri://route/plan/?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(destination.value)}&dev=0&t=0`
    window.location.href = navigationUrl
    setTimeout(() => {
      if (!document.hidden) {
        alert('请先安装高德地图 App')
        window.open('https://mobile.amap.com/', '_blank')
      }
    }, 2000)
  } catch (e) {
    console.error('导航失败:', e)
  }
}

// 监听目的地坐标变化，自动搜索路线
watch([destinationCoords, startCoords], ([newDestCoords, newStartCoords], [oldDestCoords, oldStartCoords]) => {
  // 如果目的地坐标和起点坐标都准备好了，且地图已加载，自动搜索
  if (newDestCoords && newStartCoords && map && startLocation.value !== '正在获取位置...') {
    // 避免重复搜索
    if (JSON.stringify(newDestCoords) !== JSON.stringify(oldDestCoords) || 
        JSON.stringify(newStartCoords) !== JSON.stringify(oldStartCoords)) {
      setTimeout(() => {
        if (map && startCoords.value && destinationCoords.value) {
          searchRoute();
        }
      }, 500);
    }
  }
}, { deep: true, immediate: true });

// 预填充目的地信息
const prefillDestination = async (name, coords = null) => {
  destination.value = name;
  
  if (coords) {
    destinationCoords.value = coords;
  } else {
    // 尝试地理编码获取坐标
    try {
      const geocodedCoords = await geocode(name);
      if (geocodedCoords) {
        destinationCoords.value = geocodedCoords;
      }
    } catch (error) {
      console.error('地理编码出错:', error);
    }
  }
  
  // 如果已经有起点和终点坐标，立即搜索路线
  if (startCoords.value && destinationCoords.value && startLocation.value !== '正在获取位置...' && map) {
    searchRoute();
  }
};

// 清除地图上的所有内容
const clearMap = () => {
  if (map) {
    try {
      // 清除所有覆盖物
      map.clearMap();
    } catch (error) {
      // 如果 clearMap 失败，尝试手动清除
      try {
        // 获取所有覆盖物并移除
        const overlays = map.getAllOverlays();
        overlays.forEach(overlay => {
          map.remove(overlay);
        });
      } catch (e) {
        console.warn('清除地图内容失败:', e);
      }
    }
  }
};

// 重置地图
const resetMap = () => {
  clearMap();
  // 重新获取当前位置
  getCurrentLocation();
};

// 获取交通方式标签
const getTransportModeLabel = (mode) => {
  const found = transportModes.find(m => m.value === mode)
  return found ? found.label : '未知'
}

// 获取模拟搜索建议
const getMockSuggestions = (keyword) => {
  const allPlaces = [
    { name: '北京邮电大学(海淀校区)', address: '北京市海淀区西土城路10号', location: '116.358381,39.960444' },
    { name: '颐和园', address: '北京市海淀区新建宫门路19号', location: '116.275544,39.999001' },
    { name: '故宫博物院', address: '北京市东城区景山前街4号', location: '116.397428,39.90923' },
    { name: '天安门广场', address: '北京市东城区天安门广场', location: '116.397428,39.90923' },
    { name: '清华大学', address: '北京市海淀区清华园1号', location: '116.3264,40.0004' },
    { name: '北京大学', address: '北京市海淀区颐和园路5号', location: '116.3109,39.9928' },
    { name: '中关村', address: '北京市海淀区中关村大街', location: '116.3074,39.9847' },
    { name: '西单', address: '北京市西城区西单北大街', location: '116.3740,39.9134' },
    { name: '王府井', address: '北京市东城区王府井大街', location: '116.4180,39.9150' },
    { name: '三里屯', address: '北京市朝阳区三里屯路', location: '116.4550,39.9390' }
  ]
  
  // 模糊匹配关键词
  return allPlaces.filter(place => 
    place.name.toLowerCase().includes(keyword.toLowerCase()) ||
    place.address.toLowerCase().includes(keyword.toLowerCase())
  ).map(place => ({
    id: Math.random(),
    name: place.name,
    address: place.address,
    location: place.location
  }))
}

// 在地图上绘制路线
const drawRouteOnMap = async (startCoords, endCoords, steps, mode) => {
  if (!map) return;

  // 清除之前的路线
  clearMap();

  // 确保坐标格式正确
  const start = Array.isArray(startCoords) ? startCoords : [startCoords.lng || startCoords[0], startCoords.lat || startCoords[1]];
  const end = Array.isArray(endCoords) ? endCoords : [endCoords.lng || endCoords[0], endCoords.lat || endCoords[1]];

  // 添加起点标记
  const startMarker = new AMap.Marker({
    position: start,
    icon: 'https://webapi.amap.com/theme/v1.3/markers/b/start.png',
    offset: new AMap.Pixel(-13, -30)
  });
  map.add(startMarker);

  // 添加终点标记
  const endMarker = new AMap.Marker({
    position: end,
    icon: 'https://webapi.amap.com/theme/v1.3/markers/b/end.png',
    offset: new AMap.Pixel(-13, -30)
  });
  map.add(endMarker);

  // 根据交通方式绘制不同的路径
  if (mode === 'driving' || mode === 'walking' || mode === 'bicycling') {
    // 驾车、步行和自行车：使用步骤中的坐标点
    const pathCoords = [];
    
    // 添加起点
    pathCoords.push(start);
    
    // 处理步骤中的坐标（如果有的话）
    if (steps && steps.length > 0) {
      steps.forEach(step => {
        if (step.polyline) {
          // 如果有 polyline 字段，解析坐标
          const coords = step.polyline.split(';').map(coord => {
            const [lng, lat] = coord.split(',').map(Number);
            return [lng, lat];
          });
          pathCoords.push(...coords);
        }
      });
    }
    
    // 添加终点
    pathCoords.push(end);
    
    // 绘制路径线
    if (pathCoords.length > 1) {
      const path = new AMap.Polyline({
        path: pathCoords,
        strokeColor: mode === 'driving' ? '#00b4db' : (mode === 'walking' ? '#66ccff' : '#99ccff'),
        strokeWeight: 6,
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
      });
      map.add(path);
    }
  } else if (mode === 'transit') {
    // 公交：绘制直线路径（简化处理）
    const path = new AMap.Polyline({
      path: [start, end],
      strokeColor: '#ff9900',
      strokeWeight: 6,
      strokeOpacity: 0.8,
      strokeStyle: 'dashed',
      strokeDasharray: [10, 5]
    });
    map.add(path);
  }

  // 调整地图视野，显示起点和终点
  try {
    // 使用 setBounds 替代 setFitView
    const bounds = new AMap.Bounds(start, end);
    map.setBounds(bounds, true, [50, 50, 50, 50]);
  } catch (error) {
    // 如果 setBounds 失败，使用 setCenter 和 setZoom
    const centerLng = (start[0] + end[0]) / 2;
    const centerLat = (start[1] + end[1]) / 2;
    map.setCenter([centerLng, centerLat]);
    map.setZoom(12);
  }
};

// 初始化地图
const initMap = async () => {
  try {
    console.log('开始初始化地图...')
    
    // 动态加载高德地图 SDK
    const AMap = await loadAMap()
    console.log('高德地图 SDK 加载成功，开始创建地图实例...')
    
    // 检查地图容器
    const mapContainer = document.getElementById('map')
    if (!mapContainer) {
      throw new Error('地图容器未找到')
    }
    
    // 创建地图实例
    map = new AMap.Map('map', {
      zoom: 13,
      center: [116.397428, 39.90923], // 北京天安门
      mapStyle: 'amap://styles/dark', // 深色主题
      features: ['bg', 'road', 'building', 'point']
    })
    
    console.log('地图实例创建成功，开始添加控件...')
    
    // 添加地图控件
    map.addControl(new AMap.Scale())
    map.addControl(new AMap.ToolBar())
    
    console.log('地图控件添加成功，开始初始化路线规划插件...')
    
    // 初始化路线规划插件
    console.log('开始初始化路线规划插件...')
    
    // 等待一下确保所有插件都加载完成
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('插件加载完成，开始创建实例...')
    
    // 检查插件是否正确加载
    console.log('AMap.Driving:', typeof AMap.Driving)
    console.log('AMap.Walking:', typeof AMap.Walking)
    console.log('AMap.Transfer:', typeof AMap.Transfer)
    console.log('AMap.Geocoder:', typeof AMap.Geocoder)
    console.log('AMap.AutoComplete:', typeof AMap.AutoComplete)

    driving = new AMap.Driving({
      map: map,
      policy: (AMap.DrivingPolicy && AMap.DrivingPolicy.LEAST_TIME) ? AMap.DrivingPolicy.LEAST_TIME : 0
    })
    
    walking = new AMap.Walking({
      map: map,
      policy: (AMap.WalkingPolicy && AMap.WalkingPolicy.LEAST_TIME) ? AMap.WalkingPolicy.LEAST_TIME : 0
    })
    
    // v2 中公交换乘为 AMap.Transfer
    transit = new (AMap.Transfer || function(){})({
      map: map,
      policy: (AMap.TransitPolicy && AMap.TransitPolicy.LEAST_TIME) ? AMap.TransitPolicy.LEAST_TIME : 0
    })
    
    console.log('高德地图初始化成功')
    
    // 地图加载完成后的回调
    map.on('complete', () => {
      console.log('地图加载完成')
    })
    
    map.on('error', (error) => {
      console.error('地图错误:', error)
    })
    
  } catch (error) {
    console.error('高德地图初始化失败:', error)
    
    // 显示详细的错误提示
    const mapContainer = document.getElementById('map')
    if (mapContainer) {
      let errorMessage = '地图加载失败'
      
      if (error.message.includes('API Key')) {
        errorMessage = 'API Key 配置错误，请检查密钥设置'
      } else if (error.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络设置'
      } else if (error.message.includes('超时')) {
        errorMessage = '加载超时，请检查网络速度'
      } else if (error.message.includes('容器')) {
        errorMessage = '地图容器错误，请刷新页面重试'
      }
      
      mapContainer.innerHTML = `
        <div class="map-error">
          <h3>${errorMessage}</h3>
          <p>错误详情: ${error.message}</p>
          <button onclick="location.reload()" class="retry-btn">重试</button>
        </div>
      `
    }
  }
}

// 动态加载高德地图 SDK
const loadAMap = () => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.AMap) {
      console.log('高德地图 SDK 已存在，直接使用')
      resolve(window.AMap)
      return
    }
    
    console.log('开始加载高德地图 SDK...')
    
    // 创建 script 标签
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_JS_KEY}&plugin=AMap.Scale,AMap.ToolBar,AMap.Driving,AMap.Walking,AMap.Transfer,AMap.Geocoder,AMap.AutoComplete`
    script.async = true
    
    script.onload = () => {
      console.log('高德地图 SDK 脚本加载完成')
      // 等待一下确保 AMap 对象完全初始化
      setTimeout(() => {
        if (window.AMap) {
          console.log('高德地图 SDK 初始化成功')
          resolve(window.AMap)
        } else {
          console.error('AMap 对象未找到')
          reject(new Error('高德地图 SDK 初始化失败：AMap 对象未找到'))
        }
      }, 100)
    }
    
    script.onerror = (error) => {
      console.error('高德地图 SDK 脚本加载失败:', error)
      reject(new Error('高德地图 SDK 脚本加载失败，请检查网络连接和 API Key 配置'))
    }
    
    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error('高德地图 SDK 加载超时，请检查网络连接'))
    }, 10000)
    
    script.onload = () => {
      clearTimeout(timeout)
      console.log('高德地图 SDK 脚本加载完成')
      // 等待一下确保 AMap 对象完全初始化
      setTimeout(() => {
        if (window.AMap) {
          console.log('高德地图 SDK 初始化成功')
          resolve(window.AMap)
        } else {
          console.error('AMap 对象未找到')
          reject(new Error('高德地图 SDK 初始化失败：AMap 对象未找到'))
        }
      }, 100)
    }
    
    script.onerror = (error) => {
      clearTimeout(timeout)
      console.error('高德地图 SDK 脚本加载失败:', error)
      reject(new Error('高德地图 SDK 脚本加载失败，请检查网络连接和 API Key 配置'))
    }
    
    document.head.appendChild(script)
    console.log('高德地图 SDK 脚本已添加到页面')
  })
}

// 生命周期
onMounted(async () => {
  // 先初始化地图，再获取当前位置
  await initMap()
  
  // 地图加载完成后再获取当前位置
  getCurrentLocation()
  
  // 检查是否有目的地参数并预填充（延迟执行，确保地图完全加载）
  if (route.query.destination) {
    let coords = null;
    if (route.query.destinationCoords) {
      const [lng, lat] = route.query.destinationCoords.split(',').map(Number);
      coords = [lng, lat];
    }
    
    // 延迟预填充，确保地图和位置信息都准备好
    setTimeout(() => {
      prefillDestination(route.query.destination, coords);
    }, 3000); // 延迟3秒，确保地图完全加载
  }
})

onUnmounted(() => {
  // 清理地图实例
  if (map) {
    map.destroy()
  }
})
</script>

<style lang="scss" scoped>
.navigation-page {
  min-height: 100vh;
  background: transparent;
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-container {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
    border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1000;
  }

.location-input {
  position: relative;
  z-index: 1001;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-item {
    display: flex;
    align-items: center;
  gap: 12px;
}

.label {
  color: white;
  font-weight: 600;
  min-width: 60px;
}

.location-input-field {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(0, 113, 227, 0.6);
    background: rgba(255, 255, 255, 0.15);
  }
}

.locate-btn, .search-btn {
  background: rgba(0, 113, 227, 0.8);
    border: none;
    border-radius: 8px;
  padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
    background: rgba(0, 113, 227, 1);
    transform: scale(1.05);
  }
}

.locate-icon, .search-icon {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 2;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 200px;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.suggestion-name {
  display: block;
  color: white;
  font-weight: 600;
  margin-bottom: 4px;
}

.suggestion-address {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.main-content {
    display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.map-container {
  flex: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  z-index: 1;
}

.map {
  width: 100%;
  height: 100%;
}

.map-placeholder {
    display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-size: 18px;
  background: rgba(0, 0, 0, 0.5);
}

.map-error {
      display: flex;
  flex-direction: column;
      align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  color: white;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 24px 0;
    font-size: 14px;
    opacity: 0.8;
    word-break: break-word;
  }
  
  .retry-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
}

.control-btn {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
}

.control-icon {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 2;
}

.info-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.route-info, .transport-modes, .facilities, .route-details {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.route-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.stat-value {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.start-navigation-btn {
  width: 100%;
  background: linear-gradient(135deg, #00b4db, #0083b0);
    border: none;
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
    cursor: pointer;
  transition: all 0.3s ease;

    &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 180, 219, 0.4);
  }
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mode-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(0, 113, 227, 0.6);
  }
  
  &.active {
    background: rgba(0, 113, 227, 0.8);
    border-color: rgba(0, 113, 227, 1);
  }
}

.facility-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.facility-icon {
  font-size: 20px;
}

.facility-name {
  color: white;
  font-size: 14px;
}

.steps-list {
  max-height: 300px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
}

.step-number {
  background: rgba(0, 113, 227, 0.8);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-instruction {
  color: white;
  font-size: 14px;
  margin-bottom: 4px;
}

.step-distance {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  font-size: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

// 响应式设计
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .info-panel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .navigation-page {
    padding: 10px;
  }
  
  .input-group {
    gap: 12px;
  }
  
  .mode-buttons {
    grid-template-columns: 1fr;
  }
}
</style>