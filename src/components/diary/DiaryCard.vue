<template>
  <div class="diary-card" @click="handleCardClick">
    <div class="media-container">
      <img 
        v-for="(img, index) in diary.images" 
        :key="index"
        :src="img"
        class="card-image"
        loading="lazy"
        @click="handlePreview(index)"
      >
      <video 
        v-if="diary.video"
        :src="diary.video"
        class="card-video"
        controls
      ></video>
      <!-- 浏览量 -->
      <div class="view-count">
        <svg class="view-icon" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
        <span>{{ diary.views }}</span>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="title">{{ diary.title }}</h3>
      <div class="meta">
        <user-avatar :user="diary.author"/>
        <div class="info">
          <p class="username">{{ diary.author.name }}</p>
          <p class="date">{{ formatDate(diary.createdAt) }}</p>
        </div>
      </div>
      <p class="content">{{ diary.content }}</p>
      <div class="action-bar">
        <like-button :count="diary.likes" @click="handleLike"/>
        <comment-button :count="diary.comments.length" @click="openComment"/>
        <share-button @click="handleShare"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import UserAvatar from '@/components/common/UserAvatar.vue'
import { useDiaryStore } from '@/stores/diaryStore'
import LikeButton from '@/components/common/LikeButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const forbiddenSelectors = ['.action-bar', '.view-count', 'button', 'a','svg', 'path']
// 添加卡片点击处理
const handleCardClick = (event) => {
  // 添加调试语句
  console.log('尝试跳转到日记:', props.diary.id)
  const forbiddenElements = ['.action-bar', '.view-count', 'button', 'a', 'svg', 'path'];
  const shouldPrevent = forbiddenElements.some(selector => 
    event.target.closest(selector)
  );

  if (!shouldPrevent) {
    router.push(`/diary/${props.diary.id}`);
  }
};

const props = defineProps({
  diary: {
    type: Object,
    required: true,
    validator(value) {
      return !!value.id // 必须有id字段
    }
  }
})

const formatDate = (dateString) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm')
}

const diaryStore = useDiaryStore()

const emit = defineEmits(['update:diary'])

const handleLike = async () => {
  try {
    const updatedDiary = {
      ...props.diary,
      likes: props.diary.likes + (props.diary.isLiked ? -1 : 1),
      isLiked: !props.diary.isLiked
    }
    emit('update:diary', updatedDiary)

    // const response = await fetch(`/api/diaries/${props.diary.id}/like`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })

    if (!response.ok) {
      emit('update:diary', props.diary)
      throw new Error('点赞失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}


const openComment = () => {
  router.push({
    path: `/diary/${props.diary.id}`,
    hash: '#comments'
  })
}
</script>

<style lang="scss" scoped>
.diary-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  cursor: pointer; /* 添加手型光标 */
  position: relative; /* 为子元素定位提供参考 */
  
  &:hover {
    transform: translateY(-4px);
  }
}

.media-container {
  position: relative;
  padding-top: 56.25%;
  
  .card-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: zoom-in;
  }
  
  .card-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* 浏览量 */
  .view-count {
    position: absolute;
    left: 12px;
    bottom: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    
    .view-icon {
      width: 16px;
      height: 16px;
      fill: white;
    }
  }
}

.card-content {
  padding: 16px;
  
  .title {
    font-size: 18px;
    margin: 0 0 12px;
    color: #1d1d1f;
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    p{
      margin: 5px;
    }
    .user-avatar{
      width: 22.5px;
    }
  }
  
  .content {
    color: #666;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    overflow: hidden;
  }
}

.action-bar {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  position: relative; /* 创建新的堆叠上下文 */
  z-index: 1; /* 保证按钮在点击区域之上 */
}
</style>