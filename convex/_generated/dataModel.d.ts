/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated data model.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 * To regenerate, run `npx convex dev` or `npx convex codegen`.
 * @module
 */

import type { DataModelFromSchemaDefinition } from "convex/server";
import type { TableDefinitionsIn } from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema";

/**
 * The names of all of your Convex tables.
 */
export type TableNames =
  | "categories"
  | "news"
  | "post"
  | "post_reply";

/**
 * The type of a document stored in Convex.
 */
export type Doc<TableName extends TableNames> =
  DataModelFromSchemaDefinition<typeof schema>[TableName]["document"];

/**
 * The type of a document ID.
 */
export type Id<TableName extends TableNames> = GenericId<TableName>;

/**
 * A type describing your Convex data model.
 *
 * This type includes information about your tables and their indexes.
 * It's compatible with the `DataModel` type used in Convex functions.
 *
 * @example
 * ```ts
 * import { DataModel } from "./_generated/dataModel";
 * ```
 */
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

/* prettier-ignore-end */

