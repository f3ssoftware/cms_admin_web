<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">CMS Admin</h2>
          <p class="login-subtitle">Sign in with Keycloak</p>
        </div>

        <div class="login-form">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <base-button
            type="primary"
            @click="handleLogin"
            :disabled="loading"
            class="login-button"
            block
          >
            <span v-if="loading">Redirecting to Keycloak...</span>
            <span v-else>Sign in with Keycloak</span>
          </base-button>

          <p class="login-info">
            You will be redirected to Keycloak to authenticate.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/BaseButton.vue'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    console.log('Login button clicked, calling authStore.login()')
    // This will redirect to Keycloak login page
    await authStore.login()
    // Note: After successful login, Keycloak will redirect back to the app
    // The router guard will handle the redirect based on the 'redirect' query parameter
    // Note: login() may redirect immediately, so code below may not execute
    console.log('Login call completed (redirect may have happened)')
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err?.message || 'Failed to redirect to Keycloak. Please try again.'
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

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
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

.login-info {
  color: #9a9a9a;
  font-size: 12px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 0;
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

