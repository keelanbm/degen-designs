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

// This component safely initializes a fallback Ethereum provider
// to prevent errors when running without a Web3 provider
export default function Web3ProviderFix() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    try {
      // Check if ethereum is already defined
      if (window.ethereum) {
        // If ethereum exists, wrap it with error handling but don't try to replace it
        console.log('Ethereum provider exists - adding error handling wrapper');
        
        // Create a safe error handler for ethereum operations
        const safeEthereumRequest = async (...args: any[]) => {
          try {
            if (window.ethereum && typeof window.ethereum.request === 'function') {
              return await window.ethereum.request(...args);
            }
            console.warn('Ethereum provider has no request method');
            return null;
          } catch (error) {
            console.warn('Ethereum provider request failed:', error);
            return null;
          }
        };
        
        // Add global error handler for ethereum operations
        // but don't attempt to replace the provider itself
        window.addEventListener('unhandledrejection', (event) => {
          if (event.reason && 
              typeof event.reason.message === 'string' && 
              event.reason.message.includes('ethereum')) {
            console.warn('Suppressed unhandled ethereum promise rejection:', event.reason);
            event.preventDefault();
          }
        });
      } else {
        // Only create a dummy provider if ethereum doesn't exist
        console.log('No ethereum provider detected - creating dummy provider');
        
        // Use Object.defineProperty to avoid conflicts with getter/setter properties
        Object.defineProperty(window, 'ethereum', {
          value: {
            isMetaMask: false,
            request: async () => {
              console.log('Dummy ethereum provider: request called');
              return null;
            },
            on: () => {},
            removeListener: () => {},
            // Add other required properties/methods here
          },
          writable: true,
          configurable: true
        });
      }
    } catch (error) {
      console.error('Error setting up ethereum provider fix:', error);
      // Do not attempt to overwrite window.ethereum directly as a fallback
    }
  }, []);

  // This component doesn't render anything
  return null;
} 