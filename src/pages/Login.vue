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
            <span v-if="loading">Redirecting to login...</span>
            <span v-else>Sign In with Keycloak</span>
          </base-button>

          <p class="login-info">
            You will be redirected to Keycloak to authenticate.
            After successful authentication, you will be redirected back to the application.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    // This will redirect to Keycloak login page
    await authStore.login()
    // Note: After Keycloak login, user will be redirected back
    // and the auth store will automatically sync the user state
  } catch (err) {
    error.value = err?.message || 'Login failed. Please try again.'
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

