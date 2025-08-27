import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/HomeView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/diary',
      name: 'DiaryView',
      component: () => import('@/views/diary/DiaryListView.vue')
    },
    {
      path: '/diary/create',
      name: 'DiaryEditor',
      component: () => import('@/views/diary/DiaryEditorView.vue')
    },
    {
      path: '/diary/:id',
      name: 'DiaryDetail',
      component: () => import('@/views/diary/DiaryDetailView.vue'),
      props: true
    },
    {
      path: '/spot/:id',
      name: 'SpotDetail',
      component: () => import('@/views/home/SpotDetailView.vue'),
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
      component: () => import('@/views/auth/RegisterView.vue')
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/views/auth/ForgotPasswordView.vue')
    },
    {
      path: '/navigation/:spotId',
      name: 'SpotNavigation',
      component: () => import('@/views/NavigationView.vue'),
      props: true
    },
    {
      path: '/travel-animation',
      name: 'TravelAnimation',
      component: () => import('@/views/TravelAnimationView.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isLogin') === 'true'
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router