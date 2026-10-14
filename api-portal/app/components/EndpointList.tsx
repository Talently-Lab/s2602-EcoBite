const endpoints = [
  { method: 'GET', path: '/api/restaurants', description: 'Lista restaurantes activos y eco-friendly.' },
  { method: 'POST', path: '/api/users/register', description: 'Registra un cliente.' },
  { method: 'POST', path: '/api/users/login', description: 'Inicia sesión de cliente.' },
] as const;

const methodStyles = {
  GET: 'bg-brand-soft text-brand-dark',
  POST: 'bg-cream text-heading',
} as const;

export function EndpointList() {
  return (
    <ul aria-label="Endpoints principales" className="mt-4">
      {endpoints.map(({ method, path, description }) => (
        <li key={`${method}-${path}`} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-2 py-2 first:pt-0 last:pb-0">
          <span className={`h-fit self-center rounded border border-current/15 px-2 py-1 font-mono text-[0.7em] font-semibold ${methodStyles[method]}`}>
            {method}
          </span>
          <div className="min-w-0">
            <code className="block break-words font-mono text-[0.9em]">{path}</code>
            <p className="mt-1 text-[0.85em] text-muted">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
