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
            size="md" 
            @click="goToCreate"
            class="btn btn-primary"
          >
            <i class="ni ni-fat-add"></i> Create News
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
                @click="goToCreate"
                class="btn btn-primary"
                style="display: inline-block;"
              >
                <i class="ni ni-fat-add"></i> Add News
              </base-button>
            </div>
          </template>
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <div v-if="successMessage" class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>
          <div class="table-responsive">
            <table class="table" v-if="!isLoading">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Excerpt</th>
                  <th>Author ID</th>
                  <th>Featured</th>
                  <th>Translations</th>
                  <th>Published Date</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="news.length === 0">
                  <td colspan="12" class="text-center text-muted">
                    No news articles found. Click "Add News" to create one.
                  </td>
                </tr>
                <tr v-for="article in newsWithCoverage.length > 0 ? newsWithCoverage : news" :key="article._id">
                  <td><small class="text-muted">{{ article._id.substring(0, 8) }}...</small></td>
                  <td><strong>{{ article.title }}</strong></td>
                  <td>{{ getCategoryName(article.categoryId) }}</td>
                  <td>{{ article.excerpt || "—" }}</td>
                  <td><small class="text-muted">{{ article.authorId }}</small></td>
                  <td>
                    <span
                      v-if="article.isFeatured"
                      class="badge badge-info"
                    >
                      Featured
                    </span>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td>
                    <div v-if="getTranslationCoverage(article._id)">
                      <span class="badge badge-info mr-1">
                        {{ getTranslationCoverage(article._id)?.translated || 0 }}/{{ getTranslationCoverage(article._id)?.total || 3 }}
                      </span>
                      <div class="mt-1">
                        <span
                          v-for="locale in ['pt', 'es', 'fr']"
                          :key="locale"
                          class="badge mr-1"
                          :class="getTranslationCoverage(article._id)?.coverage[locale]?.exists ? 'badge-success' : 'badge-secondary'"
                          :title="getTranslationCoverage(article._id)?.coverage[locale]?.exists ? `${locale.toUpperCase()} translated` : `${locale.toUpperCase()} missing`"
                        >
                          {{ locale.toUpperCase() }} {{ getTranslationCoverage(article._id)?.coverage[locale]?.exists ? '✅' : '❌' }}
                        </span>
                      </div>
                    </div>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td>
                    <span v-if="article.publishedAt">
                      {{ formatDate(article.publishedAt) }}
                    </span>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(article.createdAt) }}</small>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(article.updatedAt) }}</small>
                  </td>
                  <td>
                    <span
                      :class="
                        article.published
                          ? 'badge badge-success'
                          : 'badge badge-warning'
                      "
                    >
                      {{ article.published ? "Published" : "Draft" }}
                    </span>
                  </td>
                  <td>
                    <base-button
                      type="info"
                      size="sm"
                      @click="goToEdit(article._id)"
                      class="mr-1"
                    >
                      Edit
                    </base-button>
                    <base-button
                      type="warning"
                      size="sm"
                      @click="goToTranslations(article._id)"
                      class="mr-1"
                    >
                      <i class="ni ni-world"></i> Translations
                    </base-button>
                    <base-button
                      type="danger"
                      size="sm"
                      @click="openDeleteModal(article)"
                    >
                      Delete
                    </base-button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-center p-4">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>

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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Card from "@/components/Cards/Card.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseAlert from "@/components/BaseAlert.vue";
import Modal from "@/components/Modal.vue";
import { useNews } from "@/composables/useNews";
import { useCategories } from "@/composables/useCategories";
import { useNewsTranslations } from "@/composables/useNewsTranslations";
import { formatDate } from "@/utils/date";
import type { News, NewsId, CategoryId } from "@/types";

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

const {
  categories: categoriesList,
  loadCategories,
  cleanup: cleanupCategories,
} = useCategories();

const {
  newsWithCoverage,
  loadNewsWithCoverage,
  cleanup: cleanupTranslations,
} = useNewsTranslations();

// Computed
const categories = computed(() => categoriesList.value);

// Component state
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const successMessage = ref("");
const newsToDelete = ref<News | null>(null);

// Lifecycle
onMounted(() => {
  loadNews();
  loadCategories();
  // Load news with coverage for translation badges
  loadNewsWithCoverage();
});

onUnmounted(() => {
  cleanup();
  cleanupCategories();
  cleanupTranslations();
});

// Methods
const getCategoryName = (categoryId: CategoryId): string => {
  const category = categories.value.find((c) => c._id === categoryId);
  return category?.name || "Unknown";
};

const getTranslationCoverage = (newsId: NewsId) => {
  const newsWithCov = newsWithCoverage.value.find((n) => n._id === newsId);
  return newsWithCov?.translationCoverage;
};

const goToCreate = () => {
  router.push({ name: "news-new" });
};

const goToEdit = (id: NewsId) => {
  router.push({ name: "news-edit", params: { id } });
};

const goToTranslations = (id: NewsId) => {
  router.push({ name: "news-translations", params: { id } });
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  newsToDelete.value = null;
  clearError();
};

const openDeleteModal = (article: News) => {
  newsToDelete.value = article;
  showDeleteModal.value = true;
  clearError();
  successMessage.value = "";
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
</style>







