<template>
  <div class="diary-container">
    <!-- 搜索和过滤 -->
    <div class="diary-header">
      <div class="search-section">
        <div class="search-header">
          <h2 class="search-title">探索旅行日记</h2>
          <p class="search-subtitle">发现精彩的旅行故事和体验分享</p>
        </div>
        
        <div class="search-bar">
          <div class="search-input-group">
            <div class="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索旅行日记..."
              @keyup.enter="handleSearch"
            />
            <button 
              v-if="searchQuery" 
              class="clear-btn"
              @click="clearSearch"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="filter-group">
            <div class="filter-select-wrapper">
              <div class="filter-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
                </svg>
              </div>
              <select v-model="searchMode" class="filter-select">
                <option value="destination">目的地</option>
                <option value="title">标题</option>
                <option value="content">文章内容</option>
              </select>
            </div>
            <button class="search-btn" @click="handleSearch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              搜索
            </button>
          </div>
        </div>
        
        <div class="hot-searches">
          <span class="hot-label">热门搜索</span>
          <div class="hot-tags">
            <span 
              v-for="tag in hotSearchTags" 
              :key="tag"
              class="hot-tag"
              @click="searchByTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      <router-view></router-view>
    </div>
    <floating-action-button @click="openEditor"/>

    <!-- 瀑布流容器 -->
    <div class="masonry-container">
      <div 
        v-for="item in filteredDiaries" 
        :key="item.id" 
        class="masonry-item"
      >
        <diary-card :diary="item"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diaryStore'
import DiaryCard from '@/components/diary/DiaryCard.vue'
import FloatingActionButton from '@/components/common/FloatingActionButton.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const diaryStore = useDiaryStore()
const searchQuery = ref('')
const searchMode = ref('destination') // 默认搜索模式为目的地

// 初始化数据
const initData = async () => {
  try {
    await diaryStore.fetchPopularDiaries() // 默认使用后端的热度+评分排序
  } catch (error) {
    console.error('获取日记数据失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  initData()
})

const handleSearch = (query) => {
  if (query !== undefined) {
    searchQuery.value = query;
  }
  if (!searchQuery.value) {
    // 如果没有搜索内容，重新获取所有日记
    initData();
  } else {
    // 有搜索内容时才进行搜索
    diaryStore.searchDiaries(searchQuery.value, searchMode.value);
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  initData();
}

// 数据过滤
const filteredDiaries = computed(() => {
  console.log('Current diaries:', diaryStore.diaries);
  console.log('Search query:', searchQuery.value);
  console.log('Search mode:', searchMode.value);
  
  // 如果后端已经返回了搜索结果，直接使用
  if (searchQuery.value) {
    return diaryStore.diaries;
  }
  
  // 如果没有搜索内容，显示所有日记
  return diaryStore.diaries;
})

const openDetail = (id) => {
  router.push(`/diary/${id}`)
}

const openEditor = () => {
  router.push('/diary/create')
}

// 热门搜索标签
const hotSearchTags = [
  '日本樱花', '欧洲古城', '东南亚海岛', '美国西部', '澳洲大堡礁', 
  '非洲草原', '南美雨林', '北欧极光', '中东古迹', '印度泰姬陵'
]

const searchByTag = (tag) => {
  searchQuery.value = tag;
  handleSearch();
}
</script>

<style lang="scss" scoped>
.diary-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
}

.diary-header {
  position: sticky;
  top: 60px;
  z-index: 100;
  margin-bottom: 24px;
}

.search-section {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

  .search-header {
    text-align: center;
    margin-bottom: 20px;

    .search-title {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 6px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .search-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  .search-input-group {
    position: relative;
    flex: 1;
  }

  .search-icon {
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

  .search-input {
    padding: 16px 16px 16px 48px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    width: 100%;
    transition: all 0.3s ease;
    color: #ffffff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    &:focus {
      outline: none;
      border-color: #007AFF;
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
    }
  }

  .clear-btn {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.3s ease;
    
    &:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.1);
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .filter-select-wrapper {
      position: relative;
      min-width: 140px;
      
      .filter-icon {
        position: absolute;
        top: 55%;
        left: 14px;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.7);
        pointer-events: none;
        z-index: 2;
        
        svg {
          width: 20px;
          height: 20px;
        }
      }
      
      .filter-select {
        width: 100%;
        padding: 16px 16px 16px 40px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        font-size: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #ffffff;
        appearance: none; /* Remove default arrow */
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

  .search-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: rgba(0, 122, 255, 0.8);
      border-color: #007AFF;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      background: rgba(0, 0, 0, 0.2);
      cursor: not-allowed;
      color: rgba(255, 255, 255, 0.4);
      border-color: rgba(255, 255, 255, 0.2);
      transform: none;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.hot-searches {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  .hot-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
  }

  .hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;
  }

  .hot-tag {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.8);
    padding: 8px 14px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 122, 255, 0.8);
      color: #ffffff;
      border-color: #007AFF;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.masonry-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  justify-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.masonry-item {
  width: 100%;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .masonry-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 900px) {
  .masonry-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 600px) {
  .masonry-container {
    grid-template-columns: 1fr;
  }
  
  .diary-header {
    padding: 16px;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>