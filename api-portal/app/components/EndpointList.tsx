import { Lock } from 'lucide-react';

const endpointGroups = [
  {
    label: 'Restaurantes',
    endpoints: [
      { method: 'GET', path: '/api/restaurants', auth: false },
      { method: 'GET', path: '/api/restaurants/{id}', auth: false },
    ],
  },
  {
    label: 'Zonas',
    endpoints: [{ method: 'GET', path: '/api/zones', auth: false }],
  },
  {
    label: 'Pedidos',
    endpoints: [
      { method: 'GET', path: '/api/orders', auth: true },
      { method: 'POST', path: '/api/orders', auth: true },
      { method: 'GET', path: '/api/orders/{id}', auth: true },
    ],
  },
  {
    label: 'Cuenta',
    endpoints: [
      { method: 'POST', path: '/api/users/register', auth: false },
      { method: 'POST', path: '/api/users/login', auth: false },
      { method: 'GET', path: '/api/users/me', auth: true },
    ],
  },
] as const;

const methodStyles = {
  GET: 'bg-brand-soft text-brand-dark',
  POST: 'bg-cream text-heading',
} as const;

export function EndpointList() {
  return (
    <div className="mt-4 space-y-4">
      {endpointGroups.map(({ label, endpoints }) => (
        <section key={label} aria-label={label}>
          <h3 className="text-[0.75em] font-semibold uppercase tracking-wide text-muted">
            {label}
          </h3>
          <ul className="mt-2">
            {endpoints.map(({ method, path, auth }) => (
              <li
                key={`${method}-${path}`}
                className="flex items-center gap-2 py-1 first:pt-0 last:pb-0"
              >
                <span
                  className={`min-w-[7ch] rounded border border-current/15 px-2 py-0.5 text-center font-mono text-[0.7em] font-semibold ${methodStyles[method]}`}
                >
                  {method}
                </span>
                <code className="min-w-0 flex-1 break-words font-mono text-[0.9em]">
                  {path}
                </code>
                {auth && (
                  <>
                    <Lock
                      aria-hidden="true"
                      className="size-3 shrink-0 text-muted"
                      strokeWidth={1.75}
                    />
                    <span className="sr-only">(requiere autenticación)</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="flex items-center gap-1.5 text-[0.75em] text-muted">
        <Lock aria-hidden="true" className="size-3" strokeWidth={1.75} />
        Requiere autenticación
      </p>
    </div>
  );
}
