
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    // 初始化时设置默认用户
    const initUser = () => {
      if (!localStorage.getItem('isLogin')) {
        localStorage.setItem('isLogin', 'true')
        localStorage.setItem('username', '测试用户')
        localStorage.setItem('avatar', '')
        localStorage.setItem('favorites', JSON.stringify([]))
        localStorage.setItem('visited', JSON.stringify([]))
      }
      return {
        isLogin: localStorage.getItem('isLogin') === 'true',
        username: localStorage.getItem('username') || '测试用户',
        avatar: localStorage.getItem('avatar') || '',
        favorites: JSON.parse(localStorage.getItem('favorites')) || [],
        visited: JSON.parse(localStorage.getItem('visited')) || []
      }
    }
    
    return initUser()
  },
  actions: {
    login(username, avatar) {
      this.isLogin = true
      this.username = username
      this.avatar = avatar
      localStorage.setItem('isLogin', 'true')
      localStorage.setItem('username', username)
      localStorage.setItem('avatar', avatar)
      this.persistAllData()
    },
    logout() {
      this.isLogin = false
      this.username = ''
      this.avatar = ''
      this.favorites = []
      this.visited = []
      localStorage.clear()
    },
    toggleFavorite(spot) {
      const index = this.favorites.findIndex(f => f.id === spot.id)
      if (index > -1) {
        this.favorites.splice(index, 1)
      } else {
        this.favorites.push({
          id: spot.id,
          name: spot.name,
          category:spot.category,
          rating: spot.rating,
          tags:spot.tags,
          image: spot.image
        })
      }
      this.persistAllData()
    },
    persistAllData() {
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
      localStorage.setItem('visited', JSON.stringify(this.visited))
      localStorage.setItem('username', this.username)
      localStorage.setItem('avatar', this.avatar)
    }
  }
})
