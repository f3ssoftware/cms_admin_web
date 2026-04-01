import { makeFunctionReference } from "convex/server";
import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { QueryCtx } from "./_generated/server";

const syncNewsTranslationsRef = makeFunctionReference<"action">(
  "googleTranslate:syncNewsTranslations"
);

/**
 * Helper function to merge news with translations
 * Returns news with translated content if available, otherwise uses original
 */
async function mergeNewsWithTranslation(
  ctx: QueryCtx,
  news: any,
  locale?: string
): Promise<any> {
  // If no locale provided, return original news
  if (!locale) {
    return news;
  }

  // If locale is "en", return original news (English is the source)
  if (locale === "en") {
    return news;
  }

  // Try to get translation for this locale
  const translation = await ctx.db
    .query("newsTranslations")
    .withIndex("by_newsId_locale", (q) =>
      q.eq("newsId", news._id).eq("locale", locale)
    )
    .first();

  // Only use translation if it exists and is published
  if (translation && translation.status === "published") {
    return {
      ...news,
      title: translation.title,
      content: translation.body, // Translation uses "body" field
      excerpt: translation.excerpt || news.excerpt,
    };
  }

  // Fallback to original news
  return news;
}

// Query: Get all news
export const list = query({
  args: {
    published: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
    locale: v.optional(v.string()), // e.g., "en", "pt", "es", "fr"
  },
  handler: async (ctx, args) => {
    let allNews: any[] = [];

    // If both categoryId and published are provided, use categoryId index and filter by published
    if (args.categoryId) {
      allNews = await ctx.db
        .query("news")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .collect();
      
      // Filter by published if specified
      if (args.published !== undefined) {
        allNews = allNews.filter((news) => news.published === args.published);
      }
    } else if (args.published !== undefined) {
      // If only published filter is provided, use published index
      allNews = await ctx.db
        .query("news")
        .withIndex("by_published", (q) => q.eq("published", args.published!))
        .collect();
    } else {
      // No filters, return all news
      allNews = await ctx.db
        .query("news")
        .order("desc")
        .collect();
    }

    // Merge with translations if locale is provided
    if (args.locale) {
      return Promise.all(
        allNews.map((news) => mergeNewsWithTranslation(ctx, news, args.locale))
      );
    }

    return allNews;
  },
});

// Query: Get news by ID
export const get = query({
  args: { 
    id: v.id("news"),
    locale: v.optional(v.string()), // e.g., "en", "pt", "es", "fr"
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.id);
    if (!news) {
      return null;
    }

    if (args.locale) {
      return await mergeNewsWithTranslation(ctx, news, args.locale);
    }

    return news;
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
  args: { 
    categorySlug: v.string(),
    locale: v.optional(v.string()), // e.g., "en", "pt", "es", "fr"
  },
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
    const publishedNews = allNews
      .filter((news) => news.published === true)
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return dateB - dateA;
      });

    // Merge with translations if locale is provided
    if (args.locale) {
      return Promise.all(
        publishedNews.map((news) => mergeNewsWithTranslation(ctx, news, args.locale))
      );
    }

    return publishedNews;
  },
});

// Query: Get featured news (published and isFeatured = true)
export const getFeatured = query({
  args: {
    locale: v.optional(v.string()), // e.g., "en", "pt", "es", "fr"
  },
  handler: async (ctx, args) => {
    console.log("[Convex news.getFeatured] Executing query...");
    const allNews = await ctx.db
      .query("news")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    
    const featuredNews = allNews
      .filter((news) => news.isFeatured === true) // Filter for explicitly featured news
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return dateB - dateA;
      })
      .slice(0, 3); // Return top 3 featured news
    
    console.log(`[Convex news.getFeatured] Found ${featuredNews.length} featured news items.`);
    
    // Merge with translations if locale is provided
    if (args.locale) {
      return Promise.all(
        featuredNews.map((news) => mergeNewsWithTranslation(ctx, news, args.locale))
      );
    }
    
    return featuredNews;
  },
});

// Mutation: Create news
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()), // S3 URL for cover image
    categoryId: v.id("categories"),
    authorId: v.string(), // Keycloak user ID
    authorName: v.optional(v.string()), // Author's display name (from JWT: firstName + lastName or username)
    published: v.boolean(),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const now = Date.now();
      const newsId = await ctx.db.insert("news", {
        title: args.title,
        content: args.content,
        excerpt: args.excerpt,
        coverImage: args.coverImage,
        categoryId: args.categoryId,
        authorId: args.authorId,
        authorName: args.authorName, // Store author name from JWT
        published: args.published,
        isFeatured: args.isFeatured,
        publishedAt: args.published ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });

      try {
        await ctx.scheduler.runAfter(0, syncNewsTranslationsRef, {
          newsId,
          title: args.title,
          excerpt: args.excerpt,
          body: args.content,
        });
      } catch (error) {
        console.error(
          `[News.create] Failed to schedule automatic translations for ${newsId}:`,
          error
        );
      }

      return newsId;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ConvexError({ message });
    }
  },
});

// Mutation: Update news
export const update = mutation({
  args: {
    id: v.id("news"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()), // S3 URL for cover image
    authorName: v.optional(v.string()), // Author's display name (can be updated if author changes)
    categoryId: v.optional(v.id("categories")),
    published: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
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

    try {
      await ctx.scheduler.runAfter(0, syncNewsTranslationsRef, {
        newsId: id,
        title: updates.title ?? news.title,
        excerpt: Object.prototype.hasOwnProperty.call(updates, "excerpt")
          ? updates.excerpt
          : news.excerpt,
        body: updates.content ?? news.content,
      });
    } catch (error) {
      console.error(
        `[News.update] Failed to schedule automatic translations for ${id}:`,
        error
      );
    }
  },
});

// Mutation: Delete news
export const remove = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    const translations = await ctx.db
      .query("newsTranslations")
      .withIndex("by_newsId", (q) => q.eq("newsId", args.id))
      .collect();

    for (const translation of translations) {
      await ctx.db.delete(translation._id);
    }

    await ctx.db.delete(args.id);
  },
});

