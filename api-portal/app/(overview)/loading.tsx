import { OverviewColumn } from '../components/OverviewColumn';
import { Skeleton, SkeletonBlock } from '../components/Skeleton';

const decoration = <Skeleton className="absolute inset-0 rounded-none" />;

export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando el resumen…</span>
      <div className="hidden min-h-dvh bg-white xl:grid xl:h-dvh xl:grid-cols-5">
        <OverviewColumn topSpace="large" upperDecoration={decoration} />
        <OverviewColumn topSpace="small" upperContent={<SkeletonBlock />} lowerContent={<SkeletonBlock lines={5} />} />
        <OverviewColumn topSpace="large" upperContent={<SkeletonBlock lines={4} />} lowerContent={<SkeletonBlock />} />
        <OverviewColumn topSpace="small" upperContent={<SkeletonBlock />} lowerDecoration={decoration} />
        <OverviewColumn topSpace="large" />
      </div>
      <div className="flex flex-col bg-white xl:hidden">
        <Skeleton className="h-40 rounded-none border-b border-overview-border" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="border-b border-overview-border p-5">
            <SkeletonBlock />
          </div>
        ))}
      </div>
    </div>
  );
}
