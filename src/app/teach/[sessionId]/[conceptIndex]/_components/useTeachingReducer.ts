'use client';

import { useReducer, useCallback } from 'react';

// Types
export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  type?: 'hint' | 'message';
}

interface TeachingState {
  // Input
  dialogueInput: string;
  
  // Submission
  isSubmitting: boolean;
  pendingUserMessage: string | null; // Show user message while waiting for AI
  
  // Streaming
  isStreaming: boolean;
  streamingContent: string;
  
  // UI
  isMessagePanelCollapsed: boolean;
  error: string | null;
  
  // Hints
  isHintModalOpen: boolean;
  hints: (string | null)[];
  currentHintPage: number;
  hintCount: number;
  isGeneratingHint: boolean;
  streamingHint: string;
}

type TeachingAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'STREAM_START' }
  | { type: 'STREAM_UPDATE'; payload: string }
  | { type: 'STREAM_END' }
  | { type: 'TOGGLE_MESSAGE_PANEL' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPEN_HINT_MODAL' }
  | { type: 'CLOSE_HINT_MODAL' }
  | { type: 'SET_HINT_PAGE'; payload: number }
  | { type: 'HINT_GENERATE_START' }
  | { type: 'HINT_STREAM_UPDATE'; payload: string }
  | { type: 'HINT_GENERATE_SUCCESS'; payload: { hintNumber: number; content: string } }
  | { type: 'HINT_GENERATE_ERROR'; payload: string };

const initialState: TeachingState = {
  dialogueInput: '',
  isSubmitting: false,
  pendingUserMessage: null,
  isStreaming: false,
  streamingContent: '',
  isMessagePanelCollapsed: false,
  error: null,
  isHintModalOpen: false,
  hints: [null, null, null],
  currentHintPage: 0,
  hintCount: 0,
  isGeneratingHint: false,
  streamingHint: '',
};

function teachingReducer(state: TeachingState, action: TeachingAction): TeachingState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, dialogueInput: action.payload };
      
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        pendingUserMessage: state.dialogueInput,
        dialogueInput: '',
        error: null,
      };
      
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        pendingUserMessage: null,
      };
      
    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        pendingUserMessage: null,
        error: action.payload,
      };
      
    case 'STREAM_START':
      return { ...state, isStreaming: true, streamingContent: '' };
      
    case 'STREAM_UPDATE':
      return { ...state, streamingContent: action.payload };
      
    case 'STREAM_END':
      return { ...state, isStreaming: false, streamingContent: '' };
      
    case 'TOGGLE_MESSAGE_PANEL':
      return { ...state, isMessagePanelCollapsed: !state.isMessagePanelCollapsed };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'OPEN_HINT_MODAL':
      return { ...state, isHintModalOpen: true };
      
    case 'CLOSE_HINT_MODAL':
      return { ...state, isHintModalOpen: false };
      
    case 'SET_HINT_PAGE':
      return { ...state, currentHintPage: action.payload };
      
    case 'HINT_GENERATE_START':
      return { ...state, isGeneratingHint: true, streamingHint: '' };
      
    case 'HINT_STREAM_UPDATE':
      return { ...state, streamingHint: action.payload };
      
    case 'HINT_GENERATE_SUCCESS': {
      const newHints = [...state.hints];
      newHints[action.payload.hintNumber - 1] = action.payload.content;
      return {
        ...state,
        isGeneratingHint: false,
        streamingHint: '',
        hints: newHints,
        hintCount: action.payload.hintNumber,
      };
    }
      
    case 'HINT_GENERATE_ERROR':
      return {
        ...state,
        isGeneratingHint: false,
        streamingHint: '',
        error: action.payload,
      };
      
    default:
      return state;
  }
}

export function useTeachingReducer() {
  const [state, dispatch] = useReducer(teachingReducer, initialState);
  
  // Convenience action creators
  const actions = {
    setInput: useCallback((value: string) => 
      dispatch({ type: 'SET_INPUT', payload: value }), []),
    submitStart: useCallback(() => 
      dispatch({ type: 'SUBMIT_START' }), []),
    submitSuccess: useCallback(() => 
      dispatch({ type: 'SUBMIT_SUCCESS' }), []),
    submitError: useCallback((error: string) => 
      dispatch({ type: 'SUBMIT_ERROR', payload: error }), []),
    streamStart: useCallback(() => 
      dispatch({ type: 'STREAM_START' }), []),
    streamUpdate: useCallback((content: string) => 
      dispatch({ type: 'STREAM_UPDATE', payload: content }), []),
    streamEnd: useCallback(() => 
      dispatch({ type: 'STREAM_END' }), []),
    toggleMessagePanel: useCallback(() => 
      dispatch({ type: 'TOGGLE_MESSAGE_PANEL' }), []),
    setError: useCallback((error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }), []),
    openHintModal: useCallback(() => 
      dispatch({ type: 'OPEN_HINT_MODAL' }), []),
    closeHintModal: useCallback(() => 
      dispatch({ type: 'CLOSE_HINT_MODAL' }), []),
    setHintPage: useCallback((page: number) => 
      dispatch({ type: 'SET_HINT_PAGE', payload: page }), []),
    hintGenerateStart: useCallback(() => 
      dispatch({ type: 'HINT_GENERATE_START' }), []),
    hintStreamUpdate: useCallback((content: string) => 
      dispatch({ type: 'HINT_STREAM_UPDATE', payload: content }), []),
    hintGenerateSuccess: useCallback((hintNumber: number, content: string) => 
      dispatch({ type: 'HINT_GENERATE_SUCCESS', payload: { hintNumber, content } }), []),
    hintGenerateError: useCallback((error: string) => 
      dispatch({ type: 'HINT_GENERATE_ERROR', payload: error }), []),
  };
  
  return { state, dispatch, actions };
}
