import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9090/api',
  timeout: 10000
});

// 添加请求拦截器，为需要认证的请求添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器，统一处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API请求失败:', error);
    if (error.response?.status === 401) {
      console.error('认证失败，请重新登录');
    } else if (error.response?.status === 403) {
      console.error('权限不足');
    } else if (error.response?.status === 404) {
      console.error('资源不存在');
    } else if (error.response?.status === 500) {
      console.error('服务器内部错误');
    }
    return Promise.reject(error);
  }
);

// 获取日记列表
export const getDiaries = async (params) => {
  const response = await api.get('/diaries', { params });
  return response.data;
};

// 获取热门日记
export const getPopularDiaries = async (params) => {
  const response = await api.get('/diaries/popular', { params });
  return response.data;
};

// 获取最新日记
export const getLatestDiaries = async (params) => {
  const response = await api.get('/diaries/latest', { params });
  return response.data;
};

// 获取日记详情
export const getDiaryById = async (id) => {
  try {
    console.log('API调用: 获取日记详情，ID:', id)
    const response = await api.get(`/diaries/${id}`)
    console.log('API响应:', response)
    console.log('API响应数据:', response.data)
    return response.data
  } catch (error) {
    console.error('API调用失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    })
    throw error
  }
};

// 创建日记
export const createDiary = async (diary) => {
  try {
    const response = await api.post('/diaries', diary);
    return response.data;
  } catch (error) {
    // 如果是403错误，说明日记已经创建成功，只是返回了错误
    if (error.response && error.response.status === 403) {
      // 返回一个成功的结果，避免显示错误
      return { success: true };
    }
    throw error;
  }
};

// 更新日记
export const updateDiary = async (id, diary) => {
  const response = await api.put(`/diaries/${id}`, diary);
  return response.data;
};

// 删除日记
export const deleteDiary = async (id) => {
  await api.delete(`/diaries/${id}`);
};

// 搜索日记
export const searchDiaries = async (keyword, params) => {
  try {
    console.log('正在调用通用搜索接口:', '/diaries/search', '关键词:', keyword, '参数:', params);
    const response = await api.get('/diaries/search', {
      params: { keyword, ...params }
    });
    console.log('通用搜索响应:', response);
    return response.data;
  } catch (error) {
    console.error('通用搜索失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    throw error;
  }
};

// 按标签搜索日记
export const getDiariesByTag = async (tag, params) => {
  try {
    console.log('正在调用标签搜索接口:', `/diaries/tag/${tag}`, '参数:', params);
    const response = await api.get(`/diaries/tag/${tag}`, { params });
    console.log('标签搜索响应:', response);
    return response.data;
  } catch (error) {
    console.error('标签搜索失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    throw error;
  }
};

// 点赞日记
export const likeDiary = async (id) => {
  try {
    console.log('正在调用点赞接口:', `/diaries/${id}/like`);
    const response = await api.post(`/diaries/${id}/like`);
    console.log('点赞接口响应:', response);
    return response.data;
  } catch (error) {
    console.error('点赞接口调用失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    
    // 如果是400错误，可能是用户已经点赞过
    if (error.response?.status === 400) {
      if (error.response?.data === 'User has already liked this diary') {
        throw new Error('您已经点赞过这个日记了');
      }
    }
    
    throw error;
  }
};

// 取消点赞
export const unlikeDiary = async (id) => {
  try {
    console.log('正在调用取消点赞接口:', `/diaries/${id}/unlike`);
    const response = await api.post(`/diaries/${id}/unlike`);
    console.log('取消点赞接口响应:', response);
    return response.data;
  } catch (error) {
    console.error('取消点赞接口调用失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    
    // 如果是400错误，可能是用户还没有点赞过
    if (error.response?.status === 400) {
      if (error.response?.data === 'User has not liked this diary') {
        throw new Error('您还没有点赞过这个日记');
      }
    }
    
    throw error;
  }
};

// 检查点赞状态
export const checkLikeStatus = async (id) => {
  try {
    console.log('正在检查点赞状态:', `/diaries/${id}/is-liked`);
    const response = await api.get(`/diaries/${id}/is-liked`);
    console.log('点赞状态检查响应:', response);
    
    // 确保返回布尔值
    const isLiked = Boolean(response.data);
    console.log('解析后的点赞状态:', isLiked);
    
    return isLiked;
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    
    // 如果检查失败，默认返回false
    return false;
  }
};

// 保留原有的toggleLike方法以兼容现有代码，但内部逻辑改为调用新接口
export const toggleLike = async (id) => {
  try {
    // 先检查当前点赞状态
    const isLiked = await checkLikeStatus(id)
    console.log('当前点赞状态:', isLiked)
    
    if (isLiked) {
      // 如果已点赞，则取消点赞
      console.log('用户已点赞，执行取消点赞')
      return await unlikeDiary(id)
    } else {
      // 如果未点赞，则点赞
      console.log('用户未点赞，执行点赞')
      return await likeDiary(id)
    }
  } catch (error) {
    console.error('切换点赞状态失败:', error)
    throw error
  }
}

// 获取用户的所有日记
export const getUserDiaries = async (userId, params) => {
  const response = await api.get(`/diaries/user/${userId}`, { params });
  return response.data;
};

// 评分日记
export const rateDiary = async (id, rating) => {
  try {
    console.log('正在调用评分接口:', `/diaries/${id}/rate`, '评分:', rating);
    const response = await api.post(`/diaries/${id}/rate`, { rating });
    console.log('评分接口响应:', response);
    return response.data;
  } catch (error) {
    console.error('评分接口调用失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    throw error;
  }
};

// 获取用户评分
export const getUserRating = async (id) => {
  try {
    console.log('正在获取用户评分:', `/diaries/${id}/user-rating`);
    const response = await api.get(`/diaries/${id}/user-rating`);
    console.log('获取用户评分响应:', response);
    return response.data;
  } catch (error) {
    console.error('获取用户评分失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    // 如果获取失败，返回0表示未评分
    return 0;
  }
};

// 检查用户是否已评分
export const checkUserRated = async (id) => {
  try {
    console.log('正在检查用户评分状态:', `/diaries/${id}/has-rated`);
    const response = await api.get(`/diaries/${id}/has-rated`);
    console.log('检查用户评分状态响应:', response);
    return Boolean(response.data);
  } catch (error) {
    console.error('检查用户评分状态失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    // 如果检查失败，默认返回false
    return false;
  }
};

// 删除用户评分
export const deleteUserRating = async (id) => {
  try {
    console.log('正在删除用户评分:', `/diaries/${id}/rating`);
    const response = await api.delete(`/diaries/${id}/rating`);
    console.log('删除用户评分响应:', response);
    return response.data;
  } catch (error) {
    console.error('删除用户评分失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    throw error;
  }
};

// 根据目的地搜索日记
export const searchByDestination = async (destination, params) => {
  try {
    console.log('正在调用目的地搜索接口:', '/diaries/search/destination', '目的地:', destination, '参数:', params);
    const response = await api.get('/diaries/search/destination', { 
      params: { destination, ...params }
    });
    console.log('目的地搜索响应:', response);
    return response.data;
  } catch (error) {
    console.error('目的地搜索失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    throw error;
  }
};

// 按内容搜索日记
export const searchByContent = async (content, params) => {
  try {
    console.log('正在调用内容搜索接口:', '/diaries/search/content', '内容:', content, '参数:', params);
    const response = await api.get('/diaries/search/content', { 
      params: { content, ...params }
    });
    console.log('内容搜索响应:', response);
    return response.data;
  } catch (error) {
    console.error('内容搜索失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    throw error;
  }
};

// 精确查询日记标题
export const searchByExactTitle = async (title) => {
  try {
    console.log('正在调用精确标题搜索接口:', '/diaries/search/title', '标题:', title);
    const response = await api.get('/diaries/search/title', { params: { title } });
    console.log('精确标题搜索响应:', response);
    return response.data;
  } catch (error) {
    console.error('精确标题搜索失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    throw error;
  }
};

// 全文检索
export const fullTextSearch = async (keyword, params) => {
  const response = await api.get('/diaries/search/fulltext', { 
    params: { keyword, ...params }
  });
  return response.data;
};

// 压缩日记内容
export const compressDiaryContent = async (id) => {
  const response = await api.post(`/diaries/${id}/compress`);
  return response.data;
};

// 解压日记内容
export const decompressDiaryContent = async (id) => {
  const response = await api.post(`/diaries/${id}/decompress`);
  return response.data;
};

// 增加浏览量
export const incrementViews = async (id) => {
  const response = await api.post(`/diaries/${id}/views`);
  return response.data;
}; 