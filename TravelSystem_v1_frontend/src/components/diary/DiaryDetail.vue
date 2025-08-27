<template>
  <div class="diary-detail" v-if="diaryStore.currentDiary">
    <div class="media-container">
      <template v-if="diaryStore.currentDiary.images && diaryStore.currentDiary.images.length > 0">
        <img 
          v-for="(img, index) in diaryStore.currentDiary.images" 
          :key="index"
          :src="getImageUrl(img.imageUrl)"
          class="detail-image"
          loading="lazy"
          @click="handlePreview(index)"
          @error="handleImageError"
        >
      </template>
      <img 
        v-else-if="!diaryStore.currentDiary.videoUrl"
        src="/images/diaries/default.jpg"
        class="detail-image"
        loading="lazy"
      >
      <video 
        v-if="diaryStore.currentDiary.videoUrl"
        :src="getImageUrl(diaryStore.currentDiary.videoUrl)"
        class="detail-video"
        controls
        @error="handleVideoError"
        @loadeddata="handleVideoLoaded"
      ></video>
    </div>
    
    <div class="content">
      <h1 class="title">{{ diaryStore.currentDiary.title }}</h1>
      <div class="meta">
        <user-avatar 
          :name="diaryStore.currentDiary.author?.username || '未知用户'" 
          :src="diaryStore.currentDiary.author?.avatar || '/images/diaries/default.jpg'"
        />
        <div class="info">
          <p class="username">{{ diaryStore.currentDiary.author?.username || '未知用户' }}</p>
          <p class="date">{{ formatDate(diaryStore.currentDiary.createdAt) }}</p>
        </div>
      </div>
      <div class="text-content">{{ diaryStore.currentDiary.content }}</div>
      
      <div class="action-bar">
        <like-button 
          :count="diaryStore.currentDiary.likes || 0" 
          :is-liked="diaryStore.currentDiary.isLiked || false"
          @click="handleLike"
        />
        <comment-button :count="getCommentCount()" @click="scrollToComments"/>
        <div class="rating-section">
          <el-rate
            v-model="currentRating"
            :max="5"
            :disabled="!userStore.user"
            show-score
            text-color="#ff9900"
            score-template="{value} 分"
            @change="handleRating"
          />
          
          <!-- 评分信息显示 -->
          <div class="rating-info">
            <span class="average-rating">
              平均评分: {{ diaryStore.currentDiary.averageRating?.toFixed(1) || '暂无' }}
            </span>
            <span class="rating-count">
              ({{ diaryStore.currentDiary.ratingCount || 0 }}人评分)
            </span>
          </div>
          
          <!-- 删除评分按钮 -->
          <button 
            v-if="userStore.user && diaryStore.currentDiary.hasRated"
            class="delete-rating-btn"
            @click="handleDeleteRating"
            :disabled="loading"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            删除评分
          </button>
        </div>
        <share-button @click="handleShare"/>
      </div>
      
      <div class="comments-section" id="comments">
        <h2>评论 ({{ getCommentCount() }})</h2>
        
        <!-- 使用原生HTML重新设计评论输入框 -->
        <div class="comment-input-card">
          <div class="comment-input">
            <div class="user-avatar">
              <img 
                :src="userStore.user?.avatar || '/images/diaries/default.jpg'"
                :alt="userStore.user?.username || '用户'"
                class="avatar-img"
              />
              <span v-if="!userStore.user?.avatar" class="avatar-text">
                {{ userStore.user?.username?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </div>
            <div class="input-container">
              <textarea
                v-model="newComment"
                placeholder="分享你的想法..."
                maxlength="500"
                class="comment-textarea"
                rows="3"
              ></textarea>
              <div class="input-actions">
                <button 
                  class="comment-submit-btn"
                  :disabled="!newComment.trim() || !userStore.user"
                  @click="submitComment"
                >
                  <span v-if="loading" class="loading-spinner"></span>
                  {{ userStore.user ? '发布评论' : '请先登录' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用原生HTML重新设计评论列表 -->
        <div class="comment-list">
          <div 
            v-for="comment in diaryStore.comments || []" 
            :key="comment.id" 
            class="comment-card"
          >
            <div class="comment">
              <div class="user-avatar">
                <img 
                  :src="comment.author?.avatar"
                  :alt="comment.author?.username || '用户'"
                  class="avatar-img"
                />
                <span v-if="!comment.author?.avatar" class="avatar-text">
                  {{ comment.author?.username?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="username">{{ comment.author?.username || '未知用户' }}</span>
                  <span class="date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text">{{ comment.content }}</p>
                <div class="comment-actions">
                  <button class="action-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    回复
                  </button>
                  <button class="action-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    点赞
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <p>加载中...</p>
  </div>
  <!-- 自定义确认对话框 -->
  <div v-if="showDeleteConfirm" class="custom-confirm-dialog">
    <div class="confirm-overlay" @click="cancelDelete"></div>
    <div class="confirm-content">
      <div class="confirm-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="warning-icon">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <h3>确认删除</h3>
      </div>
      <div class="confirm-body">
        <p>确定要删除您的评分吗？</p>
        <p class="confirm-note">删除后无法恢复</p>
      </div>
      <div class="confirm-actions">
        <button class="btn-cancel" @click="cancelDelete">取消</button>
        <button class="btn-confirm" @click="confirmDelete" :disabled="loading">确定删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useDiaryStore } from '@/stores/diaryStore'
import { useUserStore } from '@/stores/userStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserAvatar from '@/components/common/display/UserAvatar.vue'
import LikeButton from '@/components/common/buttons/LikeButton.vue'
import CommentButton from '@/components/common/buttons/CommentButton.vue'
import ShareButton from '@/components/common/buttons/ShareButton.vue'

const route = useRoute()
const router = useRouter()
const diaryStore = useDiaryStore()
const userStore = useUserStore()
const newComment = ref('')
const loading = ref(false)
const currentRating = ref(0)
const showDeleteConfirm = ref(false)

const formatDate = (dateString) => {
  try {
    if (!dateString) return '未知时间'
    // 尝试解析日期字符串
    const date = new Date(dateString)
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('无效的日期格式:', dateString)
      return '未知时间'
    }
    return format(date, 'yyyy-MM-dd HH:mm')
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '未知时间'
  }
}

onMounted(async () => {
  try {
    const diaryId = parseInt(route.params.id)
    console.log('正在获取日记:', diaryId)
    
    if (isNaN(diaryId)) {
      console.error('无效的日记ID:', route.params.id)
      ElMessage.error('无效的日记ID')
      return
    }
    
    const diary = await diaryStore.fetchDiaryById(diaryId)
    console.log('获取到的日记:', diary)
    console.log('Store中的当前日记:', diaryStore.currentDiary)
    
    if (!diary) {
      console.error('获取日记失败，返回null')
      ElMessage.error('获取日记失败，请刷新页面重试')
      return
    }
    
    // 获取评论，添加分页参数
    await diaryStore.fetchComments(diaryId, {
      page: 0,
      size: 100,
      sort: 'createdAt,desc'
    })
    
    // 如果用户已登录，获取用户对该日记的评分和点赞状态
    if (userStore.user) {
      // 并行获取用户评分和评分状态
      const [userRating, hasRated] = await Promise.all([
        diaryStore.getUserRating(diaryId),
        diaryStore.checkUserRated(diaryId)
      ])
      
      currentRating.value = userRating
      console.log('用户评分:', userRating, '是否已评分:', hasRated)
      
      // 检查点赞状态
      await diaryStore.checkLikeStatus(diaryId)
    }
  } catch (error) {
    console.error('获取日记失败:', error)
    ElMessage.error('获取日记失败，请刷新页面重试')
  }
  console.log('DiaryDetail mounted')
  console.log('Default image path:', '/images/diaries/default.jpg')
})

const handleLike = async () => {
  try {
    if (!userStore.user) {
      ElMessage.warning('请先登录后再点赞')
      return
    }
    
    // 使用新的点赞方法
    const result = await diaryStore.toggleLike(diaryStore.currentDiary.id)
    if (result !== null) {
      // 重新检查点赞状态以更新UI
      await diaryStore.checkLikeStatus(diaryStore.currentDiary.id)
      
      // 根据当前状态显示不同的消息
      const isLiked = diaryStore.currentDiary.isLiked
      if (isLiked) {
        ElMessage.success('点赞成功！')
      } else {
        ElMessage.success('已取消点赞')
      }
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

const scrollToComments = () => {
  const commentsSection = document.getElementById('comments')
  if (commentsSection) {
    commentsSection.scrollIntoView({ behavior: 'smooth' })
  }
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
  console.log('图片加载失败:', e.target.src)
  console.log('当前图片路径:', e.target.src)
  console.log('尝试加载默认图片')
  e.target.src = '/images/diaries/default.jpg'
}

const handleVideoError = (e) => {
  console.error('视频加载失败:', e)
  console.error('视频URL:', diaryStore.currentDiary.videoUrl)
  console.error('处理后的URL:', getImageUrl(diaryStore.currentDiary.videoUrl))
  console.error('视频元素:', e.target)
  console.error('错误代码:', e.target.error?.code)
  console.error('错误信息:', e.target.error?.message)
}

const handleVideoLoaded = () => {
  console.log('视频加载成功')
  console.log('视频URL:', diaryStore.currentDiary.videoUrl)
  console.log('处理后的URL:', getImageUrl(diaryStore.currentDiary.videoUrl))
  console.log('视频元素:', document.querySelector('video'))
}

const submitComment = async () => {
  if (!userStore.user || !userStore.isLogin) {
    ElMessage.warning('请先登录后再发表评论');
    return;
  }
  
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }

  if (!diaryStore.currentDiary?.id) {
    ElMessage.error('无法获取日记信息，请刷新页面重试');
    return;
  }

  try {
    loading.value = true;
    console.log('开始提交评论，日记ID:', diaryStore.currentDiary.id);
    console.log('评论内容:', newComment.value.trim());
    console.log('用户信息:', userStore.user);
    
    const newCommentData = await diaryStore.createComment(diaryStore.currentDiary.id, newComment.value.trim());
    console.log('评论创建成功，返回数据:', newCommentData);
    
    if (newCommentData) {
      // 清空输入框
      newComment.value = '';
      
      // 重新获取评论列表以更新显示
      await diaryStore.fetchComments(diaryStore.currentDiary.id, {
        page: 0,
        size: 100,
        sort: 'createdAt,desc'
      });
      
      // 更新日记的评论计数 - 使用实际获取的评论数量
      if (diaryStore.currentDiary) {
        diaryStore.currentDiary.commentsCount = diaryStore.comments?.length || 0;
      }
      
      ElMessage.success('评论发布成功');
    }
  } catch (error) {
    console.error('发布评论失败:', error);
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      stack: error.stack
    });
    
    // 根据错误类型提供不同的用户反馈
    if (error.message.includes('响应数据为空')) {
      ElMessage.warning('评论可能已提交，请刷新页面查看');
    } else if (error.message.includes('响应数据格式不完整')) {
      ElMessage.warning('评论提交成功，但数据格式异常，请刷新页面查看');
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限发表评论，请检查登录状态');
    } else if (error.message.includes('网络错误') || error.message.includes('请求失败')) {
      ElMessage.error('网络连接失败，请检查网络后重试');
    } else {
      ElMessage.error(error.message || '评论发布失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

const handleRating = async (rating) => {
  if (!userStore.user) {
    ElMessage.warning('请先登录后再评分')
    return
  }
  
  if (!userStore.isLogin) {
    ElMessage.warning('登录已过期，请重新登录')
    router.push('/login')
    return
  }

  try {
    loading.value = true
    
    // 如果用户已经评分过，询问是否要更新
    if (diaryStore.currentDiary.hasRated && diaryStore.currentDiary.userRating === rating) {
      ElMessage.info('您已经给出过这个评分了')
      return
    }
    
    const updatedDiary = await diaryStore.rateDiary(diaryStore.currentDiary.id, rating)
    if (updatedDiary) {
      // 更新当前评分
      currentRating.value = rating
      
      // 显示相应的成功消息
      if (diaryStore.currentDiary.hasRated) {
        ElMessage.success(`评分已更新为 ${rating} 星`)
      } else {
        ElMessage.success(`评分成功！您给出了 ${rating} 星`)
      }
    } else {
      ElMessage.error('评分失败，请稍后重试')
    }
  } catch (error) {
    console.error('评分失败:', error)
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限进行评分')
    } else {
      ElMessage.error('评分失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 删除用户评分
const handleDeleteRating = async () => {
  if (!userStore.user) {
    ElMessage.warning('请先登录后再操作')
    return
  }
  
  // 显示自定义确认对话框
  showDeleteConfirm.value = true
}

const getCommentCount = () => {
  // 优先使用实际获取的评论列表长度，这样更准确
  const actualCount = diaryStore.comments?.length || 0;
  const diaryCount = diaryStore.currentDiary?.commentsCount || 0;
  
  console.log('实际评论列表长度:', actualCount);
  console.log('日记中的评论计数:', diaryCount);
  
  // 返回实际获取的评论数量，这样最准确
  return actualCount;
}

const confirmDelete = async () => {
  try {
    loading.value = true;
    await diaryStore.deleteUserRating(diaryStore.currentDiary.id);
    currentRating.value = 0;
    ElMessage.success('评分已删除');
  } catch (error) {
    console.error('删除评分失败:', error);
    ElMessage.error('删除评分失败，请稍后重试');
  } finally {
    loading.value = false;
    showDeleteConfirm.value = false;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
};
</script>

<style lang="scss" scoped>
.diary-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.media-container {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  
  .detail-image {
    width: 100%;
    height: auto;
    object-fit: cover;
    cursor: zoom-in;
  }
  
  .detail-video {
    width: 100%;
    height: auto;
  }
}

.content {
  .title {
    font-size: 24px;
    margin: 0 0 16px;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .text-content {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
    margin-bottom: 24px;
  }
}

.action-bar {
  display: flex;
  gap: 24px;
  margin: 24px 0;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 24px;
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.rating-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  min-width: 120px;
}

.average-rating {
  font-weight: 600;
  color: #ff9900;
}

.rating-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.delete-rating-btn {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
  padding: 6px 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 77, 79, 0.2);
    border-color: rgba(255, 77, 79, 0.5);
    color: #ff4d4f;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

.comments-section {
  margin-top: 32px;
  
  h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #ffffff;
  }
  
  .comment-input-card {
    margin-bottom: 24px;
    border-radius: 12px;
    border: none;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px;
  }

  .comment-input {
    display: flex;
    gap: 16px;
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      
      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-text {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 122, 255, 0.8);
        color: #ffffff;
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .input-container {
      flex: 1;
      
      .comment-textarea {
        width: 100%;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
        line-height: 1.6;
        resize: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        transition: all 0.3s;
        outline: none;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        &:focus {
          border-color: rgba(0, 122, 255, 0.6);
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
        }
      }
    }
    
    .input-actions {
      margin-top: 12px;
      display: flex;
      justify-content: flex-end;
      
      .comment-submit-btn {
        background: rgba(0, 122, 255, 0.8);
        color: #ffffff;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
        
        &:hover:not(:disabled) {
          background: rgba(0, 122, 255, 1);
          transform: translateY(-1px);
        }
        
        &:disabled {
          background: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      }
    }
  }

  .comment-list {
    .comment-card {
      margin-bottom: 16px;
      border-radius: 12px;
      border: none;
      transition: all 0.3s;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }
    }
    
    .comment {
      display: flex;
      gap: 16px;
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-text {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 122, 255, 0.8);
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
        }
      }
      
      .comment-content {
        flex: 1;
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .username {
            font-weight: 600;
            color: #ffffff;
          }
          
          .date {
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
          }
        }
        
        .text {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 12px;
        }
        
        .comment-actions {
          display: flex;
          gap: 16px;
          
          .action-btn {
            background: none;
            border: none;
            padding: 0;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;
            transition: all 0.3s;
            
            &:hover {
              color: #ffffff;
            }
            
            svg {
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 自定义确认对话框样式 */
.custom-confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: auto;
}

.confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: -1;
}

.confirm-content {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  width: 90%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  z-index: 1;
  color: #ffffff;
  font-family: 'Segoe UI', 'Arial', sans-serif;
  animation: dialogSlideIn 0.3s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px 16px 0 0;
}

.confirm-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #ff9900;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.warning-icon {
  color: #ff9900;
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.confirm-body {
  padding: 24px;
  text-align: center;
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.confirm-body p {
  margin: 0 0 8px 0;
}

.confirm-note {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12px;
  font-style: italic;
}

.confirm-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0 0 16px 16px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    color: #ff4d4f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-confirm {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.9), rgba(0, 122, 255, 0.8));
  color: #ffffff;
  border: 1px solid rgba(0, 122, 255, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(0, 122, 255, 1), rgba(0, 122, 255, 0.9));
    border-color: rgba(0, 122, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>