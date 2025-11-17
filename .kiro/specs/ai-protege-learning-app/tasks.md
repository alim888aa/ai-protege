# Implementation Plan

- [x] 1. Set up project structure and dependencies









  - Initialize Next.js 16 project with TypeScript and App Router
  - Install dependencies: Convex, Clerk, Vercel AI SDK, tldraw, @mozilla/readability, jsdom, zod
  - Configure environment variables for OpenAI API key and Hugging Face API key - done in .env.local file
  - Set up Convex project and link to Next.js app
  - _Requirements: 1.1, 2.1_

- [x] 2. Implement Convex schema and utility functions









  - Define sourceMaterial table schema in `convex/schema.ts` with sessionId, topic, sourceUrl, chunks array, and createdAt fields
  - Create text chunking utility function (1000 chars, 200 overlap) in `convex/utils/chunking.ts`
  - Create cosine similarity utility function in `convex/utils/similarity.ts`
  - _Requirements: 7.2, 4.3_

- [ ]* 2.1 Write unit tests for utility functions
  - Test chunking algorithm with various text lengths and edge cases
  - Test cosine similarity calculation with known vector pairs
  - _Requirements: 7.2, 4.3_

- [x] 3. Implement web scraping and embedding generation





  - Create Convex action `scrapeSource` in `convex/actions/scrapeSource.ts` that fetches URL content
  - Integrate @mozilla/readability and jsdom to extract readable text content
  - Split content into chunks using chunking utility
  - Generate embeddings for each chunk using OpenAI embeddings API via Vercel AI SDK
  - Store chunks with embeddings in sourceMaterial table
  - Return sessionId (generated UUID) on success
  - Implement error handling for network failures, invalid HTML, and API failures
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. Implement RAG retrieval action





  - Create Convex action `retrieveRelevantChunks` in `convex/actions/retrieveRelevantChunks.ts`
  - Generate embedding for user's text explanation using OpenAI embeddings API
  - Retrieve all chunks for the given sessionId from sourceMaterial table
  - Calculate cosine similarity between explanation embedding and each chunk embedding
  - Sort chunks by similarity in descending order and return top 5 using `.slice(0, 5)`
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Implement vision analysis server action





  - Create Next.js server action `analyzeDrawing` in `app/actions/analyzeDrawing.ts`
  - Configure Hugging Face provider for Vercel AI SDK with Qwen 2VL model (qwen/qwen-2-vl-7b-instruct)
  - Define Zod schema for vision analysis output (conceptsDrawn, relationships, clarity, completeness, observations)
  - Implement prompt that asks vision model to analyze teaching diagram
  - Use `generateObject` from Vercel AI SDK to get structured vision analysis
  - Return vision analysis object
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Implement evaluation synthesis server action





  - Create Next.js server action `evaluateTeaching` in `app/actions/evaluateTeaching.ts`
  - Define Zod schema for evaluation result (scores, feedback with clarifyingQuestions array, reasoning)
  - Implement prompt that synthesizes vision analysis and RAG chunks to evaluate teaching
  - Include instructions in prompt to generate clarifying questions when vision and text don't align
  - Use `generateObject` with GPT-5 mini to get structured evaluation
  - Calculate overall score as weighted average (Clarity 30%, Accuracy 40%, Completeness 30%)
  - Return evaluation object
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

- [x] 7. Build Setup Screen component





  - Create page component at `app/page.tsx` with form for topic and source URL
  - Implement form validation for URL format (HTTP/HTTPS only, no localhost/private IPs)
  - Add loading state UI during scraping and processing (5-15 seconds)
  - Call Convex action `scrapeSource` on form submit
  - Handle errors and display user-friendly messages with retry option
  - Navigate to `/teach/[sessionId]` on success, passing sessionId
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 7.5_

- [x] 8. Build Teaching Screen component





  - Create page component at `app/teach/[sessionId]/page.tsx` with split-panel layout
  - Integrate tldraw editor in left panel (60% width, 60% of panel height)
  - Add textarea for text explanation in left panel (40% of panel height)
  - Implement live character counter with 5000 character limit (block input beyond limit)
  - Add "Finish Lesson" button in right panel (fixed at bottom)
  - Implement canvas export using Editor.toImage() method, convert blob to base64 using FileReader API
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 9. Implement parallel evaluation orchestration





  - In Teaching Screen submit handler, use Promise.all to run RAG retrieval and vision analysis in parallel
  - Call Convex action `retrieveRelevantChunks` with sessionId and text explanation
  - Call server action `analyzeDrawing` with canvas image base64 and topic
  - Once both complete, call server action `evaluateTeaching` with all collected data
  - Show loading state during evaluation (10-20 seconds)
  - Navigate to `/results?data={encodedEvaluationJSON}` with URL-encoded evaluation data
  - Handle errors and display user-friendly messages
  - _Requirements: 3.1, 3.4, 4.1, 4.5, 5.1, 6.5_

- [x] 10. Build Results Screen component





  - Create page component at `app/results/page.tsx`
  - Parse evaluation data from URL search params (decode and JSON.parse)
  - Display large overall score (0-100) with visual indicator
  - Display three score breakdowns (Clarity, Accuracy, Completeness) with progress bars
  - Display categorized feedback sections: unclear sections, inaccuracies, missing concepts
  - Display "Questions to Consider" section with clarifying questions (Frankenstein element)
  - Add "Start New Session" button that navigates back to setup screen
  - _Requirements: 6.5, 6.6_

- [ ] 11. Add error handling and polish
  - Implement retry logic with exponential backoff for AI API rate limits (max 3 attempts)
  - Add 60-second timeout for AI API calls
  - Add 30-second timeout for scraping operations
  - Validate canvas image size (<5MB) and format (PNG) before processing
  - Sanitize all user inputs before storage
  - Add loading spinners and progress indicators throughout the app
  - Test all error scenarios and ensure user-friendly error messages
  - _Requirements: 1.3, 7.5_
