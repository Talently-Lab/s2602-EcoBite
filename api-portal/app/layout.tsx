import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoBite API',
  description: 'EcoBite API developer portal.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white font-sans text-neutral-950">{children}</body>
    </html>
  );
}
