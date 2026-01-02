<template>
  <div class="wrapper">
    <side-bar
      :sidebar-links="sidebarLinks"
      :title="sidebarTitle"
      :background-color="sidebarBackgroundColor"
      :active-color="sidebarActiveColor"
    >
    </side-bar>
    <div class="main-panel" :data="sidebarBackgroundColor">
      <base-nav
        :title="navbarTitle"
        :type="navbarType"
        :effect="navbarEffect"
        :transparent="navbarTransparent"
        :expand="navbarExpand"
      >
        <template #container-after>
          <div class="navbar-nav ml-auto" v-if="user">
            <div class="nav-item dropdown user-menu" ref="userMenuRef">
              <a
                class="nav-link user-avatar"
                href="#"
                @click.stop.prevent="toggleUserMenu"
                role="button"
                :aria-expanded="userMenuOpen"
                aria-haspopup="true"
              >
                <span class="avatar-initials">{{ userInitials }}</span>
              </a>
              <div 
                v-if="userMenuOpen"
                class="dropdown-menu dropdown-menu-right show user-dropdown-menu" 
                @click.stop
              >
                <div class="dropdown-header">
                  <div class="user-info">
                    <div class="user-name">{{ userDisplayName }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                  <i class="ni ni-user-run"></i> Logout
                </a>
              </div>
            </div>
          </div>
        </template>
      </base-nav>
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseNav from "@/components/BaseNav.vue";

export default {
  components: {
    BaseNav,
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const user = computed(() => authStore.user)
    const userMenuOpen = ref(false)
    const userMenuRef = ref(null)

    // Generate user initials from name or username
    const userInitials = computed(() => {
      if (!user.value) return ''
      
      const firstName = user.value.first_name || ''
      const lastName = user.value.last_name || ''
      const username = user.value.username || ''
      
      if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
      } else if (firstName) {
        return firstName.charAt(0).toUpperCase()
      } else if (username) {
        return username.substring(0, 2).toUpperCase()
      }
      
      return 'U'
    })

    // Display name for dropdown header
    const userDisplayName = computed(() => {
      if (!user.value) return ''
      
      if (user.value.first_name && user.value.last_name) {
        return `${user.value.first_name} ${user.value.last_name}`
      } else if (user.value.first_name) {
        return user.value.first_name
      }
      
      return user.value.username || 'User'
    })

    const toggleUserMenu = (event) => {
      event.stopPropagation()
      userMenuOpen.value = !userMenuOpen.value
    }

    const closeUserMenu = (event) => {
      // Don't close if clicking inside the user menu
      if (userMenuRef.value && userMenuRef.value.contains(event.target)) {
        return
      }
      userMenuOpen.value = false
    }

    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (userMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
        userMenuOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    const handleLogout = () => {
      closeUserMenu()
      authStore.logout()
      router.push('/login')
    }

    const state = reactive({
      sidebarTitle: "CMS Admin",
      sidebarBackgroundColor: "vue",
      sidebarActiveColor: "success",
      navbarTitle: "Dashboard",
      navbarType: "",
      navbarEffect: "dark",
      navbarTransparent: true,
      navbarExpand: false,
      showFooter: false,
      sidebarLinks: [
        {
          path: "/dashboard",
          name: "Dashboard",
          icon: "ni ni-tv-2 text-primary",
        },
        {
          path: "/categories",
          name: "Categories",
          icon: "ni ni-bullet-list-67 text-info",
        },
        {
          path: "/news",
          name: "News",
          icon: "ni ni-paper-diploma text-success",
        },
        {
          path: "/games",
          name: "Games",
          icon: "ni ni-controller text-warning",
        },
      ],
    })

    return {
      user,
      userMenuOpen,
      userMenuRef,
      userInitials,
      userDisplayName,
      toggleUserMenu,
      closeUserMenu,
      handleLogout,
      ...state,
    }
  },
};
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style>
/* Override navbar background to match application background */
.main-panel > .navbar,
.main-panel > .navbar.bg-primary,
.main-panel > .navbar[class*="bg-"],
.navbar.bg-primary {
  background-color: #1e1e2f !important;
  background: linear-gradient(#1e1e2f, #1e1e24) !important;
}

/* User avatar styles */
.user-menu {
  position: relative;
  z-index: 1000;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  margin-left: 15px;
  text-decoration: none;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-initials:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Dropdown menu styles */
.user-menu {
  position: relative !important;
}

.user-menu .dropdown-menu,
.user-menu .user-dropdown-menu {
  position: absolute !important;
  top: 100% !important;
  right: 0 !important;
  min-width: 200px;
  margin-top: 10px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
  z-index: 1001 !important;
  display: block !important;
  background-color: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  padding: 0 !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}

.user-info {
  padding: 8px 0;
}

.user-name {
  font-weight: 600;
  color: #333 !important;
  font-size: 14px;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #6c757d !important;
}

.dropdown-header {
  padding: 12px 16px !important;
  border-bottom: 1px solid #e9ecef !important;
  background-color: #ffffff !important;
}

.dropdown-item {
  display: flex !important;
  align-items: center;
  padding: 10px 16px !important;
  color: #333 !important;
  text-decoration: none !important;
  transition: background-color 0.2s;
  background-color: transparent !important;
  border: none !important;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa !important;
  color: #333 !important;
}

.dropdown-item i {
  margin-right: 8px;
  font-size: 16px;
  color: #333 !important;
}

.dropdown-divider {
  height: 1px;
  margin: 0;
  overflow: hidden;
  background-color: #e9ecef !important;
  border: none !important;
}

/* Sidebar background color override */
.sidebar,
.sidebar[data="vue"],
.sidebar[data-background-color="vue"] {
  background-color: #525f7f !important;
  background: #525f7f !important;
  background-image: none !important;
}

/* Ensure mobile toggle button is visible on mobile - Global override */
@media (max-width: 991.98px) {
  .navbar .navbar-toggle-btn.mobile-only,
  .navbar .navbar-toggler.mobile-only,
  .main-panel .navbar .navbar-toggler,
  .main-panel .navbar .navbar-toggle-btn {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  /* Position toggle button on the left side for mobile */
  .navbar .navbar-toggle-btn.mobile-only {
    order: 0 !important;
    margin-left: 0 !important;
    margin-right: auto !important;
  }
  
  /* Adjust brand position */
  .navbar .navbar-brand {
    order: 1 !important;
    margin-left: 10px;
  }
  
  /* Adjust user menu position */
  .navbar .container > [slot="container-after"] {
    order: 2 !important;
  }
}

/* Hide toggle button on desktop */
@media (min-width: 992px) {
  .navbar .navbar-toggle-btn.mobile-only,
  .navbar .navbar-toggler.mobile-only {
    display: none !important;
  }
}
</style>

