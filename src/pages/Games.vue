<template>
  <div>
    <div class="header">
      <div class="row">
        <div class="col-lg-6 col-md-6">
          <h4 class="title">Games</h4>
          <p class="category">Manage your games</p>
        </div>
        <div class="col-lg-6 col-md-6 text-right">
          <base-button
            type="primary"
            @click="openCreateModal"
            :disabled="isLoading"
          >
            <i class="ni ni-fat-add"></i> Create New Game
          </base-button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Games List</h5>
              <base-button
                type="primary"
                size="sm"
                @click="openCreateModal"
                :disabled="isLoading"
              >
                <i class="ni ni-fat-add"></i> Add Game
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
            <i class="ni ni-spin ni-settings"></i> Loading games...
          </div>

          <!-- Games Table -->
          <div v-else class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="games.length === 0">
                  <td colspan="6" class="text-center text-muted">
                    No games found. Create your first game!
                  </td>
                </tr>
                <tr v-for="game in games" :key="game._id">
                  <td>
                    <img
                      :src="game.image"
                      :alt="game.name"
                      style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"
                      @error="handleImageError"
                    />
                  </td>
                  <td><strong>{{ game.name }}</strong></td>
                  <td>
                    <code>{{ game.slug }}</code>
                  </td>
                  <td>{{ game.description || "-" }}</td>
                  <td>{{ formatDate(game.createdAt) }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <base-button
                        type="info"
                        size="sm"
                        @click="editGame(game)"
                        :disabled="isLoading"
                      >
                        <i class="ni ni-ruler-pencil"></i> Edit
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="openDeleteModal(game)"
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
        <h5 class="modal-title">{{ showEditModal ? 'Edit Game' : 'Create Game' }}</h5>
      </template>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Name <span class="text-danger">*</span></label>
          <base-input
            v-model="form.name"
            type="text"
            placeholder="Enter game name"
            required
          />
        </div>
        <div class="form-group">
          <label>Image URL <span class="text-danger">*</span></label>
          <base-input
            v-model="form.image"
            type="url"
            placeholder="https://example.com/image.jpg"
            required
          />
          <small class="form-text text-muted">Enter the full URL to the game image</small>
        </div>
        <div class="form-group">
          <label>Slug <span class="text-danger">*</span></label>
          <base-input
            v-model="form.slug"
            type="text"
            placeholder="game-slug"
            required
            pattern="[a-z0-9-]+"
          />
          <small class="form-text text-muted">URL-friendly identifier (lowercase, hyphens only)</small>
        </div>
        <div class="form-group">
          <label>Description</label>
          <base-input
            v-model="form.description"
            type="textarea"
            placeholder="Enter game description (optional)"
            rows="3"
          />
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <base-button type="secondary" @click="closeModal">
            Cancel
          </base-button>
          <base-button type="primary" :disabled="isSubmitting" @click="handleSubmit">
            <span v-if="isSubmitting">
              <i class="ni ni-spin ni-settings"></i> {{ showEditModal ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ showEditModal ? 'Update Game' : 'Create Game' }}
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
        <h5 class="modal-title text-danger">Delete Game</h5>
      </template>
      <div>
        <p>Are you sure you want to delete <strong>{{ gameToDelete?.name }}</strong>?</p>
        <p class="text-muted">This action cannot be undone.</p>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-2">
          <base-button type="secondary" @click="closeDeleteModal">
            Cancel
          </base-button>
          <base-button
            type="danger"
            :disabled="isDeleting"
            @click="handleDelete"
          >
            <span v-if="isDeleting">
              <i class="ni ni-spin ni-settings"></i> Deleting...
            </span>
            <span v-else>
              Delete Game
            </span>
          </base-button>
        </div>
      </template>
    </modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGames, useCreateGame, useUpdateGame, useDeleteGame, type Game } from '@/composables/useGames';
import { Id } from '@/convex/_generated/dataModel';

const { games, isLoading } = useGames();
const createGame = useCreateGame();
const updateGame = useUpdateGame();
const deleteGame = useDeleteGame();

const error = ref<string | null>(null);
const successMessage = ref<string>('');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const gameToDelete = ref<Game | null>(null);

const form = ref({
  name: '',
  image: '',
  slug: '',
  description: '',
});

const editingGameId = ref<Id<"games"> | null>(null);

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/60x60?text=No+Image';
};

const openCreateModal = () => {
  form.value = {
    name: '',
    image: '',
    slug: '',
    description: '',
  };
  editingGameId.value = null;
  showCreateModal.value = true;
  showEditModal.value = false;
  clearError();
};

const editGame = (game: Game) => {
  form.value = {
    name: game.name,
    image: game.image,
    slug: game.slug,
    description: game.description || '',
  };
  editingGameId.value = game._id;
  showEditModal.value = true;
  showCreateModal.value = false;
  clearError();
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  form.value = {
    name: '',
    image: '',
    slug: '',
    description: '',
  };
  editingGameId.value = null;
  clearError();
};

const handleSubmit = async () => {
  clearError();
  successMessage.value = '';

  if (!form.value.name || !form.value.image || !form.value.slug) {
    error.value = 'Please fill in all required fields';
    return;
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(form.value.slug)) {
    error.value = 'Slug must contain only lowercase letters, numbers, and hyphens';
    return;
  }

  isSubmitting.value = true;

  try {
    if (showEditModal.value && editingGameId.value) {
      await updateGame({
        id: editingGameId.value,
        name: form.value.name,
        image: form.value.image,
        slug: form.value.slug,
        description: form.value.description || undefined,
      });
      successMessage.value = 'Game updated successfully!';
    } else {
      await createGame({
        name: form.value.name,
        image: form.value.image,
        slug: form.value.slug,
        description: form.value.description || undefined,
      });
      successMessage.value = 'Game created successfully!';
    }
    closeModal();
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err: any) {
    error.value = err.message || 'An error occurred';
  } finally {
    isSubmitting.value = false;
  }
};

const openDeleteModal = (game: Game) => {
  gameToDelete.value = game;
  showDeleteModal.value = true;
  clearError();
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  gameToDelete.value = null;
  clearError();
};

const handleDelete = async () => {
  if (!gameToDelete.value) return;

  isDeleting.value = true;
  clearError();

  try {
    await deleteGame({ id: gameToDelete.value._id });
    successMessage.value = 'Game deleted successfully!';
    closeDeleteModal();
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err: any) {
    error.value = err.message || 'An error occurred';
  } finally {
    isDeleting.value = false;
  }
};

const clearError = () => {
  error.value = null;
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>


