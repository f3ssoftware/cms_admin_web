<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Categories</h4>
          <p class="category">Manage your content categories</p>
        </div>
        <div class="col-lg-6 col-md-6 text-right">
          <base-button
            type="primary"
            @click="openCreateModal"
            :disabled="isLoading"
          >
            <i class="ni ni-fat-add"></i> Create New Category
          </base-button>
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
                @click="openCreateModal"
                :disabled="isLoading"
              >
                <i class="ni ni-fat-add"></i> Add Category
              </base-button>
            </div>
          </template>

          <!-- Success Alert -->
          <base-alert
            v-if="successMessage"
            type="success"
            :dismissible="true"
          >
            <template #dismiss-icon>
              <button
                type="button"
                class="close"
                aria-label="Close"
                @click="successMessage = ''"
              >
                <span aria-hidden="true">
                  <i class="tim-icons icon-simple-remove"></i>
                </span>
              </button>
            </template>
            {{ successMessage }}
          </base-alert>

          <!-- Error Alert -->
          <base-alert
            v-if="error"
            type="danger"
            :dismissible="true"
          >
            <template #dismiss-icon>
              <button
                type="button"
                class="close"
                aria-label="Close"
                @click="clearError"
              >
                <span aria-hidden="true">
                  <i class="tim-icons icon-simple-remove"></i>
                </span>
              </button>
            </template>
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
                  <td><strong>{{ category.name }}</strong></td>
                  <td>
                    <code>{{ category.slug }}</code>
                  </td>
                  <td>{{ category.description || "-" }}</td>
                  <td>{{ formatDate(category.createdAt) }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <base-button
                        type="info"
                        size="sm"
                        @click="editCategory(category)"
                        :disabled="isLoading"
                      >
                        <i class="ni ni-ruler-pencil"></i> Edit
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="openDeleteModal(category)"
                        :disabled="isLoading"
                      >
                        <i class="ni ni-fat-remove"></i> Delete
                      </base-button>
                    </div>
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
      modal-content-classes="bg-white"
    >
      <template #header>
        <h5 class="modal-title">{{ showEditModal ? 'Edit Category' : 'Create Category' }}</h5>
      </template>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Name <span class="text-danger">*</span></label>
          <base-input
            v-model="form.name"
            type="text"
            placeholder="Category name"
            required
          />
        </div>
        <div class="form-group">
          <label>Slug <span class="text-danger">*</span></label>
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
          <base-button type="secondary" @click="closeModal" :disabled="isSubmitting">
            Cancel
          </base-button>
          <base-button
            type="primary"
            native-type="submit"
            :disabled="isSubmitting || !form.name || !form.slug"
          >
            <span v-if="isSubmitting">
              <i class="ni ni-spin ni-settings"></i> Saving...
            </span>
            <span v-else>
              {{ showEditModal ? "Update Category" : "Create Category" }}
            </span>
          </base-button>
        </div>
      </form>
    </modal>

    <!-- Delete Confirmation Modal -->
    <modal
      :show="showDeleteModal"
      @close="closeDeleteModal"
      modal-content-classes="bg-white"
    >
      <template #header>
        <h5 class="modal-title">Delete Category</h5>
      </template>
      <div v-if="categoryToDelete">
        <p>Are you sure you want to delete the category <strong>"{{ categoryToDelete.name }}"</strong>?</p>
        <p class="text-muted">This action cannot be undone.</p>
        <div class="d-flex justify-content-end gap-2">
          <base-button type="secondary" @click="closeDeleteModal" :disabled="isDeleting">
            Cancel
          </base-button>
          <base-button
            type="danger"
            @click="handleDelete"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting">
              <i class="ni ni-spin ni-settings"></i> Deleting...
            </span>
            <span v-else>
              <i class="ni ni-fat-remove"></i> Delete
            </span>
          </base-button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
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
const showDeleteModal = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const successMessage = ref("");
const editingCategoryId = ref<CategoryId | null>(null);
const categoryToDelete = ref<Category | null>(null);
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

// Watch for name changes to auto-generate slug
watch(
  () => form.value.name,
  (newName) => {
    if (newName && (!form.value.slug || form.value.slug === generateSlug(form.value.name))) {
      form.value.slug = generateSlug(newName);
    }
  }
);

// Methods
const openCreateModal = () => {
  form.value = {
    name: "",
    slug: "",
    description: "",
  };
  editingCategoryId.value = null;
  showEditModal.value = false;
  showCreateModal.value = true;
  clearError();
  successMessage.value = "";
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingCategoryId.value = null;
  form.value = {
    name: "",
    slug: "",
    description: "",
  };
  clearError();
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  categoryToDelete.value = null;
  clearError();
};


const editCategory = (category: Category) => {
  editingCategoryId.value = category._id;
  form.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || "",
  };
  showEditModal.value = true;
  clearError();
  successMessage.value = "";
};

const openDeleteModal = (category: Category) => {
  categoryToDelete.value = category;
  showDeleteModal.value = true;
  clearError();
  successMessage.value = "";
};

const handleSubmit = async () => {
  if (!form.value.name || !form.value.slug) {
    return;
  }

  isSubmitting.value = true;
  clearError();
  successMessage.value = "";

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
        successMessage.value = `Category "${form.value.name}" updated successfully!`;
        closeModal();
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage.value = "";
        }, 3000);
      }
    } else {
      const id = await createCategory(form.value);
      if (id) {
        successMessage.value = `Category "${form.value.name}" created successfully!`;
        closeModal();
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage.value = "";
        }, 3000);
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  if (!categoryToDelete.value) return;

  isDeleting.value = true;
  clearError();
  successMessage.value = "";

  try {
    const success = await deleteCategory(categoryToDelete.value._id);
    if (success) {
      successMessage.value = `Category "${categoryToDelete.value.name}" deleted successfully!`;
      closeDeleteModal();
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } finally {
    isDeleting.value = false;
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

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  padding: 12px;
}

.table td {
  padding: 12px;
  vertical-align: middle;
}

.table code {
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.text-danger {
  color: #ef8157 !important;
}

.text-right {
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .text-right {
    margin-top: 15px;
    justify-content: flex-start;
  }
}

/* Ensure modal content has proper background and text color */
:deep(.modal-content) {
  background-color: #fff !important;
  color: #333 !important;
}

:deep(.modal-body) {
  color: #333 !important;
}

:deep(.modal-header) {
  color: #333 !important;
}

:deep(.modal-header .modal-title) {
  color: #333 !important;
}

:deep(.modal-body label) {
  color: #333 !important;
}

:deep(.modal-body .form-control) {
  color: #333 !important;
}

:deep(.modal-body .form-text) {
  color: #6c757d !important;
}

:deep(.modal-body p) {
  color: #333 !important;
}

:deep(.modal-body strong) {
  color: #333 !important;
}

:deep(.modal-body select) {
  color: #333 !important;
  background-color: #fff !important;
}

:deep(.modal-body textarea) {
  color: #333 !important;
  background-color: #fff !important;
}

:deep(.modal-body input[type="text"]) {
  color: #333 !important;
  background-color: #fff !important;
}
</style>
