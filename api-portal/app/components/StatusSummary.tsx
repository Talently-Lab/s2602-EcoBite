const pastIncidents = [
  { label: '14 oct 2026', dateTime: '2026-10-14' },
  { label: '13 oct 2026', dateTime: '2026-10-13' },
  { label: '12 oct 2026', dateTime: '2026-10-12' },
  { label: '11 oct 2026', dateTime: '2026-10-11' },
];

export function StatusSummary() {
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Incidentes anteriores</h3>
      <ul className="mt-3 space-y-2">
        {pastIncidents.map((date) => (
          <li key={date.dateTime} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <time dateTime={date.dateTime} className="font-mono text-muted">
              {date.label}
            </time>
            <span className="text-muted">Sin incidentes reportados.</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
