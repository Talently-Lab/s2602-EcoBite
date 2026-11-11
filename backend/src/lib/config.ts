export interface ApiConfig {
  jwtSecret: string;
  corsOrigins: string[];
  trustProxyHops: 0 | 1;
  healthCheckTimeoutMs?: number;
  email?: {
    apiKey: string;
    from: string;
    fromName: string;
  };
}

export class ConfigError extends Error {}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const emailApiKey = env.EMAIL_API_KEY;
  const emailFrom = env.EMAIL_FROM;
  if (Boolean(emailApiKey) !== Boolean(emailFrom)) {
    throw new ConfigError('EMAIL_API_KEY y EMAIL_FROM deben configurarse juntos.');
  }
  let email: ApiConfig['email'];
  if (emailApiKey && emailFrom) {
    if (!emailPattern.test(emailFrom)) {
      throw new ConfigError('EMAIL_FROM debe ser una dirección de email válida.');
    }
    email = { apiKey: emailApiKey, from: emailFrom, fromName: env.EMAIL_FROM_NAME || 'EcoBite' };
  }

  return { jwtSecret, corsOrigins, trustProxyHops: proxyHops === '1' ? 1 : 0, email };
}
