import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppSidebar } from './components/AppSidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoBite API',
  description: 'Portal para desarrolladores de la API de EcoBite.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a href="#portal-main" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-brand-dark px-4 py-3 text-white focus:translate-y-0">
          Saltar al contenido
        </a>
        <div className="flex min-h-dvh">
          <AppSidebar />
          <main id="portal-main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
