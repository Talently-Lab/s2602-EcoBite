export interface ApiConfig {
  jwtSecret: string;
  corsOrigins: string[];
  trustProxyHops: 0 | 1;
}

export class ConfigError extends Error {}

export function readConfig(env: NodeJS.ProcessEnv): ApiConfig {
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new ConfigError('JWT_SECRET debe contener al menos 32 bytes.');
  }

  const origins = env.CORS_ORIGINS ?? (env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
  const corsOrigins = origins.split(',').map((origin) => origin.trim()).filter(Boolean);
  for (const origin of corsOrigins) {
    try {
      const url = new URL(origin);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
        throw new Error('Invalid origin');
      }
    } catch {
      throw new ConfigError('CORS_ORIGINS debe contener orígenes HTTP(S), sin rutas ni comodines.');
    }
  }
  const proxyHops = env.TRUST_PROXY_HOPS ?? '0';
  if (proxyHops !== '0' && proxyHops !== '1') {
    throw new ConfigError('TRUST_PROXY_HOPS debe ser 0 (directo) o 1 (un proxy controlado).');
  }
  return { jwtSecret, corsOrigins, trustProxyHops: proxyHops === '1' ? 1 : 0 };
}
