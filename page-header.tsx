import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
        {title}
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
