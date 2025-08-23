<template>
  <button
    class="favorite-button"
    :class="{ 'favorited': isFavorited }"
    @click.stop="handleClick"
  >
    <img 
      :src="isFavorited ? '/src/assets/icon/like.svg' : '/src/assets/icon/like.svg'"
      :class="['heart-icon', { 'favorited': isFavorited }]"
      alt="收藏"
    />
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
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
const isFavorited = ref(props.initialFavorited)

const handleClick = async () => {
  try {
    const success = await spotStore.toggleFavorite(props.spotId)
    isFavorited.value = success
    emit('update:favorited', success)
  } catch (error) {
    console.error('FavoriteButton: 收藏操作失败', {
      error,
      spotId: props.spotId,
      timestamp: new Date().toISOString()
    });
    await spotStore.fetchFavoriteSpots()
    const isCurrentlyFavorited = spotStore.favoriteSpots.some(spot => spot.id === props.spotId)
    isFavorited.value = isCurrentlyFavorited
    emit('update:favorited', isCurrentlyFavorited)
  }
}
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