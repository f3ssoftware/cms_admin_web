/**
 * Centralized error handling utility
 * Following Single Responsibility Principle
 */

import { ConvexError } from "convex/values";
import type { AppError } from "@/types";
import { ERROR_CODES } from "@/constants";

/**
 * Creates a standardized error object
 */
export function createError(
  message: string,
  code: string = ERROR_CODES.CONVEX_ERROR,
  details?: unknown
): AppError {
  return {
    code,
    message,
    details,
  };
}

/**
 * Extracts a user-friendly message from Convex errors.
 * Convex throws ConvexError for application errors (error.data has the payload).
 * For unexpected server errors, error.message is generic "Server Error" - check Convex Dashboard logs.
 */
function extractConvexMessage(error: unknown): string {
  if (error instanceof ConvexError && error.data !== undefined) {
    if (typeof error.data === "string") return error.data;
    if (typeof error.data === "object" && error.data !== null && "message" in error.data) {
      return String((error.data as { message: string }).message);
    }
    return String(error.data);
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

/**
 * Handles Convex errors and converts them to AppError
 */
export function handleConvexError(error: unknown): AppError {
  if (error instanceof Error) {
    const message = extractConvexMessage(error);
    if (message.includes("not found")) {
      return createError(message, ERROR_CODES.NOT_FOUND);
    }
    if (message.includes("unauthorized") || message.includes("forbidden")) {
      return createError(message, ERROR_CODES.UNAUTHORIZED);
    }
    return createError(message, ERROR_CODES.CONVEX_ERROR, error);
  }

  return createError(
    "An unexpected error occurred",
    ERROR_CODES.CONVEX_ERROR,
    error
  );
}

/**
 * Handles network errors
 */
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof Error) {
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return createError(
        "Network error. Please check your connection.",
        ERROR_CODES.NETWORK_ERROR,
        error
      );
    }
  }

  return createError(
    "A network error occurred",
    ERROR_CODES.NETWORK_ERROR,
    error
  );
}

/**
 * Logs error to console (and potentially to error tracking service)
 */
export function logError(error: AppError, context?: string): void {
  const errorMessage = context
    ? `[${context}] ${error.message}`
    : error.message;

  console.error(errorMessage, {
    code: error.code,
    details: error.details,
  });

  // TODO: Integrate with error tracking service (e.g., Sentry)
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error);
  // }
}

/**
 * Shows user-friendly error message
 */
export function getErrorMessage(error: AppError): string {
  switch (error.code) {
    case ERROR_CODES.UNAUTHORIZED:
      return "You are not authorized to perform this action.";
    case ERROR_CODES.FORBIDDEN:
      return "Access forbidden.";
    case ERROR_CODES.NOT_FOUND:
      return "The requested resource was not found.";
    case ERROR_CODES.NETWORK_ERROR:
      return "Network error. Please check your connection and try again.";
    case ERROR_CODES.VALIDATION_ERROR:
      return error.message || "Validation error occurred.";
    default:
      if (error.message?.includes("Server Error") || error.message?.includes("CONVEX M(")) {
        return `${error.message} — Check Convex Dashboard → Logs for details, or run \`npx convex dev\` to see live errors.`;
      }
      return error.message || "An unexpected error occurred.";
  }
}





