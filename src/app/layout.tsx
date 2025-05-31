import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dapp Design Archive - UI/UX Gallery for Web3 Apps',
  description: 'Curated collection of the best UI/UX designs from Web3 dapps. Browse flows, download designs, and get inspired.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // <ClerkProvider>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning={true}>
          <Navbar />
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </body>
      </html>
    // </ClerkProvider>
  )
}