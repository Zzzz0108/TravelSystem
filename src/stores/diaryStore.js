import { defineStore } from 'pinia'

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    diaries: [
      // 示例数据
      {
        id: 1,
        title: '云南七日游攻略',
        content: '探索丽江古城与玉龙雪山的绝美风光...',
        images: [
          'https://picsum.photos/600/400?random=1',
          'https://picsum.photos/600/400?random=2'
        ],
        video: null,
        tags: ['自驾游', '摄影'],
        location: '云南',
        likes: 245,
        views: 1234, // 浏览量
        comments: [],
        author: {
          id: 1,
          name: '旅行达人',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        createdAt: '2024-03-01',
        ratings: [], // 新增评分数组
      }
    ]
  }),
  actions: {
    // 新增根据ID获取日记的方法

    fetchDiaryById(id) {
      return new Promise((resolve) => {
        const foundDiary = this.diaries.find(d => d.id === Number(id));
        setTimeout(() => resolve(foundDiary || {}), 200); // 模拟异步
      });
    },
    // 新增评论方法
    addComment(diaryId, comment) {
      const diary = this.diaries.find(d => d.id === Number(diaryId))
      if (diary) {
        diary.comments.push({
          id: Date.now(),
          text: comment.text,
          author: {
            id: 2, // 需要替换为真实用户数据
            name: '当前用户',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          createdAt: new Date().toISOString()
        })
      }
    },
    // 修改原有addDiary方法
    addDiary(newDiary) {
      this.diaries.unshift({
        id: Date.now(),
        ...newDiary,
        likes: 0,
        views: 0,  // 新增浏览量初始化
        comments: [],
        createdAt: new Date().toISOString(),
        isLiked: false  // 新增点赞状态
      })
    },
    addRating(id, rating) {
      const diary = this.diaries.find(d => d.id === Number(id))
      if (diary) {
        // 简单实现：记录当前用户评分
        diary.ratings.push({
          userId: localStorage.getItem('userId'),
          rating
        })
      }
    },
    async fetchDiaryById(id) {
      try {
        const response = await fetch(`/api/diaries/${id}`)
        if (!response.ok) throw new Error('日记不存在')
        return await response.json()
      } catch (error) {
        console.error('获取日记失败:', error)
        return null
      }
    }
  }
})

