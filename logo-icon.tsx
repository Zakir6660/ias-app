import { newLogoDataUri } from '@/lib/logo';
import { cn } from '@/lib/utils';

export function LogoIcon({ className, ...props }: React.HTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={newLogoDataUri}
      alt="Influencer Automation Studio Logo"
      className={cn('h-8 w-8', className)}
      {...props}
    />
  );
}
