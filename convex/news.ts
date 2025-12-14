import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all news
export const list = query({
  args: {
    published: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    // If both categoryId and published are provided, use categoryId index and filter by published
    if (args.categoryId) {
      const allNews = await ctx.db
        .query("news")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .collect();
      
      // Filter by published if specified
      if (args.published !== undefined) {
        return allNews.filter((news) => news.published === args.published);
      }
      
      return allNews;
    }
    
    // If only published filter is provided, use published index
    if (args.published !== undefined) {
      return await ctx.db
        .query("news")
        .withIndex("by_published", (q) => q.eq("published", args.published!))
        .collect();
    }

    // No filters, return all news
    return await ctx.db
      .query("news")
      .order("desc")
      .collect();
  },
});

// Query: Get news by ID
export const get = query({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get news by author (Keycloak user ID)
export const getByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("news")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();
  },
});

// Query: Get published news by category slug
export const getByCategorySlug = query({
  args: { categorySlug: v.string() },
  handler: async (ctx, args) => {
    // First, get the category by slug
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug))
      .first();
    
    if (!category) {
      return [];
    }
    
    // Then get all news for this category using the index
    const allNews = await ctx.db
      .query("news")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .collect();
    
    // Filter to only published news and sort by date
    return allNews
      .filter((news) => news.published === true)
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return dateB - dateA;
      });
  },
});

// Mutation: Create news
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    categoryId: v.id("categories"),
    authorId: v.string(), // Keycloak user ID
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("news", {
      title: args.title,
      content: args.content,
      excerpt: args.excerpt,
      categoryId: args.categoryId,
      authorId: args.authorId,
      published: args.published,
      publishedAt: args.published ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation: Update news
export const update = mutation({
  args: {
    id: v.id("news"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const news = await ctx.db.get(id);
    if (!news) {
      throw new Error("News not found");
    }

    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
    };

    // If publishing for the first time, set publishedAt
    if (updates.published === true && !news.publishedAt) {
      updateData.publishedAt = Date.now();
    }

    await ctx.db.patch(id, updateData);
  },
});

// Mutation: Delete news
export const remove = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

