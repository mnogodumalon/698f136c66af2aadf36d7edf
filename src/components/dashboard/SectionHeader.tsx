import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, description, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-800 text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="gradient-hero text-primary-foreground shrink-0 gap-1.5 font-600 shadow-none hover:opacity-90 transition-smooth"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
