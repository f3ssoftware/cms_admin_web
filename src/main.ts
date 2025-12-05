import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// Import Vue Black Dashboard styles
import './styles/main.scss'
// Import nucleo icons
import './assets/css/nucleo-icons.css'

// Import plugins
import NotificationsPlugin from './components/NotificationPlugin/index.js'
import SidebarPlugin from './components/SidebarPlugin/index.js'
import RTLPlugin from './components/RTLPlugin/index.js'

// Import directives
import clickOutside from './directives/click-outside.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(NotificationsPlugin)
app.use(SidebarPlugin)
app.use(RTLPlugin)

// Register directives
app.directive('click-outside', clickOutside)

// Initialize Keycloak authentication before mounting
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('Failed to initialize authentication:', error)
  // Mount app anyway to show error state
  app.mount('#app')
})
