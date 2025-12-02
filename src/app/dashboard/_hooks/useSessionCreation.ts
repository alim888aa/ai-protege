'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { extractConcepts } from '../../actions/extractConcepts';

export type Step = 'topic' | 'source';
export type SourceType = 'url' | 'pdf' | 'none';

export function useSessionCreation() {
  const router = useRouter();

  // Convex hooks
  const scrapeSource = useAction(api.actions.scrapeSource.scrapeSource);
  const processPdf = useAction(api.actions.processPdf.processPdf);
  const createManualSourceMaterial = useMutation(api.mutations.createManualSourceMaterial);
  const updateConceptsInSourceMaterial = useMutation(api.mutations.updateConceptsInSourceMaterial);

  // Form state
  const [step, setStep] = useState<Step>('topic');
  const [topic, setTopic] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [sourceUrl, setSourceUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL validation
  const validateUrl = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return 'Only HTTP and HTTPS URLs are supported.';
      }
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return 'Cannot use localhost or private IP addresses.';
      }
      return null;
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
  }, []);

  // Processing message based on source type
  const processingMessage = (() => {
    if (sourceType === 'url') {
      return "We're scraping the content and preparing it for your teaching session.";
    } else if (sourceType === 'pdf') {
      return "We're extracting text from your PDF and preparing it for your teaching session.";
    }
    return 'Setting up your session...';
  })();

  const handleNext = useCallback(() => {
    if (topic.trim()) {
      setStep('source');
    }
  }, [topic]);

  const handleBack = useCallback(() => {
    setStep('topic');
    setError(null);
  }, []);

  const handleStart = useCallback(async () => {
    setError(null);

    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    // Validate based on source type
    if (sourceType === 'url' && !sourceUrl.trim()) {
      setError('Please enter a source URL.');
      return;
    }
    if (sourceType === 'url') {
      const urlError = validateUrl(sourceUrl);
      if (urlError) {
        setError(urlError);
        return;
      }
    }
    if (sourceType === 'pdf' && !pdfFile) {
      setError('Please select a PDF file.');
      return;
    }

    setIsProcessing(true);

    try {
      let sessionId: string;
      let sourceText: string | undefined;

      if (sourceType === 'url') {
        const result = await scrapeSource({
          topic: topic.trim(),
          sourceUrl: sourceUrl.trim(),
        });

        if (result.error) {
          setError(result.error);
          setIsProcessing(false);
          return;
        }

        if (!result.sessionId || !result.sourceText) {
          setError('Failed to create session. Please try again.');
          setIsProcessing(false);
          return;
        }

        sessionId = result.sessionId;
        sourceText = result.sourceText;
      } else if (sourceType === 'pdf') {
        const pdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(pdfFile!);
        });

        const result = await processPdf({
          topic: topic.trim(),
          pdfBase64,
        });

        if (result.error) {
          setError(result.error);
          setIsProcessing(false);
          return;
        }

        if (!result.sessionId || !result.sourceText) {
          setError('Failed to process PDF. Please try again.');
          setIsProcessing(false);
          return;
        }

        sessionId = result.sessionId;
        sourceText = result.sourceText;
      } else {
        // No source - manual concepts mode
        sessionId = crypto.randomUUID();
        await createManualSourceMaterial({
          sessionId,
          topic: topic.trim(),
        });
        router.push(`/review/${sessionId}`);
        return;
      }

      // Extract concepts from source text
      try {
        const concepts = await extractConcepts(topic.trim(), sourceText!);

        if (!concepts || concepts.length === 0) {
          setError('Failed to extract concepts from the source material. Please try again.');
          setIsProcessing(false);
          return;
        }

        await updateConceptsInSourceMaterial({
          sessionId,
          concepts,
        });

        router.push(`/review/${sessionId}`);
      } catch (conceptError) {
        setError(
          conceptError instanceof Error
            ? `Failed to extract concepts: ${conceptError.message}`
            : 'Failed to extract concepts. Please try again.'
        );
        setIsProcessing(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
      setIsProcessing(false);
    }
  }, [
    topic,
    sourceType,
    sourceUrl,
    pdfFile,
    validateUrl,
    scrapeSource,
    processPdf,
    createManualSourceMaterial,
    updateConceptsInSourceMaterial,
    router,
  ]);

  return {
    step,
    topic,
    setTopic,
    sourceType,
    setSourceType,
    sourceUrl,
    setSourceUrl,
    pdfFile,
    setPdfFile,
    isProcessing,
    error,
    setError,
    processingMessage,
    handleNext,
    handleBack,
    handleStart,
  };
}
