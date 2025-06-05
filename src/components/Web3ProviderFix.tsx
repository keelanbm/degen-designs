'use client'

import { useEffect } from 'react'

// This component disables automatic MetaMask/Ethereum provider initialization 
// to prevent errors when running without a Web3 provider
export default function Web3ProviderFix() {
  useEffect(() => {
    // Prevent MetaMask errors by defining a dummy provider
    // This prevents errors when MetaMask is not installed
    if (typeof window !== 'undefined' && !window.ethereum) {
      // Only add this if ethereum is not already defined
      console.log('Adding dummy ethereum provider to prevent errors')
      
      // Create a minimal dummy ethereum provider that does nothing but prevent errors
      window.ethereum = {
        isMetaMask: false,
        request: async () => {
          console.warn('Ethereum provider not available')
          return null
        },
        on: () => {},
        removeListener: () => {},
        // Add other required properties/methods here
      } as any
    }
  }, [])

  // This component doesn't render anything
  return null
} 