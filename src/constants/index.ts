/**
 * Application constants
 * Centralized configuration following Single Responsibility Principle
 */

// ==================== Environment Configuration ====================

export const CONFIG = {
  convex: {
    url: import.meta.env.VITE_CONVEX_URL || "",
  },
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "portal",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "cms-admin-web",
    // WARNING: Using client_secret in frontend is a security risk!
    // Only use this for development/testing. For production, use PKCE instead.
    clientSecret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET || "",
  },
  app: {
    name: "CMS Admin",
    version: "1.0.0",
  },
} as const;

// ==================== Route Names ====================

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CATEGORIES: "/categories",
  NEWS: "/news",
  POSTS: "/posts",
  NOT_FOUND: "/404",
} as const;

// ==================== Route Meta Keys ====================

export const ROUTE_META = {
  REQUIRES_AUTH: "requiresAuth",
  TITLE: "title",
  DESCRIPTION: "description",
} as const;

// ==================== Storage Keys ====================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

// ==================== Error Codes ====================

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  CONVEX_ERROR: "CONVEX_ERROR",
  KEYCLOAK_ERROR: "KEYCLOAK_ERROR",
} as const;

// ==================== Token Refresh ====================

export const TOKEN_REFRESH = {
  INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  MIN_VALIDITY_SECONDS: 30,
} as const;

// ==================== Validation Rules ====================

export const VALIDATION = {
  CATEGORY: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    SLUG_MIN_LENGTH: 2,
    SLUG_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
  },
  NEWS: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 200,
    CONTENT_MIN_LENGTH: 10,
    EXCERPT_MAX_LENGTH: 300,
  },
  POST: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 200,
    CONTENT_MIN_LENGTH: 10,
    EXCERPT_MAX_LENGTH: 300,
  },
  POST_REPLY: {
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 5000,
  },
} as const;

// ==================== Date Formats ====================

export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  DISPLAY_WITH_TIME: "MMM DD, YYYY HH:mm",
  ISO: "YYYY-MM-DD",
  ISO_WITH_TIME: "YYYY-MM-DD HH:mm:ss",
} as const;


