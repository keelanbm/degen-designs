'use client'

import { useEffect } from 'react'

// Define the ethereum window property for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
      [key: string]: any;
    };
  }
}

// This component disables automatic MetaMask/Ethereum provider initialization 
// to prevent errors when running without a Web3 provider
export default function Web3ProviderFix() {
  useEffect(() => {
    // Prevent MetaMask errors by defining a dummy provider
    // This prevents errors when MetaMask is not installed
    if (typeof window !== 'undefined') {
      try {
        // Two cases to handle:
        // 1. ethereum is undefined - create a dummy provider
        // 2. ethereum exists but causes errors - backup the original and wrap it
        
        if (!window.ethereum) {
          // Case 1: No ethereum provider at all
          console.log('No ethereum provider detected - adding dummy provider')
          
          // Create a minimal dummy ethereum provider that does nothing but prevent errors
          window.ethereum = {
            isMetaMask: false,
            request: async () => {
              console.log('Dummy ethereum provider: request called')
              return null
            },
            on: () => {},
            removeListener: () => {},
            // Add other required properties/methods here
          }
        } else {
          // Case 2: Ethereum provider exists but may cause errors
          // Wrap the existing provider with error handling
          const originalEthereum = window.ethereum
          
          // Create safe wrapper for the ethereum object
          const safeEthereum = new Proxy(originalEthereum, {
            get(target, prop, receiver) {
              // Special handling for the request method
              if (prop === 'request') {
                return async (...args: any[]) => {
                  try {
                    // Only proceed if the target has the request method
                    if (typeof target.request === 'function') {
                      return await target.request(...args)
                    }
                    console.warn('Ethereum provider has no request method')
                    return null
                  } catch (error) {
                    console.warn('Ethereum provider request failed:', error)
                    return null
                  }
                }
              }
              
              // Handle event listeners safely
              if (prop === 'on' || prop === 'addListener') {
                return (...args: any[]) => {
                  try {
                    // @ts-ignore
                    if (typeof target[prop] === 'function') {
                      // @ts-ignore
                      return target[prop](...args)
                    }
                  } catch (error) {
                    console.warn(`Ethereum provider ${String(prop)} failed:`, error)
                  }
                }
              }
              
              // For any other property access, return the original or a safe default
              try {
                // @ts-ignore
                return target[prop]
              } catch (error) {
                console.warn(`Error accessing ethereum.${String(prop)}:`, error)
                return undefined
              }
            }
          })
          
          // Replace the window.ethereum with our safe version
          window.ethereum = safeEthereum
          console.log('Enhanced ethereum provider with error handling')
        }
      } catch (error) {
        console.error('Error setting up ethereum provider fix:', error)
        // Last resort fallback - completely replace with dummy
        window.ethereum = {
          isMetaMask: false,
          request: async () => null,
          on: () => {},
          removeListener: () => {}
        }
      }
      
      // Add unhandled rejection handler for ethereum-related promises
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && 
            typeof event.reason.message === 'string' && 
            event.reason.message.includes('ethereum')) {
          console.warn('Suppressed unhandled ethereum promise rejection:', event.reason)
          event.preventDefault()
        }
      })
    }
  }, [])

  // This component doesn't render anything
  return null
} 