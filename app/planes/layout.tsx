import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planes y Precios — INGENIUM PRO',
  description:
    'Elegí el plan que se adapta a tu trabajo: Módulo único, Dúo, Pro o Team. ' +
    'Acceso a 15 módulos de ingeniería industrial con PDF verificable, Excel y DXF. ' +
    'Suscripción mensual en ARS, pago con MercadoPago.',
  keywords:
    'planes ingeniería, suscripción INGENIUM PRO, módulos ingeniería industrial, ' +
    'precio plataforma técnica, cálculo ASME online Argentina',
  alternates: {
    canonical: 'https://ingeniumpro.store/planes',
  },
  openGraph: {
    title: 'Planes y Precios — INGENIUM PRO',
    description:
      'Módulo único, Dúo, Pro o Team. 15 módulos de ingeniería, PDF verificable, Excel y DXF.',
    url: 'https://ingeniumpro.store/planes',
  },
}

export default function PlanesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
