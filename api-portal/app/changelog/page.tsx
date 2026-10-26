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
    <div className="mx-auto w-full max-w-4xl px-5 py-10 md:px-10 md:py-14">
      <h1 className="text-2xl font-semibold text-heading">Novedades</h1>
      <p className="mt-3 text-muted">
        Historial de versiones de la API de EcoBite. Desde la primera versión hasta la más reciente,
        cada cambio queda documentado aquí, junto con enlaces para compararlo en GitHub.
      </p>
      <div className="mt-10 space-y-12">
        {releases.map((release) => (
          <ChangelogRelease key={release.version} release={release} />
        ))}
      </div>
    </div>
  );
}
