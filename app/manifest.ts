import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'INGENIUM PRO',
    short_name: 'INGENIUM',
    description: 'Plataforma de cálculo técnico para ingeniería industrial — ASME, API, ISO, IEC.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#020609',
    theme_color: '#E8A020',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
