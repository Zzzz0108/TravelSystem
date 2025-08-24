<template>
  <div class="travel-animation-container">
    <!-- 标题区域 -->
    <div class="hero-section">
      <h1 class="hero-title">AI旅游动画生成</h1>
      <p class="hero-subtitle">上传景点照片，生成精彩旅游动画</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：上传区域 -->
      <div class="upload-section">
        <div class="section-header">
          <h2 class="section-title">照片上传</h2>
          <p class="section-subtitle">支持多张照片上传，智能生成动画</p>
        </div>
        
        <div class="upload-area" 
             @dragover.prevent 
             @drop.prevent="handleDrop"
             @click="triggerFileInput">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            accept="image/*" 
            multiple 
            class="hidden"
          >
          <div class="upload-content">
            <div class="upload-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <h3 class="upload-title">点击或拖拽上传照片</h3>
            <p class="upload-hint">支持 JPG、PNG 格式，最多可上传 10 张</p>
          </div>
        </div>
        
        <!-- 已上传照片预览 -->
        <div class="preview-section" v-if="uploadedImages.length > 0">
          <div class="preview-header">
            <h3 class="preview-title">已上传照片</h3>
            <span class="preview-count">{{ uploadedImages.length }} 张</span>
          </div>
          <div class="preview-grid">
            <div v-for="(image, index) in uploadedImages" 
                 :key="index" 
                 class="preview-item">
              <img :src="image.preview" :alt="'预览图 ' + (index + 1)">
              <button class="remove-btn" @click="removeImage(index)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：生成选项和预览 -->
      <div class="options-section">
        <div class="section-header">
          <h2 class="section-title">生成选项</h2>
          <p class="section-subtitle">自定义动画风格和参数</p>
        </div>
        
        <div class="options-panel">
          <div class="option-group">
            <label class="option-label">动画风格</label>
            <div class="option-select-wrapper">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <select v-model="animationStyle" class="option-select">
              <option value="realistic">写实风格</option>
              <option value="cartoon">卡通风格</option>
              <option value="watercolor">水彩风格</option>
            </select>
          </div>
          </div>
          
          <div class="option-group">
            <label class="option-label">动画时长</label>
            <div class="option-select-wrapper">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <select v-model="animationDuration" class="option-select">
              <option value="30">30秒</option>
              <option value="60">1分钟</option>
              <option value="120">2分钟</option>
            </select>
          </div>
          </div>
          
          <div class="option-group">
            <label class="option-label">背景音乐</label>
            <div class="option-select-wrapper">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <select v-model="backgroundMusic" class="option-select">
              <option value="none">无音乐</option>
              <option value="peaceful">舒缓音乐</option>
              <option value="energetic">活力音乐</option>
            </select>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="animation-preview">
          <div class="preview-header">
            <h3 class="preview-title">动画预览</h3>
          </div>
          
          <div v-if="!generatedAnimation" class="preview-placeholder">
            <div class="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="placeholder-text">上传照片并点击生成按钮开始创建动画</p>
          </div>
          
          <div v-else class="video-container">
            <video :src="generatedAnimation" controls class="preview-video"></video>
            <div class="video-actions">
              <a :href="generatedAnimation" target="_blank" class="download-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                下载视频
              </a>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p class="error-text">{{ errorMessage }}</p>
        </div>

        <!-- 生成按钮 -->
        <button 
          class="generate-btn" 
          :disabled="!canGenerate"
          @click="generateAnimation"
        >
          <div class="btn-content">
            <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <div v-else class="loading-spinner"></div>
            <span>{{ isLoading ? '生成中...' : '生成动画' }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

const router = useRouter()

// 状态变量
const fileInput = ref(null)
const uploadedImages = ref([])
const animationStyle = ref('realistic')
const animationDuration = ref('60')
const backgroundMusic = ref('none')
const generatedAnimation = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

// 计算属性
const canGenerate = computed(() => uploadedImages.value.length > 0 && !isLoading.value)

// 检查登录状态
onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
  }
})

// 方法
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  handleFiles(files)
}

const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  handleFiles(files)
}

const handleFiles = (files) => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedImages.value.push({
          file: file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const generateAnimation = async () => {
  if (!isLoggedIn.value) {
    errorMessage.value = '请先登录后再生成动画';
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const formData = new FormData();
    formData.append('title', '我的旅行动画');
    formData.append('style', animationStyle.value.toUpperCase());
    formData.append('duration', animationDuration.value);
    formData.append('musicType', backgroundMusic.value.toUpperCase());
    
    uploadedImages.value.forEach((image, index) => {
      formData.append('images', image.file);
    });
    
    const response = await axios.post('/api/animations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // 只获取必要的ID字段
    const animationId = response.data?.id;
    if (!animationId) {
      throw new Error('无法获取动画ID');
    }
    
    // 开始轮询检查视频生成状态
    const checkVideoStatus = async () => {
      try {
        const statusResponse = await axios.get(`/api/animations/${animationId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const animation = statusResponse.data;
        if (!animation) {
          throw new Error('状态响应数据为空');
        }
        
        if (animation.status === 'FAILED') {
          throw new Error('视频生成失败');
        }
        
        if (animation.videoUrl) {
          const baseUrl = 'http://localhost:9090/uploads/';
          const fullUrl = baseUrl + animation.videoUrl;
          generatedAnimation.value = fullUrl;
          return true;
        }
        
        return false;
      } catch (error) {
        errorMessage.value = error.message || '检查视频状态失败';
        return false;
      }
    };
    
    // 立即检查一次状态
    const isComplete = await checkVideoStatus();
    if (isComplete) {
      return;
    }
    
    // 如果第一次检查没有完成，开始轮询
    let attempts = 0;
    const maxAttempts = 20;
    
    const pollInterval = setInterval(async () => {
      attempts++;
      const isComplete = await checkVideoStatus();
      
      if (isComplete || attempts >= maxAttempts) {
        clearInterval(pollInterval);
        if (attempts >= maxAttempts) {
          errorMessage.value = '视频生成超时，请稍后查看';
        }
      }
    }, 3000);
    
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '生成动画失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

const isLoggedIn = computed(() => {
  return localStorage.getItem('token') !== null;
});
</script>

<style lang="scss" scoped>
.travel-animation-container {
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 24px;
  color: rgba(255, 255, 255, 0.9);
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;

  .hero-title {
    font-size: 48px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 16px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.1em;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.upload-section, .options-section {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
}

.section-header {
  margin-bottom: 24px;
  text-align: center;

  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

  .section-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }
}

  .upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);

    &:hover {
    border-color: rgba(0, 122, 255, 0.6);
    background: rgba(0, 122, 255, 0.05);
    transform: translateY(-2px);
    }

    .upload-content {
      .upload-icon {
      margin-bottom: 20px;
      
      svg {
        width: 64px;
        height: 64px;
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .upload-title {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 12px;
      }

    .upload-hint {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.5;
    }
  }
}

.preview-section {
  margin-top: 24px;
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .preview-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }
    
    .preview-count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.1);
      padding: 4px 12px;
      border-radius: 12px;
    }
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;

    .preview-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(0, 122, 255, 0.4);
        transform: scale(1.05);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .remove-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 68, 68, 0.9);
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: all 0.3s ease;

        svg {
          width: 16px;
          height: 16px;
          color: white;
        }

        &:hover {
          background: rgba(255, 68, 68, 1);
          transform: scale(1.1);
        }
      }
    }
  }
}

.options-panel {
  margin-bottom: 24px;
}

  .option-group {
  margin-bottom: 20px;
    
  .option-label {
      display: block;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    font-size: 14px;
  }
  
  .option-select-wrapper {
    position: relative;
    
    .option-icon {
      position: absolute;
      top: 50%;
      left: 16px;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.7);
      pointer-events: none;
      z-index: 2;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
    
    .option-select {
      width: 100%;
      padding: 16px 16px 16px 48px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      font-size: 16px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: #ffffff;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:focus {
        outline: none;
        border-color: #007AFF;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
      }
      
      &:hover {
        border-color: rgba(255, 255, 255, 0.5);
      }
      
      option {
        background: rgba(0, 0, 0, 0.9);
        color: #ffffff;
      }
    }
  }
}

.animation-preview {
  margin-bottom: 24px;
  
  .preview-header {
    margin-bottom: 16px;
    
    .preview-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }
  }

  .preview-placeholder {
    aspect-ratio: 16/9;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    
    .placeholder-icon {
      margin-bottom: 16px;
      
      svg {
        width: 48px;
        height: 48px;
        color: rgba(255, 255, 255, 0.4);
      }
    }
    
    .placeholder-text {
      font-size: 14px;
      text-align: center;
      margin: 0;
      line-height: 1.5;
    }
  }

  .video-container {
    .preview-video {
      width: 100%;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    
    .video-actions {
      text-align: center;
      
      .download-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: rgba(0, 122, 255, 0.8);
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
        
        svg {
          width: 20px;
          height: 20px;
        }
        
        &:hover {
          background: rgba(0, 122, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
        }
      }
    }
  }
}

.error-message {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .error-icon {
    svg {
      width: 24px;
      height: 24px;
      color: #ff4444;
    }
  }
  
  .error-text {
    color: #ff4444;
    margin: 0;
    font-size: 14px;
  }
}

.generate-btn {
  width: 100%;
  padding: 20px;
  background: rgba(0, 122, 255, 0.8);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover:not(:disabled) {
    background: rgba(0, 122, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: rgba(0, 0, 0, 0.2);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    
    svg {
      width: 24px;
      height: 24px;
  }
    
    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hidden {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .upload-section, .options-section {
    padding: 20px;
  }
  
  .upload-area {
    padding: 32px 16px;
  }
  
  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}
</style> 