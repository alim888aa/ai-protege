# Requirements Document

## Introduction

The AI Protégé is a learning application that implements the Feynman Technique by having users teach an AI about a topic. The system uses two different AI models (Frankenstein approach) - a vision model for analyzing drawings and an embedding/text model for fact-checking explanations against source material. Users provide a source URL, teach the AI through drawings and text, and receive scored feedback on their teaching effectiveness.

## Glossary

- **Teaching System**: The complete AI Protégé application
- **Vision Model**: GPT-5 nano model that analyzes user drawings
- **RAG System**: Retrieval-Augmented Generation system using OpenAI embeddings for fact-checking
- **Text Model**: GPT-5 mini model for generating feedback and analysis
- **Source Material**: Web content scraped from user-provided URL
- **Teaching Session**: A complete cycle of setup, teaching, and evaluation
- **Teaching Score**: Numerical evaluation (0-100) of user's teaching effectiveness
- **Canvas Component**: tldraw-based drawing interface
- **Score Breakdown**: Detailed metrics including Clarity, Accuracy, and Completeness

## Requirements

### Requirement 1

**User Story:** As a learner, I want to provide a topic and source URL so that I can prepare to teach the AI about specific content

#### Acceptance Criteria

1. THE Teaching System SHALL display a setup screen with input fields for topic name and source URL
2. WHEN the user submits a valid URL, THE Teaching System SHALL scrape the web content from the provided URL
3. WHEN the user submits an invalid URL, THE Teaching System SHALL display an error message indicating the URL cannot be accessed
4. THE Teaching System SHALL process the scraped content into text chunks suitable for the RAG System
5. THE Teaching System SHALL store the processed chunks and embeddings in Convex database
6. WHEN content processing completes, THE Teaching System SHALL navigate the user to the teaching screen

### Requirement 2

**User Story:** As a learner, I want to draw diagrams and write explanations so that I can teach the AI using multiple modalities

#### Acceptance Criteria

1. THE Teaching System SHALL display a Canvas Component for creating drawings
2. THE Teaching System SHALL display a text input area for writing explanations
3. THE Teaching System SHALL allow the user to draw freely on the Canvas Component using tldraw functionality
4. THE Teaching System SHALL allow the user to type text explanations up to 5000 characters
5. WHEN the user exceeds 5000 characters, THE Teaching System SHALL display a character count warning
6. WHEN the user clicks submit, THE Teaching System SHALL capture both the canvas drawing as an image and the text explanation

### Requirement 3

**User Story:** As a learner, I want the AI to analyze my drawing so that I receive feedback on my visual explanation

#### Acceptance Criteria

1. WHEN the user submits their teaching, THE Teaching System SHALL send the canvas drawing to the Vision Model
2. THE Vision Model SHALL analyze the drawing and extract visual concepts and relationships
3. THE Teaching System SHALL receive structured analysis from the Vision Model describing what was drawn
4. THE Teaching System SHALL use the Vision Model analysis as input for generating the final Teaching Score

### Requirement 4

**User Story:** As a learner, I want the AI to fact-check my text explanation so that I know if my understanding is accurate

#### Acceptance Criteria

1. WHEN the user submits their teaching, THE Teaching System SHALL use the RAG System to retrieve relevant chunks from the Source Material
2. THE RAG System SHALL generate embeddings for the user's text explanation
3. THE RAG System SHALL retrieve the top 5 most similar chunks from the Source Material based on embedding similarity
4. THE Teaching System SHALL identify factual discrepancies between the user's explanation and the retrieved Source Material chunks
5. THE Teaching System SHALL use the RAG System results as input for generating the final Teaching Score

### Requirement 5

**User Story:** As a learner, I want both AI models to work together so that I receive comprehensive feedback on my teaching

#### Acceptance Criteria

1. THE Teaching System SHALL send both Vision Model analysis and RAG System results to the Text Model
2. THE Text Model SHALL synthesize insights from both the Vision Model and RAG System
3. THE Text Model SHALL identify unclear sections in the user's teaching
4. THE Text Model SHALL identify inaccuracies in the user's teaching
5. THE Text Model SHALL identify missing key concepts from the Source Material

### Requirement 6

**User Story:** As a learner, I want to receive a Teaching Score with detailed breakdown so that I understand my teaching effectiveness

#### Acceptance Criteria

1. THE Teaching System SHALL calculate a Teaching Score between 0 and 100
2. THE Teaching System SHALL calculate a Clarity score measuring how well concepts were explained
3. THE Teaching System SHALL calculate an Accuracy score measuring factual correctness
4. THE Teaching System SHALL calculate a Completeness score measuring coverage of key concepts
5. THE Teaching System SHALL display the overall Teaching Score and Score Breakdown on the results screen
6. THE Teaching System SHALL display specific feedback about unclear sections, inaccuracies, and missing concepts

### Requirement 7

**User Story:** As a learner, I want the source material processing to happen efficiently so that I can start teaching quickly

#### Acceptance Criteria

1. WHEN the Teaching System scrapes a URL, THE Teaching System SHALL extract only text content and ignore images, scripts, and styles
2. THE Teaching System SHALL split the scraped content into chunks of maximum 1000 characters with 200 character overlap
3. THE Teaching System SHALL generate embeddings for each chunk using OpenAI embeddings API
4. THE Teaching System SHALL store the chunks and embeddings in Convex database
5. WHEN scraping or processing fails, THE Teaching System SHALL display a user-friendly error message with retry option
