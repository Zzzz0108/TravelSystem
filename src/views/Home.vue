<template>
  <main class="home-container">
    <!-- 搜索区 -->
    <section class="search-section">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索景点、目的地"
          class="search-input"
          @input="handleSearch"
        >
      </div>
    </section>

    <!-- 推荐区 -->
    <section class="recommendations">
      <h2 class="section-title">热门推荐</h2>
      <div 
        class="card-grid"
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="isLoading"
        :infinite-scroll-distance="100"
      >
        <div 
          v-for="spot in filteredSpots" 
          :key="spot.id" 
          class="spot-card"
        >
          <!-- 收藏按钮 -->
          <button 
            class="favorite-btn"
            @click.stop="toggleFavorite(spot)"
            :class="{ 'favorited': isFavorited(spot.id) }"
          >
            <svg class="heart-icon" viewBox="0 0 24 24">
              <path :d="heartPath(spot.id)"/>
            </svg>
          </button>

          <!-- 卡片媒体内容 -->
          <div class="card-media">
            <img 
              :src="spot.image" 
              :alt="spot.name" 
              class="card-image"
              loading="lazy"
            >
            <div class="rating-badge">
              <span class="rating-star">★</span>
              {{ spot.rating.toFixed(1) }}
            </div>
          </div>

          <!-- 卡片文字内容 -->
          <div class="card-content">
            <h3 class="spot-name">{{ spot.name }}</h3>
            <p class="spot-category">{{ spot.category }}</p>
            <div class="tag-container">
              <span 
                v-for="tag in spot.tags" 
                :key="tag" 
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="loader"></div>
          <p>正在加载更多...</p>
        </div>
        <div v-if="!hasMore" class="no-more">
          <svg class="checkmark" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          已加载全部内容
        </div>
      </div>
    </section>
    <!-- 返回顶部按钮 -->
    <button 
      v-show="showBackToTop"
      @click="scrollToTop"
      class="back-to-top"
    >
      <svg viewBox="0 0 24 24" class="arrow-icon">
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
      </svg>
    </button>
  </main>
</template>

<script setup>
import { ref, computed, onMounted,onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'


// 返回顶部功能
const showBackToTop = ref(false)
const router = useRouter()
const userStore = useUserStore()


// 返回顶部功能
const checkScroll = () => {
  showBackToTop.value = window.scrollY > 200
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 搜索功能
const searchQuery = ref('')
const handleSearch = () => {
  hasMore.value = true
  page.value = 1
  spots.value = []
  loadMore()
}

// 景点数据
const spots = ref([])
const page = ref(1)
const pageSize = 10 // 初始加载10个示例
const isLoading = ref(false)
const hasMore = ref(true)

// 生成10个示例数据
const generateMockData = () => {
  return [
    {
      id: 1,
      name: '丽江古城',
      category: '文化古迹',
      rating: 4.8,
      tags: ['世界遗产', '夜景', '古建筑'],
      image: 'https://picsum.photos/300/200?random=1'
    },
    {
      id: 2,
      name: '玉龙雪山',
      category: '自然风光',
      rating: 4.9,
      tags: ['雪山', '徒步', '摄影'],
      image: 'https://picsum.photos/300/200?random=2'
    },
    {
      id: 3,
      name: '大理洱海',
      category: '湖泊景观',
      rating: 4.7,
      tags: ['骑行', '日出', '水鸟'],
      image: 'https://picsum.photos/300/200?random=3'
    },
    {
      id: 4,
      name: '香格里拉',
      category: '高原圣地',
      rating: 4.6,
      tags: ['藏文化', '草原', '寺庙'],
      image: 'https://picsum.photos/300/200?random=4'
    },
    {
      id: 5,
      name: '西双版纳',
      category: '热带雨林',
      rating: 4.5,
      tags: ['大象', '傣族园', '泼水节'],
      image: 'https://picsum.photos/300/200?random=5'
    },
    {
      id: 6,
      name: '石林风景区',
      category: '地质奇观',
      rating: 4.4,
      tags: ['喀斯特', '彝族文化', '天然迷宫'],
      image: 'https://picsum.photos/300/200?random=6'
    },
    {
      id: 7,
      name: '腾冲火山',
      category: '地质公园',
      rating: 4.3,
      tags: ['温泉', '火山口', '湿地'],
      image: 'https://picsum.photos/300/200?random=7'
    },
    {
      id: 8,
      name: '普达措国家公园',
      category: '生态保护区',
      rating: 4.8,
      tags: ['高山湖泊', '原始森林', '珍稀动物'],
      image: 'https://picsum.photos/300/200?random=8'
    },
    {
      id: 9,
      name: '元阳梯田',
      category: '人文景观',
      rating: 4.7,
      tags: ['摄影圣地', '哈尼族', '日出云海'],
      image: 'https://picsum.photos/300/200?random=9'
    },
    {
      id: 10,
      name: '泸沽湖',
      category: '湖泊景区',
      rating: 4.6,
      tags: ['摩梭文化', '猪槽船', '走婚桥'],
      image: 'https://picsum.photos/300/200?random=10'
    }
  ]
}

// 无限滚动加载
const loadMore = async () => {
  if (!hasMore.value || isLoading.value) return

  isLoading.value = true
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (page.value === 1) {
      spots.value = generateMockData()
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 收藏功能
const toggleFavorite = (spot) => {
  if (!userStore.isLogin) {
    if (confirm('需要登录后才能收藏，是否立即登录？')) {
      router.push({ 
        path: '/login', 
        query: { redirect: router.currentRoute.value.path } 
      })
    }
    return
  }

  userStore.toggleFavorite(spot)
}

const isFavorited = (id) => {
  return userStore.favorites.some(f => f.id === id)
}

const heartPath = (id) => {
  return isFavorited(id) 
    ? 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    : 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'
}

// 初始化加载
onMounted(() => {
  loadMore()
  window.addEventListener('scroll', checkScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})

// 计算过滤后的景点
const filteredSpots = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return (spots.value || []).filter(spot => {
    // 处理可能的空值
    const name = spot.name?.toLowerCase() || '';
    const category = spot.category?.toLowerCase() || '';
    
    // 安全处理 tags 不存在或包含非法值的情况
    const tags = Array.isArray(spot.tags) 
      ? spot.tags.map(t => String(t || '').toLowerCase())
      : [];

    return name.includes(query) ||
           category.includes(query) ||
           tags.some(tag => tag.includes(query));
  });
});
</script>

<style lang="scss" scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  padding: 40px 0;
  
  .search-bar {
    position: relative;
    max-width: 680px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .search-icon {
    width: 20px;
    height: 20px;
    fill: #86868b;
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    border: 0;
    background: transparent;
    font-size: 17px;
    color: #1d1d1f;
    outline: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell;

    &::placeholder {
      color: #86868b;
    }
  }
}

.recommendations {
  margin-top: 40px;

  .section-title {
    font-size: 28px;
    color: #1d1d1f;
    font-weight: 600;
    margin-bottom: 30px;
    padding-left: 10px;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 10px;
}

.spot-card {
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-media {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .rating-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    backdrop-filter: blur(4px);
  }

  .rating-star {
    color: #ffd700;
    margin-right: 4px;
  }

  .card-content {
    padding: 18px;
  }

  .spot-name {
    font-size: 20px;
    color: #1d1d1f;
    margin: 0 0 8px;
    font-weight: 600;
  }

  .spot-category {
    color: #86868b;
    font-size: 15px;
    margin: 0 0 12px;
  }

  .tag-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #f5f5f7;
    color: #1d1d1f;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    transition: background 0.2s ease;
    
    &:hover {
      background: #e0e0e5;
    }
  }
}

/* 收藏按钮样式 */
.favorite-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  z-index: 2;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }

  &.favorited {
    .heart-icon path {
      fill: #ff2d55;
    }
  }
}

.heart-icon {
  width: 20px;
  height: 20px;
  path {
    fill: #86868b;
    transition: fill 0.2s ease;
  }
}

/* 加载指示器 */
.loading-indicator {
  padding: 40px 0;
  text-align: center;
  grid-column: 1 / -1;

  p {
    margin-top: 12px;
    color: #86868b;
  }
}

.loader {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-more {
  text-align: center;
  padding: 40px 0;
  color: #86868b;
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .checkmark {
    width: 40px;
    height: 40px;
    fill: #34c759;
  }
}

.back-to-top {
  position: fixed;
  top: 80px;
  right: 40px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  .arrow-icon {
    width: 24px;
    height: 24px;
    fill: #1d1d1f;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .search-bar {
    margin: 0 20px;
  }
}
</style>