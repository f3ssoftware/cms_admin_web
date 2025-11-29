<template>
  <button
    class="navbar-toggler"
    :class="{ toggled: toggled }"
    type="button"
    :data-target="targetSelector"
    :aria-controls="target"
    :aria-expanded="toggled"
    aria-label="Toggle navigation"
    @click="handleClick"
  >
    <span class="navbar-toggler-bar"></span>
    <span class="navbar-toggler-bar"></span>
    <span class="navbar-toggler-bar"></span>
  </button>
</template>
<script>
export default {
  props: {
    target: {
      type: [String, Number],
      description: "Button target element",
    },
    toggled: {
      type: Boolean,
      default: false,
      description: "Whether button is toggled",
    },
  },
  computed: {
    targetSelector() {
      return typeof this.target === 'string' || typeof this.target === 'number' 
        ? `#${this.target}` 
        : '';
    },
  },
  methods: {
    handleClick(event) {
      console.log('NavbarToggleButton clicked', event);
      // Emit click event to parent
      this.$emit('click', event);
    },
  },
};
</script>
<style></style>
