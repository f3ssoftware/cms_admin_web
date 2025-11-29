import { reactive } from 'vue'
import Sidebar from "./SideBar.vue";
import SidebarLink from "./SidebarLink.vue";

const SidebarStore = {
  showSidebar: false,
  sidebarLinks: [],
  displaySidebar(value) {
    this.showSidebar = value;
  },
};

const SidebarPlugin = {
  install(app) {
    // Create a reactive store using Vue 3's reactive
    const sidebarStore = reactive(SidebarStore);

    app.config.globalProperties.$sidebar = sidebarStore;
    app.component("side-bar", Sidebar);
    app.component("sidebar-link", SidebarLink);
  },
};

export default SidebarPlugin;
