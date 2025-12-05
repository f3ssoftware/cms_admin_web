/**
 * Legacy Convex client export
 * @deprecated Use convexClientService from @/services/convex/ConvexClientService instead
 * This file is kept for backward compatibility
 */

import { convexClientService } from "@/services/convex/ConvexClientService";

// Re-export for backward compatibility
export const convexClient = (convexClientService as any).client;

// Helper function to set authentication token for Convex
export function setConvexAuthToken(token: string | null) {
  convexClientService.setAuth(token);
}

