<template>
  <div class="text-center" style="padding: 100px 20px;">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
    <base-button type="primary" @click="$router.push('/')">
      Go Home
    </base-button>
  </div>
</template>

<script>
import BaseButton from "@/components/BaseButton.vue";

export default {
  name: "NotFound",
  components: {
    BaseButton,
  },
};
</script>







