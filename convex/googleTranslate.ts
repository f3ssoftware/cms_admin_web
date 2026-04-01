"use node";

import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

const GOOGLE_TRANSLATE_API_URL =
  "https://translation.googleapis.com/language/translate/v2";

const TARGET_LOCALES = ["pt", "es", "fr"] as const;

type TargetLocale = (typeof TARGET_LOCALES)[number];

function getGoogleTranslateApiKey(): string | null {
  return (
    process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY ||
    process.env.GOOGLE_TRANSLATION_API_KEY ||
    null
  );
}

async function translateText(
  apiKey: string,
  text: string | undefined,
  target: TargetLocale,
  format: "text" | "html"
): Promise<string | undefined> {
  if (!text || text.trim() === "") {
    return text;
  }

  const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      source: "en",
      target,
      format,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Google Translation request failed (${response.status}): ${responseText}`
    );
  }

  const data = (await response.json()) as {
    data?: {
      translations?: Array<{
        translatedText?: string;
      }>;
    };
  };

  return data.data?.translations?.[0]?.translatedText ?? text;
}

export const syncNewsTranslations = internalAction({
  args: {
    newsId: v.id("news"),
    title: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = getGoogleTranslateApiKey();

    if (!apiKey) {
      console.warn(
        "[GoogleTranslate] Missing GOOGLE_CLOUD_TRANSLATION_API_KEY / GOOGLE_TRANSLATION_API_KEY; skipping automatic news translation."
      );
      return { ok: false, reason: "missing_api_key" as const };
    }

    const upsertTranslationRef = makeFunctionReference<"mutation">(
      "newsTranslations:upsertAutoTranslatedTranslation"
    );

    const results: Array<{
      locale: TargetLocale;
      ok: boolean;
      error?: string;
    }> = [];

    for (const locale of TARGET_LOCALES) {
      try {
        const [translatedTitle, translatedExcerpt, translatedBody] =
          await Promise.all([
            translateText(apiKey, args.title, locale, "text"),
            translateText(apiKey, args.excerpt, locale, "text"),
            translateText(apiKey, args.body, locale, "html"),
          ]);

        await ctx.runMutation(upsertTranslationRef, {
          newsId: args.newsId,
          locale,
          title: translatedTitle ?? args.title,
          excerpt: translatedExcerpt,
          body: translatedBody ?? args.body,
        });

        results.push({ locale, ok: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[GoogleTranslate] Failed to translate news ${args.newsId} for locale ${locale}:`,
          message
        );
        results.push({ locale, ok: false, error: message });
      }
    }

    return {
      ok: results.some((result) => result.ok),
      results,
    };
  },
});
