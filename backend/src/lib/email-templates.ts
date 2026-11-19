export interface EmailAssets {
  logoUrl: string;
  appUrl: string;
}

export const DEFAULT_EMAIL_ASSETS: EmailAssets = {
  logoUrl: 'https://s2602-ecobite.netlify.app/images/Logo_Eb-circle-green.png',
  appUrl: 'https://s2602-ecobite.netlify.app',
};

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface LayoutInput {
  preheader: string;
  heading: string;
  paragraphs: string[];
  cta: { label: string; url: string };
  reason: string;
  assets: EmailAssets;
}

const FONT = 'font-family:Arial,Helvetica,sans-serif;';

function layout(input: LayoutInput): string {
  const paragraphs = input.paragraphs
    .map((paragraph) =>
      `<p style="margin:0 0 16px;${FONT}font-size:16px;line-height:1.5;color:#333333;">`
      + `${escapeHtml(paragraph)}</p>`)
    .join('\n');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EcoBite</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;">
<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(input.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;">
<tr><td align="center" style="padding:32px 32px 0;">
<img src="${escapeHtml(input.assets.logoUrl)}" width="64" height="64" alt="EcoBite" style="display:block;border:0;">
</td></tr>
<tr><td style="padding:24px 32px 32px;">
<h1 style="margin:0 0 16px;${FONT}font-size:24px;line-height:1.3;color:#024023;">${escapeHtml(input.heading)}</h1>
${paragraphs}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td align="center" bgcolor="#024023" style="border-radius:6px;">
<a href="${escapeHtml(input.cta.url)}" style="display:inline-block;padding:12px 24px;${FONT}font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">${escapeHtml(input.cta.label)}</a>
</td></tr></table>
<p style="margin:24px 0 0;${FONT}font-size:12px;line-height:1.5;color:#575757;">EcoBite · Delivery de comida eco-friendly en CABA.<br>${escapeHtml(input.reason)}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// Copy placeholder pendiente de Marketing (decisión 4 de la planilla).
export function welcomeEmail(name: string, assets: EmailAssets): EmailContent {
  const url = `${assets.appUrl}/catalog`;
  return {
    subject: 'Te damos la bienvenida a EcoBite',
    text:
      `Hola, ${name}:\n` +
      'Tu cuenta en EcoBite ya está lista.\n' +
      'Pide a restaurantes que usan envases biodegradables y mira el impacto ambiental de cada pedido.\n\n' +
      `Explorar restaurantes:\n${url}\n\n` +
      'Recibes este correo porque creaste una cuenta en EcoBite.',
    html: layout({
      preheader: 'Tu cuenta en EcoBite ya está lista.',
      heading: `¡Hola, ${name}!`,
      paragraphs: [
        'Tu cuenta en EcoBite ya está lista.',
        'Pide a restaurantes que usan envases biodegradables y mira el impacto ambiental de cada pedido.',
      ],
      cta: { label: 'Explorar restaurantes', url },
      reason: 'Recibes este correo porque creaste una cuenta en EcoBite.',
      assets,
    }),
  };
}

// Copy placeholder pendiente de Marketing (decisión 4 de la planilla).
export function restaurantApprovalEmail(restaurantName: string, assets: EmailAssets): EmailContent {
  const url = `${assets.appUrl}/auth`;
  return {
    subject: 'Tu solicitud de EcoBite fue aprobada',
    text:
      `Hola, ${restaurantName}:\n` +
      'Tu solicitud para sumarte como restaurante aliado fue aprobada.\n' +
      'Ya puedes entrar a tu panel de restaurante en EcoBite.\n\n' +
      `Iniciar sesión:\n${url}\n\n` +
      'Recibes este correo porque solicitaste sumar tu restaurante a EcoBite.',
    html: layout({
      preheader: 'Tu solicitud fue aprobada: ya puedes entrar a tu panel de restaurante.',
      heading: `¡${restaurantName} ya es aliado de EcoBite!`,
      paragraphs: [
        'Tu solicitud para sumarte como restaurante aliado fue aprobada.',
        'Ya puedes entrar a tu panel de restaurante en EcoBite.',
      ],
      cta: { label: 'Iniciar sesión', url },
      reason: 'Recibes este correo porque solicitaste sumar tu restaurante a EcoBite.',
      assets,
    }),
  };
}
