# Design Document - Session Dashboard

## Overview

The Session Dashboard extends the existing AI Protégé application to support user-specific session persistence. It adds user association to sessions and source materials, provides a dashboard UI for session management, and moves the session creation flow from the home page to the dashboard.

## Architecture


### Schema Changes

```typescript
// convex/schema.ts - Updated tables

sessions: defineTable({
  userId: v.string(),  // NEW: Clerk user ID
  sessionId: v.string(),
  topic: v.string(),
  // ... existing fields unchanged
})
  .index("by_session_id", ["sessionId"])
  .index("by_user", ["userId"]),  // NEW

sourceMaterial: defineTable({
  userId: v.string(),  // NEW: Clerk user ID
  sessionId: v.string(),
  // ... existing fields unchanged
})
  .index("by_session", ["sessionId"])
  .index("by_user", ["userId"]),  // NEW
```

### New Queries & Mutations

```typescript
// Get all sessions for current user
getUserSessions: query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Delete session and associated source material
deleteSession: mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Delete session (verify ownership)
    // Delete associated sourceMaterial
  },
});
```

### Updated Mutations

All session/sourceMaterial creation mutations will:
1. Call `ctx.auth.getUserIdentity()` to get user ID
2. Throw error if not authenticated
3. Store `userId: identity.subject` in the record

## Components

### Dashboard Page (`/app/dashboard/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  AI Protégé                          [UserButton]   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │  What topic would you like to learn?        │   │
│  │  [________________________]                 │   │
│  │                                             │   │
│  │  [Source Material Selection - hidden]       │   │
│  │                                             │   │
│  │                            [Next →]         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Previous Lessons                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Topic Name   │  │ Topic Name   │  │ Topic... │ │
│  │ https://...  │  │ Manual       │  │ https:// │ │
│  │ 3/5 concepts │  │ Complete ✓   │  │ 2/4      │ │
│  │ [Continue]🗑️ │  │ [Review] 🗑️  │  │ [Cont]🗑️ │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────┘
```

**State:**
```typescript
interface DashboardState {
  topic: string;
  step: 'topic' | 'source';  // Controls scroll position
  sourceType: 'url' | 'pdf' | 'none';
  sourceUrl: string;
  pdfFile: File | null;
  isProcessing: boolean;
  error: string | null;
}
```

**Behavior:**
- Topic input + "Next" button scrolls container to reveal source selection
- Source selection mirrors existing home page functionality
- "Start" button processes source and navigates to `/review/[sessionId]`
- Session cards grid below with responsive layout

### Session Card Component

**Props:**
```typescript
interface SessionCardProps {
  session: {
    sessionId: string;
    topic: string;
    sourceUrl?: string;
    sourceType: 'url' | 'pdf' | 'none';
    concepts: Array<{ id: string; title: string }>;
    currentConceptIndex: number;
    completed: boolean;
    updatedAt: number;
  };
  onDelete: (sessionId: string) => void;
}
```

**Display Logic:**
- Progress: `completed ? "Complete ✓" : `${currentConceptIndex}/${concepts.length} concepts``
- Source: `sourceType === 'none' ? "Manual" : truncate(sourceUrl, 30)`
- Button: `completed ? "Review" : "Continue"`

### Session Card Skeleton

Matches the exact layout of `SessionCard` to prevent layout shift during Convex data loading:

```typescript
function SessionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
      {/* Topic title */}
      <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
      {/* Source URL */}
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-3" />
      {/* Progress */}
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/3 mb-4" />
      {/* Action buttons row */}
      <div className="flex justify-between items-center">
        <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded w-24" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  );
}
```

Display 3 skeleton cards while `sessions === undefined` (Convex loading state).

### Delete Confirmation Dialog

Simple modal with:
- "Delete this session?" message
- Topic name for confirmation
- Cancel / Delete buttons

## Route Protection

Update `src/middleware.ts` to protect dashboard and teaching routes:

```typescript
export default clerkMiddleware((auth, req) => {
  const protectedRoutes = ['/dashboard', '/teach', '/review', '/complete'];
  
  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    auth().protect();
  }
});
```

## Canvas Restoration

Already implemented in `TeachingLayout.tsx`:

```typescript
const initialElements = useMemo(() => {
  if (currentExplanation?.canvasData) {
    const saved = JSON.parse(currentExplanation.canvasData);
    return [boundary, ...saved];
  }
  return [boundary];
}, [currentExplanation?.canvasData]);
```

No changes needed - canvas data is already saved per-concept and restored on mount.

## Data Flow

### New Session Flow
1. User enters topic on dashboard
2. User clicks "Next" → container scrolls to source selection
3. User selects source type and provides URL/PDF/nothing
4. User clicks "Start"
5. System creates session with `userId` from Clerk
6. System processes source material (if any)
7. Navigate to `/review/[sessionId]`

### Resume Session Flow
1. User clicks "Continue" on session card
2. Navigate to `/teach/[sessionId]/[currentConceptIndex]`
3. `TeachingClient` loads session via `getSession` query
4. `TeachingLayout` restores canvas from `currentExplanation.canvasData`
5. Dialogue history loaded from `currentDialogue.messages`

### Delete Session Flow
1. User clicks trash icon on session card
2. Confirmation dialog appears
3. User confirms deletion
4. `deleteSession` mutation called
5. Session and sourceMaterial records deleted
6. UI updates via Convex reactivity
