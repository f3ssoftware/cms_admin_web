// RTL (Right-to-Left) Plugin for Vue 3
const RTLStore = {
  isRTL: false,
  enableRTL() {
    this.isRTL = true;
    document.documentElement.setAttribute("dir", "rtl");
  },
  disableRTL() {
    this.isRTL = false;
    document.documentElement.removeAttribute("dir");
  },
};

const RTLPlugin = {
  install(app) {
    app.config.globalProperties.$rtl = RTLStore;
    app.provide("$rtl", RTLStore);
  },
};

export default RTLPlugin;



