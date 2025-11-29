import { mutation } from "./_generated/server";

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
      jargonWords: [
        "synchronize",
        "calculation",
        "alternative",
        "performance",
        "optimization",
        "component",
        "re-renders",
      ],
      createdAt: Date.now(),
    });

    return { sessionId, message: "Test data created successfully" };
  },
});


/**
 * Creates a complete test session with dialogues for testing summary generation
 * Run this from the Convex dashboard: testData.createTestSessionWithDialogues
 */
export const createTestSessionWithDialogues = mutation({
  args: {},
  handler: async (ctx) => {
    const sessionId = crypto.randomUUID();
    const now = Date.now();

    // Create fake embeddings
    const createFakeEmbedding = () =>
      Array.from({ length: 1536 }, () => Math.random() * 2 - 1);

    // First, create source material
    await ctx.db.insert("sourceMaterial", {
      sessionId,
      topic: "Photosynthesis",
      sourceUrl: "https://example.com/photosynthesis",
      chunks: [
        {
          text: "Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in the chloroplasts of plant cells.",
          embedding: createFakeEmbedding(),
          index: 0,
        },
        {
          text: "The light reactions occur in the thylakoid membranes and produce ATP and NADPH. These reactions require sunlight and water.",
          embedding: createFakeEmbedding(),
          index: 1,
        },
        {
          text: "The Calvin cycle occurs in the stroma and uses ATP and NADPH to convert CO2 into glucose. This is also called the dark reactions.",
          embedding: createFakeEmbedding(),
          index: 2,
        },
        {
          text: "Chlorophyll is the green pigment that absorbs light energy. It is found in the chloroplasts and gives plants their green color.",
          embedding: createFakeEmbedding(),
          index: 3,
        },
      ],
      jargonWords: [
        "photosynthesis",
        "chloroplasts",
        "thylakoid",
        "membranes",
        "chlorophyll",
        "pigment",
      ],
      concepts: [
        {
          id: "concept-0",
          title: "Light Reactions",
          description: "The first stage of photosynthesis where light energy is captured",
        },
        {
          id: "concept-1",
          title: "Calvin Cycle",
          description: "The second stage where CO2 is converted to glucose",
        },
        {
          id: "concept-2",
          title: "Chloroplasts",
          description: "The organelles where photosynthesis takes place",
        },
      ],
      createdAt: now,
    });

    // Create session with dialogues
    await ctx.db.insert("sessions", {
      sessionId,
      topic: "Photosynthesis",
      concepts: [
        {
          id: "concept-0",
          title: "Light Reactions",
          description: "The first stage of photosynthesis where light energy is captured",
        },
        {
          id: "concept-1",
          title: "Calvin Cycle",
          description: "The second stage where CO2 is converted to glucose",
        },
        {
          id: "concept-2",
          title: "Chloroplasts",
          description: "The organelles where photosynthesis takes place",
        },
      ],
      currentConceptIndex: 2,
      dialogues: [
        {
          conceptId: "concept-0",
          messages: [
            {
              role: "ai",
              content: "So what happens in the light reactions? I'm confused about where the energy comes from.",
              timestamp: now - 300000,
            },
            {
              role: "user",
              content: "Think of it like a solar panel! The plant captures sunlight and converts it into energy the plant can use. The light hits special molecules called chlorophyll, which absorb the light energy.",
              timestamp: now - 290000,
            },
            {
              role: "ai",
              content: "Oh, like a solar panel! That makes sense. So chlorophyll is like the solar cells? What does it do with the energy?",
              timestamp: now - 280000,
            },
            {
              role: "user",
              content: "Exactly! The chlorophyll uses that energy to split water molecules and create ATP and NADPH - these are like little energy batteries the plant uses later.",
              timestamp: now - 270000,
            },
          ],
        },
        {
          conceptId: "concept-1",
          messages: [
            {
              role: "ai",
              content: "What's the Calvin cycle? Is it like a bicycle?",
              timestamp: now - 200000,
            },
            {
              role: "user",
              content: "Ha! Not quite. It's called a cycle because it goes around and around. Think of it like a factory assembly line that runs in a circle. It takes CO2 from the air and uses those energy batteries (ATP and NADPH) to build sugar molecules.",
              timestamp: now - 190000,
            },
            {
              role: "ai",
              content: "So it's like a factory that makes sugar? Where does this happen?",
              timestamp: now - 180000,
            },
            {
              role: "user",
              content: "Yes! It happens in the stroma, which is like the factory floor inside the chloroplast. The cycle keeps running as long as there's CO2 and energy available.",
              timestamp: now - 170000,
            },
          ],
        },
        {
          conceptId: "concept-2",
          messages: [
            {
              role: "ai",
              content: "What are chloroplasts? Are they in all cells?",
              timestamp: now - 100000,
            },
            {
              role: "user",
              content: "Chloroplasts are like tiny green factories inside plant cells. They're only in plant cells and some algae - not in animal cells! That's why animals can't make their own food from sunlight.",
              timestamp: now - 90000,
            },
            {
              role: "ai",
              content: "So that's why plants are green? Because of these chloroplast factories?",
              timestamp: now - 80000,
            },
            {
              role: "user",
              content: "Exactly! The chlorophyll inside chloroplasts is green, and that's what gives plants their color. It's like the factory has green paint all over it!",
              timestamp: now - 70000,
            },
          ],
        },
      ],
      explanations: [
        {
          conceptId: "concept-0",
          textExplanation: "Light reactions are the first step of photosynthesis. Sunlight hits the chlorophyll molecules in the thylakoid membranes. This energy is used to split water molecules and create ATP and NADPH, which are energy carriers.",
        },
        {
          conceptId: "concept-1",
          textExplanation: "The Calvin cycle is like a sugar factory. It takes CO2 from the air and uses the ATP and NADPH from the light reactions to build glucose molecules. This happens in the stroma of the chloroplast.",
        },
        {
          conceptId: "concept-2",
          textExplanation: "Chloroplasts are the organelles where photosynthesis happens. They contain chlorophyll, which is green and absorbs light. Only plant cells have chloroplasts, which is why plants can make their own food.",
        },
      ],
      completed: false,
      createdAt: now,
      updatedAt: now,
    });

    return {
      sessionId,
      message: "Test session with dialogues created successfully! Use this sessionId to test the summary generation.",
      testUrl: `/complete/${sessionId}`,
    };
  },
});
