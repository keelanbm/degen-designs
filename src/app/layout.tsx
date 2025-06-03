import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'DappArchive',
  description: 'Explore the best Web3 dapp designs and user flows',
  openGraph: {
    title: 'DappArchive',
    description: 'Explore the best Web3 dapp designs and user flows',
    url: 'https://dapparchive.com',
    siteName: 'DappArchive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DappArchive',
    description: 'Explore the best Web3 dapp designs and user flows',
  },
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