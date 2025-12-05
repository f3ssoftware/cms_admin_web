import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all replies for a post
export const listByPost = query({
  args: { postId: v.id("post") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("post_reply")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();
  },
});

// Query: Get reply by ID
export const get = query({
  args: { id: v.id("post_reply") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get replies by author (Keycloak user ID)
export const getByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("post_reply")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();
  },
});

// Query: Get nested replies (replies to a reply)
export const getByParent = query({
  args: { parentReplyId: v.id("post_reply") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("post_reply")
      .withIndex("by_parent", (q) => q.eq("parentReplyId", args.parentReplyId))
      .order("desc")
      .collect();
  },
});

// Mutation: Create reply
export const create = mutation({
  args: {
    postId: v.id("post"),
    authorId: v.string(), // Keycloak user ID
    content: v.string(),
    parentReplyId: v.optional(v.id("post_reply")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("post_reply", {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      parentReplyId: args.parentReplyId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation: Update reply
export const update = mutation({
  args: {
    id: v.id("post_reply"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const reply = await ctx.db.get(args.id);
    if (!reply) {
      throw new Error("Reply not found");
    }

    await ctx.db.patch(args.id, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

// Mutation: Delete reply
export const remove = mutation({
  args: { id: v.id("post_reply") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

