/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as actions_extractConcepts from "../actions/extractConcepts.js";
import type * as actions_generateSummary from "../actions/generateSummary.js";
import type * as actions_processPdf from "../actions/processPdf.js";
import type * as actions_retrieveRelevantChunks from "../actions/retrieveRelevantChunks.js";
import type * as actions_scrapeSource from "../actions/scrapeSource.js";
import type * as billing from "../billing.js";
import type * as billingActions from "../billingActions.js";
import type * as billingWebhookState from "../billingWebhookState.js";
import type * as billingWebhooks from "../billingWebhooks.js";
import type * as http from "../http.js";
import type * as landingDemo from "../landingDemo.js";
import type * as landingDemoQuota from "../landingDemoQuota.js";
import type * as mutations from "../mutations.js";
import type * as polarEnvironment from "../polarEnvironment.js";
import type * as teachingPrompts from "../teachingPrompts.js";
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
  access: typeof access;
  "actions/extractConcepts": typeof actions_extractConcepts;
  "actions/generateSummary": typeof actions_generateSummary;
  "actions/processPdf": typeof actions_processPdf;
  "actions/retrieveRelevantChunks": typeof actions_retrieveRelevantChunks;
  "actions/scrapeSource": typeof actions_scrapeSource;
  billing: typeof billing;
  billingActions: typeof billingActions;
  billingWebhookState: typeof billingWebhookState;
  billingWebhooks: typeof billingWebhooks;
  http: typeof http;
  landingDemo: typeof landingDemo;
  landingDemoQuota: typeof landingDemoQuota;
  mutations: typeof mutations;
  polarEnvironment: typeof polarEnvironment;
  teachingPrompts: typeof teachingPrompts;
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
