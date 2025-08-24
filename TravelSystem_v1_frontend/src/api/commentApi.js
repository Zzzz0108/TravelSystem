import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9090/api',
  timeout: 10000
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    console.error('评论API请求失败:', error);
    console.error('错误状态码:', error.response?.status);
    console.error('错误响应:', error.response?.data);
    
    if (error.response?.status === 401) {
      // token 过期或无效，清除用户信息
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('权限不足，无法执行此操作');
    } else if (error.response?.status === 404) {
      console.error('资源不存在');
    } else if (error.response?.status === 500) {
      console.error('服务器内部错误');
    }
    return Promise.reject(error);
  }
);

// 获取日记的评论
export const getCommentsByDiaryId = async (diaryId, params) => {
  const response = await api.get(`/comments/diary/${diaryId}`, { params });
  return response.data;
};

// 创建评论
export const createComment = async (diaryId, comment) => {
  try {
    console.log('正在创建评论:', `/comments/diary/${diaryId}`, '评论内容:', comment);
    const response = await api.post(`/comments/diary/${diaryId}`, comment);
    console.log('创建评论响应:', response);
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    console.log('响应数据类型:', typeof response.data);
    
    // 检查响应状态
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`评论创建失败，HTTP状态码: ${response.status}`);
    }
    
    // 检查响应数据
    if (!response.data) {
      throw new Error('评论创建失败，响应数据为空');
    }
    
    // 检查必要字段
    if (!response.data.id || !response.data.content) {
      console.warn('响应数据缺少必要字段:', response.data);
      throw new Error('评论创建失败，响应数据格式不完整');
    }
    
    console.log('评论创建成功，返回数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('创建评论失败:', error);
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    }
    
    throw error;
  }
};

// 删除评论
export const deleteComment = async (id) => {
  await api.delete(`/comments/${id}`);
};

// 获取用户的所有评论
export const getCommentsByUserId = async (userId, params) => {
  const response = await api.get(`/comments/user/${userId}`, { params });
  return response.data;
}; 