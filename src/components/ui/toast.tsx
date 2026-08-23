import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default',
  onClose,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-top-2',
        variant === 'success' && 'bg-emerald-950/90 border-emerald-800 text-emerald-100',
        variant === 'destructive' && 'bg-red-950/90 border-red-800 text-red-100',
        variant === 'info' && 'bg-blue-950/90 border-blue-800 text-blue-100',
        variant === 'default' && 'bg-slate-900 border-slate-800 text-white'
      )}
    >
      {getIcon()}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold text-sm leading-tight">{title}</h5>}
        {description && <p className="text-xs opacity-90 leading-relaxed">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
