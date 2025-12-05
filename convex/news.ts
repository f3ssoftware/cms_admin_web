import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all news
export const list = query({
  args: {
    published: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("news");

    if (args.published !== undefined) {
      query = query.withIndex("by_published", (q) => q.eq("published", args.published));
    } else if (args.categoryId) {
      query = query.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId));
    } else {
      query = query.order("desc");
    }

    return await query.collect();
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

