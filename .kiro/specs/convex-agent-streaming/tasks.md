# Implementation Tasks - Convex Agent Streaming

## Phase 1: Setup & Dependencies

- [x] 1. Install @convex-dev/agent package





  - Run `pnpm add @convex-dev/agent`
  - Verify package installs correctly
  - Check for any peer dependency warnings
  - _Requirements: 2.1, 3.3_

**Manual Testing:**
1. Run `pnpm add @convex-dev/agent`
2. Verify no errors in terminal
3. Check `package.json` includes the dependency

- [x] 1.2 Configure Agent component in Convex


  - Add Agent component to `convex/convex.config.ts` (create if needed)
  - Run `npx convex dev` to sync component tables
  - _Requirements: 3.3_

**Manual Testing:**
1. Run `npx convex dev`
2. Check Convex dashboard for new Agent-related tables
3. Verify no schema errors

## Phase 2: Convex Backend

- [x] 1 Create streamChat action





  - Create `convex/actions/streamChat.ts`
  - Implement RAG retrieval (call existing `retrieveRelevantChunks`)
  - Build unified system prompt (clarity + accuracy)
  - Setup DeltaStreamer for streaming
  - Call OpenAI streamText with concept context
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

**Manual Testing:**
1. Call action directly from Convex dashboard with test data
2. Verify RAG chunks are retrieved (check logs)
3. Verify stream completes without errors

- [x] 2 Create streams query






  - Create `convex/queries/streams.ts`
  - Implement `listStreams` query using `syncStreams`
  - Return streaming and finished statuses
  - _Requirements: 2.1, 2.3_

**Manual Testing:**
1. After running streamChat, query listStreams with same threadId
2. Verify stream content is returned
3. Test with invalid threadId → verify empty result

- [x] 2.3 Create streamHint action


  - Create hint streaming action similar to streamChat
  - Include RAG chunks in hint context
  - Use same DeltaStreamer pattern
  - _Requirements: 4.1, 4.2_

**Manual Testing:**
1. Call streamHint action from Convex dashboard
2. Verify hint includes source material references
3. Verify streaming works correctly

## Phase 3: Client Integration

- [x] 3 Update useDialogueHandlers for Convex streaming








  - Import `useAction` from convex/react
  - Add conditional logic: Convex for source sessions, Vercel for manual
  - Call `streamChat` action instead of fetch for source sessions
  - Track streamId for subscription
  - _Requirements: 1.4, 3.1, 3.2_

**Manual Testing:**
1. Create session WITH source URL
2. Submit explanation → verify Convex action is called (check network tab)
3. Create session WITHOUT source (manual)
4. Submit explanation → verify Vercel `/api/chat` is called

- [x] 3.2 Add stream subscription to MessagePanel



  - Import `useQuery` for stream subscription
  - Subscribe to `listStreams` with current threadId
  - Render streaming content from subscription
  - Handle stream completion
  - _Requirements: 2.1, 2.2_

**Manual Testing:**
1. Submit explanation in teaching screen
2. Verify AI response streams in progressively
3. Verify streaming indicator shows during generation
4. Verify final message appears in dialogue history


- [x] 3.3 Update hint handlers for Convex streaming

  - Update `handleGenerateHint` to use Convex action
  - Subscribe to hint stream deltas
  - Maintain fallback for manual sessions
  - _Requirements: 4.1, 4.2, 4.3_

**Manual Testing:**
1. Click "Need a Hint?" in session with source
2. Verify hint streams in progressively
3. Verify hint references source material
4. Test hint in manual session → verify Vercel fallback works

**Notes from developer:**
Switched to just http. Took out convex agent. Streaming works. 
## Phase 4: Testing & Cleanup

- [ ] 4.1 End-to-end testing with source material
  - Test full flow: create session with URL → teach → verify AI asks about source
  - Verify AI questions reference the source content
  - Verify streaming works throughout conversation
  - _Requirements: 1.1, 1.2, 1.3_

**Manual Testing:**
1. Create new session with Wikipedia URL about a specific topic
2. Teach the first concept with a partially incorrect explanation
3. Verify AI asks about the discrepancy with source
4. Continue dialogue → verify AI stays on topic
5. Complete all concepts → verify summary generation still works

- [ ] 4.2 End-to-end testing without source material
  - Test manual session flow
  - Verify fallback to Vercel clarity questions
  - Verify no errors when source is missing
  - _Requirements: 1.4_

**Manual Testing:**
1. Create new session with "Manual" source option
2. Teach concepts → verify AI asks clarity questions only
3. Verify no "source material" references in AI responses
4. Complete session → verify everything works

- [ ] 4.3 Performance validation
  - Measure time-to-first-token with source sessions
  - Compare to previous Vercel-only latency
  - Verify improvement of ~100-200ms
  - _Requirements: 2.4_

**Manual Testing:**
1. Open browser DevTools → Network tab
2. Submit explanation and note time until first streamed character appears
3. Compare with previous implementation (should be faster)

- [ ] 4.4 Cleanup (after validation)
  - Remove `/api/chat` route (or keep as fallback)
  - Remove `generateAccuracyQuestions.ts` (merged into Convex)
  - Update any remaining references
  - _Requirements: 3.4_

**Manual Testing:**
1. Search codebase for references to deleted files
2. Verify app still works after cleanup
3. Run `pnpm build` → verify no build errors
