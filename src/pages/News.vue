<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">News Articles</h4>
          <p class="category">Manage your news articles</p>
        </div>
        <div class="col-lg-6 col-md-6 text-right">
          <base-button
            type="primary"
            @click="goToCreate"
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
              <h5 class="card-title mb-0">News Articles List</h5>
              <base-button
                type="primary"
                size="sm"
                @click="goToCreate"
                :disabled="isLoading"
              >
                <i class="ni ni-fat-add"></i> Add Article
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
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Excerpt</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="news.length === 0">
                  <td colspan="7" class="text-center text-muted">
                    No news articles found. Create your first article!
                  </td>
                </tr>
                <tr v-for="article in news" :key="article._id">
                  <td>
                    <div class="cover-image-thumbnail">
                      <img
                        v-if="article.coverImage"
                        :src="article.coverImage"
                        :alt="article.title"
                        class="thumbnail-img"
                      />
                      <div v-else class="no-image">
                        <i class="ni ni-image"></i>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{{ article.title }}</strong>
                  </td>
                  <td>
                    <span class="excerpt">{{ article.excerpt || "-" }}</span>
                  </td>
                  <td>
                    <span
                      :class="[
                        'badge',
                        article.published ? 'badge-success' : 'badge-warning',
                      ]"
                    >
                      {{ article.published ? "Published" : "Draft" }}
                    </span>
                  </td>
                  <td>
                    <span v-if="article.isFeatured" class="badge badge-info">
                      <i class="ni ni-favourite-28"></i> Featured
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>{{ formatDate(article.createdAt) }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <base-button
                        type="info"
                        size="sm"
                        @click="goToEdit(article._id)"
                        :disabled="isLoading"
                      >
                        <i class="ni ni-ruler-pencil"></i> Edit
                      </base-button>
                      <base-button
                        type="warning"
                        size="sm"
                        @click="goToTranslations(article._id)"
                        :disabled="isLoading"
                      >
                        <i class="ni ni-world"></i> Translations
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

    <!-- Delete Confirmation Modal -->
    <modal
      :show="showDeleteModal"
      @close="closeDeleteModal"
      modal-content-classes="bg-white"
    >
      <template #header>
        <h5 class="modal-title">Delete News Article</h5>
      </template>
      <div v-if="articleToDelete">
        <p>
          Are you sure you want to delete the article
          <strong>"{{ articleToDelete.title }}"</strong>?
        </p>
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Card from "@/components/Cards/Card.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseAlert from "@/components/BaseAlert.vue";
import Modal from "@/components/Modal.vue";
import { useNews } from "@/composables/useNews";
import { formatDate } from "@/utils/date";
import type { News, NewsId } from "@/types";

const router = useRouter();

// Composables
const {
  news,
  isLoading,
  error,
  loadNews,
  deleteNews,
  clearError,
  cleanup,
} = useNews();

// Component state
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const successMessage = ref("");
const articleToDelete = ref<News | null>(null);

// Lifecycle
onMounted(() => {
  loadNews();
});

onUnmounted(() => {
  cleanup();
});

// Methods
const goToCreate = () => {
  router.push({ name: "news-new" });
};

const goToEdit = (id: NewsId) => {
  router.push({ name: "news-edit", params: { id } });
};

const goToTranslations = (id: NewsId) => {
  router.push({ name: "news-translations", params: { id } });
};

const openDeleteModal = (article: News) => {
  articleToDelete.value = article;
  showDeleteModal.value = true;
  clearError();
  successMessage.value = "";
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  articleToDelete.value = null;
  clearError();
};

const handleDelete = async () => {
  if (!articleToDelete.value) return;

  isDeleting.value = true;
  clearError();
  successMessage.value = "";

  try {
    const success = await deleteNews(articleToDelete.value._id);
    if (success) {
      successMessage.value = `Article "${articleToDelete.value.title}" deleted successfully!`;
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

.cover-image-thumbnail {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #9a9a9a;
  font-size: 24px;
}

.excerpt {
  max-width: 300px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 0.25em 0.6em;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.badge-success {
  color: #fff;
  background-color: #28a745;
}

.badge-warning {
  color: #212529;
  background-color: #ffc107;
}

.badge-info {
  color: #fff;
  background-color: #17a2b8;
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

:deep(.modal-body p) {
  color: #333 !important;
}

:deep(.modal-body strong) {
  color: #333 !important;
}
</style>
