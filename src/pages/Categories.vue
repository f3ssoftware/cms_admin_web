<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Categories</h4>
          <p class="category">Manage your content categories</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Categories List</h5>
              <base-button type="primary" size="sm">
                <i class="ni ni-fat-add"></i> Add Category
              </base-button>
            </div>
          </template>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Technology</td>
                  <td>Tech news and updates</td>
                  <td><span class="badge badge-success">Active</span></td>
                  <td>
                    <base-button type="info" size="sm">Edit</base-button>
                    <base-button type="danger" size="sm">Delete</base-button>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Business</td>
                  <td>Business and finance news</td>
                  <td><span class="badge badge-success">Active</span></td>
                  <td>
                    <base-button type="info" size="sm">Edit</base-button>
                    <base-button type="danger" size="sm">Delete</base-button>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Sports</td>
                  <td>Sports news and updates</td>
                  <td><span class="badge badge-warning">Inactive</span></td>
                  <td>
                    <base-button type="info" size="sm">Edit</base-button>
                    <base-button type="danger" size="sm">Delete</base-button>
                  </td>
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
import BaseButton from "@/components/BaseButton.vue";

export default {
  name: "Categories",
  components: {
    Card,
    BaseButton,
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

