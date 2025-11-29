import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  roles?: string[]
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Development mode - bypass API authentication
  // Set VITE_DEV_MODE=false in .env to disable and use real API
  const DEV_MODE = import.meta.env.VITE_DEV_MODE !== 'false' && (import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true')

  // Initialize user from localStorage if token exists
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('Failed to parse stored user:', e)
    }
  }

  async function login(username: string, password: string): Promise<void> {
    try {
      // Development bypass - accept any credentials when DEV_MODE is enabled
      if (DEV_MODE) {
        console.warn('⚠️ DEV MODE: Bypassing API authentication')
        console.log('To use real API, set VITE_DEV_MODE=false in your .env file')
        
        // Create mock user data
        const mockUser: User = {
          id: 'dev-user-123',
          username: username || 'dev',
          email: `${username || 'dev'}@example.com`,
          first_name: 'Dev',
          last_name: 'User',
          roles: ['admin']
        }

        const mockToken = 'dev-token-' + Date.now()
        const mockRefreshToken = 'dev-refresh-' + Date.now()

        // Store mock tokens
        token.value = mockToken
        refreshToken.value = mockRefreshToken
        user.value = mockUser

        // Persist to localStorage
        localStorage.setItem('access_token', mockToken)
        localStorage.setItem('refresh_token', mockRefreshToken)
        localStorage.setItem('user', JSON.stringify(mockUser))

        return Promise.resolve()
      }

      // Production mode - use real API
      // Get API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
      
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Invalid credentials')
      }

      const data: LoginResponse = await response.json()

      // Store tokens
      token.value = data.access_token
      refreshToken.value = data.refresh_token
      user.value = data.user

      // Persist to localStorage
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return Promise.resolve()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  function logout(): void {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  function getAuthHeader(): string | null {
    if (!token.value) return null
    return `Bearer ${token.value}`
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
    getAuthHeader,
  }
})

