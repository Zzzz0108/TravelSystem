import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  withCredentials: true // 允许跨域请求携带认证信息
})

export const useSpotStore = defineStore('spot', () => {
  const spots = ref([])
  const favoriteSpots = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 按热度排序的计算属性
  const sortedSpots = computed(() => {
    if (!spots.value || !Array.isArray(spots.value)) {
      return []
    }
    return [...spots.value]
      .filter(spot => spot && typeof spot === 'object' && spot.id && spot.name)
      .sort((a, b) => {
        if (!a || !b) return 0
        if (!a.popularity || !b.popularity) return 0
        return b.popularity - a.popularity  // 按人气降序排序
      })
  })

  const fetchSpots = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/spots')
      if (response.data && Array.isArray(response.data)) {
        // 确保数据格式正确
        spots.value = response.data.map(spot => ({
          id: spot.id,
          name: spot.name,
          city: spot.city,
          popularity: spot.popularity || 0,
          type: spot.type,
          image: spot.image,
          created_at: spot.created_at,
          updated_at: spot.updated_at,
          isFavorited: spot.isFavorited || false,
          userRating: spot.userRating || null
        }))
      } else {
        spots.value = []
        error.value = '获取景点数据格式错误'
      }
    } catch (err) {
      error.value = '获取景点数据失败，请稍后重试'
      console.error('获取景点数据失败:', err)
      spots.value = []
    } finally {
      loading.value = false
    }
  }

  const searchSpots = async (keyword = '', type = '') => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/spots/search', {
        params: {
          keyword,
          type
        }
      })
      if (response.data && Array.isArray(response.data)) {
        // 确保数据格式正确
        spots.value = response.data.map(spot => ({
          id: spot.id,
          name: spot.name,
          city: spot.city,
          popularity: spot.popularity || 0,
          type: spot.type,
          image: spot.image,
          created_at: spot.created_at,
          updated_at: spot.updated_at,
          isFavorited: spot.isFavorited || false,
          userRating: spot.userRating || null
        }))
      } else {
        spots.value = []
        error.value = '搜索数据格式错误'
      }
    } catch (err) {
      error.value = '搜索失败，请稍后重试'
      console.error('搜索失败:', err)
      spots.value = []
    } finally {
      loading.value = false
    }
  }

  const incrementViews = async (id) => {
    if (!id) return null
    try {
      const token = localStorage.getItem('token')
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      const response = await api.post(`/spots/${id}/increment-views`, null, config)
      
      if (response && response.data) {
        const updated = response.data
        // 更新本地数据
        const idx = spots.value.findIndex(s => s.id === id)
        if (idx !== -1) {
          spots.value[idx] = { ...spots.value[idx], ...updated }
        }
        return updated
      }
      return null
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        // 未登录用户静默失败，不影响导航
        return null
      }
      console.error('增加浏览量失败:', err)
      return null
    }
  }

  const addFavorite = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }
      
      console.log('开始添加收藏，景点ID:', id);
      const response = await api.post(`/spots/${id}/toggle-favorite`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        console.log('添加收藏成功，响应数据:', response.data);
        // 更新收藏列表
        favoriteSpots.value = [...favoriteSpots.value, response.data];
        // 更新景点列表中的收藏状态
        const spotIndex = spots.value.findIndex(spot => spot.id === id);
        if (spotIndex !== -1) {
          spots.value[spotIndex].favorited = true;
        }
      }
    } catch (error) {
      console.error('添加收藏失败:', error);
      throw error;
    }
  }

  const removeFavorite = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }
      
      console.log('开始取消收藏，景点ID:', id);
      const response = await api.post(`/spots/${id}/toggle-favorite`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        console.log('取消收藏成功，响应数据:', response.data);
        // 更新收藏列表
        favoriteSpots.value = favoriteSpots.value.filter(spot => spot.id !== id);
        // 更新景点列表中的收藏状态
        const spotIndex = spots.value.findIndex(spot => spot.id === id);
        if (spotIndex !== -1) {
          spots.value[spotIndex].favorited = false;
        }
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      throw error;
    }
  }

  const fetchFavoriteSpots = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        favoriteSpots.value = []
        return []
      }
      const response = await api.get('/spots/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const list = Array.isArray(response.data) ? response.data : []
      favoriteSpots.value = list.map(spot => ({
        id: spot.id,
        name: spot.name,
        city: spot.city,
        popularity: spot.popularity || 0,
        type: spot.type,
        image: spot.image,
        created_at: spot.created_at ?? spot.createdAt,
        updated_at: spot.updated_at ?? spot.updatedAt
      }))
      return favoriteSpots.value
    } catch (err) {
      favoriteSpots.value = favoriteSpots.value || []
      return favoriteSpots.value
    }
  }

  const toggleFavorite = async (id) => {
    try {
      console.log('开始切换收藏状态，景点ID:', id)
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('未找到token，无法切换收藏')
        return false
      }
      
      console.log('调用后端toggle-favorite接口...')
      const response = await api.post(`/spots/${id}/toggle-favorite`, null, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('后端响应:', response)
      console.log('响应数据:', response.data)
      
      // 检查响应状态
      if (response.status !== 200) {
        console.error('后端返回非200状态:', response.status)
        return false
      }
      
      // 根据后端响应判断当前收藏状态
      let nowFavorited = false
      if (response.data && typeof response.data === 'object') {
        // 如果后端返回了景点对象，说明现在是已收藏状态
        if (response.data.id) {
          nowFavorited = true
          console.log('后端返回景点对象，当前为已收藏状态')
        }
      } else if (response.data === true || response.data === 'true') {
        // 如果后端返回true，说明现在是已收藏状态
        nowFavorited = true
        console.log('后端返回true，当前为已收藏状态')
      } else if (response.data === false || response.data === 'false') {
        // 如果后端返回false，说明现在是未收藏状态
        nowFavorited = false
        console.log('后端返回false，当前为未收藏状态')
      } else {
        // 其他情况，需要重新获取收藏列表来判断
        console.log('后端返回格式不明确，重新获取收藏列表')
        await fetchFavoriteSpots()
        nowFavorited = favoriteSpots.value.some(s => s.id === id)
        console.log('重新获取后，当前收藏状态:', nowFavorited)
      }
      
      console.log('最终收藏状态:', nowFavorited)
      
      // 同步 favoriteSpots
      if (nowFavorited) {
        const exists = favoriteSpots.value.some(s => s.id === id)
        if (!exists) {
          // 如果景点不在收藏列表中，需要添加
          const spotToAdd = spots.value.find(s => s.id === id)
          if (spotToAdd) {
            favoriteSpots.value = [...favoriteSpots.value, spotToAdd]
            console.log('添加到收藏列表:', spotToAdd)
          }
        }
      } else {
        // 从收藏列表中移除
        favoriteSpots.value = favoriteSpots.value.filter(s => s.id !== id)
        console.log('从收藏列表移除，ID:', id)
      }
      
      // 同步列表中的收藏标记
      const idx = spots.value.findIndex(s => s.id === id)
      if (idx !== -1) {
        spots.value[idx] = { ...spots.value[idx], isFavorited: nowFavorited }
        console.log('更新spots列表中的收藏标记:', nowFavorited)
      }
      
      console.log('当前收藏列表:', favoriteSpots.value)
      console.log('当前spots列表收藏状态:', spots.value.map(s => ({ id: s.id, isFavorited: s.isFavorited })))
      
      return nowFavorited
    } catch (err) {
      console.error('切换收藏状态失败:', err)
      return false
    }
  }

  const rateSpot = async (spotId, rating) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未登录，请先登录')
      }

      const response = await api.post(`/spots/${spotId}/rate`, null, {
        params: { rating },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data) {
        // 更新本地景点数据
        const index = spots.value.findIndex(s => s.id === spotId)
        if (index !== -1) {
          spots.value[index] = response.data
        }
        return response.data
      }
      throw new Error('评分失败')
    } catch (err) {
      console.error('评分失败:', err)
      throw err
    }
  }

  const getSpotRatings = async (spotId) => {
    try {
      const response = await api.get(`/spots/${spotId}/ratings`)
      return response.data
    } catch (err) {
      console.error('获取评分信息失败:', err)
      throw err
    }
  }

  const fetchSpotById = async (id) => {
    if (!id) return null
    try {
      const token = localStorage.getItem('token')
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      let response
      try {
        response = await api.get(`/spots/${id}`, config)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          response = await api.get(`/spots/${id}`)
        } else {
          throw err
        }
      }
      const data = response && response.data ? response.data : null
      if (!data || !data.id) throw new Error('empty')
      const mapped = {
        id: data.id,
        name: data.name,
        city: data.city,
        popularity: data.popularity || 0,
        type: data.type,
        image: data.image,
        created_at: data.created_at ?? data.createdAt,
        updated_at: data.updated_at ?? data.updatedAt,
        isFavorited: data.isFavorited ?? null,
        userRating: data.userRating ?? null,
        description: data.description ?? '',
        views: typeof data.views === 'number' ? data.views : 0,
        favorites: typeof data.favorites === 'number' ? data.favorites : 0
      }
      const idx = spots.value.findIndex(s => s.id === mapped.id)
      if (idx !== -1) {
        spots.value[idx] = { ...spots.value[idx], ...mapped }
      } else {
        spots.value.push(mapped)
      }
      return mapped
    } catch (err) {
      const cached = spots.value.find(s => s.id === id)
      if (cached) return cached
      try {
        await fetchSpots()
        return spots.value.find(s => s.id === id) || null
      } catch {
        return null
      }
    }
  }

  const fetchSpotRatings = async (id) => {
    if (!id) return null
    try {
      const token = localStorage.getItem('token')
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      let response
      try {
        response = await api.get(`/spots/${id}/ratings`, config)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          response = await api.get(`/spots/${id}/ratings`) // Anonymous retry
        } else {
          throw err
        }
      }
      const data = response && response.data ? response.data : null
      if (!data) return null
      const mapped = {
        averageRating: typeof data.averageRating === 'number' ? data.averageRating : 0,
        ratingCount: typeof data.ratingCount === 'number' ? data.ratingCount : 0
      }
      const idx = spots.value.findIndex(s => s.id === id)
      if (idx !== -1) {
        spots.value[idx] = { ...spots.value[idx], ...mapped }
      }
      return mapped
    } catch (err) {
      return null
    }
  }

  // 获取景点收藏人数
  const fetchFavoriteCount = async (id) => {
    if (!id) return 0
    try {
      const token = localStorage.getItem('token')
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      let response
      
      try {
        response = await api.get(`/spots/${id}/favorite-count`, config)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          // 如果认证失败，尝试匿名访问
          response = await api.get(`/spots/${id}/favorite-count`)
        } else {
          throw err
        }
      }
      
      const count = response && response.data ? parseInt(response.data) : 0
      
      // 更新本地数据
      const idx = spots.value.findIndex(s => s.id === id)
      if (idx !== -1) {
        spots.value[idx] = { ...spots.value[idx], favorites: count }
      }
      
      return count
    } catch (err) {
      console.error('获取收藏人数失败:', err)
      return 0
    }
  }

  return {
    spots,
    favoriteSpots,
    loading,
    error,
    sortedSpots,
    fetchSpots,
    searchSpots,
    incrementViews,
    addFavorite,
    removeFavorite,
    fetchSpotById,
    fetchSpotRatings,
    fetchFavoriteSpots,
    toggleFavorite,
    fetchFavoriteCount,
    rateSpot,
    getSpotRatings
  }
}) 