'use client';

import { useState, useEffect, useCallback } from 'react';
import { PenTool, MessageCircle, Lightbulb, Navigation, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.excalidraw .Island.App-toolbar',
    title: 'Drawing Tools',
    description: 'Use these tools to sketch diagrams, shapes, and visuals. Drawing helps organize your thoughts.',
    icon: <PenTool className="w-5 h-5" />,
    position: 'bottom',
  },
  {
    target: '[data-tour="input-panel"]',
    title: 'Text Explanation',
    description: 'Type your explanation here. Combine your drawing with written text to teach the concept clearly.',
    icon: <MessageCircle className="w-5 h-5" />,
    position: 'top',
  },
  {
    target: '[data-tour="message-panel"]',
    title: 'AI Student Chat',
    description: 'Your AI student will ask questions here. Read their questions and respond to help them understand.',
    icon: <MessageCircle className="w-5 h-5" />,
    position: 'left',
  },
  {
    target: '[data-tour="hint-button"]',
    title: 'Need Help?',
    description: 'Stuck? Click here for hints. You get 3 hints per concept to guide your thinking.',
    icon: <Lightbulb className="w-5 h-5" />,
    position: 'left',
  },
  {
    target: '[data-tour="navigation"]',
    title: 'Navigation',
    description: 'Move between concepts here. Complete at least one exchange with the AI before proceeding.',
    icon: <Navigation className="w-5 h-5" />,
    position: 'top',
  },
];

interface TeachingTourProps {
  topicName: string;
  onComplete: () => void;
}

export function TeachingTour({ topicName, onComplete }: TeachingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const updateHighlight = useCallback(() => {
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);
    if (element) {
      setHighlightRect(element.getBoundingClientRect());
    }
  }, [currentStep]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    return () => window.removeEventListener('resize', updateHighlight);
  }, [updateHighlight]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < tourSteps.length - 1) {
          setCurrentStep((s) => s + 1);
        } else {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep((s) => s - 1);
        }
      }
    },
    [currentStep, onComplete]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  // Calculate tooltip position with viewport clamping
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightRect) return { opacity: 0 };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let left = 0;
    let top = 0;

    switch (step.position) {
      case 'right':
        left = highlightRect.right + padding;
        top = highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2;
        break;
      case 'left':
        left = highlightRect.left - tooltipWidth - padding;
        top = highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2;
        break;
      case 'top':
        left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2;
        top = highlightRect.top - tooltipHeight - padding;
        break;
      case 'bottom':
        left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2;
        top = highlightRect.bottom + padding;
        break;
    }

    // Clamp to viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    return { left, top };
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border */}
      {highlightRect && (
        <div
          className="absolute border-2 border-indigo-500 rounded-xl pointer-events-none animate-pulse"
          style={{
            left: highlightRect.left - 8,
            top: highlightRect.top - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute w-80 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-200"
        style={getTooltipStyle()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            {step.icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Teaching: {topicName}
            </p>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {step.title}
            </h3>
          </div>
          <button
            onClick={onComplete}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {step.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? 'bg-indigo-600'
                    : idx < currentStep
                    ? 'bg-indigo-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => (isLastStep ? onComplete() : setCurrentStep((s) => s + 1))}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              {isLastStep ? 'Start Teaching' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Use arrow keys to navigate • Esc to skip
        </p>
      </div>
    </div>
  );
}
