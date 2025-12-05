import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all posts
export const list = query({
  args: {
    published: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("post");

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

// Query: Get post by ID
export const get = query({
  args: { id: v.id("post") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get posts by author (Keycloak user ID)
export const getByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("post")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();
  },
});

// Mutation: Create post
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    authorId: v.string(), // Keycloak user ID
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("post", {
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

// Mutation: Update post
export const update = mutation({
  args: {
    id: v.id("post"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const post = await ctx.db.get(id);
    if (!post) {
      throw new Error("Post not found");
    }

    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
    };

    // If publishing for the first time, set publishedAt
    if (updates.published === true && !post.publishedAt) {
      updateData.publishedAt = Date.now();
    }

    await ctx.db.patch(id, updateData);
  },
});

// Mutation: Delete post
export const remove = mutation({
  args: { id: v.id("post") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

