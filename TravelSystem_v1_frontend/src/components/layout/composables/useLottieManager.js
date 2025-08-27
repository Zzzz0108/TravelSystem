import { ref, onMounted, onUnmounted } from 'vue'
import lottie from 'lottie-web'

export function useLottieManager() {
  // Lottie动画实例存储
  const lottieInstances = ref({})
  const lottieRefs = ref({})
  
  // 设置Lottie引用
  const setLottieRef = (el, id) => {
    if (el) {
      lottieRefs.value[id] = el
    }
  }
  
  // 播放Lottie动画
  const playLottie = (id) => {
    if (lottieInstances.value[id]) {
      // 从头开始播放动画
      lottieInstances.value[id].goToAndPlay(0)
    }
  }
  
  // 停止Lottie动画
  const stopLottie = (id) => {
    if (lottieInstances.value[id]) {
      // 停止动画并跳转到最后一帧
      lottieInstances.value[id].goToAndStop(lottieInstances.value[id].totalFrames - 1, true)
    }
  }
  
  // 创建占位符图标
  const createPlaceholderIcon = (id) => {
    const icons = {
      location: '<svg viewBox="0 0 48 48" fill="currentColor"><path d="M24 4C16.27 4 10 10.27 10 18c0 11 14 26 14 26s14-15 14-26c0-7.73-6.27-14-14-14zm0 22c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>'
    }
    
    return icons[id] || '<svg viewBox="0 0 48 48" fill="currentColor"><circle cx="24" cy="24" r="12"/></svg>'
  }
  
  // 初始化单个Lottie动画
  const initSingleLottie = async (id, path, container) => {
    if (!container) return
    
    try {
      lottieInstances.value[id] = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: path
      })
      
      // 设置动画加载完成后停在最后一帧
      lottieInstances.value[id].addEventListener('DOMLoaded', () => {
        lottieInstances.value[id].goToAndStop(lottieInstances.value[id].totalFrames - 1, true)
      })
      
      console.log(`${id}动画加载成功`)
      return true
    } catch (error) {
      console.error(`${id}动画加载失败:`, error)
      // 如果Lottie加载失败，使用SVG图标作为备选
      container.innerHTML = createPlaceholderIcon(id)
      return false
    }
  }
  
  // 初始化导航链接的Lottie动画
  const initNavigationLottie = async (links) => {
    console.log('开始初始化导航链接Lottie动画...')
    
    for (const link of links) {
      if (lottieRefs.value[link.id]) {
        console.log(`初始化${link.name}动画...`)
        await initSingleLottie(link.id, link.lottiePath, lottieRefs.value[link.id])
      }
    }
  }
  
  // 初始化定位图标的Lottie动画
  const initLocationLottie = async () => {
    if (lottieRefs.value.location) {
      console.log('初始化定位动画...')
      await initSingleLottie('location', '/src/assets/定位.json', lottieRefs.value.location)
    }
  }
  
  // 初始化其他功能的Lottie动画
  const initOtherLottie = async (otherAnimations) => {
    otherAnimations.forEach(async ({ id, path }) => {
      if (lottieRefs.value[id]) {
        console.log(`初始化${id}动画...`)
        await initSingleLottie(id, path, lottieRefs.value[id])
      }
    })
  }
  
  // 初始化所有Lottie动画
  const initAllLottie = async (links, otherAnimations = []) => {
    console.log('开始初始化所有Lottie动画...')
    
    // 等待DOM更新后初始化
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 并行初始化所有动画
    await Promise.all([
      initNavigationLottie(links),
      initLocationLottie(),
      initOtherLottie(otherAnimations)
    ])
    
    console.log('所有Lottie动画初始化完成')
  }
  
  // 清理Lottie实例
  const cleanupLottie = () => {
    Object.values(lottieInstances.value).forEach(instance => {
      if (instance && instance.destroy) {
        instance.destroy()
      }
    })
    lottieInstances.value = {}
  }
  
  // 获取Lottie实例
  const getLottieInstance = (id) => {
    return lottieInstances.value[id]
  }
  
  // 检查动画是否已加载
  const isLottieLoaded = (id) => {
    return !!lottieInstances.value[id]
  }
  
  return {
    // 状态
    lottieInstances,
    lottieRefs,
    
    // 方法
    setLottieRef,
    playLottie,
    stopLottie,
    initAllLottie,
    initSingleLottie,
    cleanupLottie,
    getLottieInstance,
    isLottieLoaded
  }
} 