const releases = [
  {
    version: 'v1.0.0',
    title: 'Customer API and portal foundation',
    date: 'Oct 14, 2026',
    changes: 6,
  },
  {
    version: 'v0.9.0',
    title: 'Initial API portal release',
    date: 'Oct 08, 2026',
    changes: 3,
  },
] as const;

export function ChangelogSummary() {
  return (
    <div className="mt-4 space-y-3">
      {releases.map(({ version, title, date, changes }) => (
        <div key={version} className="rounded-lg border border-sidebar-border bg-sidebar/50 p-3">
          <header className="flex items-center gap-2">
            <span className="shrink-0 rounded-md bg-ink px-2 py-1 font-mono text-[0.75em] font-semibold text-white">
              {version}
            </span>
            <h3 className="min-w-0 flex-1 font-medium">{title}</h3>
          </header>
          <p className="mt-2 text-[0.8em] text-muted">
            {date} · {changes} changes
          </p>
        </div>
      ))}
    </div>
  );
}
