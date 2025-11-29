<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Table List</h4>
          <p class="category">Data tables with sorting and filtering</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <h5 class="card-title">Users Table</h5>
          </template>
          <div class="table-responsive">
            <base-table
              :data="tableData"
              :columns="tableColumns"
              thead-classes="text-primary"
            >
            </base-table>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Cards/Card.vue";
import BaseTable from "@/components/BaseTable.vue";

export default {
  name: "TableList",
  components: {
    Card,
    BaseTable,
  },
  data() {
    return {
      tableColumns: ["ID", "Name", "Email", "Status", "Actions"],
      tableData: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          status: "Active",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          status: "Pending",
        },
        {
          id: 3,
          name: "Bob Johnson",
          email: "bob@example.com",
          status: "Inactive",
        },
      ],
    };
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

