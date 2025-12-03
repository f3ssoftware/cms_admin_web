<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">News</h4>
          <p class="category">Manage your news articles</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">News Articles</h5>
              <base-button type="primary" size="sm">
                <i class="ni ni-fat-add"></i> Add News
              </base-button>
            </div>
          </template>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Published</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>New Technology Breakthrough</td>
                  <td>Technology</td>
                  <td>John Doe</td>
                  <td>2024-01-15</td>
                  <td><span class="badge badge-success">Published</span></td>
                  <td>
                    <base-button type="info" size="sm">Edit</base-button>
                    <base-button type="danger" size="sm">Delete</base-button>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Market Analysis Report</td>
                  <td>Business</td>
                  <td>Jane Smith</td>
                  <td>2024-01-14</td>
                  <td><span class="badge badge-warning">Draft</span></td>
                  <td>
                    <base-button type="info" size="sm">Edit</base-button>
                    <base-button type="danger" size="sm">Delete</base-button>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Championship Results</td>
                  <td>Sports</td>
                  <td>Bob Johnson</td>
                  <td>2024-01-13</td>
                  <td><span class="badge badge-success">Published</span></td>
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
  name: "News",
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



