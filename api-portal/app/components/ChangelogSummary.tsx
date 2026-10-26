import { changelogSectionStyles, InlineNodes } from './ChangelogRelease';
import { formatReleaseDate, getChangelog } from '../lib/changelog';

const ENTRIES_PER_RELEASE = 5;

export async function ChangelogSummary() {
  const { releases } = await getChangelog();
  const shown = releases.slice(0, 1);

  if (shown.length === 0) {
    return <p className="mt-4 text-[0.8em] text-muted">Sin versiones publicadas.</p>;
  }

  return (
    <div className="mt-4 space-y-6">
      {shown.map((release) => {
        const version = release.unreleased ? 'Sin publicar' : `v${release.version}`;
        const entries = [
          ...release.sections.filter((section) => section.kind === 'security'),
          ...release.sections.filter((section) => section.kind !== 'security' && section.kind !== 'highlights'),
        ].flatMap((section) =>
          section.entries.map((entry) => ({ kind: section.kind, entry })),
        );
        const visible = entries.slice(0, ENTRIES_PER_RELEASE);
        const remaining = entries.length - visible.length;
        return (
          <article key={release.version}>
            <header className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="font-mono font-semibold text-heading">{version}</h3>
              <span aria-hidden="true" className="text-muted">
                •
              </span>
              {release.unreleased ? (
                <span className="font-mono text-muted">En desarrollo</span>
              ) : (
                release.date && (
                  <time dateTime={release.date} className="font-mono text-muted">
                    {formatReleaseDate(release.date, 'short')}
                  </time>
                )
              )}
            </header>
            {visible.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {visible.map(({ kind, entry }, index) => {
                  const style = changelogSectionStyles[kind === 'highlights' ? 'added' : kind];
                  return (
                    <li key={index} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-2">
                      <span className={`text-[0.85em] font-semibold ${style.className}`}>
                        {style.label}
                      </span>
                      <div className="min-w-0 break-words text-[0.9em]">
                        <InlineNodes nodes={entry} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {remaining > 0 && (
              <p className="mt-1.5 text-[0.8em] text-muted">
                +{remaining} {remaining === 1 ? 'cambio más' : 'cambios más'}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
