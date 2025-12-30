import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Supported locales (excluding "en" which is the source of truth in news table)
export const SUPPORTED_LOCALES = ["pt", "es", "fr"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * Query: Get translation for a specific news item and locale
 */
export const getTranslation = query({
  args: {
    newsId: v.id("news"),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate locale
    if (!SUPPORTED_LOCALES.includes(args.locale as Locale)) {
      throw new Error(`Unsupported locale: ${args.locale}. Supported: ${SUPPORTED_LOCALES.join(", ")}`);
    }

    const translation = await ctx.db
      .query("newsTranslations")
      .withIndex("by_newsId_locale", (q) =>
        q.eq("newsId", args.newsId).eq("locale", args.locale)
      )
      .first();

    return translation || null;
  },
});

/**
 * Query: Get news with translation, returning effective content (translation if exists, else English)
 */
export const getNewsWithTranslation = query({
  args: {
    newsId: v.id("news"),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the base news (English)
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    // If locale is "en", return English content directly
    if (args.locale === "en") {
      return {
        news,
        translation: null,
        effective: {
          title: news.title,
          excerpt: news.excerpt || "",
          body: news.content,
          slug: undefined,
          seoTitle: undefined,
          seoDescription: undefined,
        },
      };
    }

    // Validate locale
    if (!SUPPORTED_LOCALES.includes(args.locale as Locale)) {
      throw new Error(`Unsupported locale: ${args.locale}. Supported: en, ${SUPPORTED_LOCALES.join(", ")}`);
    }

    // Get translation
    const translation = await ctx.db
      .query("newsTranslations")
      .withIndex("by_newsId_locale", (q) =>
        q.eq("newsId", args.newsId).eq("locale", args.locale)
      )
      .first();

    // Return effective content (translation if exists, else English)
    return {
      news,
      translation,
      effective: translation
        ? {
            title: translation.title,
            excerpt: translation.excerpt || "",
            body: translation.body,
            slug: translation.slug,
            seoTitle: translation.seoTitle,
            seoDescription: translation.seoDescription,
          }
        : {
            title: news.title,
            excerpt: news.excerpt || "",
            body: news.content,
            slug: undefined,
            seoTitle: undefined,
            seoDescription: undefined,
          },
    };
  },
});

/**
 * Query: List news for admin with translation coverage summary
 */
export const listNewsForAdmin = query({
  args: {
    published: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    // Get all news (using existing logic from news.ts)
    let allNews;
    if (args.categoryId) {
      allNews = await ctx.db
        .query("news")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .collect();
      
      if (args.published !== undefined) {
        allNews = allNews.filter((news) => news.published === args.published);
      }
    } else if (args.published !== undefined) {
      allNews = await ctx.db
        .query("news")
        .withIndex("by_published", (q) => q.eq("published", args.published!))
        .collect();
    } else {
      allNews = await ctx.db
        .query("news")
        .order("desc")
        .collect();
    }

    // For each news item, get translation coverage
    const newsWithCoverage = await Promise.all(
      allNews.map(async (newsItem) => {
        // Get all translations for this news item
        const translations = await ctx.db
          .query("newsTranslations")
          .withIndex("by_newsId", (q) => q.eq("newsId", newsItem._id))
          .collect();

        // Build coverage map
        const coverage: Record<string, { exists: boolean; updatedAt?: number }> = {};
        SUPPORTED_LOCALES.forEach((locale) => {
          const translation = translations.find((t) => t.locale === locale);
          coverage[locale] = {
            exists: !!translation,
            updatedAt: translation?.updatedAt,
          };
        });

        // Count missing locales
        const missingLocales = SUPPORTED_LOCALES.filter(
          (locale) => !coverage[locale].exists
        );

        return {
          ...newsItem,
          translationCoverage: {
            total: SUPPORTED_LOCALES.length,
            translated: SUPPORTED_LOCALES.length - missingLocales.length,
            missing: missingLocales,
            coverage,
          },
        };
      })
    );

    return newsWithCoverage;
  },
});

/**
 * Mutation: Upsert translation (create or update)
 */
export const upsertTranslation = mutation({
  args: {
    newsId: v.id("news"),
    locale: v.string(),
    title: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(),
    slug: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("published"))),
  },
  handler: async (ctx, args) => {
    // Validate locale
    if (!SUPPORTED_LOCALES.includes(args.locale as Locale)) {
      throw new Error(`Unsupported locale: ${args.locale}. Supported: ${SUPPORTED_LOCALES.join(", ")}`);
    }

    // Verify news exists
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    // Check if translation already exists
    const existing = await ctx.db
      .query("newsTranslations")
      .withIndex("by_newsId_locale", (q) =>
        q.eq("newsId", args.newsId).eq("locale", args.locale)
      )
      .first();

    const now = Date.now();
    const status = args.status || "draft";

    // If slug is provided, check uniqueness per locale
    if (args.slug) {
      const existingWithSlug = await ctx.db
        .query("newsTranslations")
        .withIndex("by_locale_slug", (q) =>
          q.eq("locale", args.locale).eq("slug", args.slug!)
        )
        .first();

      // Allow same slug if it's the same translation being updated
      if (existingWithSlug && existingWithSlug._id !== existing?._id) {
        throw new Error(`Slug "${args.slug}" already exists for locale "${args.locale}"`);
      }
    }

    if (existing) {
      // Update existing translation
      await ctx.db.patch(existing._id, {
        title: args.title,
        excerpt: args.excerpt,
        body: args.body,
        slug: args.slug,
        seoTitle: args.seoTitle,
        seoDescription: args.seoDescription,
        status,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new translation
      return await ctx.db.insert("newsTranslations", {
        newsId: args.newsId,
        locale: args.locale,
        title: args.title,
        excerpt: args.excerpt,
        body: args.body,
        slug: args.slug,
        seoTitle: args.seoTitle,
        seoDescription: args.seoDescription,
        status,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Mutation: Delete translation
 */
export const deleteTranslation = mutation({
  args: {
    newsId: v.id("news"),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate locale
    if (!SUPPORTED_LOCALES.includes(args.locale as Locale)) {
      throw new Error(`Unsupported locale: ${args.locale}. Supported: ${SUPPORTED_LOCALES.join(", ")}`);
    }

    const translation = await ctx.db
      .query("newsTranslations")
      .withIndex("by_newsId_locale", (q) =>
        q.eq("newsId", args.newsId).eq("locale", args.locale)
      )
      .first();

    if (!translation) {
      throw new Error("Translation not found");
    }

    await ctx.db.delete(translation._id);
  },
});

/**
 * Mutation: Set translation status
 */
export const setTranslationStatus = mutation({
  args: {
    newsId: v.id("news"),
    locale: v.string(),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    // Validate locale
    if (!SUPPORTED_LOCALES.includes(args.locale as Locale)) {
      throw new Error(`Unsupported locale: ${args.locale}. Supported: ${SUPPORTED_LOCALES.join(", ")}`);
    }

    const translation = await ctx.db
      .query("newsTranslations")
      .withIndex("by_newsId_locale", (q) =>
        q.eq("newsId", args.newsId).eq("locale", args.locale)
      )
      .first();

    if (!translation) {
      throw new Error("Translation not found");
    }

    await ctx.db.patch(translation._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mutation: Create empty draft translations for missing locales
 */
export const createMissingTranslations = mutation({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    // Verify news exists
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News not found");
    }

    // Get existing translations
    const existing = await ctx.db
      .query("newsTranslations")
      .withIndex("by_newsId", (q) => q.eq("newsId", args.newsId))
      .collect();

    const existingLocales = new Set(existing.map((t) => t.locale));
    const now = Date.now();

    // Create empty draft translations for missing locales
    const createdIds: string[] = [];
    for (const locale of SUPPORTED_LOCALES) {
      if (!existingLocales.has(locale)) {
        const id = await ctx.db.insert("newsTranslations", {
          newsId: args.newsId,
          locale,
          title: "", // Empty, to be filled manually
          body: "", // Empty, to be filled manually
          status: "draft",
          createdAt: now,
          updatedAt: now,
        });
        createdIds.push(id);
      }
    }

    return createdIds;
  },
});

