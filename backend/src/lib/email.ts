import type { ApiConfig } from './config';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailService {
  send(message: EmailMessage): Promise<void>;
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const SEND_TIMEOUT_MS = 5000;

/**
 * Transporte de correo transaccional. Sin `config.email` (desarrollo y CI sin
 * secretos) los correos solo quedan registrados en el log; con credenciales se
 * envían por la API HTTP de Brevo, sin SDK extra.
 */
export function createEmailService(config: ApiConfig): EmailService {
  const email = config.email;
  if (!email) {
    return {
      async send(message: EmailMessage) {
        console.log(`[email] to=${message.to} subject=${message.subject}`);
      },
    };
  }
  return {
    async send(message: EmailMessage) {
      const response = await fetch(BREVO_URL, {
        method: 'POST',
        headers: {
          'api-key': email.apiKey,
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: email.from, name: email.fromName },
          to: [{ email: message.to }],
          subject: message.subject,
          textContent: message.text,
        }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
      if (!response.ok) {
        // El error no incluye la api key ni el cuerpo del proveedor.
        throw new Error(`Brevo respondió ${response.status} al enviar el correo.`);
      }
    },
  };
}

// Copy placeholder pendiente de Marketing (decisión 4 de la planilla).
export function restaurantApprovalEmail(restaurantName: string): { subject: string; text: string } {
  return {
    subject: 'Tu solicitud de EcoBite fue aprobada',
    text: `Hola, ${restaurantName}:\n` +
      'Tu solicitud para sumarte como restaurante aliado fue aprobada.\n' +
      'Ya podés entrar a tu panel de restaurante en EcoBite.',
  };
}
