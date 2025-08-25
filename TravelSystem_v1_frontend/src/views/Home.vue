<template>
  <div class="home">
    <div class="search-section">
      <div class="search-header">
        <h2 class="search-title">探索精彩景点</h2>
        <p class="search-subtitle">发现世界各地的美丽风景和文化遗产</p>
      </div>
      
      <div class="search-bar">
        <div class="search-input-group">
          <div class="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input 
            type="text" 
            v-model="searchKeyword"
            placeholder="搜索景点名称、城市或特色..."
            @input="handleSearch"
            aria-label="搜索景点"
            class="search-input"
          >
          <button 
            v-if="searchKeyword" 
            @click="clearSearch" 
            class="clear-search-btn"
            aria-label="清除搜索"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="filter-group">
          <div class="filter-select-wrapper">
            <div class="filter-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
              </svg>
            </div>
            <select 
              v-model="selectedType" 
              @change="handleSearch"
              aria-label="景点类型"
              class="filter-select"
            >
              <option value="">全部类型</option>
              <option 
                v-for="type in spotTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <button 
            @click="handleSearch" 
            class="search-btn"
            :disabled="!searchKeyword && !selectedType"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m21 21-4.35-4.35"/>
              <circle cx="11" cy="11" r="8"/>
            </svg>
            <span>搜索</span>
          </button>
        </div>
      </div>
      
      <!-- 热门搜索标签 -->
      <div class="hot-searches" v-if="!searchKeyword && !selectedType">
        <span class="hot-label">热门搜索：</span>
        <div class="hot-tags">
          <button 
            v-for="tag in hotSearchTags" 
            :key="tag"
            @click="searchByTag(tag)"
            class="hot-tag"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="spotStore.error" class="error-message">
      {{ spotStore.error }}
    </div>

    <div v-if="!spotStore.loading && filteredSpots.length === 0" class="empty-state">
      {{ selectedProvince ? `在${selectedProvince}没有找到相关景点` : '没有找到相关景点' }}
    </div>

    <div class="spot-list" v-if="!spotStore.loading && filteredSpots.length > 0">
      <div class="search-info">
        找到 {{ filteredSpots.length }} 个景点
        {{ selectedProvince ? `（${selectedProvince}）` : '' }}
      </div>
      <template v-for="spot in filteredSpots" :key="spot.id">
        <spot-card 
          v-if="spot && typeof spot === 'object' && spot.id && spot.name"
          :spot="spot"
        />
      </template>
    </div>

    <div v-if="spotStore.loading" class="loading">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash-es'
import SpotCard from '@/components/spot/SpotCard.vue'
import { useSpotStore } from '@/stores/spotStore'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const spotStore = useSpotStore()
const userStore = useUserStore()
const searchKeyword = ref('')
const selectedType = ref('')
const selectedProvince = ref('')

const spotTypes = [
  { value: 'SCENIC_AREA', label: '景区' },
  { value: 'UNIVERSITY', label: '学校' }
]

// 根据省份筛选景点
const filteredSpots = computed(() => {
  if (!selectedProvince.value) {
    return spotStore.sortedSpots
  }
  
  return spotStore.sortedSpots.filter(spot => {
    // 检查景点的城市是否属于选中的省份
    return isCityInProvince(spot.city, selectedProvince.value)
  })
})

// 判断城市是否属于某个省份
const isCityInProvince = (city, province) => {
  const provinceCityMap = {
    '北京': ['北京', '北京市'],
    '上海': ['上海', '上海市'],
    '云南': ['昆明', '大理', '丽江', '西双版纳', '香格里拉', '玉龙', '腾冲', '瑞丽', '芒市', '景洪', '勐海', '勐腊', '德宏', '怒江', '迪庆', '临沧', '普洱', '楚雄', '红河', '文山', '昭通', '保山', '德宏', '怒江', '迪庆'],
    '四川': ['成都', '都江堰', '青城山', '峨眉山', '乐山', '九寨沟', '黄龙', '稻城', '亚丁', '海螺沟', '四姑娘山', '西岭雪山', '天台山', '剑门关', '阆中', '自贡', '宜宾', '泸州', '内江', '资阳', '遂宁', '南充', '达州', '广安', '巴中', '雅安', '眉山', '攀枝花', '德阳', '广元', '绵阳', '阿坝', '甘孜', '凉山'],
    '浙江': ['杭州', '西湖', '千岛湖', '西溪湿地', '灵隐寺', '雷峰塔', '断桥', '白堤', '苏堤', '三潭印月', '花港观鱼', '曲院风荷', '平湖秋月', '双峰插云', '南屏晚钟', '雷峰夕照', '断桥残雪', '宁波', '天一阁', '月湖', '东钱湖', '溪口', '普陀山', '舟山', '朱家尖', '桃花岛', '嵊泗', '岱山', '温岭', '台州', '天台山', '国清寺', '赤城山', '华顶山', '石梁飞瀑', '琼台仙谷', '龙穿峡', '寒山湖', '济公故居', '绍兴', '鲁迅故里', '沈园', '兰亭', '东湖', '柯岩', '鉴湖', '五泄', '新昌', '大佛寺', '穿岩十九峰', '沃洲湖', '天姥山', '温州', '雁荡山', '楠溪江', '江心屿', '南麂列岛', '洞头', '永嘉', '乐清', '瑞安', '平阳', '苍南', '文成', '泰顺', '湖州', '南浔古镇', '莫干山', '太湖', '安吉', '长兴', '德清', '嘉兴', '南湖', '乌镇', '西塘', '海宁', '盐官', '钱塘江', '海盐', '平湖', '桐乡', '嘉善', '金华', '横店影视城', '双龙洞', '方岩', '仙华山', '诸葛八卦村', '义乌', '东阳', '永康', '兰溪', '浦江', '武义', '磐安', '衢州', '江郎山', '龙游石窟', '开化', '常山', '江山', '丽水', '仙都', '缙云', '青田', '龙泉', '云和', '庆元', '松阳', '遂昌', '景宁', '莲都', '缙云', '青田', '龙泉', '云和', '庆元', '松阳', '遂昌', '景宁', '莲都']
  }
  
  const cities = provinceCityMap[province] || []
  return cities.some(c => city && city.includes(c))
}

onMounted(async () => {
  try {
    // 从localStorage获取选中的省份
    const savedProvince = localStorage.getItem('selectedProvince')
    if (savedProvince) {
      selectedProvince.value = savedProvince
    }
    
    // 从URL参数获取省份
    if (route.query.province) {
      selectedProvince.value = route.query.province
      localStorage.setItem('selectedProvince', route.query.province)
    }
    
    await spotStore.fetchSpots()
  } catch (error) {
    console.error('获取景点数据失败:', error)
    spotStore.error = '获取景点数据失败，请稍后重试'
  }
})

// 监听URL变化
watch(() => route.query.province, (newProvince) => {
  if (newProvince) {
    selectedProvince.value = newProvince
    localStorage.setItem('selectedProvince', newProvince)
  } else {
    selectedProvince.value = ''
    localStorage.removeItem('selectedProvince')
  }
})

const debouncedSearch = debounce(async () => {
  try {
    await spotStore.searchSpots(searchKeyword.value, selectedType.value)
  } catch (error) {
    console.error('搜索失败:', error)
    spotStore.error = '搜索失败，请稍后重试'
  }
}, 300)

const handleSearch = () => {
  spotStore.error = null
  debouncedSearch()
}

const clearSearch = () => {
  searchKeyword.value = ''
  selectedType.value = ''
  handleSearch() // 重新触发搜索以应用新的过滤条件
}

const hotSearchTags = [
  '故宫', '长城', '西湖', '黄山', '丽江古城', '张家界', '九寨沟', '布达拉宫', '长城', '故宫', '西湖', '黄山', '丽江古城', '张家界', '九寨沟', '布达拉宫'
]

const searchByTag = (tag) => {
  searchKeyword.value = tag
  handleSearch()
}
</script>

<style lang="scss" scoped>
.home {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
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
    
    &:focus {
      outline: none;
      border-color: #007AFF;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .clear-search-btn {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    transition: all 0.3s ease;
    z-index: 2;

    &:hover {
      color: #007AFF;
      background-color: rgba(0, 122, 255, 0.2);
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }

  .filter-group {
    display: flex;
    gap: 16px;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      width: 100%;
    }
  }

  .filter-select-wrapper {
    position: relative;
    min-width: 200px;
  }

  .filter-icon {
    position: absolute;
    top: 55%;
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

  .filter-select {
    padding: 16px 16px 16px 48px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    width: 100%;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 20px;
    transition: all 0.3s ease;
    color: #ffffff;

    &:focus {
      outline: none;
      border-color: #007AFF;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
    }
    
    option {
      background: rgba(0, 0, 0, 0.9);
      color: #ffffff;
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

.spot-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  justify-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.search-info {
  grid-column: 1 / -1;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
}

.loading, .empty-state, .error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 20px 0;
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.3);
}

.empty-state {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  background: rgba(0, 0, 0, 0.2);
}
</style>