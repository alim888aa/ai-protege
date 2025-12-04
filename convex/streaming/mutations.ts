import { mutation } from "../_generated/server";
import { components } from "../_generated/api";
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";

const streaming = new PersistentTextStreaming(components.persistentTextStreaming);

/**
 * Creates a new stream ID for chat or hint streaming.
 * Call this before initiating the HTTP stream request.
 */
export const createStream = mutation({
  args: {},
  handler: async (ctx) => {
    const streamId = await streaming.createStream(ctx);
    return { streamId };
  },
});
