/**
 * Category Repository
 * Data access layer for categories
 * Following Repository Pattern and Single Responsibility Principle
 */

import { api } from "@/convex/_generated/api";
import type {
  Category,
  CategoryId,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types";
import { convexClientService } from "../convex/ConvexClientService";

/**
 * Interface for Category Repository
 * Following Interface Segregation Principle
 */
export interface ICategoryRepository {
  list(): Promise<Category[]>;
  get(id: CategoryId): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
  create(input: CreateCategoryInput): Promise<CategoryId>;
  update(input: UpdateCategoryInput): Promise<void>;
  delete(id: CategoryId): Promise<void>;
}

/**
 * Category Repository Implementation
 */
export class CategoryRepository implements ICategoryRepository {
  /**
   * Get all categories
   * Note: This returns a subscription function. Use in composables for reactive data.
   */
  list(): (callbacks: {
    onUpdate: (result: Category[]) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.categories.list, {}, callbacks);
    };
  }

  /**
   * Get category by ID
   */
  get(id: CategoryId): (callbacks: {
    onUpdate: (result: Category | null) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.categories.get, { id }, callbacks);
    };
  }

  /**
   * Get category by slug
   */
  getBySlug(slug: string): (callbacks: {
    onUpdate: (result: Category | null) => void;
    onError: (error: Error) => void;
  }) => () => void {
    return (callbacks) => {
      return convexClientService.watchQuery(api.categories.getBySlug, { slug }, callbacks);
    };
  }

  /**
   * Create a new category
   */
  async create(input: CreateCategoryInput): Promise<CategoryId> {
    const result = await convexClientService.mutation(api.categories.create, input);
    return result as CategoryId;
  }

  /**
   * Update an existing category
   */
  async update(input: UpdateCategoryInput): Promise<void> {
    const { id, ...updates } = input;
    await convexClientService.mutation(api.categories.update, {
      id,
      ...updates,
    });
  }

  /**
   * Delete a category
   */
  async delete(id: CategoryId): Promise<void> {
    await convexClientService.mutation(api.categories.remove, { id });
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();

