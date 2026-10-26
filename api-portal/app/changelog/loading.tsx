import { Skeleton } from '../components/Skeleton';

function ReleaseSkeleton({ entries }: { entries: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mt-2 h-4 w-3/4" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: entries }, (_, index) => (
          <div key={index} className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[6rem_minmax(0,1fr)]">
            <Skeleton className="h-4 w-16" />
            <Skeleton className={`h-4 ${index % 2 === 0 ? 'w-full' : 'w-4/5'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <span className="sr-only">Cargando las novedades…</span>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="mt-3 h-4 w-2/3" />
      <div className="mt-10 space-y-12">
        <ReleaseSkeleton entries={6} />
        <ReleaseSkeleton entries={5} />
      </div>
    </div>
  );
}
