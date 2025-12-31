import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as keycloakLib from '@/lib/keycloak'
import DashboardLayout from '@/layout/dashboard/DashboardLayout.vue'

// Lazy load pages
const Login = () => import('@/pages/Login.vue')
const Dashboard = () => import('@/pages/Dashboard.vue')
const Categories = () => import('@/pages/Categories.vue')
const News = () => import('@/pages/News.vue')
const NewsEdit = () => import('@/pages/NewsEdit.vue')
const NewsTranslations = () => import('@/pages/NewsTranslations.vue')
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
        },
        {
          path: 'news/new',
          name: 'news-new',
          component: NewsEdit,
          meta: { requiresAuth: true }
        },
        {
          path: 'news/:id/edit',
          name: 'news-edit',
          component: NewsEdit,
          meta: { requiresAuth: true }
        },
        {
          path: 'news/:id/translations',
          name: 'news-translations',
          component: NewsTranslations,
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization if still loading (but don't wait too long)
  if (authStore.isLoading) {
    let attempts = 0
    while (authStore.isLoading && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 50))
      attempts++
    }
  }

  // Check Keycloak authentication directly as well
  const keycloakAuthenticated = keycloakLib.isAuthenticated()
  const storeAuthenticated = authStore.isAuthenticated
  const isAuthenticated = keycloakAuthenticated || storeAuthenticated

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (isAuthenticated) {
      // User is authenticated, allow access
      next()
    } else {
      // User is not authenticated, redirect to login
      // Only redirect if not already going to login to avoid loops
      if (to.name !== 'login') {
        next({ name: 'login', query: { redirect: to.fullPath } })
      } else {
        next()
      }
    }
  } else if (to.name === 'login' && isAuthenticated) {
    // User is already logged in, redirect to dashboard
    // Only redirect if not already going to dashboard to avoid loops
    if (from.name !== 'dashboard') {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else {
    // Route doesn't require auth, allow access
    next()
  }
})

export default router
