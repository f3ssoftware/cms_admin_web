import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  news: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    categoryId: v.id("categories"),
    authorId: v.string(), // Keycloak user ID
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),

  post: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    authorId: v.string(), // Keycloak user ID
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),

  post_reply: defineTable({
    postId: v.id("post"),
    authorId: v.string(), // Keycloak user ID
    content: v.string(),
    parentReplyId: v.optional(v.id("post_reply")), // For nested replies
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentReplyId"]),
});

