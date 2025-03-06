import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Swapify - India\'s Trusted 2nd-Hand Marketplace',
    short_name: 'Swapify',
    description: 'Buy and sell second-hand items locally with Swapify - India\'s trusted marketplace',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '512x512',
        type: 'image/x-icon'
      }
    ]
  }
} 