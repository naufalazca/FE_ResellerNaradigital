import { createRouter, createWebHistory } from 'vue-router'
import LoginViews from '../views/LoginViews.vue'
import DashboardViews from '../views/DashboardViews.vue'
import VoucherViews from '../views/VoucherViews.vue'
import { authService } from '@/service/authServices'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginViews,
    },
    {
      path: '/home',
      name: 'home',
      component: DashboardViews,
      meta: { requiresAuth: true },
    },
    {
      path: '/vouchers',
      name: 'vouchers',
      component: VoucherViews,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard untuk cek authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Jika route memerlukan auth dan user belum login, redirect ke login
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    // Jika user sudah login dan mengakses halaman login, redirect ke home
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
