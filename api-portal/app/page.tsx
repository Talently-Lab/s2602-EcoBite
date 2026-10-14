import { OverviewColumn } from './components/OverviewColumn';
import { DitherDecoration } from './components/DitherDecoration';

export default function OverviewPage() {
  return (
    <section aria-label="Overview" className="grid h-dvh min-w-0 grid-cols-5 border-l border-sidebar-border bg-white text-[clamp(0.625rem,1vw,0.875rem)] text-heading">
      <OverviewColumn topSpace="large" topDecoration={<DitherDecoration variant="dark" />} />
      <OverviewColumn
        topSpace="small"
        upperContent={
          <div className="space-y-4">
            <p>La API de EcoBite para delivery de comida sustentable.</p>
            <p className="hidden xl:block">
              Este portal muestra su documentación, su estado y sus cambios al equipo y al frontend.
            </p>
          </div>
        }
        lowerContent={<h2>Endpoints</h2>}
        bottomDecoration={<DitherDecoration variant="soft" />}
      />
      <OverviewColumn
        topSpace="large"
        upperContent={<h2>Status</h2>}
        lowerContent={<h2>Changelog</h2>}
      />
      <OverviewColumn
        topSpace="small"
        upperContent={<h2>API Docs</h2>}
        topDecoration={<DitherDecoration variant="cream" />}
      />
      <OverviewColumn
        topSpace="large"
        bottomDecoration={<DitherDecoration variant="brand" />}
      />
    </section>
  );
}
