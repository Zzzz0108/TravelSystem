import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'

export function useSpotSearch(spotStore) {
  // 搜索状态
  const searchKeyword = ref('')
  const selectedType = ref('')
  const isSearching = ref(false)
  
  // 景点类型配置
  const spotTypes = [
    { value: 'SCENIC_AREA', label: '景区' },
    { value: 'UNIVERSITY', label: '学校' }
  ]
  
  // 热门搜索标签
  const hotSearchTags = [
    '故宫', '长城', '西湖', '黄山', '丽江古城', '张家界', '九寨沟', '布达拉宫'
  ]
  
  // 计算属性
  const chineseCharRegex = /[\u4e00-\u9fa5]/
  const hasValidKeyword = computed(() => chineseCharRegex.test(searchKeyword.value))
  const hasSearchCriteria = computed(() => hasValidKeyword.value || !!selectedType.value)
  const isSearchDisabled = computed(() => !hasSearchCriteria.value)
  
  // 防抖搜索
  const debouncedSearch = debounce(async () => {
    // 双重校验：即使被外部误触发，也不在无效条件下请求
    if (!hasSearchCriteria.value) return
    try {
      isSearching.value = true
      await spotStore.searchSpots(searchKeyword.value, selectedType.value)
    } catch (error) {
      console.error('搜索失败:', error)
      spotStore.error = '搜索失败，请稍后重试'
    } finally {
      isSearching.value = false
    }
  }, 300)
  
  // 执行搜索
  const executeSearch = () => {
    if (!hasSearchCriteria.value) return
    spotStore.error = null
    debouncedSearch()
  }
  
  // 处理搜索输入（支持中文 IME 组合输入；无效条件时取消未决搜索）
  const handleSearchInput = (event) => {
    if (event && event.isComposing) return
    const keyword = (searchKeyword.value || '').trim()
    if (keyword === '') {
      // 清空：取消未决防抖并重置搜索（保留类型条件）
      debouncedSearch.cancel()
      spotStore.error = null
      spotStore.searchSpots('', selectedType.value || '')
      return
    }
    if (!hasValidKeyword.value && !selectedType.value) {
      // 非中文且无类型：取消未决防抖，不请求
      debouncedSearch.cancel()
      return
    }
    executeSearch()
  }
  
  // 处理类型筛选变化（选择类型即可触发）
  const handleTypeChange = () => {
    executeSearch()
  }
  
  // 清除搜索（重置为全部，不受中文校验限制）
  const clearSearch = () => {
    searchKeyword.value = ''
    selectedType.value = ''
    // 直接触发一次重置搜索，返回全部结果
    spotStore.searchSpots('', '')
  }
  
  // 根据标签搜索
  const searchByTag = (tag) => {
    searchKeyword.value = tag
    executeSearch()
  }
  
  // 重置搜索状态
  const resetSearch = () => {
    searchKeyword.value = ''
    selectedType.value = ''
    isSearching.value = false
    spotStore.error = null
  }
  
  // 获取搜索统计信息
  const getSearchStats = (totalSpots, filteredSpots, selectedProvince) => {
    if (totalSpots === 0) return '没有找到相关景点'
    
    const count = filteredSpots.length
    const provinceInfo = selectedProvince ? `（${selectedProvince}）` : ''
    
    return `找到 ${count} 个景点${provinceInfo}`
  }
  
  return {
    // 状态
    searchKeyword,
    selectedType,
    isSearching,
    spotTypes,
    hotSearchTags,
    
    // 计算属性
    hasSearchCriteria,
    isSearchDisabled,
    
    // 方法
    executeSearch,
    handleSearchInput,
    handleTypeChange,
    clearSearch,
    searchByTag,
    resetSearch,
    getSearchStats
  }
} 