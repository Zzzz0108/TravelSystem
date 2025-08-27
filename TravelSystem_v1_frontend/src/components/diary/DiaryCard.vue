<template>
  <div class="diary-card" @click="handleCardClick">
    <div class="media-container">
      <template v-if="diary.images && diary.images.length > 0">
        <img 
          v-for="(img, index) in diary.images" 
          :key="index"
          :src="getImageUrl(img.imageUrl)"
          class="card-image"
          loading="lazy"
          @click="handlePreview(index)"
          @error="handleImageError"
        >
      </template>
      <img 
        v-else
        :src="defaultImage"
        class="card-image"
        loading="lazy"
        @error="handleImageError"
      >
      <video 
        v-if="diary.videoUrl"
        :src="diary.videoUrl"
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
      <div class="diary-info">
        <h3 class="title">{{ diary.title }}</h3>
        <p class="content">{{ diary.content }}</p>
        <div class="meta">
          <span class="author">{{ diary.author?.username || '未知用户' }}</span>
          <span class="date">{{ formatDate(diary.createdAt) }}</span>
        </div>
      </div>
      <div class="action-bar">
        <like-button :count="getCurrentLikeCount" :is-liked="getCurrentLikeStatus" @click="handleLike"/>
        <comment-button :count="diary.comments?.length || 0" @click="openComment"/>
        <share-button @click="handleShare"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import UserAvatar from '@/components/common/display/UserAvatar.vue'
import { useDiaryStore } from '@/stores/diaryStore'
import { useUserStore } from '@/stores/userStore'
import LikeButton from '@/components/common/buttons/LikeButton.vue'
import CommentButton from '@/components/common/buttons/CommentButton.vue'
import ShareButton from '@/components/common/buttons/ShareButton.vue'
import { useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'

const defaultImage = '/images/diaries/default.jpg'
const router = useRouter()
const diaryStore = useDiaryStore()
const userStore = useUserStore()

const forbiddenSelectors = ['.action-bar', '.view-count', 'button', 'a','svg', 'path']
// 添加卡片点击处理
const handleCardClick = async (event) => {
  console.log('尝试跳转到日记:', props.diary.id)
  const forbiddenElements = ['.action-bar', '.view-count', 'button', 'a', 'svg', 'path']
  const shouldPrevent = forbiddenElements.some(selector => 
    event.target.closest(selector)
  )

  if (!shouldPrevent) {
    try {
      console.log('正在增加浏览量...')
      await diaryStore.incrementViews(props.diary.id)
      console.log('浏览量增加成功')
      router.push(`/diary/${props.diary.id}`)
    } catch (error) {
      console.error('增加浏览量失败:', error)
      ElMessage.error('增加浏览量失败，请稍后重试')
      // 即使增加浏览量失败，也继续跳转到详情页
      router.push(`/diary/${props.diary.id}`)
    }
  }
}

const props = defineProps({
  diary: {
    type: Object,
    required: true,
    validator(value) {
      console.log('Diary data:', value)
      console.log('Diary images:', value.images)
      return !!value.id // 必须有id字段
    }
  }
})

const formatDate = (dateString) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm')
}

// 获取当前日记的最新点赞状态和数量
const getCurrentLikeStatus = computed(() => {
  // 优先从 store 中获取最新状态
  const storeDiary = diaryStore.diaries.find(d => d.id === props.diary.id)
  if (storeDiary) {
    return storeDiary.isLiked || false
  }
  // 如果 store 中没有，则使用 props 中的状态
  return props.diary.isLiked || false
})

const getCurrentLikeCount = computed(() => {
  // 优先从 store 中获取最新数量
  const storeDiary = diaryStore.diaries.find(d => d.id === props.diary.id)
  if (storeDiary) {
    return storeDiary.likes || 0
  }
  // 如果 store 中没有，则使用 props 中的数量
  return props.diary.likes || 0
})

const emit = defineEmits(['update:diary'])

const handleLike = async () => {
  try {
    if (!userStore.user) {
      ElMessage.warning('请先登录后再点赞')
      return
    }
    
    // 使用 store 的点赞方法
    const result = await diaryStore.toggleLike(props.diary.id)
    if (result !== null) {
      // 重新检查点赞状态以更新UI
      await diaryStore.checkLikeStatus(props.diary.id)
      
      // 更新本地日记数据
      const updatedDiary = {
        ...props.diary,
        likes: diaryStore.currentDiary?.likes || props.diary.likes,
        isLiked: diaryStore.currentDiary?.isLiked || props.diary.isLiked
      }
      emit('update:diary', updatedDiary)
      
      // 根据当前状态显示不同的消息
      const isLiked = updatedDiary.isLiked
      if (isLiked) {
        ElMessage.success('点赞成功！')
      } else {
        ElMessage.success('已取消点赞')
      }
      
      // 触发日记点赞状态变化事件，通知收藏页面更新
      window.dispatchEvent(new CustomEvent('diary-like-updated', {
        detail: {
          diaryId: props.diary.id,
          action: isLiked ? 'added' : 'removed',
          isLiked: isLiked
        }
      }))
    }
  } catch (error) {
    console.error('点赞失败:', error)
    
    // 根据错误类型显示不同的消息
    if (error.message.includes('已经点赞过')) {
      ElMessage.warning('您已经点赞过这个日记了')
    } else if (error.message.includes('还没有点赞过')) {
      ElMessage.warning('您还没有点赞过这个日记')
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

const handleShare = () => {
  // 处理分享逻辑
}

const openComment = () => {
  router.push({
    path: `/diary/${props.diary.id}`,
    hash: '#comments'
  })
}

const handlePreview = (index) => {
  // 处理图片预览逻辑
}

const getImageUrl = (url) => {
  if (!url) return '/images/diaries/default.jpg'
  if (url.startsWith('http')) return url
  return `http://localhost:9090${url}`
}

const handleImageError = (e) => {
  e.target.src = defaultImage
}

onMounted(() => {
  console.log('DiaryCard mounted')
  console.log('Default image path:', defaultImage)
})
</script>

<style lang="scss" scoped>
.diary-card {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  width: 280px;
  margin: 8px;
  height: fit-content;
  min-height: 400px; /* 确保最小高度一致 */
  
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
    cursor: zoom-in;
    transition: transform 0.3s ease;
  }
  
  &:hover .card-image {
    transform: scale(1.05);
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
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 200px; /* 确保内容区域最小高度 */
  
  .title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 12px;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.6em; /* 确保标题高度一致 */
  }
  
  .content {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    margin-bottom: 16px;
    text-overflow: ellipsis;
    max-height: 4.8em; /* 3行文本的高度 */
    word-break: break-word;
    font-size: 14px;
    flex: 1; /* 让内容区域占据剩余空间 */
    min-height: 4.8em; /* 确保内容区域最小高度 */
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .author {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 500;
    }
    
    .date {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
    }
  }
}

.action-bar {
  display: flex;
  gap: 24px;
  margin-top: auto; /* 让操作栏始终在底部 */
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}
</style>