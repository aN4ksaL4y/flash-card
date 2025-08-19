import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex items-center justify-center p-12 border-2 border-dashed border-border bg-muted/50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-secondary p-3 rounded-full">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-semibold font-headline text-foreground">{title}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </Card>
  );
}
