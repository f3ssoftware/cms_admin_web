<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">User Profile</h4>
          <p class="category">Manage your profile information</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-8">
        <card>
          <template slot="header">
            <h5 class="card-title">Edit Profile</h5>
          </template>
          <div>
            <div class="form-group">
              <label>Full Name</label>
              <base-input
                v-model="profile.name"
                placeholder="Enter your full name"
              ></base-input>
            </div>
            <div class="form-group">
              <label>Email</label>
              <base-input
                v-model="profile.email"
                type="email"
                placeholder="Enter your email"
              ></base-input>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <base-input
                v-model="profile.phone"
                placeholder="Enter your phone number"
              ></base-input>
            </div>
            <base-button type="primary" native-type="submit">
              Update Profile
            </base-button>
          </div>
        </card>
      </div>
      <div class="col-md-4">
        <card>
          <template slot="header">
            <h5 class="card-title">Profile Picture</h5>
          </template>
          <div class="text-center">
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              class="rounded-circle img-fluid"
              style="width: 150px; height: 150px;"
            />
            <p class="mt-3">
              <base-button type="primary" size="sm">
                Change Photo
              </base-button>
            </p>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Cards/Card.vue";
import BaseInput from "@/components/Inputs/BaseInput.vue";
import BaseButton from "@/components/BaseButton.vue";

export default {
  name: "Profile",
  components: {
    Card,
    BaseInput,
    BaseButton,
  },
  data() {
    return {
      profile: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 234 567 8900",
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
.form-group {
  margin-bottom: 20px;
}
</style>

