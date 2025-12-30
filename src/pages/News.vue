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
            @click="openCreateModal"
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
                @click="openCreateModal"
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
                      @click="editNews(article)"
                      class="mr-1"
                    >
                      Edit
                    </base-button>
                    <base-button
                      type="warning"
                      size="sm"
                      @click="openTranslationsModal(article)"
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

    <!-- Create/Edit Modal -->
    <modal
      :show="showCreateModal || showEditModal"
      @close="handleCloseModal"
      :close-on-backdrop="false"
      modal-content-classes="bg-white news-modal"
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
        <div class="form-group">
          <div class="form-check">
            <input
              v-model="form.isFeatured"
              type="checkbox"
              class="form-check-input"
              id="featured-check"
            />
            <label class="form-check-label" for="featured-check">
              Feature this article
            </label>
          </div>
          <small class="form-text text-muted">
            Featured articles will be highlighted on the frontend
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

    <!-- Translations Modal -->
    <modal
      :show="showTranslationsModal"
      @close="closeTranslationsModal"
      :close-on-backdrop="false"
      modal-content-classes="bg-white news-modal translations-modal"
      :modal-classes="'modal-xl'"
    >
      <template #header>
        <div class="d-flex justify-content-between align-items-center w-100">
          <h5 class="modal-title mb-0">
            Translations: {{ currentNewsForTranslation?.title }}
          </h5>
          <div class="d-flex align-items-center gap-2">
            <!-- Coverage Badges -->
            <div v-if="currentNewsForTranslation" class="coverage-badges">
              <span
                v-for="locale in ['pt', 'es', 'fr']"
                :key="locale"
                class="badge mr-1"
                :class="getTranslationCoverage(currentNewsForTranslation._id)?.coverage[locale]?.exists ? 'badge-success' : 'badge-secondary'"
                :title="getTranslationCoverage(currentNewsForTranslation._id)?.coverage[locale]?.exists ? `${locale.toUpperCase()} translated` : `${locale.toUpperCase()} missing`"
              >
                {{ locale.toUpperCase() }} {{ getTranslationCoverage(currentNewsForTranslation._id)?.coverage[locale]?.exists ? '✅' : '❌' }}
              </span>
            </div>
            <base-button
              v-if="currentNewsForTranslation && getTranslationCoverage(currentNewsForTranslation._id)?.missing?.length"
              type="info"
              size="sm"
              @click="handleCreateMissingTranslations"
              :disabled="isSavingTranslation"
            >
              Create Missing
            </base-button>
          </div>
        </div>
      </template>
      <div v-if="currentNewsForTranslation">
        <div v-if="translationError" class="alert alert-danger" role="alert">
          {{ translationError }}
        </div>
        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentTranslationLocale === 'en' }"
              @click="switchTranslationLocale('en')"
              href="#"
            >
              English (Source)
            </a>
          </li>
          <li
            v-for="locale in ['pt', 'es', 'fr']"
            :key="locale"
            class="nav-item"
          >
            <a
              class="nav-link"
              :class="{ active: currentTranslationLocale === locale }"
              @click="switchTranslationLocale(locale)"
              href="#"
            >
              {{ locale.toUpperCase() }}
              <span
                v-if="getTranslationCoverage(currentNewsForTranslation._id)?.coverage[locale]?.exists"
                class="badge badge-success ml-1"
              >
                ✓
              </span>
            </a>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- English Tab (Read-only) -->
          <div v-if="currentTranslationLocale === 'en'" class="tab-pane active">
            <div class="alert alert-info">
              <i class="ni ni-info"></i> English is the source of truth. Edit the main news article to change English content.
            </div>
            <div class="form-group">
              <label>Title</label>
              <input
                type="text"
                class="form-control"
                :value="currentNewsForTranslation.title"
                readonly
                disabled
              />
            </div>
            <div class="form-group">
              <label>Excerpt</label>
              <input
                type="text"
                class="form-control"
                :value="currentNewsForTranslation.excerpt || ''"
                readonly
                disabled
              />
            </div>
            <div class="form-group">
              <label>Content</label>
              <textarea
                class="form-control"
                rows="10"
                :value="currentNewsForTranslation.content"
                readonly
                disabled
              ></textarea>
            </div>
          </div>

          <!-- Translation Tabs (Two-column layout) -->
          <div v-else class="tab-pane active">
            <div class="row">
              <!-- Left: English Reference (Read-only) -->
              <div class="col-md-6">
                <h6 class="text-muted mb-3">
                  <i class="ni ni-world"></i> English Reference
                </h6>
                <div class="reference-panel">
                  <div class="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      class="form-control"
                      :value="currentNewsForTranslation.title"
                      readonly
                      disabled
                    />
                  </div>
                  <div class="form-group">
                    <label>Excerpt</label>
                    <input
                      type="text"
                      class="form-control"
                      :value="currentNewsForTranslation.excerpt || ''"
                      readonly
                      disabled
                    />
                  </div>
                  <div class="form-group">
                    <label>Content</label>
                    <textarea
                      class="form-control"
                      rows="10"
                      :value="currentNewsForTranslation.content"
                      readonly
                      disabled
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Right: Translation Form -->
              <div class="col-md-6">
                <h6 class="mb-3">
                  <i class="ni ni-world"></i> {{ currentTranslationLocale.toUpperCase() }} Translation
                  <span
                    v-if="translation"
                    class="badge badge-info ml-2"
                  >
                    Last updated: {{ formatDate(translation.updatedAt) }}
                  </span>
                </h6>
                <form @submit.prevent="handleSaveTranslation">
                  <div class="form-group">
                    <label>Title <span class="text-danger">*</span></label>
                    <base-input
                      v-model="translationForm.title"
                      type="text"
                      placeholder="Translated title"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>Excerpt</label>
                    <base-input
                      v-model="translationForm.excerpt"
                      type="text"
                      placeholder="Translated excerpt (optional)"
                    />
                  </div>
                  <div class="form-group">
                    <label>Content <span class="text-danger">*</span></label>
                    <RichTextEditor
                      v-model="translationForm.body"
                      placeholder="Translated content..."
                    />
                  </div>
                  <div class="form-group">
                    <label>Slug (optional)</label>
                    <base-input
                      v-model="translationForm.slug"
                      type="text"
                      placeholder="URL-friendly slug"
                    />
                    <small class="form-text text-muted">
                      Leave empty to auto-generate from title
                    </small>
                  </div>
                  <div class="form-group">
                    <label>SEO Title (optional)</label>
                    <base-input
                      v-model="translationForm.seoTitle"
                      type="text"
                      placeholder="SEO meta title"
                    />
                  </div>
                  <div class="form-group">
                    <label>SEO Description (optional)</label>
                    <textarea
                      v-model="translationForm.seoDescription"
                      class="form-control"
                      rows="3"
                      placeholder="SEO meta description"
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label>Status</label>
                    <select
                      v-model="translationForm.status"
                      class="form-control"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <base-button
                      v-if="translation"
                      type="danger"
                      size="sm"
                      @click="handleDeleteTranslation"
                      :disabled="isSavingTranslation"
                    >
                      Delete Translation
                    </base-button>
                    <div class="ml-auto">
                      <base-button
                        type="secondary"
                        @click="closeTranslationsModal"
                        :disabled="isSavingTranslation"
                        class="mr-2"
                      >
                        Close
                      </base-button>
                      <base-button
                        type="primary"
                        native-type="submit"
                        :disabled="isSavingTranslation || !translationForm.title || !translationForm.body"
                      >
                        <span v-if="isSavingTranslation">
                          <i class="ni ni-spin ni-settings"></i> Saving...
                        </span>
                        <span v-else>
                          {{ translation ? 'Update Translation' : 'Save Translation' }}
                        </span>
                      </base-button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import Card from "@/components/Cards/Card.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseInput from "@/components/Inputs/BaseInput.vue";
import BaseAlert from "@/components/BaseAlert.vue";
import Modal from "@/components/Modal.vue";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor.vue";
import { useNews } from "@/composables/useNews";
import { useCategories } from "@/composables/useCategories";
import { useNewsTranslations } from "@/composables/useNewsTranslations";
import { formatDate } from "@/utils/date";
import type { News, NewsId, CategoryId, Locale } from "@/types";

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

const {
  translation,
  newsWithCoverage,
  isLoading: isLoadingTranslations,
  error: translationError,
  loadTranslation,
  loadNewsWithCoverage,
  upsertTranslation,
  deleteTranslation,
  setTranslationStatus,
  createMissingTranslations,
  clearError: clearTranslationError,
  cleanup: cleanupTranslations,
} = useNewsTranslations();

// Computed
const categories = computed(() => categoriesList.value);

// Component state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showTranslationsModal = ref(false);
const showUnsavedChangesModal = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const successMessage = ref("");
const editingNewsId = ref<NewsId | null>(null);
const newsToDelete = ref<News | null>(null);
const currentNewsForTranslation = ref<News | null>(null);
const currentTranslationLocale = ref<Locale>("pt");
const translationForm = ref({
  title: "",
  excerpt: "",
  body: "",
  slug: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft" as "draft" | "review" | "published",
});
const isSavingTranslation = ref(false);
const translationCoverageMap = ref<Record<string, any>>({});
const initialFormState = ref<{
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  published: boolean;
  isFeatured: boolean;
}>({
  title: "",
  content: "",
  excerpt: "",
  categoryId: "",
  published: false,
  isFeatured: false,
});
const form = ref<{
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  published: boolean;
  isFeatured: boolean;
}>({
  title: "",
  content: "",
  excerpt: "",
  categoryId: "",
  published: false,
  isFeatured: false,
});

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

const openCreateModal = () => {
  const emptyForm = {
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
    published: false,
    isFeatured: false,
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
    form.value.published !== initialFormState.value.published ||
    form.value.isFeatured !== initialFormState.value.isFeatured
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
    isFeatured: false,
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
    isFeatured: article.isFeatured || false,
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

const openTranslationsModal = async (article: News) => {
  currentNewsForTranslation.value = article;
  currentTranslationLocale.value = "pt";
  showTranslationsModal.value = true;
  clearError();
  clearTranslationError();
  successMessage.value = "";
  
  // Load translation for current locale
  await loadTranslationForLocale(article._id, "pt");
};

const closeTranslationsModal = () => {
  showTranslationsModal.value = false;
  currentNewsForTranslation.value = null;
  currentTranslationLocale.value = "pt";
  translationForm.value = {
    title: "",
    excerpt: "",
    body: "",
    slug: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft",
  };
  clearTranslationError();
};

const loadTranslationForLocale = async (newsId: NewsId, locale: Locale) => {
  if (locale === "en") {
    // For English, use the news article itself
    const newsItem = news.value.find((n) => n._id === newsId);
    if (newsItem) {
      translationForm.value = {
        title: newsItem.title,
        excerpt: newsItem.excerpt || "",
        body: newsItem.content,
        slug: "",
        seoTitle: "",
        seoDescription: "",
        status: newsItem.published ? "published" : "draft",
      };
    }
    return;
  }

  // Load translation
  loadTranslation(newsId, locale);
  
  // Wait a bit for the query to update
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const trans = translation.value;
  if (trans) {
    translationForm.value = {
      title: trans.title,
      excerpt: trans.excerpt || "",
      body: trans.body,
      slug: trans.slug || "",
      seoTitle: trans.seoTitle || "",
      seoDescription: trans.seoDescription || "",
      status: trans.status,
    };
  } else {
    // Empty form for new translation
    translationForm.value = {
      title: "",
      excerpt: "",
      body: "",
      slug: "",
      seoTitle: "",
      seoDescription: "",
      status: "draft",
    };
  }
};

const switchTranslationLocale = async (locale: Locale) => {
  if (!currentNewsForTranslation.value) return;
  currentTranslationLocale.value = locale;
  await loadTranslationForLocale(currentNewsForTranslation.value._id, locale);
};

const handleSaveTranslation = async () => {
  if (!currentNewsForTranslation.value) return;
  
  if (!translationForm.value.title || !translationForm.value.body) {
    clearTranslationError();
    return;
  }

  isSavingTranslation.value = true;
  clearTranslationError();

  try {
    const success = await upsertTranslation({
      newsId: currentNewsForTranslation.value._id,
      locale: currentTranslationLocale.value,
      title: translationForm.value.title,
      excerpt: translationForm.value.excerpt || undefined,
      body: translationForm.value.body,
      slug: translationForm.value.slug || undefined,
      seoTitle: translationForm.value.seoTitle || undefined,
      seoDescription: translationForm.value.seoDescription || undefined,
      status: translationForm.value.status,
    });

    if (success) {
      successMessage.value = `Translation saved successfully!`;
      // Reload coverage
      loadNewsWithCoverage();
      // Reload current translation
      await loadTranslationForLocale(
        currentNewsForTranslation.value._id,
        currentTranslationLocale.value
      );
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } finally {
    isSavingTranslation.value = false;
  }
};

const handleDeleteTranslation = async () => {
  if (!currentNewsForTranslation.value) return;
  if (currentTranslationLocale.value === "en") {
    return; // Can't delete English
  }

  if (!confirm(`Are you sure you want to delete the ${currentTranslationLocale.value.toUpperCase()} translation?`)) {
    return;
  }

  isSavingTranslation.value = true;
  clearTranslationError();

  try {
    const success = await deleteTranslation(
      currentNewsForTranslation.value._id,
      currentTranslationLocale.value
    );

    if (success) {
      successMessage.value = `Translation deleted successfully!`;
      // Reload coverage
      loadNewsWithCoverage();
      // Reset form
      translationForm.value = {
        title: "",
        excerpt: "",
        body: "",
        slug: "",
        seoTitle: "",
        seoDescription: "",
        status: "draft",
      };
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } finally {
    isSavingTranslation.value = false;
  }
};

const handleCreateMissingTranslations = async () => {
  if (!currentNewsForTranslation.value) return;

  isSavingTranslation.value = true;
  clearTranslationError();

  try {
    const success = await createMissingTranslations(currentNewsForTranslation.value._id);
    if (success) {
      successMessage.value = `Missing translations created!`;
      loadNewsWithCoverage();
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } finally {
    isSavingTranslation.value = false;
  }
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
        isFeatured: form.value.isFeatured,
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
        isFeatured: form.value.isFeatured,
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
</style>

<style>
/* Modal input text color - scoped to news modal */
.news-modal .form-control,
.news-modal input[type="text"],
.news-modal input[type="email"],
.news-modal input[type="password"],
.news-modal select,
.news-modal textarea {
  color: #000 !important;
}

.news-modal .form-control::placeholder {
  color: rgba(0, 0, 0, 0.5) !important;
}

.news-modal .form-control:focus {
  color: #000 !important;
}

.news-modal select.form-control {
  color: #000 !important;
}

.news-modal select.form-control option {
  color: #000 !important;
}

/* Translations Modal Styles */
.translations-modal .modal-body {
  max-height: 80vh;
  overflow-y: auto;
}

.translations-modal .coverage-badges {
  display: inline-flex;
  align-items: center;
}

.translations-modal .reference-panel {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}

.translations-modal .reference-panel .form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
}

.translations-modal .nav-tabs .nav-link {
  cursor: pointer;
  color: #495057;
}

.translations-modal .nav-tabs .nav-link.active {
  color: #007bff;
  font-weight: 600;
}
</style>






