<template>
  <div class="spot-card" @click="handleCardClick">
    <div class="media-container">
      <img 
        :src="spot.image"
        class="card-image"
        loading="lazy"
        alt="景点图片"
      >
      <div class="view-count">
        <svg class="view-icon" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
        <span>{{ spot.popularity }}</span>
      </div>
      
      <!-- 类型标签 -->
      <div class="type-badge">
        {{ spot.type === 'SCENIC_AREA' ? '景区' : '学校' }}
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="title">{{ spot.name }}</h3>
      
      <div class="meta">
        <div class="city-info">
          <svg class="location-icon" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
          </svg>
          <span>{{ spot.city }}</span>
        </div>
        
        <div class="rating-info" v-if="spot.userRating">
          <svg class="star-icon" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{{ spot.userRating }}</span>
        </div>
      </div>
      
      <div class="action-bar">
        <favorite-button 
          :spot-id="spot.id"
          :initial-favorited="isFavorite"
        />
        
        <div class="action-buttons">
          <button 
            class="action-btn go-here-btn"
            @click.stop="goToNavigation"
            title="去这里"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            去这里
          </button>
          
          <button 
            class="action-btn diary-btn"
            @click.stop="goToDiaries"
            title="相关日记"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            相关日记
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import FavoriteButton from '@/components/common/buttons/FavoriteButton.vue'
import { useSpotStore } from '@/stores/spotStore'

const props = defineProps({
  spot: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object' && 
             typeof value.id === 'number' && 
             typeof value.name === 'string' &&
             typeof value.image === 'string' &&
             typeof value.popularity === 'number' &&
             typeof value.city === 'string' &&
             typeof value.type === 'string'
    }
  }
})

const router = useRouter()
const spotStore = useSpotStore()

const isFavorite = computed(() => {
  if (!props.spot || !props.spot.id) return false
  return spotStore.favoriteSpots.some(s => s.id === props.spot.id)
})

// 监听收藏状态变化，实时更新
watch(() => spotStore.favoriteSpots, () => {}, { deep: true })

// 监听props.spot.id的变化
watch(() => props.spot.id, () => {}, { immediate: true })

// 监听全局收藏状态变化事件
onMounted(() => {
  const handleFavoriteUpdate = (event) => {
    if (event.detail.spotId === props.spot.id) {
      nextTick(() => {})
    }
  }
  window.addEventListener('favorite-updated', handleFavoriteUpdate)
  onUnmounted(() => {
    window.removeEventListener('favorite-updated', handleFavoriteUpdate)
  })
})

  // 处理卡片点击
  const handleCardClick = async () => {
    try {
      // 增加浏览量
      await spotStore.incrementViews(props.spot.id);
      // 导航到景点详情页
      router.push(`/spot/${props.spot.id}`);
    } catch (error) {
      console.error('导航失败:', error);
      // 即使增加浏览量失败，也继续导航
      router.push(`/spot/${props.spot.id}`);
    }
  };

// 去这里 - 跳转导航页面
const goToNavigation = () => {
  if (!props.spot || !props.spot.id) return;
  
  // 先增加浏览量
  spotStore.incrementViews(props.spot.id);
  
  // 尝试多种可能的坐标字段
  let coords = null;
  if (props.spot.latitude && props.spot.longitude) {
    coords = `${props.spot.longitude},${props.spot.latitude}`;
  } else if (props.spot.lat && props.spot.lng) {
    coords = `${props.spot.lng},${props.spot.lat}`;
  } else if (props.spot.x && props.spot.y) {
    coords = `${props.spot.x},${props.spot.y}`;
  } else if (props.spot.coordinates) {
    coords = props.spot.coordinates;
  }
  
  // 跳转导航页面，传递目的地信息
  router.push({
    path: '/navigation',
    query: {
      destination: props.spot.name,
      destinationCoords: coords
    }
  });
}

// 相关日记 - 跳转日记页面并搜索
const goToDiaries = () => {
  if (!props.spot || !props.spot.id) return;
  
  // 先增加浏览量（非阻塞）
  spotStore.incrementViews(props.spot.id).catch(() => {})
  
  // 仅按目的地搜索：传城市
  router.push({
    path: '/diary',
    query: {
      destination: props.spot.city
    }
  });
}
</script>

<style lang="scss" scoped>
.spot-card {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  width: 280px;
  margin: 8px;
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
    border-color: rgba(0, 113, 227, 0.4);
  }
}

.media-container {
  position: relative;
  padding-top: 56.25%;
  overflow: hidden;
  
  .card-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover .card-image {
    transform: scale(1.05);
  }

  .view-count {
    position: absolute;
    left: 12px;
    bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    
    .view-icon {
      width: 16px;
      height: 16px;
      fill: white;
    }
  }

  .type-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(94, 95, 95, 0.33);
    backdrop-filter: blur(10px);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.card-content {
  padding: 20px;
  
  .title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 16px;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .city-info {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      font-weight: 500;

      .location-icon {
        width: 16px;
        height: 16px;
        fill: rgba(255, 255, 255, 0.7);
      }
    }
    
    .rating-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffd700;
      font-size: 14px;
      font-weight: 600;
      background: rgba(255, 215, 0, 0.1);
      padding: 6px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 215, 0, 0.3);

      .star-icon {
        width: 16px;
        height: 16px;
        fill: #ffd700;
      }
    }
  }
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  .btn-icon {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
}

.go-here-btn {
  &:hover {
    background: rgba(0, 122, 255, 0.6);
    border-color: rgba(0, 122, 255, 0.3);
    color: #ffffff;
  }
}

.diary-btn {
  &:hover {
    background: rgba(255, 45, 85, 0.6);
    border-color: rgba(255, 45, 85, 0.3);
    color: #ffffff;
  }
}
</style> 