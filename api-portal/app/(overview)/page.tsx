import { OverviewColumn } from '../components/OverviewColumn';
import { EndpointList } from '../components/EndpointList';
import { StatusSummary } from '../components/StatusSummary';
import { ChangelogSummary } from '../components/ChangelogSummary';
import { ImageDitheringDecoration } from '../components/ImageDitheringDecoration';
import { PortalLink } from '../components/PortalLink';
import type { ReactNode } from 'react';

// Local asset — keep decoration images in public/images so the page works offline.
const FOOTER_IMAGE_URL = '/images/logo-frog.png';

function MobileSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`border-b border-overview-border p-5 ${className}`}>{children}</section>;
}

export default function OverviewPage() {
  return (
    <>
      <h1 className="sr-only">Portal de la API de EcoBite</h1>
      <section
        aria-label="Resumen"
        className="hidden min-h-dvh min-w-0 bg-white text-[clamp(0.8125rem,1vw,0.875rem)] text-heading xl:grid xl:h-dvh xl:grid-cols-5"
      >
      <OverviewColumn
        topSpace="large"
        upperDecoration={<ImageDitheringDecoration />}
      />
      <OverviewColumn
        topSpace="small"
        hideScrollbars
        upperContent={
          <div className="space-y-4">
            <h2 className="font-semibold">Resumen</h2>
            <p>La API de EcoBite para delivery de comida sustentable.</p>
            <p className="text-muted">
              Este portal muestra su documentación, su estado y sus cambios al equipo y al frontend.
            </p>
          </div>
        }
        lowerContent={
          <div>
            <h2 className="font-semibold">Endpoints</h2>
            <p className="mt-3">Todas las rutas de la API, agrupadas por recurso.</p>
            <EndpointList />
          </div>
        }
        lowerAction={<PortalLink href="/docs">Todos</PortalLink>}
      />
      <OverviewColumn
        topSpace="large"
        hideScrollbars
        upperContent={
          <div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="font-semibold">Estado</h2>
              <span className="font-semibold text-brand-dark">
                Vista previa — monitoreo no conectado
              </span>
            </div>
            <StatusSummary />
          </div>
        }
        upperAction={<PortalLink href="/status" newTab={false}>Vistazo</PortalLink>}
        lowerContent={
          <div>
            <h2 className="font-semibold">Novedades</h2>
            <ChangelogSummary />
          </div>
        }
        lowerAction={<PortalLink href="/changelog" newTab={false}>Detalles</PortalLink>}
      />
      <OverviewColumn
        topSpace="small"
        upperContent={
          <div className="space-y-4">
            <h2 className="font-semibold">Documentación</h2>
            <p>La referencia de la API se prepara para una experiencia interactiva con Scalar.</p>
            <p className="text-muted">
              Consulta endpoints, autenticación, parámetros y respuestas desde un mismo lugar.
            </p>
          </div>
        }
        upperAction={<PortalLink href="/docs">Leer</PortalLink>}
        lowerDecoration={
          <ImageDitheringDecoration image={FOOTER_IMAGE_URL} colorFront="#2aff7c" colorHighlight="#ffffff" colorBack="#083f26" />
        }
        lowerContent={
          <div className="flex h-full items-end">
            <p>© 2026 EcoBite · Talently Lab</p>
          </div>
        }
      />
      <OverviewColumn topSpace="large" />
      </section>

      <section
        aria-label="Resumen"
        className="flex min-w-0 flex-col bg-white text-[0.9375rem] text-heading xl:hidden"
      >
        <MobileSection className="relative min-h-40 overflow-hidden p-0">
          <ImageDitheringDecoration />
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">Resumen</h2>
          <p className="mt-4">La API de EcoBite para delivery de comida sustentable.</p>
          <p className="mt-4 text-muted">
            Este portal muestra su documentación, su estado y sus cambios al equipo y al frontend.
          </p>
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">Endpoints</h2>
          <p className="mt-3">Todas las rutas de la API, agrupadas por recurso.</p>
          <EndpointList />
          <div className="mt-4 flex justify-end">
            <PortalLink href="/docs">Todos</PortalLink>
          </div>
        </MobileSection>
        <MobileSection>
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="font-semibold">Estado</h2>
            <span className="font-semibold text-brand-dark">
              Vista previa — monitoreo no conectado
            </span>
          </div>
          <StatusSummary />
          <div className="mt-4 flex justify-end">
            <PortalLink href="/status" newTab={false}>Vistazo</PortalLink>
          </div>
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">Novedades</h2>
          <ChangelogSummary />
          <div className="mt-4 flex justify-end">
            <PortalLink href="/changelog" newTab={false}>Detalles</PortalLink>
          </div>
        </MobileSection>
        <MobileSection>
          <h2 className="font-semibold">Documentación</h2>
          <p className="mt-4">La referencia de la API se prepara para una experiencia interactiva con Scalar.</p>
          <p className="mt-4 text-muted">
            Consulta endpoints, autenticación, parámetros y respuestas desde un mismo lugar.
          </p>
          <div className="mt-4 flex justify-end">
            <PortalLink href="/docs">Leer</PortalLink>
          </div>
        </MobileSection>
        <MobileSection className="relative min-h-48 overflow-hidden p-0">
          <ImageDitheringDecoration image={FOOTER_IMAGE_URL} colorFront="#2aff7c" colorHighlight="#ffffff" colorBack="#083f26" />
        </MobileSection>
        <MobileSection className="border-b-0 px-5 py-6 text-ink">
          <p>© 2026 EcoBite · Talently Lab</p>
        </MobileSection>
      </section>
    </>
  );
}
