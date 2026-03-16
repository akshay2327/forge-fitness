import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FORGE Fitness — Elite Gym Platform',
  description: 'Premium fitness programs, expert coaches, and AI-powered diet plans.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ margin:0, padding:0, width:'100%' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=DM+Serif+Display:ital@1&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin:0, padding:0, width:'100%', overflowX:'hidden' }}>{children}</body>
    </html>
  )
}
