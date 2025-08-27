import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useProvinceFilter() {
  const route = useRoute()
  const router = useRouter()
  
  // 省份筛选状态
  const selectedProvince = ref('')
  
  // 省份数据配置
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
  
  // 省份城市映射
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
  
  // 判断城市是否属于某个省份
  const isCityInProvince = (city, province) => {
    if (!city || !province) return false
    const cities = provinceCityMap[province] || []
    return cities.some(c => city.includes(c))
  }
  
  // 根据省份筛选景点
  const filterSpotsByProvince = (spots, province) => {
    if (!province) return spots
    return spots.filter(spot => isCityInProvince(spot.city, province))
  }
  
  // 选择省份
  const selectProvince = (province) => {
    selectedProvince.value = province
    
    if (province) {
      localStorage.setItem('selectedProvince', province)
      router.push({ path: '/', query: { province } })
    } else {
      localStorage.removeItem('selectedProvince')
      router.push({ path: '/', query: {} })
    }
  }
  
  // 清除省份筛选
  const clearProvinceFilter = () => {
    selectProvince('')
  }
  
  // 获取当前选中的省份标签
  const getCurrentProvinceLabel = () => {
    const selectedProvinceData = provinces.find(p => p.value === selectedProvince.value)
    return selectedProvinceData ? selectedProvinceData.name : '选择省份'
  }
  
  // 初始化省份筛选状态
  const initProvinceFilter = () => {
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
  }
  
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
  
  return {
    // 状态
    selectedProvince,
    provinces,
    
    // 方法
    isCityInProvince,
    filterSpotsByProvince,
    selectProvince,
    clearProvinceFilter,
    getCurrentProvinceLabel,
    initProvinceFilter
  }
} 