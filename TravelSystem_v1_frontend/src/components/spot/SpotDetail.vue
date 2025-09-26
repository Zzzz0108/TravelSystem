<template>
    <div class="spot-detail">
      <!-- 顶部图片区域 -->
      <div class="hero-section">
        <div class="hero-image-container">
          <img 
            :src="getImageUrl(spotDetail?.image) || '/images/placeholder.jpg'" 
            :alt="spotDetail?.name"
            class="hero-image"
            @error="handleImageError"
          >
          <div class="hero-overlay">
            <div class="hero-content">
              <h1 class="spot-title">{{ spotDetail?.name || '加载中...' }}</h1>
              <div class="spot-meta">
                <div class="location-info">
                  <svg class="location-icon" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
                  </svg>
                  <span>{{ spotDetail?.city || '未知城市' }}</span>
                </div>
                <div class="type-badge">
                  {{ getTypeLabel(spotDetail?.type) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 快速操作按钮 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="goToNavigation">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            去这里
          </button>
          
          <button class="action-btn secondary" @click="goToDiaries">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            相关日记
          </button>
          
          <favorite-button 
            :spot-id="spotId"
            :initial-favorited="isFavorite"
            class="favorite-btn"
          />
        </div>
      </div>
  
      <!-- 主要内容区域 -->
      <div class="main-content">
        <div class="content-grid">
          <!-- 左侧信息面板 -->
          <div class="info-panel">
            <div class="info-card">
              <h3 class="card-title">基本信息</h3>
              <div class="info-list">
                <div class="info-item">
                  <span class="label">景点名称</span>
                  <span class="value">{{ spotDetail?.name || '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">所在城市</span>
                  <span class="value">{{ spotDetail?.city || '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">景点类型</span>
                  <span class="value">{{ getTypeLabel(spotDetail?.type) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">热度指数</span>
                  <span class="value">{{ spotDetail?.popularity || 0 }}</span>
                </div>
                
              </div>
            </div>
  
            <div class="info-card">
              <h3 class="card-title">统计信息</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ relatedDiaries.length }}</div>
                  <div class="stat-label">相关日记</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ spotDetail?.views || 0 }}</div>
                  <div class="stat-label">浏览次数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ spotDetail?.favorites || 0 }}</div>
                  <div class="stat-label">收藏人数</div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 右侧内容区域 -->
          <div class="content-panel">
            <!-- 景点描述 -->
            <div class="content-card">
              <h3 class="card-title">景点介绍</h3>
              <div class="description">
                <p v-if="spotDetail?.description">
                  {{ spotDetail.description }}
                </p>
                <p v-else class="placeholder-text">
                  暂无景点介绍，欢迎添加详细描述...
                </p>
              </div>
            </div>
  
            <!-- 相关日记 -->
            <div class="content-card">
              <div class="card-header">
                <h3 class="card-title">相关日记</h3>
                <button class="view-all-btn" @click="goToDiaries">
                  查看全部
                  <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              
              <div v-if="loading" class="loading-state">
                <p>加载中...</p>
              </div>
              <div v-else-if="relatedDiaries.length === 0" class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <p>暂无相关日记</p>
                <button class="create-diary-btn" @click="createDiary">
                  写一篇日记
                </button>
              </div>
              <div v-else class="diaries-grid">
                <div 
                  v-for="diary in relatedDiaries.slice(0, 3)" 
                  :key="diary.id"
                  class="diary-preview"
                  @click="viewDiary(diary.id)"
                >
                  <div class="diary-image">
                    <img 
                      :src="getImageUrl(diary.images?.[0]?.imageUrl || diary.images?.[0])" 
                      :alt="diary.title"
                      @error="handleImageError"
                    >
                  </div>
                  <div class="diary-content">
                    <h4 class="diary-title">{{ diary.title }}</h4>
                    <p class="diary-excerpt">{{ diary.content ? diary.content.substring(0, 50) + '...' : '暂无内容描述' }}</p>
                    <div class="diary-meta">
                      <span class="author">{{ diary.author?.username || '未知作者' }}</span>
                      <span class="date">{{ formatDate(diary.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- 用户评价 -->
            <div class="content-card">
              <h3 class="card-title">用户评价</h3>
              <div v-if="!userStore.user" class="login-prompt">
                <p>登录后可以查看和发表评价</p>
                <button class="login-btn" @click="goToLogin">立即登录</button>
              </div>
              <div v-else class="rating-section">
                <div class="rating-input">
                  <span class="rating-label">我的评分：</span>
                  <el-rate 
                    v-model="userRating" 
                    :max="5" 
                    @change="handleRating"
                  />
                  <button 
                    v-if="hasRated" 
                    class="delete-rating-btn"
                    @click="deleteRating"
                  >
                    删除评分
                  </button>
                </div>
                <div class="rating-stats">
                  <div class="average-rating">
                    <span class="label">平均评分：</span>
                    <span class="value">{{ spotDetail?.averageRating?.toFixed(1) || '暂无' }}</span>
                  </div>
                  <div class="rating-count">
                    <span class="label">评价人数：</span>
                    <span class="value">{{ spotDetail?.ratingCount || 0 }}人</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSpotStore } from '@/stores/spotStore'
  import { useDiaryStore } from '@/stores/diaryStore'
  import { useUserStore } from '@/stores/userStore'
import FavoriteButton from '@/components/common/buttons/FavoriteButton.vue'
import { ElMessage } from 'element-plus'
  
  const route = useRoute()
  const router = useRouter()
  const spotStore = useSpotStore()
  const diaryStore = useDiaryStore()
  const userStore = useUserStore()
  
  // 状态管理
  const spotId = computed(() => parseInt(route.params.id))
  const loading = ref(true)
  const spotDetail = ref(null)
  const relatedDiaries = ref([])
  const userRating = ref(0)
  const hasRated = ref(false)
  
  // 计算属性
  const isFavorite = computed(() => {
    if (!spotDetail.value?.id) return false
    return spotStore.favoriteSpots.some(s => s.id === spotDetail.value.id)
  })
  
  // 获取景点详情
  const fetchSpotDetail = async () => {
    try {
      loading.value = true
      
      // 确保收藏列表已加载
      if (userStore.user && spotStore.favoriteSpots.length === 0) {
        await spotStore.fetchFavoriteSpots()
      }
      
      const data = await spotStore.fetchSpotById(spotId.value)
      if (data) {
        spotDetail.value = data
        // 拉取评分汇总
        const ratings = await spotStore.fetchSpotRatings(spotId.value)
        if (ratings) {
          spotDetail.value.averageRating = ratings.averageRating
          spotDetail.value.ratingCount = ratings.ratingCount
        }
        
        // 拉取收藏人数
        const favoriteCount = await spotStore.fetchFavoriteCount(spotId.value)
        if (favoriteCount !== null) {
          spotDetail.value.favorites = favoriteCount
        }
        
        // 初始化用户评分状态
        if (userStore.user && data.userRating !== null && data.userRating !== undefined && data.userRating > 0) {
          userRating.value = data.userRating
          hasRated.value = true
          console.log('从景点详情获取到用户评分:', data.userRating)
        } else {
          userRating.value = 0
          hasRated.value = false
          console.log('景点详情中没有用户评分，设置为默认值')
        }
      } else {
        spotDetail.value = null
      }
      // 获取相关日记
      await fetchRelatedDiaries()
      // 获取用户评分（如果景点详情中没有用户评分，尝试获取）
      if (userStore.user && spotDetail.value) {
        if (spotDetail.value.userRating === null || spotDetail.value.userRating === undefined || spotDetail.value.userRating === 0) {
          console.log('景点详情中没有用户评分，尝试获取用户评分')
        await fetchUserRating()
        } else {
          console.log('景点详情中已有用户评分:', spotDetail.value.userRating)
        }
      }
    } catch (error) {
    } finally {
      loading.value = false
    }
  }
  
  // 获取相关日记
  const fetchRelatedDiaries = async () => {
    try {
      // 使用景点名称（destination）进行搜索，而不是城市
      if (spotDetail.value?.name) {
        console.log('搜索相关日记，景点名称:', spotDetail.value.name)
        await diaryStore.searchDiaries(spotDetail.value.name, 'destination')
        relatedDiaries.value = Array.isArray(diaryStore.diaries) ? diaryStore.diaries : []
        console.log('找到相关日记数量:', relatedDiaries.value.length)
      } else {
        console.log('景点名称不存在，无法搜索相关日记')
        relatedDiaries.value = []
      }
    } catch (error) {
      console.error('搜索相关日记失败:', error)
      relatedDiaries.value = []
    }
  }
  
  // 获取用户评分
  const fetchUserRating = async () => {
    try {
      console.log('尝试获取用户评分，景点ID:', spotId.value)
      // 从景点详情中获取用户评分
      if (spotDetail.value?.userRating !== null && spotDetail.value?.userRating !== undefined && spotDetail.value?.userRating > 0) {
        userRating.value = spotDetail.value.userRating
        hasRated.value = true
        console.log('从景点详情获取到用户评分:', spotDetail.value.userRating)
      } else {
        // 如果景点详情中没有用户评分，尝试从评分统计中推断
        const ratings = await spotStore.fetchSpotRatings(spotId.value)
        if (ratings && ratings.userRating !== null && ratings.userRating !== undefined && ratings.userRating > 0) {
          userRating.value = ratings.userRating
          hasRated.value = true
          console.log('从评分统计获取到用户评分:', ratings.userRating)
        } else {
      userRating.value = 0
      hasRated.value = false
          console.log('未找到用户评分，设置为默认值')
        }
      }
    } catch (error) {
      console.error('获取用户评分失败:', error)
      userRating.value = 0
      hasRated.value = false
    }
  }
  
  // 处理评分
  const handleRating = async (rating) => {
    try {
      console.log('开始评分，景点ID:', spotId.value, '评分:', rating)
      console.log('当前用户:', userStore.user?.username)
      console.log('当前景点详情:', spotDetail.value)
      
      const result = await spotStore.rateSpot(spotId.value, rating)
      console.log('评分接口返回结果:', result)
      
      if (result) {
      userRating.value = rating
      hasRated.value = true
        ElMessage.success('评分成功！')
        console.log('评分成功，更新本地状态')
        
      // 刷新景点详情
      await fetchSpotDetail()
      }
    } catch (error) {
      console.error('评分失败:', error)
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      ElMessage.error(error.message || '评分失败，请稍后重试')
    }
  }
  
  // 删除评分
  const deleteRating = async () => {
    try {
      console.log('开始删除评分，景点ID:', spotId.value)
      // 通过设置评分为0来删除评分
      const result = await spotStore.rateSpot(spotId.value, 0)
      if (result) {
      userRating.value = 0
      hasRated.value = false
        ElMessage.success('评分已删除')
      // 刷新景点详情
      await fetchSpotDetail()
      }
    } catch (error) {
      console.error('删除评分失败:', error)
      ElMessage.error(error.message || '删除评分失败，请稍后重试')
    }
  }
  
  // 导航功能
  const goToNavigation = () => {
    // TODO: 跳转导航页面，传递目的地信息
    router.push('/navigation')
  }
  
  // 相关日记
  const goToDiaries = () => {
    router.push({
      path: '/diary',
      query: {
        destination: spotDetail.value?.name  // 使用景点名称而不是城市
      }
    })
  }
  
  // 查看日记详情
  const viewDiary = (diaryId) => {
    router.push(`/diary/${diaryId}`)
  }
  
  // 创建日记
  const createDiary = () => {
    router.push({
      path: '/diary/create',
      query: {
        destination: spotDetail.value?.name,  // 使用景点名称而不是城市
        spotId: spotDetail.value?.id
      }
    })
  }
  
  // 去登录
  const goToLogin = () => {
    router.push('/login')
  }
  
  // 工具函数
  const getTypeLabel = (type) => {
    const typeMap = {
      'SCENIC_AREA': '景区',
      'UNIVERSITY': '学校',
      'MUSEUM': '博物馆',
      'PARK': '公园',
      'TEMPLE': '寺庙',
      'OTHER': '其他'
    }
    return typeMap[type] || '未知类型'
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }
  
  // 图片URL处理函数（参考日记组件的逻辑）
  const getImageUrl = (url) => {
    if (!url) return '/images/diaries/default.jpg'
    if (url.startsWith('http')) return url
    return `http://localhost:9090${url}`
  }
  
  // 图片加载失败处理
  const handleImageError = (e) => {
    console.log('图片加载失败:', e.target.src)
    e.target.src = '/images/diaries/default.jpg'
  }
  
  // 生命周期
  onMounted(async () => {
    if (Number.isFinite(spotId.value) && spotId.value > 0) {
      await fetchSpotDetail()
    }
    
    // 监听全局收藏状态变化事件
    window.addEventListener('favorite-updated', handleFavoriteUpdated)
  })
  
  onUnmounted(() => {
    window.removeEventListener('favorite-updated', handleFavoriteUpdated)
  })
  
  // 监听收藏状态变化
  const handleFavoriteUpdated = async (event) => {
    const { spotId: updatedSpotId, isFavorited, action } = event.detail
    if (updatedSpotId === spotId.value) {
      // 强制刷新收藏状态
      await spotStore.fetchFavoriteSpots()
      // 重新获取收藏人数
      const favoriteCount = await spotStore.fetchFavoriteCount(spotId.value)
      if (favoriteCount !== null) {
        spotDetail.value.favorites = favoriteCount
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .spot-detail {
    min-height: 100vh;
    background: transparent;
  }
  
  .hero-section {
    position: relative;
    margin-bottom: 40px;
  }
  
  .hero-image-container {
    position: relative;
    height: 400px;
    overflow: hidden;
    border-radius: 20px;
    margin: 0 20px;
  }
  
  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
    display: flex;
    align-items: flex-end;
    padding: 40px;
  }
  
  .hero-content {
    color: white;
    
    .spot-title {
      font-size: 48px;
      font-weight: 700;
      margin: 0 0 16px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .spot-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .location-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        
        .location-icon {
          width: 24px;
          height: 24px;
          fill: white;
        }
      }
      
      .type-badge {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
    }
  }
  
  .quick-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: -20px;
    padding: 0 20px;
    position: relative;
    z-index: 10;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    
    .btn-icon {
      width: 20px;
      height: 20px;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    
    &.primary {
      background: rgba(0, 122, 255, 0.9);
      color: white;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(0, 122, 255, 0.5);
      
      &:hover {
        background: rgba(0, 122, 255, 1);
      }
    }
    
    &.secondary {
      background: rgba(255, 45, 85, 0.9);
      color: white;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 45, 85, 0.5);
      
      &:hover {
        background: rgba(255, 45, 85, 1);
      }
    }
  }
  
  .favorite-btn {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 16px;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: translateY(-4px);
    }
  }
  
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px 40px;
  }
  
  .content-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 40px;
  }
  
  .info-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .info-card {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    
    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin: 0 0 20px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
  
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
      }
      
      .value {
        color: white;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    
    .stat-item {
      text-align: center;
      
      .stat-number {
        font-size: 24px;
        font-weight: 700;
        color: #00d4ff;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
  
  .content-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .content-card {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    
    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin: 0 0 20px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .view-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .arrow-icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2;
    }
  }
}

.description {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  font-size: 16px;
  
  .placeholder-text {
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
  
  .empty-icon {
    width: 48px;
    height: 48px;
    fill: rgba(255, 255, 255, 0.4);
    margin-bottom: 16px;
  }
  
  p {
    margin: 8px 0 16px;
    font-size: 16px;
  }
}

.create-diary-btn {
  padding: 12px 24px;
  background: rgba(255, 45, 85, 0.8);
  border: 1px solid rgba(255, 45, 85, 0.5);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 45, 85, 1);
    transform: translateY(-2px);
  }
}

.diaries-grid {
  display: grid;
  gap: 16px;
}

.diary-preview {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  
  .diary-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .diary-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .diary-title {
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    
    .diary-excerpt {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      line-height: 1.4;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .diary-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      
      .author {
        font-weight: 500;
      }
    }
  }
}

.login-prompt {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.7);
  
  p {
    margin: 0 0 16px;
    font-size: 16px;
  }
  
  .login-btn {
    padding: 12px 24px;
    background: rgba(0, 122, 255, 0.8);
    border: 1px solid rgba(0, 122, 255, 0.5);
    border-radius: 20px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 122, 255, 1);
      transform: translateY(-2px);
    }
  }
}

.rating-section {
  .rating-input {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    
    .rating-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      font-weight: 500;
    }
    
    .delete-rating-btn {
      padding: 8px 16px;
      background: rgba(255, 45, 85, 0.6);
      border: 1px solid rgba(255, 45, 85, 0.4);
      border-radius: 16px;
      color: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 45, 85, 0.8);
      }
    }
  }
  
  .rating-stats {
    display: flex;
    gap: 32px;
    
    .average-rating, .rating-count {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .label {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
      }
      
      .value {
        color: #00d4ff;
        font-size: 18px;
        font-weight: 700;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 300px 1fr;
    gap: 30px;
  }
  
  .hero-content .spot-title {
    font-size: 36px;
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .info-panel {
    order: 2;
  }
  
  .content-panel {
    order: 1;
  }
  
  .hero-content .spot-title {
    font-size: 32px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .hero-image-container {
    height: 300px;
    margin: 0 10px;
  }
  
  .hero-content {
    padding: 20px;
    
    .spot-title {
      font-size: 28px;
      margin-bottom: 12px;
    }
    
    .spot-meta {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  }
  
  .main-content {
    padding: 0 10px 20px;
  }
  
  .info-card, .content-card {
    padding: 20px;
  }
  
  .diary-preview {
    flex-direction: column;
    gap: 12px;
    
    .diary-image {
      width: 100%;
      height: 120px;
    }
  }
  
  .rating-section .rating-input {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .rating-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>