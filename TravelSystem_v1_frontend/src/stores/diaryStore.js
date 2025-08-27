import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as diaryApi from '@/api/diaryApi'
import * as commentApi from '@/api/commentApi'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export const useDiaryStore = defineStore('diary', () => {
  const diaries = ref([])
  const currentDiary = ref(null)
  const comments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 获取日记列表
  const fetchDiaries = async (params) => {
    try {
      loading.value = true
      const response = await diaryApi.getDiaries(params)
      diaries.value = response.content
    } catch (err) {
      error.value = err.message
      ElMessage.error('获取日记列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取日记列表（使用后端的热度+评分排序，支持分页）
  const fetchPopularDiaries = async (params = {}) => {
    try {
      loading.value = true
      const response = await diaryApi.getPopularDiaries(params)
      diaries.value = response.content || []
      
      // 返回完整响应，包含分页信息
      return response
    } catch (err) {
      error.value = err.message
      ElMessage.error('获取日记列表失败')
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20
      }
    } finally {
      loading.value = false
    }
  }

  // 获取按评分排序的日记（支持分页）
  const fetchPopularDiariesByScore = async (params = {}) => {
    try {
      loading.value = true
      const response = await diaryApi.getPopularDiaries(params)
      diaries.value = response.content || []
      
      // 返回完整响应，包含分页信息
      return response
    } catch (err) {
      error.value = err.message
      ElMessage.error('获取评分日记失败')
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20
      }
    } finally {
      loading.value = false
    }
  }

  // 获取最新日记（支持分页）
  const fetchLatestDiaries = async (params = {}) => {
    try {
      loading.value = true
      const response = await diaryApi.getLatestDiaries(params)
      diaries.value = response.content || []
      
      // 返回完整响应，包含分页信息
      return response
    } catch (err) {
      error.value = err.message
      ElMessage.error('获取最新日记失败')
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20
      }
    } finally {
      loading.value = false
    }
  }

  // 获取日记详情
  const fetchDiaryById = async (id) => {
    try {
      loading.value = true
      console.log('开始获取日记详情，ID:', id)
      
      const diary = await diaryApi.getDiaryById(id)
      console.log('API返回的原始日记数据:', diary)
      
      if (!diary) {
        console.error('API返回null或undefined')
        ElMessage.error('日记不存在或已被删除')
        return null
      }
      
      // 创建日记对象的副本，避免修改原始数据
      const processedDiary = { ...diary }
      
      // 处理视频URL
      if (processedDiary.videoUrl) {
        console.log('找到视频URL:', processedDiary.videoUrl)
        processedDiary.videoUrl = processedDiary.videoUrl.startsWith('http') 
          ? processedDiary.videoUrl 
          : `http://localhost:9090${processedDiary.videoUrl}`
        console.log('处理后的视频URL:', processedDiary.videoUrl)
      }
      
      // 处理图片URLs
      if (processedDiary.images && processedDiary.images.length > 0) {
        console.log('找到图片:', processedDiary.images)
        try {
          processedDiary.images = processedDiary.images.map(img => {
            const processedImg = { ...img }
            if (img.imageUrl) {
              processedImg.imageUrl = img.imageUrl.startsWith('http') 
                ? img.imageUrl 
                : `http://localhost:9090${img.imageUrl}`
            }
            if (img.url) {
              processedImg.url = img.url.startsWith('http') 
                ? img.url 
                : `http://localhost:9090${img.url}`
            }
            return processedImg
          })
          console.log('处理后的图片:', processedDiary.images)
        } catch (imgError) {
          console.error('处理图片时出错:', imgError)
          // 即使图片处理失败，也不影响日记数据的返回
        }
      }
      
      console.log('处理完成的日记:', processedDiary)
      currentDiary.value = processedDiary
      console.log('设置到store的日记:', currentDiary.value)
      
      // 同时更新 diaries 数组中的对应日记，确保数据同步
      const index = diaries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        // 保留原有的点赞状态和数量，只更新其他字段
        const existingDiary = diaries.value[index]
        diaries.value[index] = {
          ...processedDiary,
          likes: existingDiary.likes || processedDiary.likes || 0,
          isLiked: existingDiary.isLiked || false
        }
        console.log('更新了 diaries 数组中的日记:', diaries.value[index])
      } else {
        // 如果 diaries 数组中没有找到，则添加进去
        diaries.value.push({
          ...processedDiary,
          likes: processedDiary.likes || 0,
          isLiked: false
        })
        console.log('在 diaries 数组中添加了新日记:', processedDiary)
      }
      
      return processedDiary
    } catch (err) {
      console.error('获取日记详情失败:', err)
      console.error('错误详情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      })
      
      if (err.response?.status === 404) {
        ElMessage.error('日记不存在或已被删除')
      } else if (err.response?.status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试')
      } else {
        ElMessage.error('获取日记详情失败')
      }
      
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // 创建日记
  const createDiary = async (diaryData) => {
    try {
      loading.value = true
      
      // 如果传入的是FormData，直接使用；否则转换为FormData
      let formData
      if (diaryData instanceof FormData) {
        formData = diaryData
      } else {
        // 兼容旧的调用方式
        formData = new FormData()
        Object.keys(diaryData).forEach(key => {
          if (key === 'media' && Array.isArray(diaryData[key])) {
            diaryData[key].forEach(file => {
              formData.append('media', file)
            })
          } else {
            formData.append(key, diaryData[key])
          }
        })
      }
      
      const newDiary = await diaryApi.createDiary(formData)
      diaries.value.unshift(newDiary)
      ElMessage.success('创建日记成功')
      return newDiary
    } catch (err) {
      error.value = err.message
      ElMessage.error('创建日记失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新日记
  const updateDiary = async (id, diary) => {
    try {
      loading.value = true
      const updatedDiary = await diaryApi.updateDiary(id, diary)
      const index = diaries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        diaries.value[index] = updatedDiary
      }
      if (currentDiary.value?.id === id) {
        currentDiary.value = updatedDiary
      }
      ElMessage.success('更新日记成功')
      return updatedDiary
    } catch (err) {
      error.value = err.message
      ElMessage.error('更新日记失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除日记
  const deleteDiary = async (id) => {
    try {
      loading.value = true
      await diaryApi.deleteDiary(id)
      diaries.value = diaries.value.filter(d => d.id !== id)
      if (currentDiary.value?.id === id) {
        currentDiary.value = null
      }
      ElMessage.success('删除日记成功')
    } catch (err) {
      error.value = err.message
      ElMessage.error('删除日记失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索日记（支持分页）
  const searchDiaries = async (keyword, searchMode = 'destination', params = {}) => {
    try {
      if (!keyword || !keyword.trim()) {
        // 如果没有搜索内容，获取所有日记
        const response = await fetchPopularDiaries(params);
        return response;
      }

      const trimmedKeyword = keyword.trim();
      console.log('Search Keyword:', trimmedKeyword);
      console.log('Search Mode:', searchMode);
      console.log('分页参数:', params);
      
      let response;
      
      if (searchMode === 'destination') {
        // 使用目的地搜索接口
        response = await diaryApi.searchDiariesByDestination(trimmedKeyword, params);
      } else if (searchMode === 'title') {
        // 使用标题搜索接口
        response = await diaryApi.searchByExactTitle(trimmedKeyword, params);
      } else if (searchMode === 'content') {
        // 使用内容搜索接口
        response = await diaryApi.searchByContent(trimmedKeyword, params);
      } else {
        // 使用通用搜索接口
        response = await diaryApi.searchDiaries(trimmedKeyword, params);
      }
      
      console.log('Search Response:', response);
      
      if (response && response.content) {
        diaries.value = response.content;
        console.log('Updated diaries:', diaries.value);
      } else {
        console.warn('No content in response');
        diaries.value = [];
      }
      
      // 返回完整响应，包含分页信息
      return response || {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20
      }
    } catch (error) {
      console.error('搜索日记失败:', error);
      ElMessage.error('搜索失败，请稍后重试');
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20
      }
    }
  };

  // 按标签搜索日记
  const getDiariesByTag = async (tag, params) => {
    try {
      loading.value = true
      const response = await diaryApi.getDiariesByTag(tag, params)
      diaries.value = response.content
    } catch (err) {
      error.value = err.message
      ElMessage.error('获取标签日记失败')
    } finally {
      loading.value = false
    }
  }

  // 点赞日记
  const likeDiary = async (id) => {
    try {
      loading.value = true
      const response = await diaryApi.likeDiary(id)
      console.log('点赞成功，响应:', response)
      
      // 更新日记的点赞数
      if (currentDiary.value?.id === id) {
        currentDiary.value.likes = (currentDiary.value.likes || 0) + 1
        currentDiary.value.isLiked = true
      }
      
      // 更新日记列表中的点赞数
      const index = diaries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        diaries.value[index].likes = (diaries.value[index].likes || 0) + 1
        diaries.value[index].isLiked = true
      }
      
      return response
    } catch (err) {
      error.value = err.message
      ElMessage.error('点赞失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 取消点赞
  const unlikeDiary = async (id) => {
    try {
      loading.value = true
      const response = await diaryApi.unlikeDiary(id)
      console.log('取消点赞成功，响应:', response)
      
      // 更新日记的点赞数
      if (currentDiary.value?.id === id) {
        currentDiary.value.likes = Math.max(0, (currentDiary.value.likes || 0) - 1)
        currentDiary.value.isLiked = false
      }
      
      // 更新日记列表中的点赞数
      const index = diaries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        diaries.value[index].likes = Math.max(0, (diaries.value[index].likes || 0) - 1)
        diaries.value[index].isLiked = false
      }
      
      return response
    } catch (err) {
      error.value = err.message
      ElMessage.error('取消点赞失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 检查点赞状态
  const checkLikeStatus = async (id) => {
    try {
      const response = await diaryApi.checkLikeStatus(id)
      console.log('点赞状态检查结果:', response)
      
      // 更新日记的点赞状态
      if (currentDiary.value?.id === id) {
        currentDiary.value.isLiked = response
      }
      
      // 更新日记列表中的点赞状态
      const index = diaries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        diaries.value[index].isLiked = response
      }
      
      return response
    } catch (err) {
      console.error('检查点赞状态失败:', err)
      return false
    }
  }

  // 点赞/取消点赞（兼容原有方法）
  const toggleLike = async (id) => {
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
    } catch (err) {
      error.value = err.message
      ElMessage.error('操作失败')
      return null
    }
  }

  // 获取评论
  const fetchComments = async (diaryId, params) => {
    try {
      loading.value = true
      const response = await commentApi.getCommentsByDiaryId(diaryId, params)
      if (response && response.content) {
        // 确保每个评论对象都包含必要的字段
        const formattedComments = response.content.map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          author: {
            id: comment.author?.id,
            username: comment.author?.username,
            avatar: comment.author?.avatar
          }
        }))
        comments.value = formattedComments
        console.log('获取到的评论:', comments.value)
      } else {
        comments.value = []
        console.log('没有评论数据')
      }
    } catch (err) {
      error.value = err.message
      ElMessage.error('获取评论失败')
      console.error('获取评论失败:', err)
      comments.value = []
    } finally {
      loading.value = false
    }
  }

  // 添加评论
  const createComment = async (diaryId, content) => {
    try {
      if (!diaryId || !content) {
        throw new Error('参数错误');
      }

      console.log('Store: 开始创建评论，日记ID:', diaryId, '内容:', content);
      const response = await commentApi.createComment(diaryId, { content });
      console.log('Store: 评论创建响应:', response);
      
      // 检查响应数据 - 使用更宽松的验证
      if (!response) {
        throw new Error('评论创建失败，响应数据为空');
      }
      
      // 如果响应没有ID字段，尝试从其他字段推断
      if (!response.id) {
        console.warn('响应数据缺少ID字段，尝试使用其他标识:', response);
        
        // 检查是否有其他唯一标识符
        if (response.content && response.createdAt) {
          console.log('使用内容和时间作为临时标识');
          // 创建一个临时ID，避免报错
          response.id = `temp_${Date.now()}`;
        } else {
          throw new Error('评论创建失败，响应数据格式不完整');
        }
      }

      console.log('Store: 评论数据验证通过，开始更新本地状态');
      
      if (currentDiary.value?.id === diaryId) {
        if (!currentDiary.value.comments) {
          currentDiary.value.comments = [];
        }
        // 确保新评论数据格式正确
        const newComment = {
          id: response.id,
          content: response.content,
          createdAt: response.createdAt,
          author: {
            id: response.author?.id,
            username: response.author?.username,
            avatar: response.author?.avatar
          }
        };
        currentDiary.value.comments = [newComment, ...currentDiary.value.comments];
        currentDiary.value.commentsCount = (currentDiary.value.commentsCount || 0) + 1;
        console.log('Store: 本地状态更新完成，新评论:', newComment);
      }
      
      console.log('Store: 评论创建成功，返回数据:', response);
      return response;
    } catch (err) {
      console.error('Store: 创建评论失败:', err);
      console.error('Store: 错误详情:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      error.value = err.message;
      ElMessage.error(err.message || '评论发布失败');
      throw err;
    }
  };

  // 删除评论
  const deleteComment = async (commentId) => {
    try {
      loading.value = true
      await commentApi.deleteComment(commentId)
      if (currentDiary.value) {
        currentDiary.value.comments = currentDiary.value.comments.filter(
          comment => comment.id !== commentId
        )
        currentDiary.value.commentsCount--
      }
      ElMessage.success('评论删除成功')
    } catch (err) {
      error.value = err.message
      ElMessage.error('评论删除失败')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 评分日记
  const rateDiary = async (id, rating) => {
    try {
      loading.value = true
      const updatedDiary = await diaryApi.rateDiary(id, rating)
      console.log('评分成功，更新后的日记:', updatedDiary)
      
      if (!updatedDiary) {
        throw new Error('评分失败')
      }
      
      // 更新日记列表中的评分信息
      const index = diaries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        diaries.value[index] = { ...diaries.value[index], ...updatedDiary }
      }
      
      // 更新当前日记的评分信息
      if (currentDiary.value?.id === id) {
        currentDiary.value = { ...currentDiary.value, ...updatedDiary }
        // 更新用户评分状态
        currentDiary.value.userRating = rating
        currentDiary.value.hasRated = true
      }
      
      return updatedDiary
    } catch (err) {
      error.value = err.message
      ElMessage.error('评分失败，请稍后重试')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户对日记的评分
  const getUserRating = async (id) => {
    try {
      const rating = await diaryApi.getUserRating(id)
      console.log('获取到用户评分:', rating)
      
      // 更新当前日记的用户评分状态
      if (currentDiary.value?.id === id) {
        currentDiary.value.userRating = rating
        currentDiary.value.hasRated = rating > 0
      }
      
      return rating
    } catch (err) {
      console.error('获取用户评分失败:', err)
      return 0
    }
  }

  // 检查用户是否已评分
  const checkUserRated = async (id) => {
    try {
      const hasRated = await diaryApi.checkUserRated(id)
      console.log('用户评分状态检查结果:', hasRated)
      
      // 更新当前日记的评分状态
      if (currentDiary.value?.id === id) {
        currentDiary.value.hasRated = hasRated
      }
      
      return hasRated
    } catch (err) {
      console.error('检查用户评分状态失败:', err)
      return false
    }
  }

  // 删除用户评分
  const deleteUserRating = async (id) => {
    try {
      loading.value = true
      const updatedDiary = await diaryApi.deleteUserRating(id)
      console.log('删除评分成功，更新后的日记:', updatedDiary)
      
      // 更新日记列表中的评分信息
      const index = diaries.value.findIndex(d => d.id === id)
      if (index !== -1) {
        diaries.value[index] = { ...diaries.value[index], ...updatedDiary }
      }
      
      // 更新当前日记的评分信息
      if (currentDiary.value?.id === id) {
        currentDiary.value = { ...currentDiary.value, ...updatedDiary }
        // 清除用户评分状态
        currentDiary.value.userRating = 0
        currentDiary.value.hasRated = false
      }
      
      ElMessage.success('评分已删除')
      return updatedDiary
    } catch (err) {
      error.value = err.message
      ElMessage.error('删除评分失败，请稍后重试')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 根据目的地搜索日记
  const searchByDestination = async (destination, params) => {
    try {
      loading.value = true
      const response = await diaryApi.searchByDestination(destination, params)
      diaries.value = response.content
    } catch (err) {
      error.value = err.message
      ElMessage.error('搜索失败')
    } finally {
      loading.value = false
    }
  }

  // 精确查询日记标题
  const searchByExactTitle = async (title) => {
    try {
      loading.value = true
      const diary = await diaryApi.searchByExactTitle(title)
      currentDiary.value = diary
      return diary
    } catch (err) {
      error.value = err.message
      ElMessage.error('查询失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 全文检索
  const fullTextSearch = async (keyword, params) => {
    try {
      loading.value = true
      const response = await diaryApi.fullTextSearch(keyword, params)
      diaries.value = response.content
    } catch (err) {
      error.value = err.message
      ElMessage.error('搜索失败')
    } finally {
      loading.value = false
    }
  }

  // 压缩日记内容
  const compressDiaryContent = async (id) => {
    try {
      loading.value = true
      const compressedContent = await diaryApi.compressDiaryContent(id)
      return compressedContent
    } catch (err) {
      error.value = err.message
      ElMessage.error('压缩失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 解压日记内容
  const decompressDiaryContent = async (id) => {
    try {
      loading.value = true
      const decompressedContent = await diaryApi.decompressDiaryContent(id)
      return decompressedContent
    } catch (err) {
      error.value = err.message
      ElMessage.error('解压失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 增加浏览量
  const incrementViews = async (id) => {
    try {
      await diaryApi.incrementViews(id);
      // 更新本地状态
      const index = diaries.value.findIndex(d => d.id === id);
      if (index !== -1) {
        diaries.value[index].views += 1;
      }
      if (currentDiary.value?.id === id) {
        currentDiary.value.views += 1;
      }
    } catch (err) {
      error.value = err.message;
      ElMessage.error('增加浏览量失败');
    }
  };

  // 获取用户点赞的日记
  const getLikedDiaries = async (params = {}) => {
    try {
      loading.value = true
      const response = await diaryApi.getLikedDiaries(params)
      console.log('获取用户点赞日记成功:', response)
      return response
    } catch (err) {
      error.value = err.message
      ElMessage.error('获取点赞日记失败')
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20
      }
    } finally {
      loading.value = false
    }
  }

  return {
    diaries,
    currentDiary,
    comments,
    loading,
    error,
    fetchDiaries,
    fetchPopularDiaries,
    fetchPopularDiariesByScore,
    fetchLatestDiaries,
    fetchDiaryById,
    createDiary,
    updateDiary,
    deleteDiary,
    searchDiaries,
    getDiariesByTag,
    toggleLike,
    likeDiary,
    unlikeDiary,
    checkLikeStatus,
    fetchComments,
    createComment,
    deleteComment,
    rateDiary,
    getUserRating,
    checkUserRated,
    deleteUserRating,
    searchByDestination,
    searchByExactTitle,
    fullTextSearch,
    compressDiaryContent,
    decompressDiaryContent,
    incrementViews,
    getLikedDiaries
  }
})

