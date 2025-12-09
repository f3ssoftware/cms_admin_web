import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/layout/dashboard/DashboardLayout.vue'

// Lazy load pages
const Login = () => import('@/pages/Login.vue')
const Dashboard = () => import('@/pages/Dashboard.vue')
const Categories = () => import('@/pages/Categories.vue')
const News = () => import('@/pages/News.vue')
const NotFound = () => import('@/pages/NotFoundPage.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: DashboardLayout,
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: { requiresAuth: true }
        },
        {
          path: 'categories',
          name: 'categories',
          component: Categories,
          meta: { requiresAuth: true }
        },
        {
          path: 'news',
          name: 'news',
          component: News,
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ],
})

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Debug: Log navigation attempt
  console.log("Router guard - navigating to:", to.path, {
    requiresAuth: to.meta.requiresAuth,
    isAuthenticated: authStore.isAuthenticated,
    hasUser: !!authStore.user,
  });

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      // User is authenticated, allow access
      console.log("Router guard - allowing access to protected route");
      next()
    } else {
      // User is not authenticated, redirect to login
      console.log("Router guard - redirecting to login (not authenticated)");
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // User is already logged in, redirect to dashboard
    console.log("Router guard - user already logged in, redirecting to dashboard");
    next({ name: 'dashboard' })
  } else {
    // Route doesn't require auth, allow access
    next()
  }
})

export default router
