<!-- src/components/common/LocationPicker.vue -->
<template>
  <div class="location-picker">
    <div class="location-input-wrapper">
      <div class="location-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="输入地点名称"
        class="location-input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
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
    
    <!-- 下拉建议列表 -->
    <div 
      v-if="showSuggestions && suggestions.length > 0"
      class="suggestions-dropdown"
    >
      <div 
        v-for="(item, index) in suggestions" 
        :key="index"
        class="suggestion-item"
        :class="{ 'highlighted': highlightedIndex === index }"
        @click="handleSelect(item)"
        @mouseenter="highlightedIndex = index"
      >
        <div class="suggestion-content">
          <span class="name">{{ item.name }}</span>
          <span class="city">{{ item.city }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchQuery.value = newValue.name
  }
})

const handleInput = async () => {
  if (searchQuery.value.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    const response = await axios.get(`/api/spots/search`, {
      params: { keyword: searchQuery.value },
      baseURL: 'http://localhost:9090'
    })
    
    if (response.data && Array.isArray(response.data)) {
      // 获取每个景点的评分信息
      const suggestionsData = await Promise.all(response.data.map(async spot => {
        try {
          const ratingResponse = await axios.get(`/api/spots/${spot.id}/ratings`, {
            baseURL: 'http://localhost:9090'
          })
          return {
            value: spot.name,
            name: spot.name,
            city: spot.city,
            id: spot.id,
            type: spot.type,
            ratingCount: ratingResponse.data.ratingCount || 0,
            averageRating: ratingResponse.data.averageRating || 0
          }
        } catch (error) {
          console.error('获取景点评分信息失败:', error)
          return {
            value: spot.name,
            name: spot.name,
            city: spot.city,
            id: spot.id,
            type: spot.type,
            ratingCount: 0,
            averageRating: 0
          }
        }
      }))
      
      suggestions.value = suggestionsData
      showSuggestions.value = true
      highlightedIndex.value = -1
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  } catch (error) {
    console.error('搜索地点失败:', error)
    suggestions.value = []
    showSuggestions.value = false
  }
}

const handleFocus = () => {
  if (suggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

const handleBlur = () => {
  // 延迟隐藏，让点击事件能够触发
  setTimeout(() => {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }, 200)
}

const handleSelect = (item) => {
  searchQuery.value = item.name
  showSuggestions.value = false
  highlightedIndex.value = -1
  
  emit('update:modelValue', {
    id: item.id,
    name: item.name,
    city: item.city,
    type: item.type,
    ratingCount: item.ratingCount,
    averageRating: item.averageRating
  })
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
  highlightedIndex.value = -1
  emit('update:modelValue', null)
}
</script>

<style lang="scss" scoped>
.location-picker {
  width: 100%;
  position: relative;
  
  .location-input-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    padding: 18px 20px 18px 56px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      border-radius: 14px;
      pointer-events: none;
    }
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    
    &:focus-within {
      background: rgba(0, 0, 0, 0.8);
      border-color: rgba(0, 122, 255, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15), 0 12px 30px rgba(0, 0, 0, 0.3);
    }
  }
  
  .location-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    width: 24px;
    height: 24px;
    color: rgba(0, 122, 255, 0.8);
    transition: all 0.3s ease;
  }
  
  .location-input {
    flex-grow: 1;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    background: transparent;
    border: none;
    outline: none;
    letter-spacing: 0.5px;
    padding-left: 10px;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 400;
    }
  }
  
  .clear-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.2s ease;
    z-index: 2;
    
    &:hover {
      color: #ffffff;
    }
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  &:focus-within {
    .location-icon {
      color: rgba(0, 122, 255, 1);
      transform: translateY(-50%) scale(1.1);
    }
  }
}

.suggestions-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-bottom: 8px;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 122, 255, 0.5), transparent);
  }
  
  .suggestion-item {
    position: relative;
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
    margin: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.2s ease;
      border-radius: 12px;
    }
    
    &:hover {
      background: rgba(0, 0, 0, 0.95);
      border-color: rgba(0, 122, 255, 0.3);
      transform: translateX(4px);
      
      &::before {
        opacity: 1;
      }
    }
    
    &.highlighted {
      background: rgba(0, 122, 255, 0.25);
      color: #ffffff;
      font-weight: 600;
    }
  }
  
  .suggestion-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 1;
    
    .name {
      font-weight: 600;
      color: #ffffff;
      font-size: 15px;
      letter-spacing: 0.3px;
    }
    
    .city {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      font-weight: 400;
      background: rgba(0, 122, 255, 0.2);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid rgba(0, 122, 255, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .location-picker {
    .location-input-wrapper {
      padding: 16px 16px 16px 52px;
      border-radius: 14px;
    }
    
    .location-icon {
      left: 18px;
      width: 22px;
      height: 22px;
    }
    
    .location-input {
      font-size: 14px;
    }
    
    .clear-btn {
      right: 8px;
      padding: 4px;
    }
  }
  
  .suggestions-dropdown {
    .suggestion-item {
      padding: 14px 16px;
      margin: 4px 6px;
      
      .suggestion-content {
        .name {
          font-size: 14px;
        }
        
        .city {
          font-size: 12px;
          padding: 3px 6px;
        }
      }
    }
  }
}
</style>