/**
 * Date utility functions
 * Following Single Responsibility Principle
 */

import { DATE_FORMATS } from "@/constants";

/**
 * Formats a timestamp to a display string
 */
export function formatDate(timestamp: number, format: string = DATE_FORMATS.DISPLAY): string {
  const date = new Date(timestamp);
  
  // Simple formatter (for production, consider using date-fns or dayjs)
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const pad = (n: number) => n.toString().padStart(2, "0");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  switch (format) {
    case DATE_FORMATS.DISPLAY:
      return `${monthNames[month - 1]} ${pad(day)}, ${year}`;
    case DATE_FORMATS.DISPLAY_WITH_TIME:
      return `${monthNames[month - 1]} ${pad(day)}, ${year} ${pad(hours)}:${pad(minutes)}`;
    case DATE_FORMATS.ISO:
      return `${year}-${pad(month)}-${pad(day)}`;
    case DATE_FORMATS.ISO_WITH_TIME:
      return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

/**
 * Checks if a date is in the past
 */
export function isPast(timestamp: number): boolean {
  return timestamp < Date.now();
}

/**
 * Checks if a date is in the future
 */
export function isFuture(timestamp: number): boolean {
  return timestamp > Date.now();
}



