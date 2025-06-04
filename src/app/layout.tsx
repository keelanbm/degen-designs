import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClerkProviders from '@/components/ClerkProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Use a string instead of URL object to avoid serialization issues
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  // @ts-ignore - Using string instead of URL object to avoid serialization issues
  metadataBase: baseUrl,
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
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClerkProviders>
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </ClerkProviders>
      </body>
    </html>
  )
}