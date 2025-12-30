# Multilingual News Implementation

## Overview

This document describes the multilingual news feature implementation with manual translations. The system supports English (source of truth) and three translation locales: Portuguese (pt), Spanish (es), and French (fr).

## Architecture

### Data Model

1. **`news` table** (English canonical content)
   - Contains the original English content
   - Fields: `title`, `content`, `excerpt`, `categoryId`, `authorId`, `published`, `isFeatured`, etc.

2. **`newsTranslations` table** (Per-locale translations)
   - One row per locale per news article
   - Unique constraint: `(newsId, locale)`
   - Fields:
     - `newsId`: Reference to the news article
     - `locale`: Translation locale ("pt" | "es" | "fr")
     - `title`: Translated title
     - `excerpt`: Translated excerpt (optional)
     - `body`: Translated content
     - `slug`: URL-friendly slug (optional)
     - `seoTitle`: SEO meta title (optional)
     - `seoDescription`: SEO meta description (optional)
     - `status`: Translation status ("draft" | "review" | "published")
     - `createdAt`, `updatedAt`: Timestamps

### Indexes

- `by_newsId`: Index on `newsId` for quick lookups
- `by_locale`: Index on `locale` for filtering by language
- `by_newsId_locale`: Composite index for unique constraint enforcement
- `by_locale_slug`: Composite index for slug uniqueness per locale

## Convex Functions

### Queries

1. **`getTranslation(newsId, locale)`**
   - Returns translation for a specific news item and locale
   - Returns `null` if translation doesn't exist

2. **`getNewsWithTranslation(newsId, locale)`**
   - Returns `{ news, translation, effective }`
   - `effective` contains translated fields if present, else English fallback
   - Handles "en" locale by returning English content directly

3. **`listNewsForAdmin(filters)`**
   - Lists news articles with translation coverage summary
   - Includes: total locales, translated count, missing locales, last updated timestamps

### Mutations

1. **`upsertTranslation(newsId, locale, payload)`**
   - Creates or updates a translation
   - Validates locale and slug uniqueness
   - Updates `updatedAt` timestamp
   - Sets `createdAt` on insert

2. **`deleteTranslation(newsId, locale)`**
   - Deletes a translation for a specific locale

3. **`setTranslationStatus(newsId, locale, status)`**
   - Updates the status of a translation

4. **`createMissingTranslations(newsId)`**
   - Creates empty draft translation rows for missing locales
   - Useful for bulk creation

## Admin UI Features

### News List Page

- **Translation Coverage Column**: Shows badges for each locale (PT ✅/❌, ES ✅/❌, FR ✅/❌)
- **Coverage Summary**: Displays "X/3 translated" badge
- **Translations Button**: Opens the translations modal for each news article

### Translations Modal

- **Tabs**: Separate tabs for EN, PT, ES, FR
- **English Tab**: Read-only display of canonical English content
- **Translation Tabs**: Two-column layout:
  - **Left**: English reference (read-only)
  - **Right**: Translation form with:
    - Title (required)
    - Excerpt (optional)
    - Body/Content (required, rich text editor)
    - Slug (optional)
    - SEO Title (optional)
    - SEO Description (optional)
    - Status dropdown (draft/review/published)
- **Coverage Badges**: Shows translation status at the top
- **Create Missing**: Button to create empty draft translations for missing locales
- **Delete Translation**: Button to remove a translation (not available for English)

## Setup Instructions

### 1. Regenerate Convex API

After adding the new `newsTranslations.ts` file, you need to regenerate the Convex API:

```bash
cd cms_admin_web
npx convex dev
```

This will update `convex/_generated/api.d.ts` and `api.js` to include the new `newsTranslations` functions.

### 2. Verify Schema

Ensure the schema is properly deployed:

```bash
npx convex deploy
```

### 3. Test the Feature

1. Navigate to the News page in the admin
2. Click "Translations" on any news article
3. Switch between locale tabs
4. Create/edit translations
5. Verify coverage badges update correctly

## TypeScript Types

All types are defined in `src/types/index.ts`:

- `Locale`: Union type `"en" | "pt" | "es" | "fr"`
- `TranslationStatus`: Union type `"draft" | "review" | "published"`
- `NewsTranslation`: Full translation object
- `CreateTranslationInput`: Input for creating translations
- `UpdateTranslationInput`: Input for updating translations
- `TranslationCoverage`: Coverage summary object
- `NewsWithCoverage`: News with coverage information

## Files Created/Modified

### New Files

- `convex/newsTranslations.ts`: Convex functions for translations
- `src/services/repositories/NewsTranslationRepository.ts`: Repository for translation data access
- `src/composables/useNewsTranslations.ts`: Vue composable for translation management

### Modified Files

- `convex/schema.ts`: Added `newsTranslations` table definition
- `src/types/index.ts`: Added translation-related types
- `src/pages/News.vue`: Added translations UI and functionality
- `src/services/repositories/index.ts`: Exported translation repository

## Usage Examples

### Creating a Translation

```typescript
const { upsertTranslation } = useNewsTranslations();

await upsertTranslation({
  newsId: "j123...",
  locale: "pt",
  title: "Título em Português",
  body: "Conteúdo em Português",
  status: "draft"
});
```

### Getting News with Translation

```typescript
const { loadNewsWithTranslation } = useNewsTranslations();

loadNewsWithTranslation(newsId, "pt");
// Returns effective content (translation if exists, else English)
```

### Listing News with Coverage

```typescript
const { loadNewsWithCoverage } = useNewsTranslations();

loadNewsWithCoverage();
// Returns news articles with translationCoverage information
```

## Fallback Behavior

- If a translation is missing, the frontend uses English content
- The `getNewsWithTranslation` query automatically handles fallback
- English is always available as the source of truth

## Notes

- **No External Translation API**: This is a manual-only MVP. All translations must be entered manually by content editors.
- **Slug Uniqueness**: Slugs are validated for uniqueness per locale (not globally)
- **Status Management**: Each translation has its own status, independent of the main news article's published status
- **Real-time Updates**: Uses Convex subscriptions for real-time updates in the admin UI

