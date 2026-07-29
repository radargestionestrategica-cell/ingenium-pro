import { MetadataRoute } from 'next'

const BASE = 'https://ingeniumpro.store'

const MODULOS = [
  'petroleo-gas',
  'valvulas',
  'canerias',
  'hidraulica',
  'soldadura',
  'geotecnia',
  'telemetria',
  'inteligencia-cruzada',
  'electricidad',
  'civil',
  'mineria',
  'represas',
  'vialidad',
  'perforacion',
  'arquitectura',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:             `${BASE}`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        1,
    },
    {
      url:             `${BASE}/planes`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${BASE}/planes/modulo-unico`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${BASE}/planes/duo`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${BASE}/modulos`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.85,
    },
    ...MODULOS.map((slug): MetadataRoute.Sitemap[number] => ({
      url:             `${BASE}/modulos/${slug}`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.8,
    })),
    {
      url:             `${BASE}/terminos`,
      lastModified:    new Date(),
      changeFrequency: 'yearly',
      priority:        0.3,
    },
    {
      url:             `${BASE}/privacidad`,
      lastModified:    new Date(),
      changeFrequency: 'yearly',
      priority:        0.3,
    },
  ]
}
