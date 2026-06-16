import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Cup 2026 Predictions',
  description: 'Predict match scores and compete with friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-white min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-5xl">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
