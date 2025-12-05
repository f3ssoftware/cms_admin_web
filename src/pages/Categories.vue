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
              <base-button
                type="primary"
                size="sm"
                @click="showCreateModal = true"
                :disabled="isLoading"
              >
                <i class="ni ni-fat-add"></i> Add Category
              </base-button>
            </div>
          </template>

          <!-- Error Alert -->
          <base-alert
            v-if="error"
            type="danger"
            :dismissible="true"
          >
            {{ error }}
          </base-alert>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-4">
            <i class="ni ni-spin ni-settings"></i> Loading categories...
          </div>

          <!-- Categories Table -->
          <div v-else class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="categories.length === 0">
                  <td colspan="5" class="text-center text-muted">
                    No categories found. Create your first category!
                  </td>
                </tr>
                <tr v-for="category in categories" :key="category._id">
                  <td>{{ category.name }}</td>
                  <td>
                    <code>{{ category.slug }}</code>
                  </td>
                  <td>{{ category.description || "-" }}</td>
                  <td>{{ formatDate(category.createdAt) }}</td>
                  <td>
                    <base-button
                      type="info"
                      size="sm"
                      @click="editCategory(category)"
                    >
                      Edit
                    </base-button>
                    <base-button
                      type="danger"
                      size="sm"
                      @click="confirmDelete(category)"
                    >
                      Delete
                    </base-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </card>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <modal
      :show="showCreateModal || showEditModal"
      @close="closeModal"
      :title="showEditModal ? 'Edit Category' : 'Create Category'"
    >
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Name</label>
          <base-input
            v-model="form.name"
            type="text"
            placeholder="Category name"
            required
          />
        </div>
        <div class="form-group">
          <label>Slug</label>
          <base-input
            v-model="form.slug"
            type="text"
            placeholder="category-slug"
            required
          />
          <small class="form-text text-muted">
            URL-friendly identifier (auto-generated from name if left empty)
          </small>
        </div>
        <div class="form-group">
          <label>Description</label>
          <base-input
            v-model="form.description"
            type="text"
            placeholder="Category description (optional)"
          />
        </div>
        <div class="d-flex justify-content-end gap-2">
          <base-button type="secondary" @click="closeModal">Cancel</base-button>
          <base-button
            type="primary"
            native-type="submit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Saving..." : showEditModal ? "Update" : "Create" }}
          </base-button>
        </div>
      </form>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Card from "@/components/Cards/Card.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseInput from "@/components/Inputs/BaseInput.vue";
import BaseAlert from "@/components/BaseAlert.vue";
import Modal from "@/components/Modal.vue";
import { useCategories } from "@/composables/useCategories";
import { formatDate } from "@/utils/date";
import { generateSlug } from "@/utils/validation";
import type { Category, CategoryId } from "@/types";

// Composables
const {
  categories,
  isLoading,
  error,
  loadCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
  cleanup,
} = useCategories();

// Component state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const isSubmitting = ref(false);
const editingCategoryId = ref<CategoryId | null>(null);
const form = ref({
  name: "",
  slug: "",
  description: "",
});

// Lifecycle
onMounted(() => {
  loadCategories();
});

onUnmounted(() => {
  cleanup();
});

// Methods
const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingCategoryId.value = null;
  form.value = {
    name: "",
    slug: "",
    description: "",
  };
};

const editCategory = (category: Category) => {
  editingCategoryId.value = category._id;
  form.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || "",
  };
  showEditModal.value = true;
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  clearError();

  // Generate slug if not provided
  if (!form.value.slug) {
    form.value.slug = generateSlug(form.value.name);
  }

  try {
    if (showEditModal.value && editingCategoryId.value) {
      const success = await updateCategory({
        id: editingCategoryId.value,
        ...form.value,
      });
      if (success) {
        closeModal();
      }
    } else {
      const id = await createCategory(form.value);
      if (id) {
        closeModal();
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = async (category: Category) => {
  if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
    await deleteCategory(category._id);
  }
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
.gap-2 {
  gap: 0.5rem;
}
</style>
