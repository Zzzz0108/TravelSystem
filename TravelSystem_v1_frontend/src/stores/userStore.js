import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useUserStore = defineStore('user', {
  state: () => {
    // 初始化时设置默认用户
    const initUser = () => {
      if (!localStorage.getItem('isLogin')) {
        localStorage.setItem('isLogin', 'false')
        localStorage.setItem('user', JSON.stringify({
          id: null,
          username: '',
          email: '',
          avatar: ''
        }))
      }
      return {
        isLogin: localStorage.getItem('isLogin') === 'true',
        user: JSON.parse(localStorage.getItem('user')) || {
          id: null,
          username: '',
          email: '',
          avatar: ''
        }
      }
    }
    
    return initUser()
  },
  actions: {
    // 发送验证码
    async sendCode(email) {
      try {
        console.log('发送验证码请求:', { email })
        const response = await api.post('/auth/send-code', { email })
        console.log('发送验证码响应:', response)
        if (response.status === 200) {
          return {
            success: true,
            message: '验证码发送成功'
          }
        }
        throw new Error(response.data?.message || '发送验证码失败')
      } catch (error) {
        console.error('发送验证码错误:', error)
        return {
          success: false,
          message: error.response?.data?.message || '发送验证码失败，请重试'
        }
      }
    },

    // 邮箱密码登录
    async loginWithPassword(email, password) {
      try {
        console.log('邮箱密码登录请求:', { email, password })
        const response = await api.post('/auth/login', {
          email,
          password,
          loginType: 'password'
        })
        console.log('邮箱密码登录响应:', response)
        if (response.status === 200 && response.data) {
          this.isLogin = true
          this.user = {
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email,
            avatar: response.data.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(response.data.user.username)}`
          }
          localStorage.setItem('isLogin', 'true')
          localStorage.setItem('user', JSON.stringify(this.user))
          localStorage.setItem('token', response.data.token)
          return true
        }
        throw new Error(response.data?.message || '登录失败')
      } catch (error) {
        console.error('邮箱密码登录错误:', error)
        throw new Error(error.response?.data?.message || '登录失败，请检查邮箱和密码')
      }
    },

    // 邮箱验证码登录
    async loginWithCode(email, code) {
      try {
        console.log('邮箱验证码登录请求:', { email, code })
        const response = await api.post('/auth/login', {
          email,
          code,
          loginType: 'code'
        })
        console.log('邮箱验证码登录响应:', response)
        if (response.status === 200 && response.data) {
          this.isLogin = true
          this.user = {
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email,
            avatar: response.data.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(response.data.user.username)}`
          }
          localStorage.setItem('isLogin', 'true')
          localStorage.setItem('user', JSON.stringify(this.user))
          localStorage.setItem('token', response.data.token)
          return true
        }
        throw new Error(response.data?.message || '登录失败')
      } catch (error) {
        console.error('邮箱验证码登录错误:', error)
        throw new Error(error.response?.data?.message || '登录失败，请检查邮箱和验证码')
      }
    },

    async register(form) {
      try {
        console.log('开始注册请求:', form)
        const response = await api.post('/auth/register', form)
        console.log('注册响应:', response)
        if (response.status === 200) {
          return {
            success: true,
            message: '注册成功'
          }
        }
        throw new Error(response.data?.message || '注册失败')
      } catch (error) {
        console.error('注册错误:', error)
        return {
          success: false,
          message: error.response?.data?.message || '注册失败，请重试'
        }
      }
    },

    logout() {
      this.isLogin = false
      this.user = {
        id: null,
        username: '',
        email: '',
        avatar: ''
      }
      localStorage.removeItem('isLogin')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },

    async checkLoginStatus() {
      try {
        const response = await api.get('/auth/check')
        if (response.status === 200 && response.data.username) {
          this.isLogin = true
          this.user = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            avatar: response.data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(response.data.username)}`
          }
          localStorage.setItem('isLogin', 'true')
          localStorage.setItem('user', JSON.stringify(this.user))
          // 如果后端返回了新的 token，更新它
          if (response.data.token) {
            localStorage.setItem('token', response.data.token)
          }
          return true
        }
        this.logout()
        return false
      } catch (error) {
        console.error('检查登录状态错误:', error)
        this.logout()
        return false
      }
    }
  }
})
