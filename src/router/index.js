import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue'; // 确保正确导入
import ForgotPassword from '@/views/ForgotPassword.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { requiresAuth: true }
  },
  // 删除原有/diary路由配置，替换为：
{
  path: '/diary',
  name: 'DiaryView',
  component: () => import('@/views/DiaryView.vue')
},
{
  path: '/diary/create',
  name: 'DiaryEditor',
  component: () => import('@/components/diary/DiaryEditor.vue')
},
{
  path: '/diary/:id',
  name: 'DiaryDetail',
  component: () => import('@/components/diary/DiaryDetail.vue'),
  props: true
},
  {
    path: '/navigation',
    name: 'Navigation',
    component: () => import('@/views/NavigationView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  
  {
    path: '/visited',
    name: 'Visited',
    component: () => import('@/views/VisitedSpots.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/navigation/:spotId',
    name: 'SpotNavigation',
    component: () => import('@/components/Navigation.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router