type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-sidebar-hover motion-reduce:animate-none ${className}`} />;
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden="true" className="space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={`h-3 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
