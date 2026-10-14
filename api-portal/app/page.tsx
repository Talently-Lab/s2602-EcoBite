import { OverviewColumn } from './components/OverviewColumn';
import { EndpointList } from './components/EndpointList';
import { StatusSummary } from './components/StatusSummary';
import { ChangelogSummary } from './components/ChangelogSummary';
import { ImageDitheringDecoration } from './components/ImageDitheringDecoration';
import { PortalLink } from './components/PortalLink';
import type { ReactNode } from 'react';

// Replace this URL with the image used for the footer background.
const FOOTER_IMAGE_URL = 'https://i.ibb.co/Nn7zPNk8/Screenshot-2026-10-14-144106.png';

function MobileSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`border-b border-overview-border p-5 ${className}`}>{children}</section>;
}

export default function OverviewPage() {
  return (
    <>
      <section
        aria-label="Overview"
        className="hidden min-h-dvh min-w-0 border-l border-sidebar-border bg-white text-[clamp(0.8125rem,1vw,0.875rem)] text-heading xl:grid xl:h-dvh xl:grid-cols-5"
      >
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

      <section
        aria-label="Mobile overview"
        className="flex min-w-0 flex-col border-l border-sidebar-border bg-white text-[0.9375rem] text-heading xl:hidden"
      >
        <MobileSection className="relative min-h-40 overflow-hidden p-0">
          <ImageDitheringDecoration invertColors={false} />
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">Overview</h2>
          <p className="mt-4">La API de EcoBite para delivery de comida sustentable.</p>
          <p className="mt-4 text-muted">
            Este portal muestra su documentación, su estado y sus cambios al equipo y al frontend.
          </p>
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">Endpoints</h2>
          <p className="mt-3">Lista de endpoints.</p>
          <EndpointList />
          <div className="mt-4 flex justify-end">
            <PortalLink href="/docs">Todos</PortalLink>
          </div>
        </MobileSection>
        <MobileSection>
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="font-semibold">Status</h2>
            <span role="status" className="font-semibold text-brand-dark">
              All Systems Operational
            </span>
          </div>
          <StatusSummary />
          <div className="mt-4 flex justify-end">
            <PortalLink href="/status">Vistazo</PortalLink>
          </div>
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">Changelog</h2>
          <ChangelogSummary />
          <div className="mt-4 flex justify-end">
            <PortalLink href="/changelog">Detalles</PortalLink>
          </div>
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">API Docs</h2>
          <p className="mt-4">La referencia de la API se prepara para una experiencia interactiva con Scalar.</p>
          <p className="mt-4 text-muted">
            Consulta endpoints, autenticación, parámetros y respuestas desde un mismo lugar.
          </p>
          <div className="mt-4 flex justify-end">
            <PortalLink href="/docs">Leer</PortalLink>
          </div>
        </MobileSection>
        <MobileSection className="relative min-h-48 overflow-hidden p-0">
          <ImageDitheringDecoration image={FOOTER_IMAGE_URL} invertColors />
        </MobileSection>
        <MobileSection className="border-b-0 px-5 py-6 text-ink">
          <p>© 2026 EcoBite · Talently Lab</p>
        </MobileSection>
      </section>
    </>
  );
}
