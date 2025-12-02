/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_processPdf from "../actions/processPdf.js";
import type * as actions_retrieveRelevantChunks from "../actions/retrieveRelevantChunks.js";
import type * as actions_scrapeSource from "../actions/scrapeSource.js";
import type * as mutations from "../mutations.js";
import type * as testData from "../testData.js";
import type * as utils_chunking from "../utils/chunking.js";
import type * as utils_jargon from "../utils/jargon.js";
import type * as utils_similarity from "../utils/similarity.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/processPdf": typeof actions_processPdf;
  "actions/retrieveRelevantChunks": typeof actions_retrieveRelevantChunks;
  "actions/scrapeSource": typeof actions_scrapeSource;
  mutations: typeof mutations;
  testData: typeof testData;
  "utils/chunking": typeof utils_chunking;
  "utils/jargon": typeof utils_jargon;
  "utils/similarity": typeof utils_similarity;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
