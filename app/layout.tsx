import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-display' })

export const metadata: Metadata = {
  title: 'World Cup 2026 Predictions',
  description: 'Predict match scores and compete with friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable}`}>
      <body className="app-bg text-white min-h-screen antialiased">
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
