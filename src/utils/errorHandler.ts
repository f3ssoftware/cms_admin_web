/**
 * Centralized error handling utility
 * Following Single Responsibility Principle
 */

import type { AppError, ConvexError } from "@/types";
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
 * Handles Convex errors and converts them to AppError
 */
export function handleConvexError(error: unknown): AppError {
  if (error instanceof Error) {
    // Check if it's a Convex-specific error
    if (error.message.includes("not found")) {
      return createError(error.message, ERROR_CODES.NOT_FOUND);
    }
    if (error.message.includes("unauthorized") || error.message.includes("forbidden")) {
      return createError(error.message, ERROR_CODES.UNAUTHORIZED);
    }
    return createError(error.message, ERROR_CODES.CONVEX_ERROR, error);
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
      return error.message || "An unexpected error occurred.";
  }
}

