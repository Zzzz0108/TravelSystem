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
        <span class="tab-count">{{ currentFavorites.length }}</span>
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
        <span class="tab-count">{{ diaryFavorites.length }}</span>
      </button>
    </div>
    
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="currentFavorites.length" class="card-grid">
      <!-- 景点收藏 -->
      <template v-if="activeTab === 'spots'">
        <div 
          v-for="fav in currentFavorites"
          :key="fav.id"
          class="favorite-item"
        >
          <spot-card :spot="fav" />
        </div>
      </template>
      
      <!-- 日记收藏 -->
      <template v-if="activeTab === 'diaries'">
        <div 
          v-for="fav in currentFavorites"
          :key="fav.id"
          class="favorite-item"
        >
          <diary-card :diary="fav" />
        </div>
      </template>
    </div>
    <div v-else class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
      <p>暂无{{ activeTab === 'spots' ? '景点' : '日记' }}收藏内容</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useSpotStore } from '@/stores/spotStore'
import { useDiaryStore } from '@/stores/diaryStore'
import SpotCard from '@/components/spot/SpotCard.vue'
import DiaryCard from '@/components/diary/DiaryCard.vue'

const spotStore = useSpotStore()
const diaryStore = useDiaryStore()

// 状态管理
const loading = ref(true)
const error = ref(null)
const activeTab = ref('spots')

// 收藏数据
const spotFavorites = ref([])
const diaryFavorites = ref([])
const currentFavorites = ref([])

// 切换tab
const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'spots') {
    currentFavorites.value = spotFavorites.value
  } else {
    currentFavorites.value = diaryFavorites.value
  }
}

// 获取景点收藏
const fetchSpotFavorites = async () => {
  try {
    await spotStore.fetchFavoriteSpots()
    spotFavorites.value = spotStore.favoriteSpots
    if (activeTab.value === 'spots') {
      currentFavorites.value = spotFavorites.value
    }
  } catch (err) {
    error.value = '获取景点收藏失败，请稍后重试'
  }
}

// 获取日记收藏
const fetchDiaryFavorites = async () => {
  try {
    // TODO: 接入日记收藏接口
    diaryFavorites.value = []
    if (activeTab.value === 'diaries') {
      currentFavorites.value = diaryFavorites.value
    }
  } catch (err) {
    error.value = '获取日记收藏失败，请稍后重试'
  }
}

// 获取当前tab的收藏数据
const fetchCurrentFavorites = async () => {
  try {
    loading.value = true
    error.value = null
    if (activeTab.value === 'spots') {
      await fetchSpotFavorites()
      currentFavorites.value = [...spotFavorites.value]
    } else {
      await fetchDiaryFavorites()
      currentFavorites.value = [...diaryFavorites.value]
    }
  } catch (err) {
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
      spotFavorites.value = currentFavoritesFromStore
      currentFavorites.value = currentFavoritesFromStore
    }
  }
}

// 同步store状态到本地状态
const syncStoreToLocal = () => {
  if (activeTab.value === 'spots') {
    const storeFavorites = [...spotStore.favoriteSpots]
    spotFavorites.value = storeFavorites
    currentFavorites.value = storeFavorites
  }
}

// 监听store中的收藏状态变化
watch(() => spotStore.favoriteSpots, updateFavorites, { deep: true, immediate: true })

// 添加全局事件监听，监听收藏状态变化
onMounted(() => {
  fetchCurrentFavorites()
  window.addEventListener('favorite-updated', (event) => {
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
      setTimeout(() => {
        updateFavorites()
        syncStoreToLocal()
      }, 100)
    }
  })
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('favorite-updated', updateFavorites)
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
.error-state {
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
}

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
  }
  
  .tab-button {
    width: 100%;
    justify-content: center;
  }
}
</style>