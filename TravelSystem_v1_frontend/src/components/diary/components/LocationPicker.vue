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

// 省份城市映射（从 useProvinceFilter 中提取）
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

// 根据城市获取省份
const getProvinceByCity = (city) => {
  for (const [province, cities] of Object.entries(provinceCityMap)) {
    if (cities.some(c => city && city.includes(c))) {
      return province
    }
  }
  return ''
}

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
  
  // 获取省份信息
  const province = getProvinceByCity(item.city)
  
  const locationData = {
    id: item.id,
    name: item.name,
    city: item.city,
    province: province,
    type: item.type,
    ratingCount: item.ratingCount,
    averageRating: item.averageRating
  }
  
  emit('update:modelValue', locationData)
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