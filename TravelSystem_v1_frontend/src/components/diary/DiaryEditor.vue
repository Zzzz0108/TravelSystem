<template>
  <div class="editor-container">
    <div class="editor-card">
      <div class="editor-header">
        <div class="header-content">
          <h2 class="editor-title">撰写新游记</h2>
          <p class="editor-subtitle">分享你的精彩旅行故事</p>
        </div>
        <div class="header-actions">
          <button 
            @click="handleCancel"
            class="cancel-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            取消
          </button>
          <button 
            @click="handlePublish"
            :disabled="loading"
            class="publish-btn"
          >
            <svg v-if="!loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
            <span v-if="loading" class="loading-spinner"></span>
            <span>{{ loading ? '发布中...' : '发布游记' }}</span>
          </button>
        </div>
      </div>
      
      <div class="editor-main">
        <!-- 标题输入 -->
        <div class="input-section">
          <div class="input-group">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
            </div>
            <input
              v-model="form.title"
              type="text"
              placeholder="给你的游记起个吸引人的标题..."
              class="title-input"
            />
          </div>
        </div>
        
        <!-- 内容编辑 -->
        <div class="content-editor">
          <div class="editor-toolbar">
            <div class="toolbar-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span>内容编辑</span>
            </div>
          </div>
          
          <textarea
            v-model="form.content"
            placeholder="分享你的旅行故事，描述你看到的风景、遇到的人和事，以及你的感受..."
            class="content-input"
            rows="12"
          ></textarea>
          
          <!-- 多媒体上传区域 -->
          <div class="upload-section">
            <div class="upload-header">
              <h3 class="upload-title">添加照片和视频</h3>
              <p class="upload-hint">让你的游记更加生动有趣</p>
            </div>
            
            <file-uploader @files-selected="handleFiles"/>
            
            <!-- 已上传内容预览 -->
            <div class="media-preview" v-if="form.media.length > 0">
              <div class="preview-header">
                <span class="preview-count">{{ form.media.length }} 个文件</span>
                <button class="clear-all-btn" @click="clearAllMedia">
                  清空全部
                </button>
              </div>
              
              <div class="media-grid">
                <div 
                  v-for="(file, index) in form.media"
                  :key="index"
                  class="media-item"
                >
                  <div class="media-content">
                    <img 
                      v-if="file.type.startsWith('image')"
                      :src="file.url"
                      class="preview-image"
                    >
                    <video 
                      v-else
                      :src="file.url"
                      controls
                      class="preview-video"
                    ></video>
                  </div>
                  
                  <div class="media-actions">
                    <button class="action-btn move-btn" @click="moveMedia(index, -1)" :disabled="index === 0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15,18 9,12 15,6"/>
                      </svg>
                    </button>
                    <button class="action-btn delete-btn" @click="removeMedia(index)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                    <button class="action-btn move-btn" @click="moveMedia(index, 1)" :disabled="index === form.media.length - 1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="media-info">
                    <span class="file-name">{{ file.file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.file.size) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="editor-footer">
          <div class="footer-section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3>选择位置</h3>
            </div>
            <location-picker @update:modelValue="handleLocationSelect"/>
            
            <!-- 调试信息：显示选择的位置详情 -->
            <div v-if="form.destination" class="debug-info" style="margin-top: 12px; padding: 12px; background: rgba(0, 122, 255, 0.1); border-radius: 8px; font-size: 14px;">
              <div><strong>已选择位置：</strong></div>
              <div>景点：{{ form.destination }}</div>
              <div>城市：{{ form.city }}</div>
              <div>省份：{{ form.province }}</div>
              <div>景点ID：{{ form.spotId || '未获取' }}</div>
            </div>
          </div>
          
          <!-- 添加评分组件 -->
          <div class="footer-section" v-if="form.destination && form.city && form.province">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>景点评分</h3>
            </div>
            <star-rating
              v-model="form.rating"
              :rating-count="0"
              :show-text="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diaryStore'
import { ElMessage } from 'element-plus'
import FileUploader from '@/components/common/forms/FileUploader.vue'
import LocationPicker from '@/components/diary/components/LocationPicker.vue'
import StarRating from '@/components/common/display/StarRating.vue'

const form = ref({
  title: '',
  content: '',
  media: [],
  destination: '',  // 具体景点名称，如：故宫、宽窄巷子
  city: '',         // 城市名称，如：北京、成都
  province: '',     // 省份名称，如：北京、四川
  spotId: null,     // 景点ID
  rating: 0
})

const loading = ref(false)
const router = useRouter()
const diaryStore = useDiaryStore()

const handleLocationSelect = (locationData) => {
  if (locationData) {
    form.value.destination = locationData.name
    form.value.city = locationData.city
    form.value.province = locationData.province
    form.value.spotId = locationData.id  // 保存景点ID
    
    // 强制触发响应式更新
    form.value = { ...form.value }
  } else {
    // 清空位置信息
    form.value.destination = ''
    form.value.city = ''
    form.value.province = ''
    form.value.spotId = null  // 清空景点ID
  }
}

const handleFiles = (files) => {
  files.forEach(file => {
    // 检查是否已经存在相同的文件
    const isDuplicate = form.value.media.some(media => 
      media.file.name === file.name && 
      media.file.size === file.size
    )
    
    if (!isDuplicate) {
      const url = URL.createObjectURL(file)
      form.value.media.push({
        type: file.type,
        url: url,
        file: file
      })
    }
  })
}

const removeMedia = (index) => {
  form.value.media.splice(index, 1)
}

const clearAllMedia = () => {
  form.value.media = []
}

const moveMedia = (index, direction) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < form.value.media.length) {
    const temp = form.value.media[index]
    form.value.media[index] = form.value.media[newIndex]
    form.value.media[newIndex] = temp
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handlePublish = async () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  try {
    loading.value = true
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('content', form.value.content)
    
    if (form.value.destination && form.value.city && form.value.province) {
      formData.append('destination', form.value.destination)
      formData.append('city', form.value.city)
      formData.append('province', form.value.province)
      if (form.value.spotId) {
        formData.append('spotId', form.value.spotId)
        console.log('添加景点ID:', form.value.spotId)
      }
      if (form.value.rating > 0) {
        formData.append('spotRating', form.value.rating)
      }
      console.log('添加目的地:', form.value.destination)
      console.log('添加城市:', form.value.city)
      console.log('添加省份:', form.value.province)
      console.log('添加景点ID:', form.value.spotId)
      console.log('添加评分:', form.value.rating)
    }
    
    form.value.media.forEach((file, index) => {
      formData.append('media', file.file)
      console.log(`添加媒体文件 ${index + 1}:`, file.file.name)
    })
    
    console.log('发送请求到:', 'http://localhost:9090/api/diaries')
    console.log('请求头:', {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data'
    })
    
    // 使用 store 方法创建日记，传入 FormData
    const newDiary = await diaryStore.createDiary(formData)
    
    if (newDiary) {
      ElMessage.success('发布成功')
      router.push(`/diary/${newDiary.id}`)
    } else {
      ElMessage.error('发布失败，请重试')
    }
  } catch (error) {
    console.error('发布失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    
    // 如果是403错误，说明日记已经创建成功，只是返回了错误
    if (error.response?.status === 403) {
      ElMessage.success('发布成功')
      // 尝试从错误响应中获取日记ID
      const diaryId = error.response?.data?.id
      if (diaryId) {
        router.push(`/diary/${diaryId}`)
      } else {
        // 如果没有ID，跳转到日记列表页
        router.push('/diaries')
      }
      return
    }
    
    ElMessage.error(error.response?.data?.message || '发布失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/diary')
}
</script>

<style lang="scss" scoped>
.editor-container {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 24px;
  color: rgba(255, 255, 255, 0.9);
}

.editor-card {
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
}

.editor-header {
  background: rgba(0, 122, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-content {
    .editor-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .editor-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 16px;
  }
}

.publish-btn {
  background: rgba(0, 122, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover:not(:disabled) {
    background: rgba(0, 122, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.cancel-btn {
  background: rgba(255, 68, 68, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover:not(:disabled) {
    background: rgba(255, 68, 68, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 68, 68, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
    opacity: 0.6;
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.editor-main {
  padding: 32px;
}

.input-section {
  margin-bottom: 32px;
}

.input-group {
  position: relative;
  
  .input-icon {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
    z-index: 2;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
  
  .title-input {
    width: 100%;
    padding: 20px 20px 20px 60px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    outline: none;

    &:hover, &:focus {
      border-color: rgba(0, 122, 255, 0.6);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.content-editor {
  margin-bottom: 32px;
}

.editor-toolbar {
  margin-bottom: 20px;
  
  .toolbar-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    font-weight: 500;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.content-input {
  margin-bottom: 24px;
  padding: 24px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  outline: none;
  resize: none;

  &:hover, &:focus {
    border-color: rgba(0, 122, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}

.upload-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  
  .upload-header {
    margin-bottom: 20px;
    
    .upload-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 8px 0;
    }
    
    .upload-hint {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }
  }
}

.media-preview {
  margin-top: 24px;
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .preview-count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: 12px;
    }
    
    .clear-all-btn {
      background: none;
      border: 1px solid rgba(255, 68, 68, 0.4);
      color: rgba(255, 68, 68, 0.8);
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 68, 68, 0.1);
        border-color: rgba(255, 68, 68, 0.6);
        color: rgba(255, 68, 68, 1);
      }
    }
  }
  
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}

.media-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 122, 255, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  .media-content {
    position: relative;
    
    .preview-image, .preview-video {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }
  }
  
  .media-actions {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    
    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        transform: scale(1.1);
      }
      
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      svg {
        width: 16px;
        height: 16px;
      }
      
      &.delete-btn:hover {
        background: rgba(255, 68, 68, 0.2);
        border-color: rgba(255, 68, 68, 0.4);
        color: rgba(255, 68, 68, 1);
      }
    }
  }
  
  .media-info {
    padding: 12px;
    
    .file-name {
      display: block;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .file-size {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.editor-footer {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  .footer-section {
    margin-bottom: 32px;
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      
      .section-icon {
        color: rgba(0, 122, 255, 0.8);
        
        svg {
          width: 24px;
          height: 24px;
        }
      }
      
      h3 {
        font-size: 18px;
        color: #ffffff;
        margin: 0;
        font-weight: 600;
      }
    }
    

  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-container {
    padding: 16px;
  }
  
  .editor-header {
    padding: 24px;
    flex-direction: column;
    gap: 20px;
    text-align: center;
    
    .editor-title {
      font-size: 24px;
    }

    .header-actions {
      flex-direction: column;
      gap: 10px;
    }
  }
  
  .editor-main {
    padding: 24px;
  }
  
  .media-grid {
    grid-template-columns: 1fr;
  }
  
  .publish-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>