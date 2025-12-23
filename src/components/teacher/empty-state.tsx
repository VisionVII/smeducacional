import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 sm:py-16 text-center px-4">
        <Icon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
        {action && (
          <Button asChild className="w-full sm:w-auto">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
