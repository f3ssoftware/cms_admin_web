<template>
  <div class="news-page">
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">News Management</h4>
          <p class="category">Manage news articles and translations</p>
        </div>
        <div class="col-lg-6 col-md-6 text-right">
          <base-button 
            type="primary" 
            size="md" 
            @click="goToCreate"
            class="btn btn-primary"
            style="display: inline-block;"
          >
            <i class="ni ni-fat-add"></i> Add News
          </base-button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <h5 class="card-title mb-0">News Articles</h5>
          </template>
          <div v-if="isLoading" class="text-center py-4">
            <i class="fa fa-spinner fa-spin"></i> Loading...
          </div>
          <div v-else-if="newsWithCoverage.length === 0" class="text-center py-4">
            <p>No news articles found.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Excerpt</th>
                  <th>Author</th>
                  <th>Published</th>
                  <th>Featured</th>
                  <th>Published At</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Translation Coverage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in newsWithCoverage" :key="item._id">
                  <td>{{ item._id }}</td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.categoryId }}</td>
                  <td>{{ item.excerpt || '-' }}</td>
                  <td>{{ item.authorId }}</td>
                  <td>
                    <span :class="item.published ? 'badge badge-success' : 'badge badge-secondary'">
                      {{ item.published ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td>
                    <span :class="item.isFeatured ? 'badge badge-info' : 'badge badge-secondary'">
                      {{ item.isFeatured ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td>{{ item.publishedAt ? formatDate(item.publishedAt) : '-' }}</td>
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td>{{ formatDate(item.updatedAt) }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge badge-info">
                        {{ item.translationCoverage.translated }}/{{ item.translationCoverage.total }}
                      </span>
                      <span v-if="item.translationCoverage.missing.length > 0" class="text-muted small">
                        Missing: {{ item.translationCoverage.missing.join(', ').toUpperCase() }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <base-button
                        type="info"
                        size="sm"
                        @click="goToEdit(item._id)"
                        class="btn btn-sm btn-info"
                      >
                        <i class="ni ni-ruler-pencil"></i> Edit
                      </base-button>
                      <base-button
                        type="warning"
                        size="sm"
                        @click="goToTranslations(item._id)"
                        class="btn btn-sm btn-warning"
                      >
                        <i class="ni ni-world"></i> Translations
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="handleDelete(item._id)"
                        class="btn btn-sm btn-danger"
                        :disabled="isDeleting"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import Card from "@/components/Cards/Card.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useNews } from "@/composables/useNews";
import { useNewsTranslations } from "@/composables/useNewsTranslations";
import { formatDate } from "@/utils/date";
import type { NewsId } from "@/types";

const router = useRouter();

// Composables
const {
  deleteNews,
  error: newsError,
  cleanup: cleanupNews,
} = useNews();

const {
  newsWithCoverage,
  isLoading,
  error: translationError,
  loadNewsWithCoverage,
  cleanup: cleanupTranslations,
} = useNewsTranslations();

// State
const isDeleting = ref(false);

// Computed
const error = computed(() => newsError.value || translationError.value);

// Lifecycle
onMounted(() => {
  loadNewsWithCoverage();
});

onUnmounted(() => {
  cleanupNews();
  cleanupTranslations();
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

const handleDelete = async (id: NewsId) => {
  if (!confirm(`Are you sure you want to delete this news article?`)) {
    return;
  }

  isDeleting.value = true;
  const success = await deleteNews(id);
  isDeleting.value = false;

  if (success) {
    // Reload the list
    loadNewsWithCoverage();
  }
};
</script>

<style scoped>
.news-page {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header .title {
  margin-bottom: 5px;
  font-weight: 600;
}

.header .category {
  color: #6c757d;
  margin-bottom: 0;
}

.table-responsive {
  overflow-x: auto;
}

.table th {
  font-weight: 600;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.btn-group {
  display: flex;
  gap: 5px;
}

.btn-group .btn {
  margin: 0;
}

.badge {
  padding: 0.25em 0.5em;
  font-size: 0.875em;
  font-weight: 600;
  border-radius: 0.25rem;
}

.badge-success {
  background-color: #28a745;
  color: #fff;
}

.badge-secondary {
  background-color: #6c757d;
  color: #fff;
}

.badge-info {
  background-color: #17a2b8;
  color: #fff;
}

.gap-2 {
  gap: 0.5rem;
}
</style>