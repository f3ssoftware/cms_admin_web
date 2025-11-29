<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">CMS Admin</h2>
          <p class="login-subtitle">Sign in to your account</p>
          <!-- Dev mode indicator -->
          <div v-if="isDevMode" class="dev-mode-banner">
            <i class="ni ni-notification-70"></i>
            Development Mode: Any credentials will work
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <!-- Dev mode quick login -->
          <div v-if="isDevMode" class="dev-quick-login">
            <base-button
              type="info"
              size="sm"
              @click="quickLogin"
              block
            >
              Quick Login (Dev Mode)
            </base-button>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <base-input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="loading"
            ></base-input>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <base-input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="loading"
            ></base-input>
          </div>

          <base-button
            type="primary"
            native-type="submit"
            :disabled="loading"
            class="login-button"
            block
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </base-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/Inputs/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Check if dev mode is enabled
const isDevMode = computed(() => {
  return import.meta.env.VITE_DEV_MODE !== 'false' && (import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true')
})

const quickLogin = async () => {
  username.value = 'dev'
  password.value = 'dev'
  await handleLogin()
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(username.value, password.value)
    // Redirect to dashboard after successful login
    router.push('/dashboard')
  } catch (err) {
    error.value = err?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(#1e1e2f, #1e1e24);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
}

.login-subtitle {
  color: #9a9a9a;
  font-size: 14px;
  margin: 0;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.login-button {
  margin-top: 10px;
  height: 45px;
  font-size: 16px;
  font-weight: 600;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-danger {
  background-color: rgba(255, 54, 54, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 54, 54, 0.3);
}

.dev-mode-banner {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
  color: #ffc107;
  padding: 10px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.dev-quick-login {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>

