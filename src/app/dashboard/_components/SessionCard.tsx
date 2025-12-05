'use client';

import { useRouter } from 'next/navigation';

interface SessionCardProps {
  session: {
    sessionId: string;
    topic: string;
    sourceUrl?: string;
    sourceType?: 'url' | 'pdf' | 'none';
    concepts: Array<{ id: string; title: string; description: string }>;
    currentConceptIndex: number;
    completed: boolean;
    updatedAt: number;
  };
  onDelete: (sessionId: string) => void;
}

/**
 * Truncates a URL to a maximum length, preserving the domain
 */
function truncateUrl(url: string, maxLength: number = 30): string {
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // If domain alone is too long, truncate it
    if (domain.length >= maxLength - 3) {
      return domain.substring(0, maxLength - 3) + '...';
    }
    
    // Show domain + beginning of path
    const remaining = maxLength - domain.length - 3;
    const path = urlObj.pathname;
    
    if (path.length > 1 && remaining > 0) {
      return domain + path.substring(0, remaining) + '...';
    }
    
    return domain + '...';
  } catch {
    // If URL parsing fails, just truncate the string
    return url.substring(0, maxLength - 3) + '...';
  }
}

/**
 * Formats a timestamp into a relative time string
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else if (weeks < 4) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const router = useRouter();
  const { sessionId, topic, sourceUrl, sourceType, concepts, currentConceptIndex, completed, updatedAt } = session;
  
  // Session is effectively complete if marked complete OR all concepts have been covered
  // (handles case where user navigates away from complete page without clicking "Looks correct!")
  const isEffectivelyComplete = completed || currentConceptIndex >= concepts.length;
  
  // Determine source display text
  const getSourceDisplay = () => {
    if (sourceType === 'pdf') {
      return 'PDF Upload';
    }
    if (sourceType === 'url' && sourceUrl) {
      return truncateUrl(sourceUrl);
    }
    return 'Manual';
  };
  const sourceDisplay = getSourceDisplay();
  
  // Determine progress display
  const progressDisplay = isEffectivelyComplete 
    ? 'Complete ✓' 
    : `${currentConceptIndex}/${concepts.length} concepts`;
  
  // Format relative time
  const timeDisplay = formatRelativeTime(updatedAt);

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Topic title */}
      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1" title={topic}>
        {topic}
      </h3>
      
      {/* Source URL or Manual */}
      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2" title={sourceUrl || 'Manual'}>
        {sourceDisplay}
      </p>
      
      {/* Progress */}
      <p className={`text-sm mb-2 ${isEffectivelyComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
        {progressDisplay}
      </p>
      
      {/* Relative time */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        {timeDisplay}
      </p>
      
      {/* Action buttons row */}
      <div className="flex justify-between items-center">
        {isEffectivelyComplete ? (
          <button
            onClick={() => router.push(`/complete/${sessionId}`)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Review
          </button>
        ) : (
          <button
            onClick={() => router.push(`/teach/${sessionId}/${currentConceptIndex}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Continue
          </button>
        )}
        <button
          onClick={() => onDelete(sessionId)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label="Delete session"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
