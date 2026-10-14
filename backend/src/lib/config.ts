export interface ApiConfig {
  jwtSecret: string;
  corsOrigins: string[];
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
  return { jwtSecret, corsOrigins };
}
