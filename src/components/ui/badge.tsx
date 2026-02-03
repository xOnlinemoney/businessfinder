'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-100 text-dark-700',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
      outline: 'bg-transparent border border-dark-300 text-dark-600',
      purple: 'bg-purple-100 text-purple-700',
    };

    const sizes = {
      sm: 'px-1.5 py-0.5 text-[10px]',
      md: 'px-2 py-0.5 text-xs',
      lg: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-bold rounded-full whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge with dot indicator
interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'inactive' | 'pending' | 'verified' | 'sold' | 'draft' | 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    const statusConfig = {
      active: { color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
      inactive: { color: 'bg-dark-400', bg: 'bg-dark-100', text: 'text-dark-600', label: 'Inactive' },
      pending: { color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
      verified: { color: 'bg-primary', bg: 'bg-primary/10', text: 'text-primary', label: 'Verified' },
      sold: { color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', label: 'Sold' },
      draft: { color: 'bg-dark-400', bg: 'bg-dark-100', text: 'text-dark-600', label: 'Draft' },
      success: { color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: '' },
      warning: { color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: '' },
      danger: { color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', label: '' },
      info: { color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', label: '' },
      default: { color: 'bg-dark-400', bg: 'bg-dark-100', text: 'text-dark-600', label: '' },
    };

    const config = statusConfig[status];

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
          config.bg,
          config.text,
          className
        )}
        {...props}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', config.color)} />
        {config.label || props.children}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default Badge;
