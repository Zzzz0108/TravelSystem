<template>
  <button
    class="favorite-button"
    :class="{ 'favorited': isFavorited }"
    @click.stop="handleClick"
  >
    <img 
      src="@/assets/icon/like.svg"
      :class="['heart-icon', { 'favorited': isFavorited }]"
      alt="收藏"
    />
  </button>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSpotStore } from '@/stores/spotStore'

const props = defineProps({
  spotId: {
    type: Number,
    required: true
  },
  initialFavorited: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:favorited'])

const spotStore = useSpotStore()

// 使用计算属性来实时获取收藏状态，确保与 store 同步
const isFavorited = computed(() => {
  return spotStore.favoriteSpots.some(spot => spot.id === props.spotId)
})

// 监听 store 中收藏列表的变化
watch(() => spotStore.favoriteSpots, () => {
  // 当收藏列表变化时，通知父组件
  const currentStatus = isFavorited.value
  emit('update:favorited', currentStatus)
}, { deep: true })

const handleClick = async () => {
  try {
    console.log('FavoriteButton 点击，景点ID:', props.spotId, '当前状态:', isFavorited.value)
    const success = await spotStore.toggleFavorite(props.spotId)
    console.log('toggleFavorite 返回结果:', success)
    
    // 发送全局事件通知其他组件
    const event = new CustomEvent('favorite-updated', {
      detail: {
        spotId: props.spotId,
        isFavorited: success,
        action: success ? 'added' : 'removed'
      }
    })
    window.dispatchEvent(event)
    console.log('已发送全局事件:', event.detail)
    
    emit('update:favorited', success)
  } catch (error) {
    console.error('收藏操作失败:', error)
    // 刷新收藏列表以确保状态一致
    await spotStore.fetchFavoriteSpots()
  }
}

// 组件挂载时确保收藏状态正确
onMounted(async () => {
  // 如果 store 中还没有收藏列表，先获取一次
  if (spotStore.favoriteSpots.length === 0) {
    await spotStore.fetchFavoriteSpots()
  }
})
</script>

<style scoped>
.favorite-button {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.favorite-button:hover {
  background: rgba(0, 113, 227, 0.2);
  border-color: rgba(0, 113, 227, 0.4);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.favorite-button:active {
  transform: scale(0.95);
}

.heart-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
  filter: brightness(0) invert(1); /* 默认白色 */
}

.heart-icon.favorited {
  filter: none; /* 收藏状态显示原始颜色 */
  transform: scale(1.1);
}

.favorite-button.favorited {
  background: rgba(255, 45, 85, 0.2);
  border-color: rgba(255, 45, 85, 0.4);
}

.favorite-button.favorited:hover {
  background: rgba(255, 45, 85, 0.3);
  border-color: rgba(255, 45, 85, 0.6);
  box-shadow: 0 4px 12px rgba(255, 45, 85, 0.3);
}
</style> 