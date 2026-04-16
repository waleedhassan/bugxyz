import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { Toast as ToastType } from './use-toast';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export function Toast({ toast: t, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
        t.variant === 'destructive'
          ? 'border-destructive bg-destructive text-destructive-foreground'
          : 'border-border bg-background text-foreground'
      )}
    >
      <div className="flex-1">
        {t.title && <div className="text-sm font-semibold">{t.title}</div>}
        {t.description && <div className="text-sm opacity-90">{t.description}</div>}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
