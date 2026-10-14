import { HttpError } from './http-error';

function bodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'El cuerpo debe ser un objeto JSON.');
  }
  return body as Record<string, unknown>;
}

export function validateCredentials(body: unknown) {
  const input = bodyObject(body);
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = input.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Email y contraseña válidos son obligatorios (máximo 72 bytes para la contraseña).');
  }
  return { email, password };
}

export function validateRegistration(body: unknown) {
  const input = bodyObject(body);
  const credentials = validateCredentials(input);
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name)) {
    throw new HttpError(400, 'El nombre es obligatorio y debe tener como máximo 120 caracteres.');
  }
  if (credentials.password.length < 8) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres.');
  }
  if (Object.keys(input).some((key) => !['name', 'email', 'password'].includes(key))) {
    throw new HttpError(400, 'Solo se permiten los campos name, email y password.');
  }
  return { name, ...credentials };
}
