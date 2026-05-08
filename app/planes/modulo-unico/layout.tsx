import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plan Módulo Único — INGENIUM PRO',
  description:
    'Suscribite a un módulo de ingeniería a elección: Petróleo/MAOP, Perforación, Hidráulica, ' +
    'Cañerías, Electricidad, Geotecnia, Soldadura y más. ARS $45.000/mes con MercadoPago.',
  keywords:
    'módulo único ingeniería, suscripción módulo técnico, MAOP cálculo online, ' +
    'ingeniería petróleo Argentina, cálculo ASME mensual',
  alternates: {
    canonical: 'https://ingeniumpro.store/planes/modulo-unico',
  },
  openGraph: {
    title: 'Plan Módulo Único — INGENIUM PRO',
    description:
      '1 módulo de ingeniería a elección. PDF verificable, Excel y DXF. ARS $45.000/mes.',
    url: 'https://ingeniumpro.store/planes/modulo-unico',
  },
}

export default function ModuloUnicoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
