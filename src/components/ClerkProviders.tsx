'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { ToastProvider } from '@/components/ToastProvider';

export default function ClerkProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <ClerkProvider
      appearance={{
        baseTheme: {
          colors: {
            primary: "#22c55e",
          }
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/80',
          footerActionLink: 'text-primary hover:text-primary/80',
        }
      }}
      navigate={(to) => router.push(to)}
    >
      <Navbar />
      {children}
      <ToastProvider />
    </ClerkProvider>
  );
} 