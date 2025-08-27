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
                @input="handleSearchInput($event)"
                @keyup.enter="() => handleSearch()"
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
          <diary-card :diary="item" @update:diary="handleDiaryUpdate"/>
        </div>
      </div>
      
      <!-- 分页组件 - sticky在底部 -->
      <div v-if="totalElements > 0" class="pagination-container">

        <!-- 原生分页组件 -->
        <div class="native-pagination">
          <div class="pagination-info">
            <span class="total-info">共 {{ totalElements }} 条记录</span>
            <span class="page-info">第 {{ currentPage }} 页，共 {{ Math.ceil(totalElements / pageSize) }} 页</span>
          </div>
          
          <div class="pagination-controls">
            <button 
              @click="handleCurrentChange(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="pagination-btn prev-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              上一页
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in getVisiblePages()" 
                :key="page"
                @click="handleCurrentChange(page)"
                :class="['page-btn', { active: page === currentPage }]"
                :disabled="page === '...'"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="handleCurrentChange(currentPage + 1)"
              :disabled="currentPage >= Math.ceil(totalElements / pageSize)"
              class="pagination-btn next-btn"
            >
              下一页
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          
          <div class="page-size-selector">
            <span>每页显示：</span>
            <select v-model="pageSize" @change="handleSizeChange(pageSize)" class="page-size-select">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>条</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDiaryStore } from '@/stores/diaryStore'
import DiaryCard from '@/components/diary/DiaryCard.vue'
import FloatingActionButton from '@/components/common/buttons/FloatingActionButton.vue'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
  
  const router = useRouter()
const route = useRoute()
const diaryStore = useDiaryStore()
const searchQuery = ref('')
const searchMode = ref('destination') // 默认搜索模式为目的地

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(20) // 默认20条/页
const totalElements = ref(0)

  // 初始化分页信息
  const initializePagination = () => {
    // 如果有现有数据，设置分页信息
    if (diaryStore.diaries.length > 0) {
      totalElements.value = diaryStore.diaries.length
      console.log('初始化分页信息:', { total: totalElements.value, diaries: diaryStore.diaries.length })
    }
  }
  
  // 根据 destination 查询参数进行搜索
  const applyDestinationFromRoute = async () => {
    const dest = route.query.destination
    if (typeof dest === 'string' && dest.trim()) {
      searchMode.value = 'destination'
      searchQuery.value = dest.trim()
      currentPage.value = 1 // 重置到第一页
      const response = await diaryStore.searchDiaries(
        searchQuery.value, 
        'destination',
        { page: 0, size: pageSize.value }
      )
      if (response) {
        updatePaginationInfo(response.totalElements, 1)
      }
    }
  }
  
  // 初始化数据
  const initData = async (force = false) => {
    try {
      // 如果已经有数据且不是强制刷新，则跳过
      if (!force && diaryStore.diaries.length > 0) {
        console.log('已有数据，跳过重新获取')
        return
      }
      const response = await diaryStore.fetchPopularDiaries({ 
        page: currentPage.value - 1, 
        size: pageSize.value 
      })
      updatePaginationInfo(response.totalElements, currentPage.value)
    } catch (error) {
      console.error('获取日记数据失败:', error)
    }
  }
  
  // 组件挂载时：若路由带destination则按目的地搜索，否则加载默认数据
  onMounted(async () => {
    // 初始化分页信息
    initializePagination()
    
    const hasDestination = typeof route.query.destination === 'string' && route.query.destination.trim()
    if (hasDestination) {
      await applyDestinationFromRoute()
    } else {
      await initData(false) // 不强制刷新，保持现有数据
    }
  })
  
  // 监听路由变更（支持从其他页带 destination 返回）
  watch(() => route.query.destination, async (newVal, oldVal) => {
    if (typeof newVal === 'string' && newVal.trim()) {
      await applyDestinationFromRoute()
    }
  })
  
  const chineseCharRegex = /[\u4e00-\u9fa5]/
  const hasValidKeyword = () => chineseCharRegex.test((searchQuery.value || '').trim())

  const debouncedSearch = debounce(async () => {
    // 双重校验，防止误触
    if (!hasValidKeyword() && !searchMode.value) return
    
    const response = await diaryStore.searchDiaries(
      (searchQuery.value || '').trim(), 
      searchMode.value,
      { page: 0, size: pageSize.value } // 搜索时重置到第一页
    )
    
    // 更新分页信息
    if (response) {
      updatePaginationInfo(response.totalElements, 1)
      currentPage.value = 1
    }
  }, 300)
  
  const handleSearch = () => {
    const keyword = (searchQuery.value || '').trim()
    if (!keyword) {
      // 空关键字，回退到默认热门数据
      debouncedSearch.cancel()
      initData(true) // 回退到默认数据时强制刷新
      return
    }
    if (!hasValidKeyword() && !searchMode.value) {
      // 非中文且未选择模式，不请求
      debouncedSearch.cancel()
      return
    }
    debouncedSearch()
  };
  
  const handleSearchInput = (event) => {
    if (event && event.isComposing) return
    handleSearch()
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
    debouncedSearch.cancel()
    currentPage.value = 1 // 重置到第一页
    initData(true) // 清除搜索时强制刷新数据
  }
  
  // 数据过滤（直接展示 store 结果）
  const filteredDiaries = computed(() => {
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
    '川藏线', '新疆自驾', '云南秘境', '青海湖日出', '内蒙古草原'
  ]
  
  const searchByTag = (tag) => {
    searchQuery.value = tag;
    currentPage.value = 1; // 重置到第一页
    handleSearch();
  }
  
  // 处理日记更新（如点赞状态变化）
  const handleDiaryUpdate = (updatedDiary) => {
    // 更新 store 中的日记数据
    const index = diaryStore.diaries.findIndex(d => d.id === updatedDiary.id)
    if (index !== -1) {
      diaryStore.diaries[index] = { ...diaryStore.diaries[index], ...updatedDiary }
    }
  }
  
    // 分页处理函数
  const handleSizeChange = async (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1 // 重置到第一页
    console.log('页面大小改变:', newSize)
    
    // 调用API获取新页面大小的数据
    if (searchQuery.value.trim()) {
      // 如果有搜索关键词，执行搜索
      const response = await diaryStore.searchDiaries(
        searchQuery.value.trim(), 
        searchMode.value, 
        { page: 0, size: newSize }
      )
      updatePaginationInfo(response.totalElements, 1)
    } else {
      // 否则获取热门日记
      const response = await diaryStore.fetchPopularDiaries({ page: 0, size: newSize })
      updatePaginationInfo(response.totalElements, 1)
    }
  }

  const handleCurrentChange = async (newPage) => {
    currentPage.value = newPage
    console.log('当前页改变:', newPage)
    
    // 调用API获取指定页的数据
    if (searchQuery.value.trim()) {
      // 如果有搜索关键词，执行搜索
      const response = await diaryStore.searchDiaries(
        searchQuery.value.trim(), 
        searchMode.value, 
        { page: newPage - 1, size: pageSize.value } // 后端从0开始，前端从1开始
      )
      updatePaginationInfo(response.totalElements, newPage)
    } else {
      // 否则获取热门日记
      const response = await diaryStore.fetchPopularDiaries({ 
        page: newPage - 1, 
        size: pageSize.value 
      })
      updatePaginationInfo(response.totalElements, newPage)
    }
  }

  // 更新分页信息
  const updatePaginationInfo = (total, current = 1) => {
    if (total !== undefined && total !== null) {
      totalElements.value = total
    }
    if (current !== undefined && current !== null) {
      currentPage.value = current
    }
    console.log('分页信息更新:', { total, current, pageSize: pageSize.value })
  }

  // 获取可见的页码数组
  const getVisiblePages = () => {
    const totalPages = Math.ceil(totalElements.value / pageSize.value)
    const current = currentPage.value
    const pages = []
    
    if (totalPages <= 7) {
      // 如果总页数小于等于7，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 如果总页数大于7，显示部分页码
      if (current <= 4) {
        // 当前页在前4页
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        // 当前页在后3页
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
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
  
  /* 分页组件样式 */
  .pagination-container {
    position: sticky;
    bottom: 0px;
    z-index: 100;
    display: flex;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  /* 原生分页组件样式 */
  .native-pagination {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 1200px;
    
    .pagination-info {
      display: flex;
      gap: 20px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      
      .total-info {
        color: #007AFF;
        font-weight: 600;
      }
      
      .page-info {
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .pagination-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        
        svg {
          width: 16px;
          height: 16px;
        }
        
        &:hover:not(:disabled) {
          background: rgba(0, 122, 255, 0.2);
          border-color: #007AFF;
          color: #007AFF;
          transform: translateY(-1px);
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        &.prev-btn {
          padding-left: 12px;
        }
        
        &.next-btn {
          padding-right: 12px;
        }
      }
      
      .page-numbers {
        display: flex;
        gap: 4px;
        
        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &:hover:not(:disabled) {
            background: rgba(0, 122, 255, 0.2);
            border-color: #007AFF;
            color: #007AFF;
          }
          
          &.active {
            background: #007AFF;
            border-color: #007AFF;
            color: #ffffff;
            font-weight: 600;
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
    
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      
      .page-size-select {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #007AFF;
        }
        
        &:focus {
          outline: none;
          border-color: #007AFF;
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
        }
      }
    }
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