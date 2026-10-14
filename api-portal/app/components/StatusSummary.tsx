const pastIncidents = [
  { label: 'Oct 14, 2026', dateTime: '2026-10-14' },
  { label: 'Oct 13, 2026', dateTime: '2026-10-13' },
  { label: 'Oct 12, 2026', dateTime: '2026-10-12' },
  { label: 'Oct 11, 2026', dateTime: '2026-10-11' },
];

export function StatusSummary() {
  return (
    <div className="mt-4">
      <section aria-labelledby="past-incidents-title">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 id="past-incidents-title" className="font-semibold">
            Past Incidents
          </h3>
          <span className="text-muted">Last 14 days · None</span>
        </div>
        <ul className="mt-3 space-y-2">
          {pastIncidents.map((date) => (
            <li key={date.dateTime} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <time dateTime={date.dateTime} className="font-mono text-muted">
                {date.label}
              </time>
              <span className="text-muted">No incidents reported.</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
