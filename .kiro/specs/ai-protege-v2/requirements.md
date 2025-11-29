# Requirements Document - AI Protégé v2

## Introduction

The AI Protégé v2 is a learning application that implements the Feynman Technique by having users teach an AI "12-year-old student" about a topic. The AI asks questions in real-time, requests simplification, and helps users identify gaps in their understanding through interactive dialogue. Users provide a source URL, the system extracts key concepts, and users teach each concept one at a time through drawings and text explanations.

## Glossary

- **Teaching System**: The complete AI Protégé application
- **AI Student**: GPT-5 nano model acting as a curious 12-year-old learner
- **RAG System**: Retrieval-Augmented Generation system using OpenAI embeddings for fact-checking
- **Source Material**: Web content scraped from user-provided URL
- **Key Concepts**: 3-5 main topics extracted from source material that user must teach
- **Teaching Session**: A complete cycle of setup, concept extraction, teaching, and completion
- **Canvas Component**: tldraw-based drawing interface
- **Concept Page**: Individual teaching screen for one key concept
- **Dialogue Mode**: Real-time conversational interaction between user and AI student
- **Jargon**: Complex technical terms from source material that require simplification

## Requirements

### Requirement 1

**User Story:** As a learner, I want to provide a topic and source URL so that I can prepare to teach the AI about specific content

#### Acceptance Criteria

1. THE Teaching System SHALL display a setup screen with input fields for topic name and source URL
2. WHEN the user submits a valid URL, THE Teaching System SHALL scrape the web content from the provided URL
3. WHEN the user submits an invalid URL, THE Teaching System SHALL display an error message indicating the URL cannot be accessed
4. THE Teaching System SHALL process the scraped content into text chunks suitable for the RAG System
5. THE Teaching System SHALL store the processed chunks and embeddings in Convex database
6. WHEN content processing completes, THE Teaching System SHALL extract 3-5 key concepts from the source material using AI
7. THE Teaching System SHALL navigate the user to the concept review screen

### Requirement 2

**User Story:** As a learner, I want to review and edit the extracted concepts so that I can ensure they match what I want to learn

#### Acceptance Criteria

1. THE Teaching System SHALL display a concept review screen showing the extracted key concepts
2. THE Teaching System SHALL display each concept with a title and brief description
3. THE Teaching System SHALL allow the user to edit any concept title or description
4. THE Teaching System SHALL allow the user to delete concepts from the list
5. THE Teaching System SHALL allow the user to add new concepts manually
6. THE Teaching System SHALL require at least 1 concept before proceeding
7. THE Teaching System SHALL limit the maximum number of concepts to 10
8. WHEN the user confirms the concepts, THE Teaching System SHALL navigate to the first concept teaching screen

### Requirement 3

**User Story:** As a learner, I want to teach one concept at a time so that I can focus on explaining each topic thoroughly

#### Acceptance Criteria

1. THE Teaching System SHALL display a concept teaching screen for one concept at a time
2. THE Teaching System SHALL show a progress indicator (e.g., "Concept 2/5")
3. THE Teaching System SHALL display the concept title at the top of the screen
4. THE Teaching System SHALL provide a Canvas Component for drawing diagrams
5. THE Teaching System SHALL provide a text area for writing explanations
6. THE Teaching System SHALL display a "Done Explaining" button
7. WHEN the user clicks "Done Explaining", THE Teaching System SHALL trigger AI evaluation of that concept
8. THE Teaching System SHALL disable the "Done Explaining" button while AI is processing

### Requirement 4

**User Story:** As a learner, I want the AI to ask me questions about my explanation so that I can identify gaps in my understanding

#### Acceptance Criteria

1. WHEN the user clicks "Done Explaining", THE Teaching System SHALL make two parallel AI calls:
   - Call 1: Clarity/Simplicity check (canvas image + text explanation)
   - Call 2: Accuracy check (text explanation + RAG chunks from source material)
2. THE Teaching System SHALL retrieve relevant chunks from source material using the RAG System in parallel with Call 1
3. THE AI Student SHALL generate 1-2 questions about clarity and simplicity from Call 1
4. THE AI Student SHALL generate 1-2 questions about accuracy from Call 2
5. THE Teaching System SHALL display all questions (2-4 total) in the right panel as they arrive
6. THE AI Student SHALL act as a curious 12-year-old with no prior knowledge of the topic
7. THE AI Student SHALL ask for simplification when complex terms are used
8. THE AI Student SHALL request drawings when concepts are abstract
9. THE Teaching System SHALL provide a text input for the user to respond to questions
10. THE Teaching System SHALL allow the user to continue the dialogue until they click "Move to Next Concept"

### Requirement 5

**User Story:** As a learner, I want jargon in my explanation to be highlighted so that I can choose to simplify complex terms

#### Acceptance Criteria

1. WHEN source material is scraped, THE Teaching System SHALL extract complex technical terms (jargon words)
2. THE Teaching System SHALL store the jargon words list in the session
3. WHEN the user types in the text area, THE Teaching System SHALL check for jargon words in real-time
4. WHEN a jargon word is detected, THE Teaching System SHALL highlight the jargon word in the user's text
5. WHEN the user hovers over a highlighted jargon word, THE Teaching System SHALL display a tooltip with the text "Simplify this?"
6. THE tooltip SHALL be informational only and not trigger any AI calls

### Requirement 6

**User Story:** As a learner, I want hints when I'm stuck so that I can continue learning without getting frustrated

#### Acceptance Criteria

1. THE Teaching System SHALL track user activity with a frontend timer
2. WHEN the user has not typed or drawn for 30 seconds, THE Teaching System SHALL display a "Need a Hint?" button
3. WHEN the user clicks "Need a Hint?", THE Teaching System SHALL send a request to the AI Student for a hint
4. THE AI Student SHALL provide a leading clue without giving away the full answer
5. IF the user requests a second hint, THE AI Student SHALL provide a more specific clue
6. IF the user requests a third hint, THE Teaching System SHALL display a popup with the relevant source excerpt
7. THE Teaching System SHALL allow the user to close the hint and continue teaching

### Requirement 7

**User Story:** As a learner, I want the AI to request analogies so that I can explain concepts in relatable terms

#### Acceptance Criteria

1. IF the AI Student determines the user's explanation is correct but abstract, IT SHALL include a request for an analogy in its response
2. THE AI Student SHALL ask: "Can you explain this using an analogy or comparison?"
3. WHEN the user provides an analogy, THE AI Student SHALL ask follow-up questions about the analogy
4. THE AI Student SHALL ask: "How is [concept] similar to [analogy]?" or "Where does the analogy break down?"
5. THE Teaching System SHALL allow the user to skip the analogy request if they prefer

### Requirement 8

**User Story:** As a learner, I want to see my progress through all concepts so that I know how much I have left to teach

#### Acceptance Criteria

1. THE Teaching System SHALL display a progress indicator on every concept teaching screen
2. THE progress indicator SHALL show current concept number and total (e.g., "Concept 3/5")
3. THE Teaching System SHALL provide a "Move to Next Concept" button after the user has engaged with AI questions
4. WHEN the user clicks "Move to Next Concept", THE Teaching System SHALL save the current concept progress
5. THE Teaching System SHALL navigate to the next concept teaching screen
6. WHEN all concepts are completed, THE Teaching System SHALL navigate to the completion screen

### Requirement 9

**User Story:** As a learner, I want the AI to summarize what it learned so that I can verify my teaching was effective

#### Acceptance Criteria

1. WHEN all concepts are taught, THE Teaching System SHALL display a completion screen
2. THE AI Student SHALL generate a summary of the entire topic using the user's explanations
3. THE AI Student SHALL say: "I think I understand [topic] now! Let me explain it back to you:"
4. THE Teaching System SHALL display the AI's summary
5. THE Teaching System SHALL provide options: "That's correct!" or "Let me clarify..."
6. IF the user chooses "Let me clarify", THE Teaching System SHALL allow additional teaching
7. IF the user chooses "That's correct!", THE Teaching System SHALL display a completion message
8. THE Teaching System SHALL provide a "Start New Session" button to return to setup

### Requirement 10

**User Story:** As a learner, I want the system to respond quickly so that the teaching dialogue feels natural

#### Acceptance Criteria

1. THE Teaching System SHALL complete concept extraction within 10 seconds
2. THE Teaching System SHALL generate AI questions within 10 seconds of user clicking "Done Explaining"
3. THE Teaching System SHALL generate hint responses within 10 seconds
4. THE Teaching System SHALL generate the final summary within 15 seconds
5. THE Teaching System SHALL display loading indicators during all AI processing
6. THE Teaching System SHALL handle API errors gracefully with retry options

### Requirement 11

**User Story:** As a learner, I want my teaching session to be saved so that I can track my progress

#### Acceptance Criteria

1. THE Teaching System SHALL store the session ID in the URL
2. THE Teaching System SHALL save all user explanations and AI responses to Convex database
3. THE Teaching System SHALL save dialogue history for each concept
