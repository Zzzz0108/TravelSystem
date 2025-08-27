import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

export function useAnimationGenerator() {
  const router = useRouter()
  
  // 状态变量
  const uploadedImages = ref([])
  const generatedAnimation = ref(null)
  const isLoading = ref(false)
  const errorMessage = ref('')
  
  // 计算属性
  const canGenerate = computed(() => uploadedImages.value.length > 0 && !isLoading.value)
  const isLoggedIn = computed(() => localStorage.getItem('token') !== null)
  
  // 检查登录状态
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return false
    }
    return true
  }
  
  // 处理文件上传
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
  
  // 删除图片
  const removeImage = (index) => {
    uploadedImages.value.splice(index, 1)
  }
  
  // 清空所有图片
  const clearImages = () => {
    uploadedImages.value = []
  }
  
  // 检查视频生成状态
  const checkVideoStatus = async (animationId) => {
    try {
      const statusResponse = await axios.get(`/api/animations/${animationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const animation = statusResponse.data
      if (!animation) {
        throw new Error('状态响应数据为空')
      }
      
      if (animation.status === 'FAILED') {
        throw new Error('视频生成失败')
      }
      
      if (animation.videoUrl) {
        const baseUrl = 'http://localhost:9090/uploads/'
        const fullUrl = baseUrl + animation.videoUrl
        generatedAnimation.value = fullUrl
        return true
      }
      
      return false
    } catch (error) {
      errorMessage.value = error.message || '检查视频状态失败'
      return false
    }
  }
  
  // 生成动画
  const generateAnimation = async (options) => {
    if (!checkLoginStatus()) {
      errorMessage.value = '请先登录后再生成动画'
      return
    }
    
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const formData = new FormData()
      formData.append('title', '我的旅行动画')
      formData.append('style', options.animationStyle)
      formData.append('duration', options.animationDuration)
      formData.append('musicType', options.backgroundMusic)
      formData.append('transitionEffect', options.transitionEffect)
      formData.append('subtitleText', options.subtitleText)
      formData.append('subtitleStyle', options.subtitleStyle)
      formData.append('autoEnhance', options.autoEnhance)
      formData.append('removeNoise', options.removeNoise)
      formData.append('colorCorrection', options.colorCorrection)
      formData.append('faceBeautify', options.faceBeautify)
      
      uploadedImages.value.forEach((image, index) => {
        formData.append('images', image.file)
      })
      
      const response = await axios.post('/api/animations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      // 只获取必要的ID字段
      const animationId = response.data?.id
      if (!animationId) {
        throw new Error('无法获取动画ID')
      }
      
      // 立即检查一次状态
      const isComplete = await checkVideoStatus(animationId)
      if (isComplete) {
        return
      }
      
      // 如果第一次检查没有完成，开始轮询
      let attempts = 0
      const maxAttempts = 20
      
      const pollInterval = setInterval(async () => {
        attempts++
        const isComplete = await checkVideoStatus(animationId)
        
        if (isComplete || attempts >= maxAttempts) {
          clearInterval(pollInterval)
          if (attempts >= maxAttempts) {
            errorMessage.value = '视频生成超时，请稍后查看'
          }
        }
      }, 3000)
      
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message || '生成动画失败，请稍后重试'
    } finally {
      isLoading.value = false
    }
  }
  
  // 下载视频
  const downloadVideo = async (videoUrl) => {
    try {
      // 从完整URL中提取相对路径
      const baseUrl = 'http://localhost:9090/uploads/'
      const relativePath = videoUrl.replace(baseUrl, '')
      
      // 调用后端下载接口
      const response = await axios.get(`/api/animations/download?videoUrl=${relativePath}`, {
        responseType: 'blob', // 重要：设置响应类型为blob
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'video/mp4' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `旅行动画_${Date.now()}.mp4` // 设置下载文件名
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('视频下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      errorMessage.value = '下载失败: ' + (error.response?.data || error.message)
    }
  }
  
  // 清空错误信息
  const clearError = () => {
    errorMessage.value = ''
  }
  
  // 重置状态
  const reset = () => {
    uploadedImages.value = []
    generatedAnimation.value = null
    isLoading.value = false
    errorMessage.value = ''
  }
  
  return {
    // 状态
    uploadedImages,
    generatedAnimation,
    isLoading,
    errorMessage,
    
    // 计算属性
    canGenerate,
    isLoggedIn,
    
    // 方法
    checkLoginStatus,
    handleFiles,
    removeImage,
    clearImages,
    generateAnimation,
    downloadVideo,
    clearError,
    reset
  }
} 