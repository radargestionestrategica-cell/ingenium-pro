import './globals.css';
import type { Metadata, Viewport } from 'next';

const BASE_URL = 'https://ingeniumpro.store';

export const viewport: Viewport = {
  themeColor: '#E8A020',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: 'INGENIUM PRO',
  title: 'INGENIUM PRO | Plataforma de Ingeniería Industrial — ASME API ISO',
  description:
    'Plataforma de cálculo técnico para ingeniería industrial. ASME B31.8, API 6D, ISO, IEC. ' +
    'Módulos de tuberías, válvulas, perforación, geotecnia, minería y más. ' +
    'PDF con QR verificable, Excel con fórmulas reales y DXF para fabricación.',
  keywords: 'ingeniería industrial, cálculo MAOP, ASME B31.8, API 6D, válvulas industriales, DXF CAD ingeniería, plataforma ingeniería online',
  authors: [{ name: 'RADAR Gestión Estratégica', url: BASE_URL }],
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
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'INGENIUM PRO — Plataforma de Ingeniería Industrial',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INGENIUM PRO | Ingeniería Industrial Online',
    description:
      'Cálculo MAOP, Cv válvulas, ASME B31.8. PDF con QR verificable, Excel y DXF. 15 módulos técnicos.',
    creator: '@ingeniumpro',
    images: ['/opengraph-image'],
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

const jsonLd = [
  {
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
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RADAR Gestión Estratégica',
    url: BASE_URL,
    logo: `${BASE_URL}/opengraph-image`,
    sameAs: [BASE_URL],
  },
];

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