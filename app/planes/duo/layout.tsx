import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plan Dúo — INGENIUM PRO',
  description:
    'Accedé a 2 módulos de ingeniería a elección. Ideal para el profesional con necesidades diversas. ' +
    'PDF verificable, Excel con fórmulas reales y DXF para CAD. ARS $80.000/mes con MercadoPago.',
  keywords:
    'plan duo ingeniería, dos módulos técnicos, ingeniería industrial Argentina, ' +
    'suscripción ingeniería online, cálculo ASME API online',
  alternates: {
    canonical: 'https://ingeniumpro.store/planes/duo',
  },
  openGraph: {
    title: 'Plan Dúo — INGENIUM PRO',
    description:
      '2 módulos de ingeniería a elección. PDF verificable, Excel y DXF. ARS $80.000/mes.',
    url: 'https://ingeniumpro.store/planes/duo',
  },
}

export default function DuoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
