<template>
  <div class="news-translations-page">
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Translations: {{ currentNews?.title || 'Loading...' }}</h4>
          <p class="category">Manage translations for this news article</p>
        </div>
        <div class="col-lg-6 col-md-6 text-right">
          <base-button 
            type="secondary" 
            size="md" 
            @click="goBack"
            class="btn btn-secondary mr-2"
          >
            <i class="ni ni-bold-left"></i> Back to News
          </base-button>
          <base-button 
            type="info" 
            size="md" 
            @click="goToEdit"
            class="btn btn-info"
          >
            <i class="ni ni-settings"></i> Edit Article
          </base-button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-if="translationError" class="alert alert-danger" role="alert">
      {{ translationError }}
    </div>
    <div v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <div class="row" v-if="currentNews">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center w-100">
              <h5 class="card-title mb-0">Translation Management</h5>
              <div class="d-flex align-items-center gap-2">
                <!-- Coverage Badges -->
                <div class="coverage-badges">
                  <span
                    v-for="locale in ['pt', 'es', 'fr']"
                    :key="locale"
                    class="badge mr-1"
                    :class="getTranslationCoverage()?.coverage[locale]?.exists ? 'badge-success' : 'badge-secondary'"
                    :title="getTranslationCoverage()?.coverage[locale]?.exists ? `${locale.toUpperCase()} translated` : `${locale.toUpperCase()} missing`"
                  >
                    {{ locale.toUpperCase() }} {{ getTranslationCoverage()?.coverage[locale]?.exists ? '✅' : '❌' }}
                  </span>
                </div>
                <base-button
                  v-if="getTranslationCoverage()?.missing?.length"
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
                  v-if="getTranslationCoverage()?.coverage[locale]?.exists"
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
                  :value="currentNews.title"
                  readonly
                  disabled
                />
              </div>
              <div class="form-group">
                <label>Excerpt</label>
                <input
                  type="text"
                  class="form-control"
                  :value="currentNews.excerpt || ''"
                  readonly
                  disabled
                />
              </div>
              <div class="form-group">
                <label>Content</label>
                <div
                  class="form-control english-content-preview"
                  v-html="currentNews.content"
                ></div>
              </div>
            </div>

            <!-- Translation Tabs (Two-column layout) -->
            <div v-else class="tab-pane active">
              <div class="row">
                <!-- Left: English Reference (Read-only) -->
                <div class="col-md-7">
                  <h6 class="text-muted mb-3">
                    <i class="ni ni-world"></i> English Reference
                  </h6>
                  <div class="reference-panel">
                    <div class="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="currentNews.title"
                        readonly
                        disabled
                      />
                    </div>
                    <div class="form-group">
                      <label>Excerpt</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="currentNews.excerpt || ''"
                        readonly
                        disabled
                      />
                    </div>
                    <div class="form-group">
                      <label>Content</label>
                      <div
                        class="form-control english-content-preview"
                        v-html="currentNews.content"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Right: Translation Form -->
                <div class="col-md-5">
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
                    <div class="d-flex justify-content-between align-items-center mt-4">
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
                          @click="goBack"
                          :disabled="isSavingTranslation"
                          class="mr-2"
                        >
                          Cancel
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
        </card>
      </div>
    </div>

    <div v-else class="text-center p-4">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import Card from "@/components/Cards/Card.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseInput from "@/components/Inputs/BaseInput.vue";
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor.vue";
import { useNews } from "@/composables/useNews";
import { useNewsTranslations } from "@/composables/useNewsTranslations";
import { formatDate } from "@/utils/date";
import type { NewsId, Locale } from "@/types";

const router = useRouter();
const route = useRoute();

// Composables
const {
  currentNews,
  loadNewsItem,
  error,
  clearError,
  cleanup,
} = useNews();

const {
  translation,
  newsWithCoverage,
  isLoading: isLoadingTranslations,
  error: translationError,
  loadTranslation,
  loadNewsWithCoverage,
  upsertTranslation,
  deleteTranslation,
  createMissingTranslations,
  clearError: clearTranslationError,
  cleanup: cleanupTranslations,
} = useNewsTranslations();

// Computed
const newsId = computed(() => route.params.id as string);
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
const successMessage = ref("");

// Lifecycle
onMounted(async () => {
  await loadNewsItem(newsId.value as NewsId);
  loadNewsWithCoverage();
  await loadTranslationForLocale(newsId.value as NewsId, "pt");
});

onUnmounted(() => {
  cleanup();
  cleanupTranslations();
});

// Watch for translation changes
watch(() => translation.value, (trans) => {
  if (trans && currentTranslationLocale.value !== "en") {
    translationForm.value = {
      title: trans.title,
      excerpt: trans.excerpt || "",
      body: trans.body,
      slug: trans.slug || "",
      seoTitle: trans.seoTitle || "",
      seoDescription: trans.seoDescription || "",
      status: trans.status,
    };
  }
}, { immediate: true });

// Methods
const goBack = () => {
  router.push({ name: "news" });
};

const goToEdit = () => {
  router.push({ name: "news-edit", params: { id: newsId.value } });
};

const getTranslationCoverage = () => {
  const newsWithCov = newsWithCoverage.value.find((n) => n._id === newsId.value);
  return newsWithCov?.translationCoverage;
};

const loadTranslationForLocale = async (id: NewsId, locale: Locale) => {
  if (locale === "en") {
    // For English, use the news article itself
    if (currentNews.value) {
      translationForm.value = {
        title: currentNews.value.title,
        excerpt: currentNews.value.excerpt || "",
        body: currentNews.value.content,
        slug: "",
        seoTitle: "",
        seoDescription: "",
        status: currentNews.value.published ? "published" : "draft",
      };
    }
    return;
  }

  // Load translation
  loadTranslation(id, locale);
  
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
  currentTranslationLocale.value = locale;
  await loadTranslationForLocale(newsId.value as NewsId, locale);
};

const handleSaveTranslation = async () => {
  if (!currentNews.value) return;
  
  if (!translationForm.value.title || !translationForm.value.body) {
    clearTranslationError();
    return;
  }

  isSavingTranslation.value = true;
  clearTranslationError();

  try {
    const success = await upsertTranslation({
      newsId: currentNews.value._id,
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
        currentNews.value._id,
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
  if (!currentNews.value) return;
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
      currentNews.value._id,
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
  if (!currentNews.value) return;

  isSavingTranslation.value = true;
  clearTranslationError();

  try {
    const success = await createMissingTranslations(currentNews.value._id);
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
</script>

<script lang="ts">
export default {
  name: "NewsTranslations",
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

.coverage-badges {
  display: inline-flex;
  align-items: center;
}

.reference-panel {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
  min-height: 500px;
}

.reference-panel .form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
}

.reference-panel .form-group {
  margin-bottom: 20px;
}

.reference-panel textarea.form-control {
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.english-content-preview {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  padding: 15px;
  background-color: #fff !important;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #000 !important;
  font-size: 14px;
  line-height: 1.6;
}

/* Force all text elements to be black */
.english-content-preview * {
  color: #000 !important;
}

.english-content-preview h1,
.english-content-preview h2,
.english-content-preview h3,
.english-content-preview h4,
.english-content-preview h5,
.english-content-preview h6 {
  color: #000 !important;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.english-content-preview p {
  color: #000 !important;
  margin: 0.5em 0;
}

.english-content-preview div {
  color: #000 !important;
}

.english-content-preview span {
  color: #000 !important;
}

.english-content-preview ul,
.english-content-preview ol {
  color: #000 !important;
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.english-content-preview li {
  color: #000 !important;
  margin: 0.25em 0;
}

.english-content-preview strong,
.english-content-preview b {
  color: #000 !important;
  font-weight: bold;
}

.english-content-preview em,
.english-content-preview i {
  color: #000 !important;
  font-style: italic;
}

.english-content-preview u {
  color: #000 !important;
  text-decoration: underline;
}

.english-content-preview a {
  color: #5e72e4 !important;
  text-decoration: underline;
}

.english-content-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

.english-content-preview blockquote {
  border-left: 4px solid #5e72e4;
  padding-left: 1em;
  margin: 1em 0;
  color: #000 !important;
  font-style: italic;
}

.english-content-preview blockquote * {
  color: #000 !important;
}

.english-content-preview code {
  background-color: rgba(0, 0, 0, 0.05) !important;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #000 !important;
}

.english-content-preview pre {
  background-color: rgba(0, 0, 0, 0.05) !important;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
  color: #000 !important;
}

.english-content-preview pre * {
  color: #000 !important;
}

.english-content-preview pre code {
  background-color: transparent;
  padding: 0;
  color: #000 !important;
}

/* Override any inline styles that might set white text */
.english-content-preview [style*="color"] {
  color: #000 !important;
}

.nav-tabs .nav-link {
  cursor: pointer;
  color: #495057;
}

.nav-tabs .nav-link.active {
  color: #007bff;
  font-weight: 600;
}
</style>

<style>
/* Form input text color */
.news-translations-page .form-control,
.news-translations-page input[type="text"],
.news-translations-page input[type="email"],
.news-translations-page input[type="password"],
.news-translations-page select,
.news-translations-page textarea {
  color: #000 !important;
  background-color: #fff !important;
}

.news-translations-page .form-control::placeholder {
  color: rgba(0, 0, 0, 0.5) !important;
}

.news-translations-page .form-control:focus {
  color: #000 !important;
  background-color: #fff !important;
}

.news-translations-page select.form-control {
  color: #000 !important;
  background-color: #fff !important;
}

.news-translations-page select.form-control option {
  color: #000 !important;
  background-color: #fff !important;
}

/* Rich Text Editor styling to match form inputs */
.news-translations-page .rich-text-editor {
  background-color: #fff !important;
  border-color: #cad1d7 !important;
}

.news-translations-page .rich-text-editor .editor-content-wrapper {
  background-color: #fff !important;
}

.news-translations-page .rich-text-editor :deep(.ProseMirror) {
  color: #000 !important;
  background-color: #fff !important;
}

.news-translations-page .rich-text-editor :deep(.editor-content) {
  color: #000 !important;
  background-color: #fff !important;
}

.news-translations-page .rich-text-editor :deep(.ProseMirror p),
.news-translations-page .rich-text-editor :deep(.editor-content p),
.news-translations-page .rich-text-editor :deep(.ProseMirror),
.news-translations-page .rich-text-editor :deep(.ProseMirror *),
.news-translations-page .rich-text-editor :deep(.editor-content),
.news-translations-page .rich-text-editor :deep(.editor-content *) {
  color: #000 !important;
}

.news-translations-page .rich-text-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: rgba(0, 0, 0, 0.5) !important;
}
</style>

