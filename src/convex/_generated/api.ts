// Runtime stub for Convex API
// This provides a runtime implementation for the Convex API types
// The actual API is type-only and used for type checking

// Import types from the generated type definitions
import type { api as ApiType, internal as InternalType } from '../../../convex/_generated/api';

// Create runtime stubs that match the API structure
// These are empty objects that satisfy the type system
// In production, the Convex client provides the actual implementation
export const api = {} as typeof ApiType;
export const internal = {} as typeof InternalType;
