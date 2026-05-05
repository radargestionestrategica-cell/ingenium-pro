import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'INGENIUM PRO | Plataforma de Ingeniería Industrial — ASME API ISO',
  description:
    'Plataforma de cálculo técnico para ingeniería industrial. ASME B31.8, API 6D, ISO, IEC. ' +
    'Módulos de tuberías, válvulas, perforación, geotecnia, minería y más. ' +
    'PDF con QR verificable, Excel con fórmulas reales y DXF para fabricación.',
  keywords: 'ingeniería industrial, cálculo MAOP, ASME B31.8, API 6D, válvulas industriales, DXF CAD ingeniería, plataforma ingeniería online',
  metadataBase: new URL('https://ingeniumpro.store'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}