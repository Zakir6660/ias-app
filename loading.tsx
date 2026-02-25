import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="flex flex-col items-center">
          <p className="text-lg font-bold font-headline text-primary">IAS</p>
          <p className="text-sm text-muted-foreground animate-pulse">Influencer Automation Studio is starting...</p>
        </div>
      </div>
    </div>
  );
}
