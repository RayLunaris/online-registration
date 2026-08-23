import * as React from 'react';
import { cn } from '@/lib/utils';

export const FormItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('space-y-1.5', className)} {...props} />;

export const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => (
  <label
    className={cn('text-xs font-semibold text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
);

export const FormDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => <p className={cn('text-[11px] text-slate-500', className)} {...props} />;

export const FormMessage: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  if (!children) return null;
  return (
    <p className={cn('text-[11px] font-medium text-red-400', className)} {...props}>
      {children}
    </p>
  );
};
