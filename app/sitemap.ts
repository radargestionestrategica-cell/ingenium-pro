import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {url:'https://www.ingeniumpro.store',lastModified:new Date(),changeFrequency:'weekly',priority:1},
    {url:'https://www.ingeniumpro.store/login',lastModified:new Date(),changeFrequency:'monthly',priority:0.8},
    {url:'https://www.ingeniumpro.store/register',lastModified:new Date(),changeFrequency:'monthly',priority:0.8},
    {url:'https://www.ingeniumpro.store/planes',lastModified:new Date(),changeFrequency:'weekly',priority:0.9},
  ]
}
