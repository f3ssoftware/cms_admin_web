<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Notifications</h4>
          <p class="category">View and manage your notifications</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <h5 class="card-title">Notification Settings</h5>
          </template>
          <div>
            <base-checkbox v-model="settings.email">
              Email Notifications
            </base-checkbox>
            <base-checkbox v-model="settings.push">
              Push Notifications
            </base-checkbox>
            <base-checkbox v-model="settings.sms">
              SMS Notifications
            </base-checkbox>
            <base-button type="primary" class="mt-3">
              Save Settings
            </base-button>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Cards/Card.vue";
import BaseCheckbox from "@/components/BaseCheckbox.vue";
import BaseButton from "@/components/BaseButton.vue";

export default {
  name: "Notifications",
  components: {
    Card,
    BaseCheckbox,
    BaseButton,
  },
  data() {
    return {
      settings: {
        email: true,
        push: false,
        sms: false,
      },
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

