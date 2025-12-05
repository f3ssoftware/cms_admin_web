/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated server utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 * To regenerate, run `npx convex dev` or `npx convex codegen`.
 * @module
 */

import type {
  ActionBuilder,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
  GenericQueryCtx,
  GenericMutationCtx,
  GenericActionCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Types used internally within the generated server code.
 */
type DocumentByCollection<CollectionName extends keyof DataModel> =
  DataModel[CollectionName] extends Record<string, never>
    ? never
    : {
        [TableName in CollectionName]: DataModel[TableName];
      }[CollectionName];

export type Doc<CollectionName extends keyof DataModel> =
  DocumentByCollection<CollectionName>;

export type TableNames = keyof DataModel;

export type IndexNames<
  TableName extends TableNames,
> = keyof DataModel[TableName]["indexes"];

export type VectorIndexNames<
  TableName extends TableNames,
> = keyof DataModel[TableName]["vectorIndexes"];

export type SearchIndexNames<
  TableName extends TableNames,
> = keyof DataModel[TableName]["searchIndexes"];

export type DatabaseReader = GenericDatabaseReader<DataModel>;
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;

export type QueryCtx = GenericQueryCtx<DataModel>;

export type MutationCtx = GenericMutationCtx<DataModel>;

export type ActionCtx = GenericActionCtx<DataModel>;

export type Query<Args, Output> = FunctionReference<
  "query",
  "public",
  Args,
  Output
>;
export type Mutation<Args, Output> = FunctionReference<
  "mutation",
  "public",
  Args,
  Output
>;
export type Action<Args, Output> = FunctionReference<
  "action",
  "public",
  Args,
  Output
>;
export type HttpAction<Args, Output> = FunctionReference<
  "httpAction",
  "public",
  Args,
  Output
>;

/**
 * Define a query in this Convex app's API.
 *
 * @example
 * ```
 * export default query({
 *   args: {},
 *   handler: (ctx, args) => {
 *     // Function implementation
 *   },
 * });
 * ```
 */
export declare const query: QueryBuilder<DataModel, "public">;

/**
 * Define a mutation in this Convex app's API.
 *
 * @example
 * ```
 * export default mutation({
 *   args: {},
 *   handler: (ctx, args) => {
 *     // Function functions
 *   },
 * });
 * ```
 */
export declare const mutation: MutationBuilder<DataModel, "public">;

/**
 * Define an action in this Convex app's API.
 *
 * @example
 * ```
 * export default action({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     // Function implementation
 *   },
 * });
 * ```
 */
export declare const action: ActionBuilder<DataModel, "public">;

/**
 * Define an HTTP action.
 *
 * @example
 * ```
 * export default httpAction(async (ctx, request) => {
 *   // Function implementation
 *   return new Response("Hello world!");
 * });
 * ```
 */
export declare const httpAction: HttpActionBuilder;

/* prettier-ignore-end */

