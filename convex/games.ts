import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all games
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("games")
      .order("desc")
      .collect();
  },
});

// Query: Get game by ID
export const get = query({
  args: { id: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get game by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("games")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Mutation: Create game
export const create = mutation({
  args: {
    name: v.string(),
    image: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("games", {
      name: args.name,
      image: args.image,
      slug: args.slug,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation: Update game
export const update = mutation({
  args: {
    id: v.id("games"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const game = await ctx.db.get(id);
    if (!game) {
      throw new Error("Game not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation: Delete game
export const remove = mutation({
  args: { id: v.id("games") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

