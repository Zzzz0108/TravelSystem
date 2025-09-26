<template>
  <main class="favorites-container">
    <h2 class="section-title">我的收藏</h2>
    
    <!-- Tab切换 -->
    <div class="tab-container">
      <button 
        class="tab-button"
        :class="{ 'active': activeTab === 'spots' }"
        @click="switchTab('spots')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        景点收藏
        <span class="tab-count">{{ spotFavorites.length }}</span>
      </button>
      
      <button 
        class="tab-button"
        :class="{ 'active': activeTab === 'diaries' }"
        @click="switchTab('diaries')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        日记收藏
        <span class="tab-count">{{ diaryTotalElements }}</span>
      </button>
    </div>
    
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="isComponentMounted && currentFavorites.length" class="card-grid">
      <!-- 景点收藏 -->
      <template v-if="activeTab === 'spots'">
        <div 
          v-for="fav in currentFavorites"
          :key="`spot-${fav.id}`"
          class="favorite-item"
        >
          <spot-card :spot="fav" />
        </div>
      </template>
      
      <!-- 日记收藏 -->
      <template v-if="activeTab === 'diaries'">
        <div 
          v-for="fav in currentFavorites"
          :key="`diary-${fav.id}`"
          class="favorite-item"
        >
          <diary-card :diary="fav" />
        </div>
      </template>
    </div>
    
    <!-- 分页组件 - 移出grid布局，独立定位 -->
    <div v-if="activeTab === 'diaries' && diaryTotalElements > 0" class="pagination-container">
      <!-- 原生分页组件 -->
      <div class="native-pagination">
        <div class="pagination-info">
          <span class="total-info">共 {{ diaryTotalElements }} 条记录</span>
          <span class="page-info">第 {{ diaryCurrentPage }} 页，共 {{ Math.ceil(diaryTotalElements / diaryPageSize) }} 页</span>
        </div>
        
        <div class="pagination-controls">
          <button 
            @click="handleDiaryPageChange(diaryCurrentPage - 1)"
            :disabled="diaryCurrentPage <= 1"
            class="pagination-btn prev-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            上一页
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in getVisiblePages()" 
              :key="page"
              @click="handleDiaryPageChange(page)"
              :class="['page-btn', { active: page === diaryCurrentPage }]"
              :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="handleDiaryPageChange(diaryCurrentPage + 1)"
            :disabled="diaryCurrentPage >= Math.ceil(diaryTotalElements / diaryPageSize)"
            class="pagination-btn next-btn"
          >
            下一页
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        
        <div class="page-size-selector">
          <span>每页显示：</span>
          <select v-model="diaryPageSize" @change="handleDiarySizeChange(diaryPageSize)" class="page-size-select">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>条</span>
        </div>
      </div>
    </div>
    <div v-else-if="isComponentMounted && currentFavorites.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
      <p>暂无{{ activeTab === 'spots' ? '景点' : '日记' }}收藏内容</p>
    </div>
    
    <!-- 组件卸载状态 -->
    <div v-else class="unmounting-state">
      <p>页面加载中...</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useSpotStore } from '@/stores/spotStore'
import { useDiaryStore } from '@/stores/diaryStore'
import SpotCard from '@/components/spot/SpotCard.vue'
import DiaryCard from '@/components/diary/DiaryCard.vue'

const router = useRouter()
const spotStore = useSpotStore()
const diaryStore = useDiaryStore()

// 状态管理 - 使用更简单的响应式管理
const loading = ref(true)
const error = ref(null)
const activeTab = ref('spots')
const isComponentMounted = ref(false)

// 收藏数据 - 使用普通 ref，但减少不必要的响应式
const spotFavorites = ref([])
const diaryFavorites = ref([])
const currentFavorites = ref([])

// 日记收藏分页状态
const diaryCurrentPage = ref(1)
const diaryPageSize = ref(20)
const diaryTotalElements = ref(0)
const diaryTotalPages = ref(0)

// 操作锁 - 防止重复操作
let isProcessing = false

// 切换tab
const switchTab = async (tab) => {
  try {
    // 检查组件是否仍然挂载
    if (!isComponentMounted.value) {
      console.log('组件已卸载，停止tab切换')
      return
    }
    
    // 防止重复操作
    if (isProcessing) {
      console.log('操作进行中，忽略重复请求')
      return
    }
    
    isProcessing = true
    
    console.log('切换tab到:', tab)
    
    // 先清理当前数据，避免数据混乱
    currentFavorites.value = []
    
    // 先更新tab状态
  activeTab.value = tab
    
    // 使用 nextTick 确保DOM更新完成
    await nextTick()
    
    // 再次检查组件是否仍然挂载
    if (!isComponentMounted.value) return
    
  if (tab === 'spots') {
      console.log('切换到景点tab，当前景点收藏数量:', spotFavorites.value.length)
      // 切换到景点tab时，如果数据为空则重新获取
      if (spotFavorites.value.length === 0) {
        console.log('景点收藏数据为空，重新获取...')
        await fetchSpotFavorites()
      }
      
      // 再次检查组件是否仍然挂载
      if (!isComponentMounted.value) return
      
      // 使用 nextTick 确保DOM更新完成后再修改状态
      await nextTick()
      
      // 再次检查组件是否仍然挂载
      if (!isComponentMounted.value) return
      
      currentFavorites.value = [...spotFavorites.value]
      console.log('设置景点tab的currentFavorites，数量:', currentFavorites.value.length)
    } else {
      console.log('切换到日记tab，重置分页状态')
      // 切换到日记tab时，重置分页并获取第一页数据
      diaryCurrentPage.value = 1
      
      // 先获取日记收藏数据
      const diaries = await fetchDiaryFavorites(1, diaryPageSize.value)
      
      // 再次检查组件是否仍然挂载
      if (!isComponentMounted.value) return
      
      // 使用 nextTick 确保DOM更新完成后再修改状态
      await nextTick()
      
      // 再次检查组件是否仍然挂载
      if (!isComponentMounted.value) return
      
      // 确保使用正确的日记数据
      if (diaries && Array.isArray(diaries) && diaries.length > 0) {
        currentFavorites.value = [...diaries]
        console.log('设置日记tab的currentFavorites，数量:', currentFavorites.value.length)
        console.log('日记数据详情:', currentFavorites.value)
        console.log('日记收藏总数:', diaryTotalElements.value)
  } else {
        console.log('没有获取到日记数据，设置空数组')
        currentFavorites.value = []
        console.log('日记收藏总数:', diaryTotalElements.value)
      }
    }
  } catch (error) {
    if (isComponentMounted.value) {
      console.error('切换tab失败:', error)
      error.value = '切换tab失败，请稍后重试'
    }
  } finally {
    isProcessing = false
  }
}

// 获取景点收藏
const fetchSpotFavorites = async () => {
  try {
    // 检查组件是否仍然挂载
    if (!isComponentMounted.value) {
      console.log('组件已卸载，停止获取景点收藏')
      return
    }
    
    // 防止重复操作
    if (isProcessing) {
      console.log('操作进行中，忽略重复请求')
      return
    }
    
    console.log('开始获取景点收藏...')
    await spotStore.fetchFavoriteSpots()
    
    // 再次检查组件是否仍然挂载
    if (!isComponentMounted.value) return
    
    // 使用 nextTick 确保DOM更新完成后再修改状态
    await nextTick()
    
    // 再次检查组件是否仍然挂载
    if (!isComponentMounted.value) return
    
    const spots = [...spotStore.favoriteSpots]
    console.log('获取到的景点数据:', spots)
    
    // 验证数据是否为景点类型
    const validSpots = spots.filter(spot => spot && typeof spot === 'object' && 'id' in spot && 'name' in spot)
    console.log('验证后的景点数据:', validSpots)
    
    spotFavorites.value = validSpots
    
    // 如果当前是景点tab，更新currentFavorites
    if (activeTab.value === 'spots') {
      currentFavorites.value = [...validSpots]
      console.log('更新景点tab的currentFavorites:', currentFavorites.value)
    }
    
    console.log('获取到景点收藏数量:', spotFavorites.value.length)
  } catch (err) {
    if (isComponentMounted.value) {
      console.error('获取景点收藏失败:', err)
    error.value = '获取景点收藏失败，请稍后重试'
      spotFavorites.value = []
      if (activeTab.value === 'spots') {
        currentFavorites.value = []
      }
    }
  }
}

// 获取日记收藏
const fetchDiaryFavorites = async (page = 1, size = 20) => {
  try {
    // 检查组件是否仍然挂载
    if (!isComponentMounted.value) {
      console.log('组件已卸载，停止获取日记收藏')
      return
    }
    
    console.log('开始获取用户点赞的日记...', { page, size })
    const response = await diaryStore.getLikedDiaries({ 
      page: page - 1, // 后端从0开始，前端从1开始
      size 
    })
    
    // 再次检查组件是否仍然挂载
    if (!isComponentMounted.value) return
    
    console.log('日记API响应:', response)
    
    // 验证日记数据
    const diaries = response.content || []
    console.log('获取到的日记数据:', diaries)
    
    // 验证数据是否为日记类型
    const validDiaries = diaries.filter(diary => 
      diary && 
      typeof diary === 'object' && 
      'id' in diary && 
      'title' in diary && 
      'content' in diary
    )
    console.log('验证后的日记数据:', validDiaries)
    
    // 批量更新状态
    diaryFavorites.value = validDiaries
    diaryTotalElements.value = response.totalElements || 0
    diaryTotalPages.value = response.totalPages || 0
    diaryCurrentPage.value = page
    
    // 只在需要时更新 currentFavorites
    if (activeTab.value === 'diaries') {
      currentFavorites.value = [...validDiaries]
      console.log('更新日记tab的currentFavorites:', currentFavorites.value)
    }
    
    console.log('获取到点赞日记数量:', validDiaries.length)
    console.log('分页信息:', {
      total: response.totalElements,
      pages: response.totalPages,
      current: page
    })
    
    return validDiaries
  } catch (err) {
    if (isComponentMounted.value) {
      console.error('获取日记收藏失败:', err)
    error.value = '获取日记收藏失败，请稍后重试'
      diaryFavorites.value = []
      diaryTotalElements.value = 0
      diaryTotalPages.value = 0
      if (activeTab.value === 'diaries') {
        currentFavorites.value = []
      }
    }
    return []
  }
}

// 获取当前tab的收藏数据
const fetchCurrentFavorites = async () => {
  try {
    loading.value = true
    error.value = null
    
    // 使用 nextTick 确保DOM更新完成
    await nextTick()
    
    if (activeTab.value === 'spots') {
      await fetchSpotFavorites()
      await nextTick()
      currentFavorites.value = [...spotFavorites.value]
      
      // 即使当前是景点tab，也预先获取日记收藏数量，确保tab显示正确
      console.log('当前是景点tab，但预先获取日记收藏数量')
      await fetchDiaryFavorites(1, diaryPageSize.value)
    } else {
      // 重置分页状态并获取第一页数据
      diaryCurrentPage.value = 1
      const diaries = await fetchDiaryFavorites(1, diaryPageSize.value)
      await nextTick()
      
      if (diaries && Array.isArray(diaries)) {
        currentFavorites.value = [...diaries]
        console.log('初始化日记收藏数据:', currentFavorites.value.length)
        console.log('日记收藏总数:', diaryTotalElements.value)
      } else {
        currentFavorites.value = []
        console.log('初始化日记收藏数据为空')
        console.log('日记收藏总数:', diaryTotalElements.value)
      }
    }
  } catch (err) {
    console.error('获取收藏列表失败:', err)
    error.value = '获取收藏列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 监听收藏状态变化，实时更新数据
const updateFavorites = () => {
  if (activeTab.value === 'spots') {
    const currentFavoritesFromStore = [...spotStore.favoriteSpots]
    const hasChanged = JSON.stringify(currentFavorites.value) !== JSON.stringify(currentFavoritesFromStore)
    if (hasChanged) {
      console.log('景点收藏数据有变化，更新本地状态')
      spotFavorites.value = [...currentFavoritesFromStore]
      currentFavorites.value = [...currentFavoritesFromStore]
    }
  } else if (activeTab.value === 'diaries') {
    // 日记收藏数据变化时，重新获取当前页数据
    console.log('日记收藏数据有变化，重新获取当前页数据')
    fetchDiaryFavorites(diaryCurrentPage.value, diaryPageSize.value)
  }
}

// 同步store状态到本地状态
const syncStoreToLocal = () => {
  if (activeTab.value === 'spots') {
    const storeFavorites = [...spotStore.favoriteSpots]
    console.log('同步store状态到本地，景点收藏数量:', storeFavorites.length)
    spotFavorites.value = [...storeFavorites]
    currentFavorites.value = [...storeFavorites]
  }
}

// 获取可见的页码数组
const getVisiblePages = () => {
  const totalPages = Math.ceil(diaryTotalElements.value / diaryPageSize.value)
  const current = diaryCurrentPage.value
  const pages = []
  
  if (totalPages <= 7) {
    // 如果总页数少于等于7，显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 如果总页数大于7，显示智能分页
    if (current <= 4) {
      // 当前页在前4页，显示前5页 + ... + 最后一页
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (current >= totalPages - 3) {
      // 当前页在后3页，显示第一页 + ... + 后5页
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间，显示第一页 + ... + 当前页前后2页 + ... + 最后一页
      pages.push(1)
      pages.push('...')
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
}

// 日记收藏分页处理函数
const handleDiaryPageChange = async (page) => {
  try {
    diaryCurrentPage.value = page
    await fetchDiaryFavorites(page, diaryPageSize.value)
  } catch (error) {
    console.error('页面切换失败:', error)
  }
}

const handleDiarySizeChange = async (size) => {
  try {
    diaryPageSize.value = size
    diaryCurrentPage.value = 1
    await fetchDiaryFavorites(1, size)
  } catch (error) {
    console.error('页面大小改变失败:', error)
  }
}

// 监听store中的收藏状态变化
watch(() => spotStore.favoriteSpots, (newValue) => {
  if (isComponentMounted.value && !isProcessing) {
    try {
      updateFavorites()
    } catch (error) {
      console.error('更新收藏状态失败:', error)
    }
  }
}, { deep: true, immediate: true })

// 添加全局事件监听，监听收藏状态变化
const handleFavoriteUpdated = (event) => {
    if (event.detail.action === 'removed') {
      if (activeTab.value === 'spots') {
        const spotId = event.detail.spotId
        const newFavorites = currentFavorites.value.filter(spot => spot.id !== spotId)
        currentFavorites.value = newFavorites
        spotFavorites.value = newFavorites
        spotStore.favoriteSpots = newFavorites
        nextTick(() => {
          syncStoreToLocal()
        })
      }
    } else if (event.detail.action === 'added') {
      // 清理之前的定时器
      if (window.favoriteUpdateTimer) {
        clearTimeout(window.favoriteUpdateTimer)
      }
      
      // 设置新的定时器
      window.favoriteUpdateTimer = setTimeout(() => {
        updateFavorites()
        syncStoreToLocal()
        window.favoriteUpdateTimer = null
      }, 100)
    }
}

const handleDiaryLikeUpdated = async (event) => {
  try {
    console.log('收到日记点赞状态变化事件:', event.detail)
    if (activeTab.value === 'diaries') {
      // 重新获取当前页的点赞日记
      console.log('重新获取日记收藏，当前页:', diaryCurrentPage.value)
      await fetchDiaryFavorites(diaryCurrentPage.value, diaryPageSize.value)
      
      // 更新计数显示和当前显示数据
      if (diaryFavorites.value && Array.isArray(diaryFavorites.value)) {
        currentFavorites.value = [...diaryFavorites.value]
        console.log('更新后的日记收藏数量:', currentFavorites.value.length)
      }
    }
  } catch (error) {
    console.error('处理日记点赞状态变化失败:', error)
  }
}

onMounted(async () => {
  try {
    console.log('组件开始挂载...')
    isComponentMounted.value = true
    console.log('组件挂载状态设置为true')
    
    await fetchCurrentFavorites()
    console.log('初始数据获取完成')
    
    // 无论初始tab是什么，都预先获取日记收藏数量，这样tab上的数字就能立即显示
    console.log('预先获取日记收藏数量，确保tab显示正确')
    await fetchDiaryFavorites(1, diaryPageSize.value)
    
    // 监听景点收藏状态变化
    window.addEventListener('favorite-updated', handleFavoriteUpdated)
    
    // 监听日记点赞状态变化
    window.addEventListener('diary-like-updated', handleDiaryLikeUpdated)
    
    console.log('事件监听器设置完成')
  } catch (error) {
    console.error('组件挂载失败:', error)
  }
})

// 组件即将卸载时停止所有异步操作
onBeforeUnmount(() => {
  isComponentMounted.value = false
  isProcessing = false
  
  // 清理定时器
  if (window.favoriteUpdateTimer) {
    clearTimeout(window.favoriteUpdateTimer)
    window.favoriteUpdateTimer = null
  }
})

// 组件卸载时移除事件监听和重置状态
onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('favorite-updated', handleFavoriteUpdated)
  window.removeEventListener('diary-like-updated', handleDiaryLikeUpdated)
  
  // 重置组件状态
  loading.value = false
  error.value = null
  activeTab.value = 'spots'
  currentFavorites.value = []
  spotFavorites.value = []
  diaryFavorites.value = []
})
</script>

<style lang="scss" scoped>
.favorites-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background: transparent;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 20px 40px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.loading-state,
.error-state,
.unmounting-state {
  text-align: center;
  padding: 80px 0;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;

  .empty-icon {
    fill: rgba(255, 255, 255, 0.6);
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  justify-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.favorite-item {
  position: relative;
  width: 100%;
  max-width: 280px;
}

.tab-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  gap: 20px;
  padding: 0 20px;

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover:not(.active) {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  &.active {
    background: rgba(0, 122, 255, 0.8);
    color: #ffffff;
    border-color: rgba(0, 122, 255, 0.5);
    box-shadow: 0 8px 24px rgba(0, 122, 255, 0.4);
    transform: translateY(-4px);
  }

  .tab-icon {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  .tab-count {
    background: rgba(255, 45, 85, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-left: 8px;
    box-shadow: 0 2px 8px rgba(255, 45, 85, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
}

  /* 分页组件样式 */
  .pagination-container {
    position: sticky;
    max-width: 1200px;
    margin: 0 auto;
    bottom: 0px;
    z-index: 100;
    display: flex;
    justify-content: space-around;
    padding: 20px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  /* 原生分页组件样式 */
  .native-pagination {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 1200px;
    
    .pagination-info {
      display: flex;
      gap: 20px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      
      .total-info {
        color: #007AFF;
        font-weight: 600;
      }
      
      .page-info {
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .pagination-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        
        svg {
          width: 16px;
          height: 16px;
        }
        
        &:hover:not(:disabled) {
          background: rgba(0, 122, 255, 0.2);
          border-color: #007AFF;
          color: #007AFF;
          transform: translateY(-1px);
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        &.prev-btn {
          padding-left: 12px;
        }
        
        &.next-btn {
          padding-right: 12px;
        }
      }
      
      .page-numbers {
        display: flex;
        gap: 4px;
        
        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &:hover:not(:disabled) {
            background: rgba(0, 122, 255, 0.2);
            border-color: #007AFF;
            color: #007AFF;
          }
          
          &.active {
            background: #007AFF;
            border-color: #007AFF;
            color: #ffffff;
            font-weight: 600;
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
    
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      
      .page-size-select {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #007AFF;
        }
        
        &:focus {
          outline: none;
          border-color: #007AFF;
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }
      }
    }
  }

/* 响应式适配 */
@media (max-width: 768px) {
  .favorites-container {
    padding: 20px 10px;
  }
  
  .section-title {
    font-size: 24px;
    padding: 15px 20px;
  }
  
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
    padding: 0 10px;
  }
  
  .tab-container {
    flex-direction: column;
    gap: 12px;
    padding: 0 10px;
  
  .tab-button {
    width: 100%;
    justify-content: center;
    }
  }
}
</style>