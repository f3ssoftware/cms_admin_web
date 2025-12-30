<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">News</h4>
          <p class="category">Manage your news articles</p>
        </div>
        <div class="col-lg-6 col-md-6 text-right">
          <base-button
            type="primary"
            @click="openCreateModal"
            :disabled="isLoading"
          >
            <i class="ni ni-fat-add"></i> Create New Article
          </base-button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">News Articles</h5>
              <base-button
                type="primary"
                size="sm"
                @click="openCreateModal"
                :disabled="isLoading"
              >
                <i class="ni ni-fat-add"></i> Add News
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
            <i class="ni ni-spin ni-settings"></i> Loading news articles...
          </div>

          <!-- News Table -->
          <div v-else class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="news.length === 0">
                  <td colspan="6" class="text-center text-muted">
                    No news articles found. Create your first article!
                  </td>
                </tr>
                <tr v-for="article in news" :key="article._id">
                  <td><strong>{{ article.title }}</strong></td>
                  <td>
                    <span class="badge badge-info">
                      {{ getCategoryName(article.categoryId) }}
                    </span>
                  </td>
                  <td>
                    <span
                      :class="[
                        'badge',
                        article.published ? 'badge-success' : 'badge-warning'
                      ]"
                    >
                      {{ article.published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td>
                    {{ article.publishedAt ? formatDate(article.publishedAt) : '-' }}
                  </td>
                  <td>{{ formatDate(article.createdAt) }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <base-button
                        type="info"
                        size="sm"
                        @click="editNews(article)"
                        :disabled="isLoading"
                      >
                        <i class="ni ni-ruler-pencil"></i> Edit
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="openDeleteModal(article)"
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
      @close="handleCloseModal"
      :close-on-backdrop="false"
      modal-content-classes="bg-white"
    >
      <template #header>
        <h5 class="modal-title">{{ showEditModal ? 'Edit News Article' : 'Create News Article' }}</h5>
      </template>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Title <span class="text-danger">*</span></label>
          <base-input
            v-model="form.title"
            type="text"
            placeholder="Article title"
            required
          />
        </div>
        <div class="form-group">
          <label>Category <span class="text-danger">*</span></label>
          <select
            v-model="form.categoryId"
            class="form-control"
            required
          >
            <option value="">Select a category</option>
            <option
              v-for="category in categories"
              :key="category._id"
              :value="category._id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Excerpt</label>
          <base-input
            v-model="form.excerpt"
            type="text"
            placeholder="Short description (optional)"
          />
          <small class="form-text text-muted">
            Brief summary of the article
          </small>
        </div>
        <div class="form-group">
          <label>Content <span class="text-danger">*</span></label>
          <RichTextEditor
            v-model="form.content"
            placeholder="Start writing your article content..."
          />
          <small class="form-text text-muted">
            Use the toolbar above to format your content with headings, lists, links, images, and more.
          </small>
        </div>
        <div class="form-group">
          <div class="form-check">
            <input
              v-model="form.published"
              type="checkbox"
              class="form-check-input"
              id="published-check"
            />
            <label class="form-check-label" for="published-check">
              Publish immediately
            </label>
          </div>
          <small class="form-text text-muted">
            Uncheck to save as draft
          </small>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <base-button type="secondary" @click="closeModal" :disabled="isSubmitting">
            Cancel
          </base-button>
          <base-button
            type="primary"
            native-type="submit"
            :disabled="isSubmitting || !form.title || !form.content || !form.categoryId"
          >
            <span v-if="isSubmitting">
              <i class="ni ni-spin ni-settings"></i> Saving...
            </span>
            <span v-else>
              {{ showEditModal ? "Update Article" : "Create Article" }}
            </span>
          </base-button>
        </div>
      </form>
    </modal>

    <!-- Delete Confirmation Modal -->
    <modal
      :show="showDeleteModal"
      @close="closeDeleteModal"
      :close-on-backdrop="false"
      modal-content-classes="bg-white"
    >
      <template #header>
        <h5 class="modal-title">Delete News Article</h5>
      </template>
      <div v-if="newsToDelete">
        <p>Are you sure you want to delete the article <strong>"{{ newsToDelete.title }}"</strong>?</p>
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

    <!-- Unsaved Changes Confirmation Modal -->
    <modal
      :show="showUnsavedChangesModal"
      @close="cancelCloseModal"
      :close-on-backdrop="false"
      modal-content-classes="bg-white"
    >
      <template #header>
        <h5 class="modal-title">Unsaved Changes</h5>
      </template>
      <div>
        <p>You have unsaved changes. Are you sure you want to close without saving?</p>
        <p class="text-muted">Your changes will be lost.</p>
        <div class="d-flex justify-content-end gap-2">
          <base-button type="secondary" @click="cancelCloseModal">
            Cancel
          </base-button>
          <base-button type="danger" @click="confirmCloseModal">
            Close Without Saving
          </base-button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Card from "@/components/Cards/Card.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseInput from "@/components/Inputs/BaseInput.vue";
import BaseAlert from "@/components/BaseAlert.vue";
import Modal from "@/components/Modal.vue";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor.vue";
import { useNews } from "@/composables/useNews";
import { useCategories } from "@/composables/useCategories";
import { formatDate } from "@/utils/date";
import type { News, NewsId, CategoryId } from "@/types";

// Composables
const {
  news,
  isLoading,
  error,
  loadNews,
  createNews,
  updateNews,
  deleteNews,
  clearError,
  cleanup,
} = useNews();

const {
  categories: categoriesList,
  loadCategories,
  cleanup: cleanupCategories,
} = useCategories();

// Computed
const categories = computed(() => categoriesList.value);

// Component state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showUnsavedChangesModal = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const successMessage = ref("");
const editingNewsId = ref<NewsId | null>(null);
const newsToDelete = ref<News | null>(null);
const initialFormState = ref<{
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  published: boolean;
}>({
  title: "",
  content: "",
  excerpt: "",
  categoryId: "",
  published: false,
});
const form = ref<{
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  published: boolean;
}>({
  title: "",
  content: "",
  excerpt: "",
  categoryId: "",
  published: false,
});

// Lifecycle
onMounted(() => {
  loadNews();
  loadCategories();
});

onUnmounted(() => {
  cleanup();
  cleanupCategories();
});

// Methods
const getCategoryName = (categoryId: CategoryId): string => {
  const category = categories.value.find((c) => c._id === categoryId);
  return category?.name || "Unknown";
};

const openCreateModal = () => {
  const emptyForm = {
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
    published: false,
  };
  form.value = { ...emptyForm };
  initialFormState.value = { ...emptyForm };
  editingNewsId.value = null;
  showEditModal.value = false;
  showCreateModal.value = true;
  clearError();
  successMessage.value = "";
};

const hasUnsavedChanges = (): boolean => {
  return (
    form.value.title !== initialFormState.value.title ||
    form.value.content !== initialFormState.value.content ||
    form.value.excerpt !== initialFormState.value.excerpt ||
    form.value.categoryId !== initialFormState.value.categoryId ||
    form.value.published !== initialFormState.value.published
  );
};

const handleCloseModal = () => {
  if (hasUnsavedChanges()) {
    showUnsavedChangesModal.value = true;
  } else {
    closeModal();
  }
};

const cancelCloseModal = () => {
  showUnsavedChangesModal.value = false;
};

const confirmCloseModal = () => {
  showUnsavedChangesModal.value = false;
  closeModal();
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingNewsId.value = null;
  const emptyForm = {
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
    published: false,
  };
  form.value = { ...emptyForm };
  initialFormState.value = { ...emptyForm };
  clearError();
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  newsToDelete.value = null;
  clearError();
};

const editNews = (article: News) => {
  editingNewsId.value = article._id;
  const articleForm = {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt || "",
    categoryId: article.categoryId,
    published: article.published,
  };
  form.value = { ...articleForm };
  initialFormState.value = { ...articleForm };
  showEditModal.value = true;
  clearError();
  successMessage.value = "";
};

const openDeleteModal = (article: News) => {
  newsToDelete.value = article;
  showDeleteModal.value = true;
  clearError();
  successMessage.value = "";
};

const handleSubmit = async () => {
  if (!form.value.title || !form.value.content || !form.value.categoryId) {
    return;
  }

  isSubmitting.value = true;
  clearError();
  successMessage.value = "";

  try {
    if (showEditModal.value && editingNewsId.value) {
      const success = await updateNews({
        id: editingNewsId.value,
        title: form.value.title,
        content: form.value.content,
        excerpt: form.value.excerpt || undefined,
        categoryId: form.value.categoryId as News["categoryId"],
        published: form.value.published,
      });
      if (success) {
        successMessage.value = `Article "${form.value.title}" updated successfully!`;
        // Reset initial state to match current form state
        initialFormState.value = { ...form.value };
        closeModal();
        setTimeout(() => {
          successMessage.value = "";
        }, 3000);
      }
    } else {
      const id = await createNews({
        title: form.value.title,
        content: form.value.content,
        excerpt: form.value.excerpt || undefined,
        categoryId: form.value.categoryId as News["categoryId"],
        published: form.value.published,
      });
      if (id) {
        successMessage.value = `Article "${form.value.title}" created successfully!`;
        // Reset initial state to match current form state
        initialFormState.value = { ...form.value };
        closeModal();
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
  if (!newsToDelete.value) return;

  isDeleting.value = true;
  clearError();
  successMessage.value = "";

  try {
    const success = await deleteNews(newsToDelete.value._id);
    if (success) {
      successMessage.value = `Article "${newsToDelete.value.title}" deleted successfully!`;
      closeDeleteModal();
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

.text-danger {
  color: #ef8157 !important;
}

.text-right {
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875em;
  font-weight: 500;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-info {
  background-color: #17a2b8;
  color: white;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 0.2rem rgba(94, 114, 228, 0.25);
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-check-label {
  margin: 0;
  cursor: pointer;
}

textarea.form-control {
  resize: vertical;
  min-height: 150px;
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
