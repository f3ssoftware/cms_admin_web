<template>
  <div class="news-edit-page">
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">{{ isEditMode ? 'Edit News Article' : 'Create News Article' }}</h4>
          <p class="category">{{ isEditMode ? 'Update article details' : 'Create a new news article' }}</p>
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
            v-if="isEditMode"
            type="warning" 
            size="md" 
            @click="goToTranslations"
            class="btn btn-warning"
          >
            <i class="ni ni-world"></i> Manage Translations
          </base-button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <h5 class="card-title mb-0">{{ isEditMode ? 'Edit Article' : 'New Article' }}</h5>
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
                <label class="form-check-label" for="published-check">
                  <input
                    v-model="form.published"
                    type="checkbox"
                    class="form-check-input"
                    id="published-check"
                  />
                  <span class="form-check-sign"></span>
                  Publish immediately
                </label>
              </div>
              <small class="form-text text-muted">
                Uncheck to save as draft
              </small>
            </div>
            <div class="form-group">
              <div class="form-check">
                <label class="form-check-label" for="featured-check">
                  <input
                    v-model="form.isFeatured"
                    type="checkbox"
                    class="form-check-input"
                    id="featured-check"
                  />
                  <span class="form-check-sign"></span>
                  Feature this article
                </label>
              </div>
              <small class="form-text text-muted">
                Featured articles will be highlighted on the frontend
              </small>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <base-button type="secondary" @click="goBack" :disabled="isSubmitting">
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
                  {{ isEditMode ? "Update Article" : "Create Article" }}
                </span>
              </base-button>
            </div>
          </form>
        </card>
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
import { useCategories } from "@/composables/useCategories";
import type { NewsId, CategoryId } from "@/types";

const router = useRouter();
const route = useRoute();

// Composables
const {
  currentNews,
  isLoading,
  error,
  loadNewsItem,
  createNews,
  updateNews,
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
const isEditMode = computed(() => !!route.params.id);
const newsId = computed(() => route.params.id as string);

// Component state
const isSubmitting = ref(false);
const successMessage = ref("");
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
onMounted(async () => {
  loadCategories();
  
  if (isEditMode.value) {
    await loadNewsItem(newsId.value as NewsId);
  }
});

onUnmounted(() => {
  cleanup();
  cleanupCategories();
});

// Watch for currentNews changes to populate form
watch(() => currentNews.value, (news) => {
  if (news && isEditMode.value) {
    form.value = {
      title: news.title,
      content: news.content,
      excerpt: news.excerpt || "",
      categoryId: news.categoryId,
      published: news.published,
      isFeatured: news.isFeatured || false,
    };
  }
}, { immediate: true });

// Methods
const goBack = () => {
  router.push({ name: "news" });
};

const goToTranslations = () => {
  if (isEditMode.value) {
    router.push({ name: "news-translations", params: { id: newsId.value } });
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
    if (isEditMode.value) {
      const success = await updateNews({
        id: newsId.value as NewsId,
        title: form.value.title,
        content: form.value.content,
        excerpt: form.value.excerpt || undefined,
        categoryId: form.value.categoryId as CategoryId,
        published: form.value.published,
        isFeatured: form.value.isFeatured,
      });
      if (success) {
        successMessage.value = `Article "${form.value.title}" updated successfully!`;
        setTimeout(() => {
          goBack();
        }, 1500);
      }
    } else {
      const id = await createNews({
        title: form.value.title,
        content: form.value.content,
        excerpt: form.value.excerpt || undefined,
        categoryId: form.value.categoryId as CategoryId,
        published: form.value.published,
        isFeatured: form.value.isFeatured,
      });
      if (id) {
        successMessage.value = `Article "${form.value.title}" created successfully!`;
        setTimeout(() => {
          router.push({ name: "news-edit", params: { id } });
        }, 1500);
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<script lang="ts">
export default {
  name: "NewsEdit",
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
/* Form input text color */
.news-edit-page .form-control,
.news-edit-page input[type="text"],
.news-edit-page input[type="email"],
.news-edit-page input[type="password"],
.news-edit-page select,
.news-edit-page textarea {
  color: #000 !important;
  background-color: #fff !important;
}

.news-edit-page .form-control::placeholder {
  color: rgba(0, 0, 0, 0.5) !important;
}

.news-edit-page .form-control:focus {
  color: #000 !important;
  background-color: #fff !important;
}

.news-edit-page select.form-control {
  color: #000 !important;
  background-color: #fff !important;
}

.news-edit-page select.form-control option {
  color: #000 !important;
  background-color: #fff !important;
}

/* Rich Text Editor styling to match form inputs */
.news-edit-page .rich-text-editor {
  background-color: #fff !important;
  border-color: #cad1d7 !important;
}

.news-edit-page .rich-text-editor .editor-content-wrapper {
  background-color: #fff !important;
}

.news-edit-page .rich-text-editor :deep(.ProseMirror) {
  color: #000 !important;
  background-color: #fff !important;
}

.news-edit-page .rich-text-editor :deep(.editor-content) {
  color: #000 !important;
  background-color: #fff !important;
}

.news-edit-page .rich-text-editor :deep(.ProseMirror p),
.news-edit-page .rich-text-editor :deep(.editor-content p),
.news-edit-page .rich-text-editor :deep(.ProseMirror),
.news-edit-page .rich-text-editor :deep(.ProseMirror *),
.news-edit-page .rich-text-editor :deep(.editor-content),
.news-edit-page .rich-text-editor :deep(.editor-content *) {
  color: #000 !important;
}

.news-edit-page .rich-text-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: rgba(0, 0, 0, 0.5) !important;
}

/* Checkbox visibility */
.news-edit-page .form-check-input {
  opacity: 0 !important;
  position: absolute !important;
  visibility: hidden !important;
}

.news-edit-page .form-check-label {
  display: inline-block;
  position: relative;
  cursor: pointer;
  padding-left: 25px;
  line-height: 18px;
  margin-bottom: 0;
  color: #000 !important;
}

.news-edit-page .form-check-sign::before,
.news-edit-page .form-check-sign::after {
  content: " ";
  display: inline-block;
  position: absolute;
  width: 17px;
  height: 17px;
  left: 0;
  cursor: pointer;
  border-radius: 3px;
  top: 0;
  border: 1px solid #666;
  transition: opacity 0.3s linear;
}

.news-edit-page .form-check-input:checked + .form-check-sign::before {
  border: none;
  background-color: #5e72e4;
}

.news-edit-page .form-check-sign::after {
  font-family: "nucleo";
  content: "\ea1b";
  top: 0px;
  text-align: center;
  font-size: 14px;
  opacity: 0;
  color: #fff;
  font-weight: bold;
  border: 0;
  background-color: inherit;
}

.news-edit-page .form-check-input:checked + .form-check-sign::after {
  opacity: 1;
  font-size: 10px;
  margin-top: 0;
}
</style>

