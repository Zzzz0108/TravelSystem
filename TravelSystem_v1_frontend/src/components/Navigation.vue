<template>
  <div class="navigation-container">
    <!-- 主内容区 -->
    <main class="main-content">

      <!-- 搜索与筛选 -->
      <div class="search-section">
        <div class="search-header">
          <h2 class="search-title">路线规划</h2>
          <p class="search-subtitle">输入目的地，智能规划最佳路线</p>
        </div>
        
        <div class="search-bar">
          <div class="search-input-group">
            <div class="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="输入目的地（如二校门、图书馆）"
              class="search-input"
              @keyup.enter="addDestination"
            >
            <button 
              v-if="searchQuery" 
              class="clear-btn"
              @click="clearSearch"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="filter-group">
            <div class="filter-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
              </svg>
            </div>
            <div class="filter-select-wrapper">
              <select v-model="transportMode" class="filter-select">
                <option value="walking">步行</option>
                <option value="bike">自行车</option>
                <option value="scooter">电瓶车</option>
              </select>
            </div>
            <button class="search-btn" @click="addDestination">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 4v16m8-8H4"/>
              </svg>
              添加
            </button>
          </div>
        </div>
        
        <!-- 已选择的目的地列表 -->
        <div class="selected-destinations" v-if="selectedDestinations.length > 0">
          <div class="destinations-header">
            <span class="destinations-label">已选择的目的地</span>
            <button class="clear-all-btn" @click="clearAllDestinations">
              清空全部
            </button>
          </div>
          <div class="destinations-tags">
            <div 
              v-for="(dest, index) in selectedDestinations" 
              :key="index"
              class="destination-tag"
            >
              <span class="tag-text">{{ dest }}</span>
              <button class="remove-btn" @click="removeDestination(index)">×</button>
            </div>
          </div>
        </div>
        
        <!-- 热门目的地 -->
        <div class="hot-destinations">
          <span class="hot-label">热门目的地</span>
          <div class="hot-tags">
            <span 
              v-for="dest in hotDestinations" 
              :key="dest"
              class="hot-tag"
              @click="addHotDestination(dest)"
            >
              {{ dest }}
            </span>
          </div>
        </div>
      </div>

      <!-- 功能按钮区 -->
      <div class="action-section">
        <button 
          class="action-btn primary" 
          @click="calculateRoute"
          :disabled="selectedDestinations.length === 0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          开始导航
        </button>
        
        <button 
          class="action-btn secondary" 
          @click="clearRoute"
          :disabled="routes.length === 0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          清空路线
        </button>
      </div>

      <!-- 路线信息面板 -->
      <div class="routes-section" v-if="routes.length > 0">
        <div class="routes-header">
          <h3 class="routes-title">推荐路线</h3>
          <div class="transport-selector">
            <button 
              v-for="t in transports"
              :key="t.value"
              :class="{ active: selectedTransport === t.value }"
              @click="selectedTransport = t.value"
            >
              <component :is="t.icon" />
              {{ t.label }}
            </button>
          </div>
        </div>

        <div class="routes-grid">
          <div 
            v-for="(route, index) in filteredRoutes"
            :key="index"
            class="route-card"
            @mouseenter="highlightRoute(route)"
          >
            <div class="route-header">
              <div class="route-index">{{ String(index + 1).padStart(2, '0') }}</div>
              <div class="route-info">
                <h4 class="route-name">{{ route.name }}</h4>
                <p class="route-description">{{ route.distance }}km · {{ route.duration }}分钟</p>
              </div>
            </div>
            
            <div class="route-stats">
              <div class="stat-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>步行{{ route.steps }}步</span>
              </div>
              <div class="stat-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{{ route.poiCount }}个目的地</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 设施选择面板 -->
      <div class="facilities-section" v-if="filteredFacilities.length > 0">
        <div class="facilities-header">
          <h3 class="facilities-title">附近设施</h3>
          <div class="facilities-filter">
            <span 
              v-for="tag in ['学习场所', '餐厅', '商店', '厕所', '咖啡馆', '运动场所', '医药', '银行', '快递站', '打印店']"
              :key="tag"
              :class="{ active: selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="facilities-grid">
          <div 
            v-for="facility in filteredFacilities" 
            :key="facility.id"
            class="facility-card"
            :class="{ 'selected': selectedFacility?.id === facility.id }"
            @click="selectFacility(facility)"
          >
            <div class="facility-icon">{{ facility.icon || '📍' }}</div>
            <div class="facility-info">
              <h4 class="facility-name">{{ facility.name }}</h4>
              <p class="facility-distance">{{ facility.distance }}米</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import WalkIcon from '@/assets/icon/Walk.vue'
import BikeIcon from '@/assets/icon/Bike.vue'
import ScooterIcon from '@/assets/icon/Scooter.vue'

const searchQuery = ref('')
const selectedDestinations = ref([])
const selectedTags = ref([])
const selectedTransport = ref('walking')
const transportMode = ref('walking')
const currentRoute = ref(null)

// 添加新的响应式变量
const filteredFacilities = ref([])
const selectedFacility = ref(null)

// 添加设施类型映射
const facilityTypeMap = {
  '学习场所': 'LIBRARY',
  '餐厅': 'CANTEEN',
  '商店': 'STORE',
  '厕所': 'TOILET',
  '咖啡馆': 'CAFE',
  '运动场所': 'STADIUM',
  '医药': 'CLINIC',
  '银行': 'BANK',
  '快递站': 'EXPRESS',
  '打印店': 'PRINT'
}

// 添加路线数据
const routes = ref([])

// 热门目的地
const hotDestinations = [
  '二校门', '图书馆', '清华学堂', '水木清华', '荷塘月色', 
  '大礼堂', '清华园', '工字厅', '古月堂', '闻亭'
]

// 计算过滤后的路线
const filteredRoutes = computed(() => {
  return routes.value
})

// 添加高亮路线方法
const highlightRoute = (route) => {
  console.log('高亮路线:', route);
};

// 更新路线信息
const updateRouteInfo = (routeData) => {
  if (!routeData) return
  
  // 计算步行步数（假设每步0.6米）
  const steps = Math.round(routeData.distance / 0.6)
  
  routes.value = [{
    name: '最短路线',
    distance: (routeData.distance / 1000).toFixed(1), // 转换为千米
    duration: Math.round(routeData.time / 60), // 使用后端返回的时间（秒转分钟）
    steps: steps,
    poiCount: routeData.poiCount || 0,
    path: routeData.path
  }]
}

// 监听标签选择变化
watch(selectedTags, async (newTags, oldTags) => {
  if (newTags.length > 0) {
    // 获取最后一个选中的标签对应的设施类型
    const lastTag = newTags[newTags.length - 1]
    const selectedType = facilityTypeMap[lastTag]
    
    if (selectedType) {
      try {
        // 模拟获取设施数据
        filteredFacilities.value = [
          { id: 1, name: '图书馆', distance: 200, icon: '📚' },
          { id: 2, name: '餐厅', distance: 300, icon: '🍽️' },
          { id: 3, name: '商店', distance: 150, icon: '🛒' }
        ]
      } catch (error) {
        console.error('获取设施失败:', error)
      }
    }
  } else {
    filteredFacilities.value = []
    selectedFacility.value = null
  }
}, { deep: true })

const transports = [
  { value: 'walking', label: '步行', icon: WalkIcon },
  { value: 'bike', label: '自行车', icon: BikeIcon },
  { value: 'scooter', label: '电瓶车', icon: ScooterIcon }
]

// 添加目的地
const addDestination = () => {
  if (searchQuery.value.trim()) {
    selectedDestinations.value.push(searchQuery.value.trim())
    searchQuery.value = ''
  }
}

// 添加热门目的地
const addHotDestination = (dest) => {
  if (!selectedDestinations.value.includes(dest)) {
    selectedDestinations.value.push(dest)
  }
}

// 移除目的地
const removeDestination = (index) => {
  selectedDestinations.value.splice(index, 1)
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
}

// 清空所有目的地
const clearAllDestinations = () => {
  selectedDestinations.value = []
}

// 切换标签
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 路线规划方法
const calculateRoute = async () => {
  if (selectedDestinations.value.length === 0) return
  
  try {
    // 模拟路线数据
    const routeData = {
      distance: 1200, // 米
      time: 900, // 秒
      poiCount: selectedDestinations.value.length
    }
    
    // 更新路线信息
    updateRouteInfo(routeData)
  } catch (error) {
    console.error('路线规划失败:', error)
  }
}

// 清空路线方法
const clearRoute = () => {
  routes.value = []
  selectedDestinations.value = []
}

// 选择设施的方法
const selectFacility = async (facility) => {
  selectedFacility.value = facility
  // 将选中的设施添加到目的地列表
  if (!selectedDestinations.value.includes(facility.name)) {
    selectedDestinations.value.push(facility.name)
  }
  // 清空设施列表
  filteredFacilities.value = []
  selectedTags.value = []
}
</script>

<style lang="scss" scoped>
.navigation-container {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: auto;
}

.main-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}



.search-section {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: 24px;

  .search-header {
    text-align: center;
    margin-bottom: 20px;

    .search-title {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 6px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .search-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  .search-input-group {
    position: relative;
    flex: 1;
  }

  .search-icon {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
    pointer-events: none;
    z-index: 2;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }

  .search-input {
    padding: 20px 16px 16px 48px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    width: 100%;
    transition: all 0.3s ease;
    color: #ffffff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    &:focus {
      outline: none;
      border-color: #007AFF;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
    }
  }

  .clear-btn {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.3s ease;
    
    &:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.1);
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .filter-icon {
      position: absolute;
      top: 55%;
      left: 14px;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.7);
      pointer-events: none;
      z-index: 2;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
    
    .filter-select-wrapper {
      position: relative;
      min-width: 140px;
      
      .filter-select {
        width: 100%;
        padding: 16px 16px 16px 40px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        font-size: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #ffffff;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 16px center;
        background-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: #007AFF;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
        }
        
        &:hover {
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        option {
          background: rgba(0, 0, 0, 0.9);
          color: #ffffff;
        }
      }
    }
  }

  .search-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: rgba(0, 122, 255, 0.8);
      border-color: #007AFF;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      background: rgba(0, 0, 0, 0.2);
      cursor: not-allowed;
      color: rgba(255, 255, 255, 0.4);
      border-color: rgba(255, 255, 255, 0.2);
      transform: none;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.selected-destinations {
  margin-bottom: 20px;
  
  .destinations-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .destinations-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }
    
    .clear-all-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.3s ease;
      
      &:hover {
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
  
  .destinations-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .destination-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 122, 255, 0.2);
    border: 1px solid rgba(0, 122, 255, 0.4);
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 14px;
    color: #ffffff;
    
    .tag-text {
      font-weight: 500;
    }
    
    .remove-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      line-height: 1;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.hot-destinations {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  .hot-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
  }

  .hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;
  }

  .hot-tag {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.8);
    padding: 8px 14px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 122, 255, 0.8);
      color: #ffffff;
      border-color: #007AFF;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.action-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    
    svg {
      width: 20px;
      height: 20px;
    }
    
    &.primary {
      background: rgba(0, 122, 255, 0.8);
      color: #ffffff;
      border: 1px solid rgba(0, 122, 255, 0.4);
      
      &:hover:not(:disabled) {
        background: rgba(0, 122, 255, 1);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
      }
      
      &:disabled {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.2);
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
    
    &.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

.routes-section {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: 24px;
  
  .routes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .routes-title {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }
  }
  
  .transport-selector {
    display: flex;
    gap: 8px;
    
    button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 8px 16px;
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      
      &.active {
        background: rgba(0, 122, 255, 0.8);
        border-color: #007AFF;
        color: #ffffff;
      }
      
      &:hover {
        transform: translateY(-1px);
      }
    }
  }
  
  .routes-grid {
    display: grid;
    gap: 16px;
  }
  
  .route-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(0, 122, 255, 0.3);
      transform: translateX(4px);
    }
    
    .route-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      
      .route-index {
        font-size: 24px;
        font-weight: 700;
        color: #007AFF;
        background: rgba(0, 122, 255, 0.1);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(0, 122, 255, 0.3);
      }
      
      .route-info {
        flex: 1;
        
        .route-name {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px 0;
        }
        
        .route-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      }
    }
    
    .route-stats {
      display: flex;
      gap: 24px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        
        svg {
          width: 16px;
          height: 16px;
          color: #007AFF;
        }
      }
    }
  }
}

.facilities-section {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  
  .facilities-header {
    margin-bottom: 20px;
    
    .facilities-title {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 16px 0;
    }
    
    .facilities-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      span {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.3s ease;
        
        &.active {
          background: rgba(0, 122, 255, 0.8);
          border-color: #007AFF;
          color: #ffffff;
        }
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
  
  .facilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .facility-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(0, 122, 255, 0.3);
      transform: translateY(-2px);
    }
    
    &.selected {
      background: rgba(0, 122, 255, 0.1);
      border-color: #007AFF;
    }
    
    .facility-icon {
      font-size: 24px;
      margin-bottom: 12px;
    }
    
    .facility-info {
      .facility-name {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 4px 0;
      }
      
      .facility-distance {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .routes-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .facilities-grid {
    grid-template-columns: 1fr;
  }
}
</style> 