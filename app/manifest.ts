import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wenlance',
    short_name: 'Wenlance',
    description: 'Advanced freelance management platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#03045E',
    theme_color: '#023E8A',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
