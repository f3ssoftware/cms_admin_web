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
    isFeatured: v.optional(v.boolean()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),

  newsTranslations: defineTable({
    newsId: v.id("news"),
    locale: v.string(), // "pt" | "es" | "fr"
    title: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(), // Translated content
    slug: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_newsId", ["newsId"])
    .index("by_locale", ["locale"])
    .index("by_newsId_locale", ["newsId", "locale"]) // Composite index for unique constraint enforcement
    .index("by_locale_slug", ["locale", "slug"]), // For slug uniqueness per locale

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

  games: defineTable({
    name: v.string(),
    image: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]),
});

