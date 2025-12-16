import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'edged' | 'flat';
}

export function Card({ className, variant = 'edged', children, ...props }: CardProps) {
  const baseClass = variant === 'edged' ? 'card-edged' : 'card-flat';

  // card-edged has no padding by default in globals? let's check or add it.
  // Actually the globals.css definition was:
  // .card-edged { @apply bg-surface border-thick border-primary rounded-2xl shadow-[4px_4px_0px_var(--color-primary)]; }
  // It lacks padding. Let's add p-6 by default.

  return (
    <div className={`${baseClass} p-6 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}
