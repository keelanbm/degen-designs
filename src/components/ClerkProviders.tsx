'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { ToastProvider } from '@/components/ToastProvider';
import { useEffect, useState } from 'react';

// Check if Clerk environment variables are available
const hasClerkKeys = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 0

export default function ClerkProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClientSide, setIsClientSide] = useState(false);
  
  // Wait for client-side to avoid hydration issues
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  // Log Clerk configuration on client side for debugging
  useEffect(() => {
    if (isClientSide) {
      console.log('Clerk provider configuration:', {
        hasKeys: hasClerkKeys,
        mode: process.env.NODE_ENV
      });
    }
  }, [isClientSide]);
  
  // Check if we're on the client side and Clerk keys are available
  if (!isClientSide) {
    // Just render children during server-side rendering
    return <>{children}</>;
  }
  
  if (!hasClerkKeys) {
    // Handle missing Clerk keys
    console.warn('Clerk keys are missing. Authentication will not work properly.');
    
    // Fallback provider that doesn't actually authenticate
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }
  
  // Normal rendering with Clerk available
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#22c55e",
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/80',
          footerActionLink: 'text-primary hover:text-primary/80',
        }
      }}
    >
      <Navbar />
      {children}
      <ToastProvider />
    </ClerkProvider>
  );
} 