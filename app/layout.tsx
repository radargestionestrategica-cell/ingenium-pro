import './globals.css';
import type { Metadata } from 'next';

const BASE_URL = 'https://ingeniumpro.store';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'INGENIUM PRO | Plataforma de Ingeniería Industrial — ASME API ISO',
  description:
    'Plataforma de cálculo técnico para ingeniería industrial. ASME B31.8, API 6D, ISO, IEC. ' +
    'Módulos de tuberías, válvulas, perforación, geotecnia, minería y más. ' +
    'PDF con QR verificable, Excel con fórmulas reales y DXF para fabricación.',
  keywords: 'ingeniería industrial, cálculo MAOP, ASME B31.8, API 6D, válvulas industriales, DXF CAD ingeniería, plataforma ingeniería online',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'INGENIUM PRO',
    title: 'INGENIUM PRO | Plataforma de Ingeniería Industrial — ASME API ISO',
    description:
      'Cálculo técnico profesional: ASME B31.8, API 6D, ISO, IEC. ' +
      'PDF verificable, Excel con fórmulas reales, DXF para fabricación. ' +
      '15 módulos: tuberías, válvulas, perforación, geotecnia y más.',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INGENIUM PRO | Ingeniería Industrial Online',
    description:
      'Cálculo MAOP, Cv válvulas, ASME B31.8. PDF con QR verificable, Excel y DXF. 15 módulos técnicos.',
    creator: '@ingeniumpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'INGENIUM PRO',
  url: BASE_URL,
  applicationCategory: 'EngineeringApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  description:
    'Plataforma de cálculo técnico para ingeniería industrial. ' +
    'ASME B31.8, API 6D, ISO, IEC. 15 módulos: tuberías, válvulas, perforación, geotecnia, minería y más.',
  author: {
    '@type': 'Organization',
    name: 'INGENIUM PRO',
    url: BASE_URL,
  },
  inLanguage: 'es',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}