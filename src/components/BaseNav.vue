<template>
  <nav
    class="navbar"
    :class="[
      { 'navbar-expand-lg': expand },
      { [`navbar-${effect}`]: effect },
      { 'navbar-transparent': transparent },
      { [`bg-${type}`]: type },
      { rounded: round },
    ]"
  >
    <div class="container">
      <slot name="container-pre"></slot>
      <slot name="brand">
        <a class="navbar-brand" href="#" @click.prevent="onTitleClick">
          {{ title }}
        </a>
      </slot>
      
      <!-- Mobile sidebar toggle button -->
      <navbar-toggle-button
        ref="toggleButtonRef"
        :toggled="sidebarToggled"
        @click="toggleSidebar"
        class="navbar-toggle-btn mobile-only"
      >
      </navbar-toggle-button>

      <slot name="container-after"></slot>
    </div>
  </nav>
</template>
<script>
import NavbarToggleButton from "./NavbarToggleButton.vue";

export default {
  name: "base-nav",
  components: {
    NavbarToggleButton,
  },
  props: {
    type: {
      type: String,
      default: "primary",
      description: "Navbar type (e.g default, primary etc)",
    },
    title: {
      type: String,
      default: "",
      description: "Title of navbar",
    },
    contentId: {
      type: [String, Number],
      default: Math.random().toString(),
      description:
        "Explicit id for the menu. By default it's a generated random number",
    },
    effect: {
      type: String,
      default: "dark",
      description: "Effect of the navbar (light|dark)",
    },
    round: {
      type: Boolean,
      default: false,
      description: "Whether nav has rounded corners",
    },
    transparent: {
      type: Boolean,
      default: false,
      description: "Whether navbar is transparent",
    },
    expand: {
      type: Boolean,
      default: false,
      description: "Whether navbar should contain `navbar-expand-lg` class",
    },
  },
  data() {
    return {
      sidebarToggled: false,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
      toggleButtonRef: null,
    };
  },
  methods: {
    onTitleClick(evt) {
      this.$emit("title-click", evt);
    },
    toggleSidebar(event) {
      console.log('toggleSidebar called', event, 'sidebar available:', !!this.$sidebar);
      
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (this.$sidebar) {
        // Toggle based on current sidebar state, not local state
        const currentState = this.$sidebar.showSidebar;
        const newState = !currentState;
        console.log('Current sidebar state:', currentState, 'New state:', newState);
        
        this.sidebarToggled = newState;
        this.$sidebar.displaySidebar(newState);
        
        console.log('After displaySidebar, showSidebar is:', this.$sidebar.showSidebar);
      } else {
        console.error('$sidebar is not available');
      }
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      // Auto-hide sidebar when resizing to desktop
      if (this.windowWidth >= 992 && this.$sidebar) {
        this.$sidebar.displaySidebar(false);
        this.sidebarToggled = false;
      }
    },
  },
  mounted() {
    console.log('BaseNav mounted, $sidebar available:', !!this.$sidebar);
    
    // Initialize window width
    if (typeof window !== 'undefined') {
      this.windowWidth = window.innerWidth;
      window.addEventListener('resize', this.handleResize);
    }
    // Sync with sidebar state
    if (this.$sidebar) {
      this.sidebarToggled = this.$sidebar.showSidebar;
      console.log('Initial sidebar state:', this.$sidebar.showSidebar);
      // Watch for sidebar state changes
      this.$watch(() => this.$sidebar.showSidebar, (newVal) => {
        console.log('Sidebar state changed to:', newVal);
        this.sidebarToggled = newVal;
      });
    } else {
      console.error('$sidebar is not available in BaseNav mounted');
    }
    
    // Add direct click listener as fallback
    this.$nextTick(() => {
      if (this.$refs.toggleButtonRef) {
        const button = this.$refs.toggleButtonRef.$el || this.$refs.toggleButtonRef;
        if (button) {
          console.log('Adding direct click listener to toggle button');
          button.addEventListener('click', (e) => {
            console.log('Direct click listener triggered');
            e.preventDefault();
            e.stopPropagation();
            this.toggleSidebar(e);
          });
        } else {
          console.log('Toggle button element not found');
        }
      } else {
        console.log('Toggle button ref not found');
      }
    });
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>
<style scoped>
.navbar .container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.navbar-brand {
  margin-right: 1rem;
  padding-top: 0.3125rem;
  padding-bottom: 0.3125rem;
  font-size: 1.25rem;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  order: 1;
}

/* Mobile toggle button - shown on mobile, hidden on desktop */
.navbar-toggle-btn.mobile-only {
  order: 2;
  flex-shrink: 0;
  margin-left: 10px;
  margin-right: 0;
  display: block !important; /* Visible by default */
  z-index: 10;
}

/* Ensure the toggler button is visible */
.navbar-toggle-btn.mobile-only .navbar-toggler {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  padding: 8px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* Ensure container-after content is positioned correctly */
.navbar .container > :deep([slot="container-after"]) {
  order: 3;
  margin-left: auto;
  flex-shrink: 0;
}

/* Hide toggle button on desktop */
@media (min-width: 992px) {
  .navbar-toggle-btn.mobile-only {
    display: none !important;
  }
}

/* Show toggle button on mobile */
@media (max-width: 991.98px) {
  .navbar-toggle-btn.mobile-only {
    display: block !important;
  }
  
  .navbar-brand {
    flex: 1 1 auto;
    min-width: 0;
    max-width: calc(100% - 100px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
