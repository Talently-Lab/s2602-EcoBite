import type { Metadata } from 'next';
import { ChangelogRelease } from '../components/ChangelogRelease';
import { getChangelog } from '../lib/changelog';

export const metadata: Metadata = {
  title: 'Novedades · EcoBite API',
  description: 'Historial de versiones de la API de EcoBite.',
};

export default async function ChangelogPage() {
  const { releases } = await getChangelog();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 text-sm md:px-8 md:py-16">
      <h1 className="text-xl font-semibold text-heading">Novedades</h1>
      <p className="mt-3 text-muted">
        Historial de versiones de la API de EcoBite. Desde la primera versión hasta la más reciente,
        cada cambio queda documentado aquí, junto con enlaces para compararlo en GitHub.
      </p>
      <div className="mt-12 space-y-32">
        {releases.map((release) => (
          <ChangelogRelease key={release.version} release={release} />
        ))}
      </div>
    </div>
  );
}
