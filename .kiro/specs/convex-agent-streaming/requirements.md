# Requirements Document - Convex Agent Streaming

## Introduction

Migrate the AI student chat from Vercel API routes to Convex Agent with delta streaming. This enables RAG retrieval and AI generation to happen in the same environment, reducing latency and ensuring questions are grounded in source material.

## Problem Statement

Currently, AI student questions don't reference the source material because:
1. The `retrieveRelevantChunks` action exists but is never called
2. RAG chunks are hardcoded as empty arrays in `useDialogueHandlers.ts`
3. The Vercel→Convex round-trip adds unnecessary latency

## Requirements

### Requirement 1

**User Story:** As a learner, I want AI questions to consider both clarity and accuracy together so that the conversation stays focused on the topic

#### Acceptance Criteria

1. THE AI student SHALL consider both clarity and accuracy in a single unified prompt
2. WHEN source material exists, THE system SHALL retrieve top 5 relevant chunks and include them in the AI context
3. THE AI SHALL keep questions focused on the current concept being taught
4. WHEN no source material exists, THE system SHALL fallback to the existing Vercel clarity-only function
5. THE AI SHALL naturally blend clarity and accuracy concerns rather than asking them separately

### Requirement 2

**User Story:** As a learner, I want to see AI responses stream in real-time so that the conversation feels natural

#### Acceptance Criteria

1. THE AI response SHALL stream progressively as it's generated
2. THE streaming indicator SHALL appear while AI is generating
3. THE system SHALL handle network interruptions gracefully (resume streaming)
4. THE time-to-first-token SHALL be under 1 second

### Requirement 3

**User Story:** As a developer, I want the chat logic consolidated in Convex so that RAG and AI calls don't require network round-trips

#### Acceptance Criteria

1. THE chat action SHALL run entirely in Convex (no Vercel API route)
2. THE RAG retrieval SHALL happen in the same action as AI generation
3. THE system SHALL use Convex delta streaming for real-time updates
4. THE existing dialogue storage format SHALL be preserved

### Requirement 4

**User Story:** As a learner, I want hints to also use source material so that they guide me toward accurate explanations

#### Acceptance Criteria

1. THE hint generation SHALL include relevant source chunks
2. THE hints SHALL reference specific parts of the source when helpful
3. THE hint streaming SHALL work the same as chat streaming

## Out of Scope

- Migrating to Convex RAG component (keep existing `sourceMaterial.chunks`)
- Changing the dialogue UI/UX
- Adding new AI features
- Authentication changes

## Technical Constraints

- Must use `@convex-dev/agent` package for delta streaming
- Must preserve existing `sessions.dialogues` data structure
- Must support multimodal input (canvas images)
- Must work with existing Clerk authentication
- Fallback to existing `generateClarityQuestions` Vercel action when no source material
