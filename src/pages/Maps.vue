<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Maps</h4>
          <p class="category">Interactive maps integration</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <h5 class="card-title">Map View</h5>
          </template>
          <div style="height: 400px; background: #e0e0e0; display: flex; align-items: center; justify-content: center;">
            <p>Map integration placeholder</p>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Cards/Card.vue";

export default {
  name: "Maps",
  components: {
    Card,
  },
};
</script>

<style scoped>
.header {
  margin-bottom: 30px;
}
.title {
  margin-bottom: 5px;
}
.category {
  color: #9a9a9a;
  font-weight: 300;
  margin: 0;
}
</style>







