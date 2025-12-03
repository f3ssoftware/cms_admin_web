<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Icons</h4>
          <p class="category">Nucleo Icons showcase</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <h5 class="card-title">Available Icons</h5>
          </template>
          <div>
            <i class="ni ni-tv-2" style="font-size: 2rem; margin: 10px;"></i>
            <i class="ni ni-single-02" style="font-size: 2rem; margin: 10px;"></i>
            <i class="ni ni-bell-55" style="font-size: 2rem; margin: 10px;"></i>
            <i class="ni ni-planet" style="font-size: 2rem; margin: 10px;"></i>
            <i class="ni ni-pin-3" style="font-size: 2rem; margin: 10px;"></i>
            <i class="ni ni-key-25" style="font-size: 2rem; margin: 10px;"></i>
            <i class="ni ni-active-40" style="font-size: 2rem; margin: 10px;"></i>
            <i class="ni ni-chart-pie-35" style="font-size: 2rem; margin: 10px;"></i>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Cards/Card.vue";

export default {
  name: "Icons",
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



