# Implementation Tasks - Session Dashboard

## Phase 1: Schema & Backend Updates

- [x] 1 Update Schema with userId








  - Add `userId: v.string()` field to `sessions` table
  - Add `userId: v.string()` field to `sourceMaterial` table
  - Add `.index("by_user", ["userId"])` to both tables
  - Run `npx convex dev` to apply schema changes
  - _Requirements: 6.1_

**Manual Testing:**
1. Open Convex dashboard → Data tab
2. Verify `sessions` table has `userId` column
3. Verify `sourceMaterial` table has `userId` column
4. Check indexes: both tables should have `by_user` index

- [x] 1.2 Update Existing Mutations for Auth


  - Update `createSession` to get userId from `ctx.auth.getUserIdentity()`
  - Update `createSourceMaterial` to include userId
  - Update `createManualSourceMaterial` to include userId
  - Throw error if not authenticated in all mutations
  - _Requirements: 6.1, 6.2_

**Manual Testing:**
1. Sign in and create a new session via the app
2. Check Convex dashboard → sessions table → verify `userId` field is populated with your Clerk user ID
3. Check sourceMaterial table → verify `userId` matches
4. Sign out and try to call createSession directly in Convex dashboard → verify it throws "Not authenticated" error


- [x] 1.3 Add New Queries & Mutations






  - Create `getUserSessions` query - returns sessions for current user sorted by updatedAt desc
  - Create `deleteSession` mutation - deletes session and associated sourceMaterial (verify ownership)
  - _Requirements: 1.1, 1.2, 4.3_

**Manual Testing:**
1. Create 2-3 sessions with different topics
2. Run `getUserSessions` in Convex dashboard → verify it returns only your sessions, sorted by most recent first
3. Run `deleteSession` with a valid sessionId → verify session and sourceMaterial are both deleted
4. Try `deleteSession` with another user's sessionId → verify it fails or returns error

## Phase 2: Dashboard Page

- [x] 1 Create Dashboard Page Structure





  - Create `/app/dashboard/page.tsx`
  - Add UserButton in top-right corner
  - Create scrollable container for topic input + source selection
  - Add "Previous Lessons" section header
  - _Requirements: 1.1, 5.1_

**Manual Testing:**
1. Navigate to `/dashboard`
2. Verify UserButton appears in top-right corner
3. Verify page has a container/card for new session creation
4. Verify "Previous Lessons" header is visible below the creation container

- [x] 2 Implement Topic Input Step





  - Add topic input field with placeholder "What topic would you like to learn?"
  - Add "Next" button that scrolls container to source selection
  - Validate topic is not empty before allowing "Next"
  - _Requirements: 5.1, 5.2_

**Manual Testing:**
1. Verify input placeholder shows "What topic would you like to learn?"
2. Try clicking "Next" with empty input → verify button is disabled or shows validation error
3. Enter a topic and click "Next" → verify container smoothly scrolls to reveal source selection
4. Verify topic input value is preserved after scrolling

- [x] 2.3 Implement Source Selection Step


  - Reuse source type selection UI from current home page (URL/PDF/Manual buttons)
  - Add URL input field (shown when URL selected)
  - Add PDF upload area (shown when PDF selected)
  - Add info message (shown when Manual selected)
  - Add "Start" button that triggers processing
  - _Requirements: 5.3, 5.4_

**Manual Testing:**
1. After clicking "Next", verify three source options appear: Web URL, PDF Upload, Manual
2. Click "Web URL" → verify URL input field appears
3. Click "PDF Upload" → verify file upload area appears
4. Click "Manual" → verify info message appears
5. Verify "Start" button is visible


- [x] 2.4 Implement Session Processing

  - On "Start" click, call appropriate Convex action based on source type
  - Show loading state during processing
  - Handle errors with user-friendly messages
  - Navigate to `/review/[sessionId]` on success
  - _Requirements: 5.4_

**Manual Testing:**
1. Enter topic, select URL source, enter valid URL, click "Start"
2. Verify loading indicator appears during processing
3. Verify navigation to `/review/[sessionId]` on success
4. Test with invalid URL → verify error message is displayed
5. Test with PDF upload → verify processing works
6. Test with Manual → verify direct navigation to review page

## Phase 3: Session Cards

- [x] 1 Create SessionCard Component





  - Create `/app/dashboard/_components/SessionCard.tsx`
  - Display topic name as card title
  - Display source URL (truncated) or "Manual" for no-source
  - Display progress: "X/Y concepts" or "Complete ✓"
  - Display relative time (e.g., "2 hours ago")
  - _Requirements: 1.3, 1.4, 1.5_

**Manual Testing:**
1. Create sessions with different states (in-progress at various concept indexes, completed)
2. Verify topic name displays as card title
3. Verify URL sessions show truncated URL (e.g., "https://example.com/very-long..." → truncated)
4. Verify Manual sessions show "Manual" instead of URL
5. Verify in-progress shows "2/5 concepts" format
6. Verify completed shows "Complete ✓"
7. Verify relative time displays (e.g., "2 hours ago", "Yesterday")

- [x] 2 Implement Session Actions





  - Add "Continue" button for in-progress sessions → navigates to `/teach/[sessionId]/[currentConceptIndex]`
  - Add "Review" button for completed sessions → navigates to `/complete/[sessionId]`
  - Add trash icon button for delete
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1_

**Manual Testing:**
1. Find an in-progress session card → verify "Continue" button is shown
2. Click "Continue" → verify navigation to `/teach/[sessionId]/[currentConceptIndex]` (correct concept index)
3. Find a completed session card → verify "Review" button is shown
4. Click "Review" → verify navigation to `/complete/[sessionId]`
5. Verify trash icon is visible on all cards

- [x] 3 Implement Delete Confirmation





  - Create delete confirmation dialog component
  - Show topic name in confirmation message
  - Call `deleteSession` mutation on confirm
  - Close dialog and update UI on success
  - _Requirements: 4.2, 4.3, 4.4_

**Manual Testing:**
1. Click trash icon on a session card
2. Verify confirmation dialog appears with message like "Delete 'React Hooks' session?"
3. Click "Cancel" → verify dialog closes, session still exists
4. Click trash icon again, then click "Delete" → verify dialog closes
5. Verify session card disappears from the list
6. Check Convex dashboard → verify session and sourceMaterial are deleted

- [x] 3.4 Display Session List

  - Query `getUserSessions` on dashboard mount
  - Display `SessionCardSkeleton` grid (3 cards) while `sessions === undefined`
  - Display session cards in responsive grid (1-3 columns) when loaded
  - Handle empty state (no sessions yet - just show topic input)
  - _Requirements: 1.1, 1.2, 1.6_

**Manual Testing:**
1. Hard refresh dashboard page → verify skeleton cards appear briefly before real cards load
2. Verify skeleton cards match the layout of real cards (no layout shift)
3. Verify cards display in responsive grid: 1 column on mobile, 2-3 on desktop
4. Delete all sessions → verify empty state shows (no "Previous Lessons" section or just the topic input)
5. Create a new session → verify it appears in the list without page refresh

## Phase 4: Route Protection & Polish

- [x] 1 Update Middleware for Auth




  - Update `src/middleware.ts` to protect `/dashboard`, `/teach/*`, `/review/*`, `/complete/*`
  - Redirect unauthenticated users to `/sign-in`
  - _Requirements: 6.3, 6.4_

**Manual Testing:**
1. Sign out of the application
2. Try navigating directly to `/dashboard` → verify redirect to `/sign-in`
3. Try navigating to `/teach/some-id/0` → verify redirect to `/sign-in`
4. Try navigating to `/review/some-id` → verify redirect to `/sign-in`
5. Try navigating to `/complete/some-id` → verify redirect to `/sign-in`
6. Sign in → verify you can access all protected routes

- [ ] 4.2 Update Home Page
  - Convert current `/app/page.tsx` to a simple redirect to `/dashboard`
  - (Marketing page to be designed separately)

**Manual Testing:**
1. Navigate to `/` (root URL)
2. Verify automatic redirect to `/dashboard`
3. If signed out, verify redirect chain: `/` → `/dashboard` → `/sign-in`

- [ ] 4.3 Final Integration Testing
  - Test complete flow from dashboard to completion
  - Verify session isolation between users

**Manual Testing:**
1. **New session flow**: Dashboard → enter topic → select source → Start → review concepts → teach all → complete
2. **Continue flow**: Create session, teach 2/5 concepts, go to dashboard, click "Continue" → verify canvas drawings restored, dialogue history restored, correct concept loaded
3. **Review flow**: Complete a session, go to dashboard, click "Review" → verify summary page loads with saved summary
4. **Delete flow**: Delete a session → verify it's gone from dashboard and Convex
5. **Multi-user isolation**: Sign in as User A, create session. Sign in as User B → verify User A's sessions are not visible
