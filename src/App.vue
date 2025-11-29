<template>
  <div>
    <notifications></notifications>
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script>
export default {
  methods: {
    disableRTL() {
      if (!this.$rtl.isRTL) {
        this.$rtl.disableRTL();
      }
    },
    toggleNavOpen(newVal) {
      console.log('App.vue toggleNavOpen called with:', newVal);
      let root = document.getElementsByTagName("html")[0];
      if (newVal) {
        root.classList.add("nav-open");
        console.log('Added nav-open class to html');
      } else {
        root.classList.remove("nav-open");
        console.log('Removed nav-open class from html');
      }
    },
  },
  mounted() {
    this.$watch("$route", this.disableRTL, { immediate: true });
    this.$watch("$sidebar.showSidebar", this.toggleNavOpen);
  },
};
</script>

<style lang="scss"></style>
