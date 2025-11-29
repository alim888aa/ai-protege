# Implementation Tasks - AI Protégé v2

## Phase 2: Scraping & Concept Extraction

- [x] 2.2 Add Jargon Extraction to Scraping
  - Implement jargon extraction function in convex/utils/jargon.ts
  - Extract complex technical terms (words >10 chars, technical patterns)
  - Store top 20-30 jargon words in sourceMaterial table
  - Update schema to include jargonWords field
  - Update scrapeSource action to extract and store jargon
  - _Requirements: 5.1, 5.2_

**Manual Testing:**
1. Submit a URL with technical content (e.g., a Wikipedia article on "Neural Networks")
2. Check Convex dashboard → sourceMaterial table → verify jargonWords field exists
3. Verify jargonWords array contains 20-30 technical terms (e.g., "backpropagation", "optimization", "architecture")
4. Test with different types of content (scientific, programming, medical) to ensure extraction works across domains
5. Verify words are properly filtered (no common words like "the", "and")

- [x] 3. Concept Extraction Server Action





  - Create Server Action: app/actions/extractConcepts.ts
  - Implement GPT call with structured output using generateObject
  - Define Zod schema for concept extraction (id, title, description)
  - Generate 3-5 key concepts from source text
  - Handle API errors with retry logic
  - Return concepts array
  - _Requirements: 1.6_

**Manual Testing:**
1. Submit a URL on the setup screen (e.g., article about "Photosynthesis")
2. Wait for scraping to complete
3. Verify 3-5 concepts are extracted (e.g., "Light Reactions", "Calvin Cycle", "Chloroplasts")
4. Check that each concept has: id, title (2-5 words), description (1-2 sentences)
5. Test with short articles (should still get 3 concepts) and long articles (should cap at 5)
6. Test error handling: disconnect internet mid-request, verify retry logic works
7. Verify concepts are relevant to the topic and not generic

- [x] 4 Update Setup Screen for Concept Extraction




  - Call extractConcepts action after scraping completes
  - Navigate to concept review screen (/review/[sessionId]) instead of teaching screen
  - _Requirements: 1.6, 1.7_

**Manual Testing:**
1. Go to setup screen (/)
2. Enter topic "Machine Learning" and a valid URL
3. Click "Start Teaching"
4. Verify loading state shows "Processing your source material..."
5. After scraping completes, verify you're redirected to /review/[sessionId] (not /teach/[sessionId])
6. Check browser URL contains the sessionId
7. Test error case: if concept extraction fails, verify error message is displayed

## Phase 3: Session Management & Concept Review

- [x] 3.1 Update Schema for Sessions




  - Add sessions table to convex/schema.ts
  - Include fields: sessionId, topic, concepts array, currentConceptIndex, dialogues, completed
  - Add index by sessionId
  - _Requirements: 2.1, 2.2, 11.1, 11.2, 11.3_

**Manual Testing:**
1. Open Convex dashboard in browser
2. Navigate to Data tab
3. Verify "sessions" table exists
4. Check table has columns: sessionId, topic, concepts, currentConceptIndex, dialogues, completed
5. Verify index "by_session_id" exists on sessionId field
6. Create a test session via mutation and verify all fields are stored correctly
7. Test querying by sessionId using the index

- [x] 2. Session Management Mutations & Queries





  - Create Convex mutation: createSession (sessionId, topic, concepts)
  - Create Convex mutation: updateConcepts (sessionId, concepts)
  - Create Convex query: getSession (sessionId)
  - Create Convex mutation: saveDialogue (sessionId, conceptId, messages)
  - Create Convex mutation: updateProgress (sessionId, conceptIndex)
  - Create Convex mutation: markComplete (sessionId)
  - _Requirements: 2.1, 2.8, 8.4, 11.2, 11.3_

**Manual Testing:**
1. **createSession**: Open Convex dashboard → Functions tab → Run createSession with test data → Verify session appears in sessions table
2. **updateConcepts**: Run updateConcepts with modified concepts array → Verify concepts are updated in database
3. **getSession**: Run getSession query with sessionId → Verify it returns correct session data
4. **saveDialogue**: Run saveDialogue with test messages → Verify dialogues array is updated
5. **updateProgress**: Run updateProgress with conceptIndex=1 → Verify currentConceptIndex changes to 1
6. **markComplete**: Run markComplete → Verify completed field changes to true
7. Test error cases: invalid sessionId, missing required fields

- [x] 3.3 Concept Review Screen




  - Create /app/review/[sessionId]/page.tsx
  - Fetch session data and display extracted concepts
  - Implement inline editing for concept titles
  - Implement inline editing for concept descriptions
  - Add "Delete Concept" button with confirmation
  - Add "Add Concept" button with default template
  - Validate minimum 1 concept, maximum 10 concepts
  - Add "Start Teaching" button
  - Call updateConcepts mutation on proceed
  - Navigate to first concept teaching screen (/teach/[sessionId]/0)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

**Manual Testing:**
1. Navigate to /review/[sessionId] after completing setup
2. Verify all extracted concepts are displayed with titles and descriptions
3. **Edit title**: Click on a concept title → Edit text → Verify changes are saved
4. **Edit description**: Click on description → Edit text → Verify changes are saved
5. **Delete concept**: Click delete button → Verify confirmation dialog appears → Confirm → Verify concept is removed
6. **Try deleting last concept**: Verify you cannot delete when only 1 concept remains
7. **Add concept**: Click "Add Concept" → Verify new concept appears with default template
8. **Add 10 concepts**: Verify "Add Concept" button is disabled at 10 concepts
9. Click "Start Teaching" → Verify navigation to /teach/[sessionId]/0
10. Check Convex dashboard → Verify concepts were saved via updateConcepts mutation

## Phase 4: Multi-Concept Teaching Interface

- [x] 4.1 Refactor Teaching Screen for Multi-Concept Flow





  - Rename /app/teach/[sessionId]/page.tsx to /app/teach/[sessionId]/[conceptIndex]/page.tsx
  - Update route to accept conceptIndex parameter
  - Fetch session data and get current concept by index
  - Add progress indicator showing "Concept X/Y: [Title]"
  - Update right panel to show dialogue history for current concept
  - Replace "Finish Lesson" button with "Done Explaining" button
  - Add "Move to Next Concept" button (initially hidden)
  - _Requirements: 3.1, 3.2, 3.3, 8.1, 8.2_

**Manual Testing:**
1. Navigate to /teach/[sessionId]/0 from concept review
2. Verify URL contains conceptIndex parameter (0)
3. Verify progress indicator shows "Concept 1/5: [First Concept Title]"
4. Verify only the first concept's title and description are displayed
5. Verify right panel is empty (no dialogue yet)
6. Verify "Done Explaining" button exists (not "Finish Lesson")
7. Verify "Move to Next Concept" button is hidden initially
8. Manually navigate to /teach/[sessionId]/1 → Verify second concept loads
9. Test with invalid conceptIndex (e.g., 99) → Verify error handling
10. Refresh page → Verify concept data persists

- [x] 4.3 Jargon Detection & Highlighting




  - Create component: JargonHighlightedTextarea.tsx
  - Load jargonWords from sourceMaterial query on mount
  - Implement real-time text checking against jargon list
  - Highlight detected jargon words (yellow background)
  - Add tooltip on hover: "Simplify this?"
  - Replace TextExplanationArea with JargonHighlightedTextarea
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

**Manual Testing:**
1. Start a session with technical content (e.g., "Neural Networks")
2. Navigate to teaching screen
3. Type a jargon word from the source (e.g., "backpropagation")
4. Verify the word is highlighted with yellow background in real-time
5. Hover over the highlighted word → Verify tooltip appears with "Simplify this?"
6. Type multiple jargon words in one sentence → Verify all are highlighted
7. Type a jargon word with different casing (e.g., "BackPropagation") → Verify it's still detected
8. Type non-jargon words → Verify they are not highlighted
9. Delete a jargon word → Verify highlighting is removed
10. Test performance: Type quickly → Verify highlighting doesn't lag

- [x] 4.4 Activity Tracking & Hint System





  - Implement useInactivityTimer hook (30 seconds)
  - Track user activity (typing, drawing, dialogue)
  - Show "Need a Hint?" button after timeout
  - Reset timer on any user activity
  - Create Server Action: app/actions/generateHint.ts
  - Implement hint generation with GPT using current dialogue context
  - Track hint count (1st, 2nd, 3rd hint)
  - Show source excerpt popup on 3rd hint
  - Display hints in dialogue panel as AI messages
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

**Manual Testing:**
1. Navigate to teaching screen and do nothing for 30 seconds
2. Verify "Need a Hint?" button appears after 30 seconds
3. Type in text area → Verify button disappears and timer resets
4. Wait 30 seconds again → Verify button reappears
5. Draw on canvas → Verify timer resets
6. Click "Need a Hint?" → Verify hint appears in dialogue panel as AI message
7. Verify hint is helpful but doesn't give away the answer
8. Request a second hint → Verify it's more specific than the first
9. Request a third hint → Verify a popup appears with source excerpt
10. Close popup → Verify you can continue teaching
11. Test timer reset during dialogue: Send a message → Verify timer resets

## Phase 5: Real-Time AI Dialogue System

- [x] 2 Replace Evaluation with Dialogue Flow










  - Remove evaluateTeaching and analyzeDrawing actions (keep for reference)
  - Create Server Action: app/actions/generateClarityQuestions.ts
  - Implement GPT multimodal call for clarity (canvas + text)
  - Define Zod schema for clarity questions (questions array, requestsAnalogy boolean)
  - Generate 1-2 questions about clarity/simplicity
  - Include analogy request if explanation is correct but abstract
  - Create Server Action: app/actions/generateAccuracyQuestions.ts
  - Implement GPT call for accuracy (text + RAG chunks)
  - Define Zod schema for accuracy questions
  - Generate 1-2 questions about factual accuracy
  - Update teaching screen to call both actions in parallel on "Done Explaining"
  - Display questions in dialogue panel as they arrive
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 7.1, 7.2_

**Manual Testing:**
1. Draw a diagram and write an explanation on teaching screen
2. Click "Done Explaining"
3. Verify loading indicator appears
4. Verify clarity questions appear first (within 3-5 seconds)
5. Verify accuracy questions appear shortly after
6. Verify total of 2-4 questions are displayed
7. **Test clarity questions**: Use complex jargon → Verify AI asks for simplification
8. **Test clarity questions**: Write abstract explanation → Verify AI asks for drawing or analogy
9. **Test accuracy questions**: Write something incorrect → Verify AI questions the accuracy
10. **Test accuracy questions**: Miss key concepts → Verify AI asks about missing details
11. Verify questions sound like a curious 12-year-old (simple language)
12. Test with empty drawing → Verify AI asks for visual explanation

- [x] 3 Dialogue Response & Streaming



  - Create Server Action: app/actions/generateDialogueResponse.ts
  - Implement streaming response with streamText from Vercel AI SDK
  - Accept dialogue history and RAG chunks as parameters
  - Configure AI as curious 12-year-old student
  - Stream AI response to dialogue panel
  - Handle follow-up questions naturally
  - Add text input for user responses in dialogue panel
  - Update dialogue state with each exchange
  - _Requirements: 4.9, 4.10, 7.3, 7.4, 7.5_

**Manual Testing:**
1. After AI asks initial questions, type a response in dialogue input
2. Press Enter or click Send
3. Verify your message appears in dialogue panel immediately
4. Verify AI response starts streaming (appears word by word)
5. Verify streaming completes within 2-3 seconds
6. **Test follow-up**: Answer a question → Verify AI asks a natural follow-up
7. **Test analogy request**: If AI requested analogy, provide one → Verify AI asks about the analogy
8. **Test clarification**: Give a vague answer → Verify AI asks for more details
9. **Test understanding**: Give a good answer → Verify AI acknowledges and may ask deeper question
10. Verify dialogue history is maintained (scroll up to see previous messages)
11. Test rapid responses: Send multiple messages quickly → Verify all are handled
12. Verify AI tone is curious and encouraging (like a 12-year-old)

- [x] 4 Dialogue State Management





  - Add dialogue state to teaching screen (array of messages)
  - Load previous dialogue for current concept on mount
  - Save dialogue to Convex after each AI response
  - Update saveDialogue mutation to handle per-concept storage
  - Enable "Move to Next Concept" button after at least 1 question answered
  - _Requirements: 4.10, 8.3, 11.2, 11.3_

**Manual Testing:**
1. Start dialogue on concept 1, answer at least 1 question
2. Verify "Move to Next Concept" button becomes enabled
3. Refresh the page → Verify dialogue history is still there
4. Check Convex dashboard → sessions table → Verify dialogues array contains messages for concept 1
5. Navigate to concept 2, start new dialogue
6. Navigate back to concept 1 → Verify previous dialogue is loaded
7. Check Convex → Verify dialogues are stored per-concept (separate entries for concept 1 and 2)
8. Test with no dialogue → Verify "Move to Next Concept" button stays disabled
9. Answer 1 question → Verify button enables immediately
10. Test concurrent updates: Open two browser tabs → Verify dialogue syncs correctly

## Phase 6: Navigation & Progress Tracking

- [ ] 6.1 Concept Navigation
  - Add "Move to Next Concept" button to teaching screen
  - Enable button after AI engagement (at least 1 question answered)
  - Call updateProgress mutation when moving to next concept
  - Navigate to next concept: /teach/[sessionId]/[conceptIndex+1]
  - Handle last concept → navigate to completion screen
  - Add navigation to previous concepts (optional enhancement)
  - _Requirements: 8.3, 8.4, 8.5, 8.6_

**Manual Testing:**
1. On concept 1, answer at least 1 AI question
2. Verify "Move to Next Concept" button is enabled
3. Click button → Verify navigation to /teach/[sessionId]/1
4. Verify concept 2 loads with empty dialogue
5. Verify progress indicator updates to "Concept 2/5"
6. Check Convex → Verify currentConceptIndex updated to 1
7. Navigate through all concepts (1 → 2 → 3 → 4 → 5)
8. On last concept (5/5), click "Move to Next Concept"
9. Verify navigation to /complete/[sessionId] (not concept 6)
10. Test back navigation: Use browser back button → Verify previous concept loads correctly
11. Test direct URL access: Navigate to /teach/[sessionId]/3 → Verify concept 3 loads

- [x] 2 Progress Tracking Display





  - Display progress indicator on teaching screen header
  - Show "Concept X/Y: [Title]" format
  - Update progress indicator when navigating between concepts
  - Persist currentConceptIndex in session
  - _Requirements: 8.1, 8.2, 8.6_

**Manual Testing:**
1. Navigate to first concept → Verify header shows "Concept 1/5: [First Concept Title]"
2. Move to next concept → Verify header updates to "Concept 2/5: [Second Concept Title]"
3. Navigate through all concepts → Verify progress indicator updates each time
4. Verify format is exactly "Concept X/Y: [Title]"
5. Test with different numbers of concepts (3 concepts, 7 concepts, 10 concepts)
6. Refresh page on concept 3 → Verify progress indicator still shows "Concept 3/X"
7. Check Convex → Verify currentConceptIndex persists across page refreshes
8. Test visual styling: Verify progress indicator is prominent and easy to read

## Phase 7: Completion & Summary

- [x] 1 Summary Generation Server Action







  - Create Server Action: app/actions/generateSummary.ts
  - Accept sessionId and retrieve all dialogues from Convex
  - Generate summary using GPT with all concept dialogues
  - AI says: "I think I understand [topic] now! Let me explain it back to you:"
  - Include key concepts and analogies from user's teaching
  - Return summary text
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.4_

**Manual Testing:**
1. Complete teaching all concepts in a session
2. Navigate to completion screen
3. Verify loading indicator appears while summary generates
4. Verify summary starts with "I think I understand [topic] now! Let me explain it back to you:"
5. Verify summary includes all key concepts you taught
6. Verify summary includes any analogies you provided
7. Verify summary is in simple language (like a 12-year-old explaining)
8. Test with different teaching styles: technical vs simple → Verify summary adapts
9. Test with session that used many analogies → Verify analogies are referenced
10. Verify summary generation completes within 15 seconds
11. Check console for errors during generation

- [x] 2 Completion Screen





  - Create /app/complete/[sessionId]/page.tsx
  - Fetch session data and generate summary on mount
  - Display AI's summary of the topic
  - Add "That's correct!" button
  - Add "Let me clarify..." button
  - Implement clarification flow (navigate back to concept review)
  - Show completion message on "That's correct!"
  - Add "Start New Session" button (navigate to /)
  - Call markComplete mutation on success
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

**Manual Testing:**
1. Complete all concepts and navigate to /complete/[sessionId]
2. Verify AI's summary is displayed prominently
3. Verify two buttons are visible: "That's correct!" and "Let me clarify..."
4. **Test clarification flow**:
   - Click "Let me clarify..." → Verify navigation to /review/[sessionId]
   - Verify you can edit concepts and re-teach
5. **Test completion flow**:
   - Click "That's correct!" → Verify completion message appears
   - Verify message is encouraging (e.g., "Great teaching! You've helped me learn [topic].")
   - Verify "Start New Session" button appears
6. Click "Start New Session" → Verify navigation to / (setup screen)
7. Check Convex → Verify markComplete mutation was called (completed = true)
8. Test with invalid sessionId → Verify error handling
9. Refresh page → Verify summary persists (doesn't regenerate)
10. Test visual design: Verify screen is celebratory and positive

## Phase 8: Performance & Polish

- [ ] 1 Performance Optimization
  - Ensure AI question generation completes within 10 seconds
  - Ensure hint generation completes within 10 seconds
  - Ensure summary generation completes within 15 seconds
  - Add loading indicators for all AI operations
  - Implement timeout handling (30s for AI calls)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

**Manual Testing:**
1. **Question generation timing**: Click "Done Explaining" → Time how long until questions appear → Verify < 10 seconds
2. **Hint generation timing**: Click "Need a Hint?" → Time response → Verify < 10 seconds
3. **Summary generation timing**: Navigate to completion screen → Time summary → Verify < 15 seconds
4. **Loading indicators**: Verify spinner/loading state appears for all AI operations
5. **Timeout handling**: Simulate slow network (Chrome DevTools → Network → Slow 3G)
   - Verify timeout message appears after 30 seconds
   - Verify user can retry
6. Test on slow connection: Verify all operations still complete within acceptable time
7. Test rapid operations: Click "Done Explaining" multiple times → Verify no race conditions
8. Monitor browser console for performance warnings

- [ ] 8.2 Error Handling
  - Add retry logic for all AI API calls
  - Handle network failures gracefully
  - Display user-friendly error messages
  - Implement error boundaries for React components
  - Handle expired or invalid sessions
  - _Requirements: 10.6_

- [x] 3 UI/UX Polish





  - Add loading skeletons for content
  - Implement smooth transitions between screens
  - Add animations for dialogue messages appearing
  - Implement auto-scroll for dialogue panel
  - Add keyboard shortcuts (Enter to submit dialogue)
  - Add visual feedback for all interactions
  - Improve mobile responsiveness (optional)

- [ ]* 8.4 Testing
  - Write unit tests for chunking algorithm
  - Write unit tests for cosine similarity
  - Write unit tests for jargon extraction
  - Manual test: Complete flow from setup to completion
  - Manual test: Concept review editing
  - Manual test: Multi-concept teaching flow
  - Manual test: Dialogue system with follow-ups
  - Manual test: Hint system with 3 hints
  - Manual test: Jargon highlighting
  - Manual test: Session persistence across page refreshes

## Phase 9: Deployment (Optional)

- [ ] 9.1 Deployment Preparation
  - Set up Convex production environment
  - Configure environment variables for production
  - Set up Vercel project
  - Configure build settings
  - Test production build locally

- [ ] 9.2 Deploy & Monitor
  - Deploy to Vercel
  - Verify all features work in production
  - Monitor API usage and costs
  - Set up error tracking (optional)

## Notes on Current Implementation

The current codebase has a simplified single-concept version implemented:
- ✅ Setup screen with URL scraping and validation
- ✅ Convex schema for sourceMaterial (needs sessions table)
- ✅ Scraping action with chunking and embeddings
- ✅ RAG retrieval action
- ✅ Teaching screen with canvas and text area (needs multi-concept support)
- ✅ Vision analysis and evaluation (needs to be replaced with dialogue system)
- ✅ Results page (needs to be replaced with completion screen)
- ✅ Utility functions (chunking, similarity, canvas export)

**Key Missing Features:**
1. Concept extraction and review flow
2. Multi-concept teaching with progress tracking
3. Real-time AI dialogue system (currently uses batch evaluation)
4. Jargon detection and highlighting
5. Hint system with inactivity tracking
6. Analogy requests
7. Completion screen with AI summary
8. Sessions table in schema

**Recommended Implementation Order:**
1. Start with Phase 3 (Session Management & Concept Review)
2. Then Phase 2.2-2.4 (Jargon extraction and concept extraction)
3. Then Phase 4.1 (Refactor teaching screen for multi-concept)
4. Then Phase 5.2-5.4 (Replace evaluation with dialogue system)
5. Then Phase 6 (Navigation & Progress)
6. Then Phase 7 (Completion & Summary)
7. Then Phase 4.3-4.4 (Jargon highlighting and hints)
8. Finally Phase 8 (Polish & Testing)
