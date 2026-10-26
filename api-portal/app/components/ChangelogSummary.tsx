import { formatReleaseDate, getChangelog, inlineToText } from '../lib/changelog';

export async function ChangelogSummary() {
  const { releases } = await getChangelog();
  const shown = releases.slice(0, 2);

  if (shown.length === 0) {
    return <p className="mt-4 text-[0.8em] text-muted">Sin versiones publicadas.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {shown.map((release) => {
        const version = release.unreleased ? 'Sin publicar' : `v${release.version}`;
        const highlights = release.sections.find((section) => section.kind === 'highlights');
        const titleEntry = highlights?.entries[0] ?? release.sections[0]?.entries[0];
        const title = titleEntry ? inlineToText(titleEntry) : 'Sin cambios destacados';
        const date = release.unreleased
          ? 'En desarrollo'
          : release.date
            ? formatReleaseDate(release.date, 'short')
            : 'Sin fecha';
        return (
          <div key={release.version} className="rounded-lg border border-sidebar-border bg-sidebar/50 p-3">
            <header className="flex items-center gap-2">
              <span className="shrink-0 rounded-md bg-ink px-2 py-1 font-mono text-[0.75em] font-semibold text-white">
                {version}
              </span>
              <h3 className="min-w-0 flex-1 font-medium line-clamp-2">{title}</h3>
            </header>
            <p className="mt-2 text-[0.8em] text-muted">
              {date} · {release.changeCount} {release.changeCount === 1 ? 'cambio' : 'cambios'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
