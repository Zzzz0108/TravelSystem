<!-- src/components/common/LocationPicker.vue -->
<template>
  <div class="location-picker">
    <el-autocomplete
      v-model="searchQuery"
      :fetch-suggestions="querySearch"
      placeholder="输入地点名称"
      class="location-input"
      @select="handleSelect"
      :trigger-on-focus="false"
    >
      <template #prefix>
        <el-icon><Location /></el-icon>
      </template>
      <template #default="{ item }">
        <div class="suggestion-item">
          <span class="name">{{ item.name }}</span>
          <span class="city">{{ item.city }}</span>
        </div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Location } from '@element-plus/icons-vue'
import axios from 'axios'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchQuery.value = newValue.name
  }
})

const querySearch = async (query, callback) => {
  if (query.length < 2) {
    callback([])
    return
  }

  try {
    const response = await axios.get(`/api/spots/search`, {
      params: { keyword: query },
      baseURL: 'http://localhost:9090'
    })
    
    if (response.data && Array.isArray(response.data)) {
      // 获取每个景点的评分信息
      const suggestions = await Promise.all(response.data.map(async spot => {
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
      callback(suggestions)
    } else {
      callback([])
    }
  } catch (error) {
    console.error('搜索地点失败:', error)
    callback([])
  }
}

const handleSelect = (item) => {
  emit('update:modelValue', {
    id: item.id,
    name: item.name,
    city: item.city,
    type: item.type,
    ratingCount: item.ratingCount,
    averageRating: item.averageRating
  })
}
</script>

<style lang="scss" scoped>
.location-picker {
  width: 100%;
  
  .location-input {
    width: 100%;
    
    :deep(.el-input__wrapper) {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: none;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 16px 16px 16px 48px;
      transition: all 0.3s ease;
      
      &:hover, &:focus {
        box-shadow: none;
        border-color: rgba(0, 122, 255, 0.6);
        background: rgba(66, 66, 66, 0.335);
        box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
      }
    }
    
    :deep(.el-input__inner) {
      font-size: 16px;
      color: #fffefe;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }
    
    :deep(.el-input__prefix) {
      color: rgba(255, 255, 255, 0.7);
      font-size: 18px;
    }
  }
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  margin: 1px 0;
  
  .name {
    font-weight: 500;
    color: #ffffff;
  }
  
  .city {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }
}

/* 下拉菜单样式 */
:deep(.el-autocomplete-suggestion) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  .el-autocomplete-suggestion__list {
    background: transparent;
    
    li {
      background: transparent;
      color: #ffffff;
      
      &:hover {
        background: rgba(0, 122, 255, 0.2);
      }
      
      &.highlighted {
        background: rgba(0, 122, 255, 0.3);
      }
    }
  }
}
</style>