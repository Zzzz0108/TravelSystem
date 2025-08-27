<template>
  <nav class="nav-container">
    <div class="nav-content">
      <!-- Logo区域 -->
      <div class="nav-logo">
        <img src="@/assets/favicon.svg" alt="Logo" class="logo-icon" />
        
        <!-- 应用名称 -->
        <span class="logo-text">Travel</span>
        
        <!-- 定位图标（带省份选择功能） -->
        <div class="dock-item location-item" @click="toggleLocationMenu" @mouseenter="playLottie('location')" @mouseleave="stopLottie('location')">
          <div :ref="el => setLottieRef(el, 'location')" class="lottie-container" data-lottie-id="location"></div>
          <div class="dock-label">{{ getCurrentProvinceLabel() }}</div>
          
          <!-- 省份选择下拉菜单 -->
          <div class="location-dropdown" :class="{ 'show': showLocationMenu }">
            <div 
              v-for="province in provinces" 
              :key="province.path" 
              class="location-dropdown-item"
              @click="selectProvince(province)"
            >
              {{ province.name }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mac程序坞风格的导航链接 -->
      <div class="nav-dock">
        <router-link 
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="dock-item"
          :class="{ active: $route.path === link.path }"
          @mouseenter="playLottie(link.id)"
          @mouseleave="stopLottie(link.id)"
        >
          <!-- Lottie动画容器 -->
          <div 
            :ref="el => setLottieRef(el, link.id)" 
            class="lottie-container"
            :data-lottie-id="link.id"
          ></div>
          
          <!-- 标签 -->
          <div class="dock-label">{{ link.name }}</div>
        </router-link>
        
        <!-- 分隔线 -->
        <div class="dock-divider"></div>
        
        <!-- 用户相关功能 -->
        <template v-if="userStore.isLogin">
          <!-- 用户头像下拉菜单 -->
          <div class="dock-item user-avatar-item" @click="toggleUserMenu">
            <UserAvatar 
              :src="avatarUrl" 
              :name="userStore.user.username" 
              size="48" 
            />
            <div class="dock-label">{{ userStore.user.username }}</div>
            
            <!-- 用户下拉菜单 -->
            <div class="user-dropdown" :class="{ 'show': showUserMenu }">
              <router-link to="/favorites" class="dropdown-item">
                <div class="dropdown-icon">
                  <img src="/src/assets/icon/like.svg" alt="收藏" />
                </div>
                <span>我的收藏</span>
              </router-link>
              
              <div class="dropdown-divider"></div>
              
              <button class="dropdown-item logout-btn" @click="logout">
                <div class="dropdown-icon">
                  <img src="/src/assets/icon/logout.svg" alt="退出" />
                </div>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </template>
        
        <!-- 登录/注册 -->
        <router-link 
          v-else 
          to="/login" 
          class="dock-item"
          :class="{ active: $route.path === '/login' }"
          @mouseenter="playLottie('login')"
          @mouseleave="stopLottie('login')"
        >
          <div :ref="el => setLottieRef(el, 'login')" class="lottie-container" data-lottie-id="login"></div>
          <div class="dock-label">登录/注册</div>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserAvatar from '@/components/common/display/UserAvatar.vue'
import { useLottieManager } from './composables/useLottieManager'

const userStore = useUserStore()
const router = useRouter()

// 使用Lottie动画管理composable
const {
  lottieInstances,
  lottieRefs,
  setLottieRef,
  playLottie,
  stopLottie,
  initAllLottie,
  cleanupLottie
} = useLottieManager()

// 用户菜单状态
const showUserMenu = ref(false)

// 位置选择菜单状态
const showLocationMenu = ref(false)

const links = [
  { 
    name: '首页', 
    path: '/', 
    id: 'home',
    lottiePath: '/src/assets/首页.json'
  },
  { 
    name: '景区导航', 
    path: '/navigation', 
    id: 'navigation',
    lottiePath: '/src/assets/景区导航.json'
  },
  { 
    name: '旅行日记', 
    path: '/diary', 
    id: 'diary',
    lottiePath: '/src/assets/旅行日记.json'
  },
  { 
    name: '旅游动画', 
    path: '/travel-animation', 
    id: 'travel-animation',
    lottiePath: '/src/assets/旅游动画.json'
  }
]

// 省份数据
const provinces = [
  { name: '无', path: '/', value: '' },
  { name: '北京', path: '/', value: '北京' },
  { name: '天津', path: '/', value: '天津' },
  { name: '河北', path: '/', value: '河北' },
  { name: '山西', path: '/', value: '山西' },
  { name: '内蒙古', path: '/', value: '内蒙古' },
  { name: '辽宁', path: '/', value: '辽宁' },
  { name: '吉林', path: '/', value: '吉林' },
  { name: '黑龙江', path: '/', value: '黑龙江' },
  { name: '上海', path: '/', value: '上海' },
  { name: '江苏', path: '/', value: '江苏' },
  { name: '浙江', path: '/', value: '浙江' },
  { name: '安徽', path: '/', value: '安徽' },
  { name: '福建', path: '/', value: '福建' },
  { name: '江西', path: '/', value: '江西' },
  { name: '山东', path: '/', value: '山东' },
  { name: '河南', path: '/', value: '河南' },
  { name: '湖北', path: '/', value: '湖北' },
  { name: '湖南', path: '/', value: '湖南' },
  { name: '广东', path: '/', value: '广东' },
  { name: '广西', path: '/', value: '广西' },
  { name: '海南', path: '/', value: '海南' },
  { name: '重庆', path: '/', value: '重庆' },
  { name: '四川', path: '/', value: '四川' },
  { name: '贵州', path: '/', value: '贵州' },
  { name: '云南', path: '/', value: '云南' },
  { name: '西藏', path: '/', value: '西藏' },
  { name: '陕西', path: '/', value: '陕西' },
  { name: '甘肃', path: '/', value: '甘肃' },
  { name: '青海', path: '/', value: '青海' },
  { name: '宁夏', path: '/', value: '宁夏' },
  { name: '新疆', path: '/', value: '新疆' },
  { name: '台湾', path: '/', value: '台湾' },
  { name: '香港', path: '/', value: '香港' },
  { name: '澳门', path: '/', value: '澳门' }
]



// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  // 关闭位置选择菜单
  showLocationMenu.value = false
}

// 切换位置选择菜单
const toggleLocationMenu = () => {
  showLocationMenu.value = !showLocationMenu.value
  // 关闭用户菜单
  showUserMenu.value = false
}

// 选择省份
const selectProvince = (province) => {
  showLocationMenu.value = false
  
  if (province.name === '无') {
    // 清除筛选
    localStorage.removeItem('selectedProvince')
    router.push({ path: '/', query: {} })
  } else {
    // 设置省份筛选
    localStorage.setItem('selectedProvince', province.value)
    router.push({ path: '/', query: { province: province.value } })
  }
}

// 获取当前选中的省份标签
const getCurrentProvinceLabel = () => {
  const selectedProvince = provinces.find(p => p.value === localStorage.getItem('selectedProvince'));
  return selectedProvince ? selectedProvince.name : '选择省份';
};

// 点击外部关闭菜单
const closeMenus = (event) => {
  if (!event.target.closest('.user-avatar-item') && !event.target.closest('.location-item')) {
    showUserMenu.value = false
    showLocationMenu.value = false
  }
}





// 头像 URL
const avatarUrl = computed(() => {
  return userStore.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userStore.user.username)}`;
});

// 退出登录
const logout = () => {
  userStore.logout()
  window.location.reload()
}

// 生命周期
onMounted(() => {
  console.log('NavBar组件已挂载')
  
  // 初始化所有Lottie动画
  const otherAnimations = [
    { id: 'login', path: '/src/assets/登录注册.json' }
  ]
  initAllLottie(links, otherAnimations)
  
  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  // 清理Lottie实例
  cleanupLottie()
  
  // 移除事件监听
  document.removeEventListener('click', closeMenus)
})
</script>

<style lang="scss" scoped>
.nav-container {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 1400px;
  margin: 0 auto;
}

.nav-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: brightness(0) invert(1); // 将logo图标改为白色
  }
  
  .logo-text {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.5px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.nav-dock {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dock-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 113, 227, 0.2);
    transform: translateY(-6px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 113, 227, 0.3);
    color: #ffffff;
    
    .dock-label {
      opacity: 1;
      transform: translateY(0);
    }
    
    .lottie-container {
      transform: scale(1.1);
    }
  }
  
  &.active {
    background: rgba(0, 113, 227, 0.25);
    color: #0071e3;
    border: 1px solid rgba(0, 113, 227, 0.4);
    box-shadow: 0 4px 15px rgba(0, 113, 227, 0.3);
  }
}

.lottie-container {
  width: 70%;
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  
  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}

.dock-label {
  position: absolute;
  bottom: -30px;
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s ease;
  pointer-events: none;
  backdrop-filter: blur(10px);
  font-weight: 500;
  
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.8);
  }
}

.dock-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 8px;
}

.user-avatar-item {
  position: relative;
  
  .user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }
}

// 位置选择下拉菜单
.location-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px;
  max-height: 400px;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
  
  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 20px;
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.95);
    transform: rotate(45deg);
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 113, 227, 0.5);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 113, 227, 0.7);
    }
  }
  
  .location-dropdown-item {
    padding: 10px 16px;
    color: #1d1d1f;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    
    &:hover {
      background: rgba(0, 113, 227, 0.1);
      color: #0071e3;
    }
    
    &:first-child {
      border-radius: 12px 12px 0 0;
    }
    
    &:last-child {
      border-radius: 0 0 12px 12px;
    }
  }
}

// 用户下拉菜单
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
  
  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: rgba(0, 0, 0, 0.8);
    transform: rotate(45deg);
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  
  span {
    color: #ffffffd8;
  }
  
  &:hover {
    background: rgba(0, 113, 227, 0.1);
    color: #0071e3;
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 12px 12px;
  }
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.dropdown-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

.logout-btn {
  font-family: inherit;
}

// 确保定位图标样式完全一致
.location-item {
  // 继承所有dock-item的样式
  // 添加特定的悬浮效果
  &:hover {
    .lottie-container {
      transform: scale(1.1);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .nav-content {
    padding: 0 15px;
    height: 70px;
  }
  
  .nav-logo {
    gap: 12px;
    
    .logo-icon {
      width: 32px;
      height: 32px;
    }
    
    .logo-text {
      font-size: 24px;
    }
  }
  
  .nav-dock {
    gap: 12px;
  }
  
  .dock-item {
    width: 56px;
    height: 56px;
  }
  
  .lottie-container {
    width: 70%;
    height: 70%;
  }
  
  .user-dropdown {
    min-width: 160px;
    right: -20px;
  }
  
  .location-dropdown {
    min-width: 100px;
  }
}
</style>