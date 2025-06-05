'use client';

import { Button } from '@/components/ui/button';

export default function ErrorRetry({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading dapps</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <Button onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
} 