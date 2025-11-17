import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates test source material for manual testing
 * Run this from the Convex dashboard to create test data
 */
export const createTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const sessionId = crypto.randomUUID();
    
    // Create some fake embeddings (1536 dimensions for text-embedding-3-small)
    const createFakeEmbedding = () => 
      Array.from({ length: 1536 }, () => Math.random() * 2 - 1);

    await ctx.db.insert("sourceMaterial", {
      sessionId,
      topic: "React Hooks",
      sourceUrl: "https://example.com/test",
      chunks: [
        {
          text: "useState is a React Hook that lets you add a state variable to your component. You call it at the top level of your component to declare a state variable.",
          embedding: createFakeEmbedding(),
          index: 0,
        },
        {
          text: "useEffect is a React Hook that lets you synchronize a component with an external system. It runs after every render by default.",
          embedding: createFakeEmbedding(),
          index: 1,
        },
        {
          text: "useContext is a React Hook that lets you read and subscribe to context from your component. It accepts a context object and returns the current context value.",
          embedding: createFakeEmbedding(),
          index: 2,
        },
        {
          text: "useReducer is a React Hook that lets you add a reducer to your component. It's an alternative to useState for managing complex state logic.",
          embedding: createFakeEmbedding(),
          index: 3,
        },
        {
          text: "useMemo is a React Hook that lets you cache the result of a calculation between re-renders. It helps optimize performance.",
          embedding: createFakeEmbedding(),
          index: 4,
        },
      ],
      createdAt: Date.now(),
    });

    return { sessionId, message: "Test data created successfully" };
  },
});
