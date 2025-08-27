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

      <!-- 右侧：选项设置区域 -->
      <div class="options-section">
        <div class="section-header">
          <h2 class="section-title">动画设置</h2>
          <p class="section-subtitle">自定义您的旅行动画效果</p>
        </div>
        
        <!-- 基础设置 -->
        <div class="options-panel">
          <div class="option-group">
            <label class="option-label">动画风格</label>
            <div class="option-select-wrapper">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <select v-model="animationStyle" class="option-select">
                <option value="REALISTIC">写实风格</option>
                <option value="CARTOON">卡通风格</option>
                <option value="WATERCOLOR">水彩风格</option>
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
                <option value="60">60秒</option>
                <option value="90">90秒</option>
                <option value="120">120秒</option>
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
                <option value="NONE">无音乐</option>
                <option value="PEACEFUL">舒缓音乐</option>
                <option value="ENERGETIC">活力音乐</option>
                <option value="ROMANTIC">浪漫音乐</option>
                <option value="ADVENTURE">冒险音乐</option>
                <option value="NATURE">自然音乐</option>
                <option value="URBAN">都市音乐</option>
                <option value="ETHNIC">民族音乐</option>
                <option value="ELECTRONIC">电子音乐</option>
                <option value="CLASSICAL">古典音乐</option>
                <option value="JAZZ">爵士音乐</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 转场效果设置 -->
        <div class="options-panel">
          <h3 class="panel-title">转场效果</h3>
          <div class="effects-grid">
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'FADE' }"
                 @click="transitionEffect = 'FADE'">
              <div class="effect-preview fade-preview"></div>
              <span>淡入淡出</span>
            </div>
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'SLIDE_LEFT' }"
                 @click="transitionEffect = 'SLIDE_LEFT'">
              <div class="effect-preview slide-left-preview"></div>
              <span>左滑</span>
            </div>
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'SLIDE_RIGHT' }"
                 @click="transitionEffect = 'SLIDE_RIGHT'">
              <div class="effect-preview slide-right-preview"></div>
              <span>右滑</span>
            </div>
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'SLIDE_UP' }"
                 @click="transitionEffect = 'SLIDE_UP'">
              <div class="effect-preview slide-up-preview"></div>
              <span>上滑</span>
            </div>
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'SLIDE_DOWN' }"
                 @click="transitionEffect = 'SLIDE_DOWN'">
              <div class="effect-preview slide-down-preview"></div>
              <span>下滑</span>
            </div>
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'ZOOM_IN' }"
                 @click="transitionEffect = 'ZOOM_IN'">
              <div class="effect-preview zoom-in-preview"></div>
              <span>放大</span>
            </div>
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'ZOOM_OUT' }"
                 @click="transitionEffect = 'ZOOM_OUT'">
              <div class="effect-preview zoom-out-preview"></div>
              <span>缩小</span>
            </div>
            <div class="effect-item" 
                 :class="{ active: transitionEffect === 'ROTATE' }"
                 @click="transitionEffect = 'ROTATE'">
              <div class="effect-preview rotate-preview"></div>
              <span>旋转</span>
            </div>
          </div>
        </div>

        <!-- 字幕设置 -->
        <div class="options-panel">
          <h3 class="panel-title">字幕设置</h3>
          <div class="subtitle-editor">
            <input v-model="subtitleText" 
                   placeholder="输入字幕内容（可选）" 
                   class="subtitle-input">
            <select v-model="subtitleStyle" class="subtitle-style-select">
              <option value="ELEGANT">优雅</option>
              <option value="BOLD">粗体</option>
              <option value="HANDWRITING">手写</option>
              <option value="NEON">霓虹</option>
            </select>
          </div>
        </div>

        <!-- 图片处理设置 -->
        <div class="options-panel">
          <h3 class="panel-title">图片处理</h3>
          <div class="processing-options">
            <label class="checkbox-item">
              <input type="checkbox" v-model="autoEnhance">
              <span class="checkmark"></span>
              <span class="label-text">自动增强</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="removeNoise">
              <span class="checkmark"></span>
              <span class="label-text">降噪处理</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="colorCorrection">
              <span class="checkmark"></span>
              <span class="label-text">色彩校正</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="faceBeautify">
              <span class="checkmark"></span>
              <span class="label-text">人像美化</span>
            </label>
          </div>
        </div>

        <!-- 实时预览 -->
        <div class="options-panel">
          <h3 class="panel-title">实时预览</h3>
          <div class="preview-controls">
            <button @click="previewEffect('zoom')" class="preview-btn">预览缩放</button>
            <button @click="previewEffect('slide')" class="preview-btn">预览滑动</button>
            <button @click="previewEffect('fade')" class="preview-btn">预览淡入淡出</button>
          </div>
          <div class="preview-canvas">
            <canvas ref="previewCanvas" width="300" height="200"></canvas>
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
              <button @click="handleDownloadVideo(generatedAnimation)" class="download-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                下载视频
              </button>
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
          @click="handleGenerateAnimation"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimationGenerator } from './composables/useAnimationGenerator'

const router = useRouter()

// 使用动画生成逻辑 composable
const {
  uploadedImages,
  generatedAnimation,
  isLoading,
  errorMessage,
  canGenerate,
  isLoggedIn,
  handleFiles,
  removeImage,
  generateAnimation,
  downloadVideo
} = useAnimationGenerator()

// 本地状态变量
const fileInput = ref(null)
const animationStyle = ref('REALISTIC')
const animationDuration = ref('60')
const backgroundMusic = ref('NONE')
const transitionEffect = ref('FADE')
const subtitleText = ref('')
const subtitleStyle = ref('ELEGANT')
const autoEnhance = ref(true)
const removeNoise = ref(false)
const colorCorrection = ref(true)
const faceBeautify = ref(false)
const previewCanvas = ref(null)

// 检查登录状态
onMounted(() => {
  if (!isLoggedIn.value) {
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

const handleGenerateAnimation = async () => {
  const options = {
    animationStyle: animationStyle.value,
    animationDuration: animationDuration.value,
    backgroundMusic: backgroundMusic.value,
    transitionEffect: transitionEffect.value,
    subtitleText: subtitleText.value,
    subtitleStyle: subtitleStyle.value,
    autoEnhance: autoEnhance.value,
    removeNoise: removeNoise.value,
    colorCorrection: colorCorrection.value,
    faceBeautify: faceBeautify.value
  }
  
  await generateAnimation(options)
}

const handleDownloadVideo = async (videoUrl) => {
  await downloadVideo(videoUrl)
}



// 预览效果方法
const previewEffect = (effectType) => {
  if (!previewCanvas.value) return;
  
  const canvas = previewCanvas.value;
  const ctx = canvas.getContext('2d');
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制示例内容
  ctx.fillStyle = '#007AFF';
  ctx.fillRect(50, 50, 100, 100);
  
  // 应用动画效果
  switch (effectType) {
    case 'zoom':
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.scale(1.5, 1.5);
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(-50, -50, 100, 100);
      ctx.restore();
      break;
    case 'slide':
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(150, 50, 100, 100);
      break;
    case 'fade':
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#45B7D1';
      ctx.fillRect(50, 50, 100, 100);
      ctx.globalAlpha = 1.0;
      break;
  }
  
  // 添加文字说明
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${effectType} 效果预览`, canvas.width/2, 180);
};
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

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  text-align: center;
}

.effects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.effect-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 122, 255, 0.1);
    border-color: rgba(0, 122, 255, 0.3);
    transform: translateY(-2px);
  }
  
  &.active {
    background: rgba(0, 122, 255, 0.2);
    border-color: #007AFF;
    box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
  }
  
  .effect-preview {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: linear-gradient(45deg, #007AFF, #00D4FF);
  }
  
  span {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
  }
}

.subtitle-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .subtitle-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 14px;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    &:focus {
      outline: none;
      border-color: #007AFF;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
    }
  }
  
  .subtitle-style-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #007AFF;
    }
    
    option {
      background: rgba(0, 0, 0, 0.9);
      color: #ffffff;
    }
  }
}

.processing-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  input[type="checkbox"] {
    display: none;
  }
  
  .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    position: relative;
    transition: all 0.3s ease;
  }
  
  input[type="checkbox"]:checked + .checkmark {
    background: #007AFF;
    border-color: #007AFF;
    
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 14px;
      font-weight: bold;
    }
  }
  
  .label-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
  }
}

.preview-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  
  .preview-btn {
    flex: 1;
    padding: 8px 12px;
    background: rgba(0, 122, 255, 0.6);
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 122, 255, 0.8);
      transform: translateY(-1px);
    }
  }
}

.preview-canvas {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: center;
  
  canvas {
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.5);
  }
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