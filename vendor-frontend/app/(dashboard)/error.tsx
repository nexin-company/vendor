'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-4 md:p-6">
      <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-6xl md:text-7xl">😞</div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h1 className="font-semibold text-2xl md:text-3xl">
              ¡Oops! Algo salió mal
            </h1>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-sm md:text-base">
            Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta
            nuevamente.
          </p>
          {error.message && (
            <p className="text-xs text-muted-foreground/70 font-mono bg-muted px-3 py-2 rounded-md mt-4">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="w-full sm:w-auto"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </main>
  );
}
