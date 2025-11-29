'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-zinc-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1rem' : undefined),
  };

  if (lines > 1 && variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Skeleton for concept cards in review screen
export function ConceptCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-fadeIn">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton width="40%" height="0.875rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
        <Skeleton variant="circular" width={36} height={36} className="ml-4 mt-7" />
      </div>
      <div>
        <Skeleton width="30%" height="0.875rem" className="mb-2" />
        <Skeleton lines={3} />
      </div>
    </div>
  );
}

// Skeleton for dialogue messages
export function DialogueMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div
      className={`p-4 rounded-lg animate-pulse ${
        isUser
          ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
          : 'bg-gray-100 dark:bg-zinc-700 mr-8'
      }`}
    >
      <Skeleton width="4rem" height="0.75rem" className="mb-2" />
      <Skeleton lines={2} />
    </div>
  );
}

// Skeleton for the teaching screen left panel
export function TeachingPanelSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <Skeleton width="60%" height="1.5rem" />
      <Skeleton variant="rectangular" height="300px" />
      <Skeleton lines={4} />
    </div>
  );
}
