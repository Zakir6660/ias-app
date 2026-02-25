'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log errors silently to the console for developers
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-3 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    We've hit a snag. Please try again. If the problem persists, refreshing the page might help.
                </p>
                <details className="text-left bg-muted p-2 rounded-md text-xs">
                    <summary>Show Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-left">
                        {error.message}
                    </pre>
                </details>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
