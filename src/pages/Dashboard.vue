<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Dashboard</h4>
          <p class="category">Welcome to your admin dashboard</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card class="mb-4 mb-sm-0">
          <template slot="header">
            <div class="icon icon-shape bg-gradient-red text-white rounded-circle shadow">
              <i class="ni ni-active-40"></i>
            </div>
          </template>
          <template slot="content">
            <p class="text-sm text-uppercase font-weight-bold">Active Users</p>
            <h5 class="mb-0">3,500</h5>
          </template>
        </stats-card>
      </div>
      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card class="mb-4 mb-sm-0">
          <template slot="header">
            <div class="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
              <i class="ni ni-chart-pie-35"></i>
            </div>
          </template>
          <template slot="content">
            <p class="text-sm text-uppercase font-weight-bold">Total Sales</p>
            <h5 class="mb-0">$45,000</h5>
          </template>
        </stats-card>
      </div>
      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card class="mb-4 mb-sm-0">
          <template slot="header">
            <div class="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
              <i class="ni ni-money-coins"></i>
            </div>
          </template>
          <template slot="content">
            <p class="text-sm text-uppercase font-weight-bold">Revenue</p>
            <h5 class="mb-0">$24,000</h5>
          </template>
        </stats-card>
      </div>
      <div class="col-lg-3 col-md-6 col-sm-6">
        <stats-card class="mb-4 mb-sm-0">
          <template slot="header">
            <div class="icon icon-shape bg-gradient-blue text-white rounded-circle shadow">
              <i class="ni ni-favourite-28"></i>
            </div>
          </template>
          <template slot="content">
            <p class="text-sm text-uppercase font-weight-bold">Followers</p>
            <h5 class="mb-0">+45K</h5>
          </template>
        </stats-card>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-lg-12">
        <card>
          <template slot="header">
            <h5 class="card-title">Recent Activity</h5>
          </template>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>Created new post</td>
                  <td>2024-01-15</td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>Updated profile</td>
                  <td>2024-01-14</td>
                  <td><span class="badge badge-info">Pending</span></td>
                </tr>
                <tr>
                  <td>Bob Johnson</td>
                  <td>Deleted comment</td>
                  <td>2024-01-13</td>
                  <td><span class="badge badge-warning">Warning</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Cards/Card.vue";
import StatsCard from "@/components/Cards/StatsCard.vue";

export default {
  name: "Dashboard",
  components: {
    Card,
    StatsCard,
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

