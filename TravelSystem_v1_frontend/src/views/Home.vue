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
    '天津': ['天津', '天津市'],
    '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
    '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
    '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
    '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
    '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'],
    '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化', '大兴安岭'],
    '上海': ['上海', '上海市'],
    '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
    '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
    '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
    '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
    '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
    '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '莱芜', '临沂', '德州', '聊城', '滨州', '菏泽'],
    '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源'],
    '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施'],
    '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西'],
    '广东': ['广州', '韶关', '深圳', '珠海', '汕头', '佛山', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
    '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
    '海南': ['海口', '三亚', '三沙', '儋州'],
    '重庆': ['重庆', '重庆市'],
    '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝', '甘孜', '凉山'],
    '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南', '黔东南', '黔南'],
    '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄', '红河', '文山', '西双版纳', '大理', '德宏', '怒江', '迪庆'],
    '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'],
    '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
    '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏', '甘南'],
    '青海': ['西宁', '海东', '海北', '黄南', '海南', '果洛', '玉树', '海西'],
    '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
    '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰'],
    '台湾': ['台北', '新北', '桃园', '台中', '台南', '高雄', '基隆', '新竹', '嘉义'],
    '香港': ['香港', '香港特别行政区'],
    '澳门': ['澳门', '澳门特别行政区']
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