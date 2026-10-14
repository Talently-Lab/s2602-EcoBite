import { OverviewColumn } from './components/OverviewColumn';
import { EndpointList } from './components/EndpointList';
import { StatusSummary } from './components/StatusSummary';
import { ChangelogSummary } from './components/ChangelogSummary';
import { ImageDitheringDecoration } from './components/ImageDitheringDecoration';
import { PortalLink } from './components/PortalLink';

// Replace this URL with the image used for the footer background.
const FOOTER_IMAGE_URL = 'https://i.ibb.co/Nn7zPNk8/Screenshot-2026-10-14-144106.png';

export default function OverviewPage() {
  return (
    <section aria-label="Overview" className="grid h-dvh min-w-0 grid-cols-5 border-l border-sidebar-border bg-white text-[clamp(0.625rem,1vw,0.875rem)] text-heading">
      <OverviewColumn
        topSpace="large"
        upperDecoration={<ImageDitheringDecoration invertColors={false} />}
      />
      <OverviewColumn
        topSpace="small"
        upperContent={
          <div className="space-y-4">
            <h2 className="font-semibold">Overview</h2>
            <p>La API de EcoBite para delivery de comida sustentable.</p>
            <p className="hidden xl:block">
              Este portal muestra su documentación, su estado y sus cambios al equipo y al frontend.
            </p>
          </div>
        }
        lowerContent={
          <div>
            <h2 className="font-semibold">Endpoints</h2>
            <p className="mt-3">Lista de endpoints.</p>
            <EndpointList />
          </div>
        }
        lowerAction={<PortalLink href="/docs">Todos</PortalLink>}
      />
      <OverviewColumn
        topSpace="large"
        upperContent={
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="font-semibold">Status</h2>
              <span role="status" className="font-semibold text-brand-dark">
                All Systems Operational
              </span>
            </div>
            <StatusSummary />
          </div>
        }
        upperAction={<PortalLink href="/status">Vistazo</PortalLink>}
        lowerContent={
          <div>
            <h2 className="font-semibold">Changelog</h2>
            <ChangelogSummary />
          </div>
        }
        lowerAction={<PortalLink href="/changelog">Detalles</PortalLink>}
      />
      <OverviewColumn
        topSpace="small"
        upperContent={
          <div className="space-y-4">
            <h2 className="font-semibold">API Docs</h2>
            <p>La referencia de la API se prepara para una experiencia interactiva con Scalar.</p>
            <p className="hidden text-muted xl:block">
              Consulta endpoints, autenticación, parámetros y respuestas desde un mismo lugar.
            </p>
          </div>
        }
        upperAction={<PortalLink href="/docs">Leer</PortalLink>}
        lowerDecoration={<ImageDitheringDecoration image={FOOTER_IMAGE_URL} invertColors />}
        lowerContent={
          <div className="flex h-full items-end">
            <p>© 2026 EcoBite · Talently Lab</p>
          </div>
        }
      />
      <OverviewColumn topSpace="large" />
    </section>
  );
}
