import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all categories
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .order("desc")
      .collect();
  },
});

// Query: Get category by ID
export const get = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get category by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Mutation: Create category
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      slug: args.slug,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation: Update category
export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const category = await ctx.db.get(id);
    if (!category) {
      throw new Error("Category not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation: Delete category
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

