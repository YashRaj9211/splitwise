'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './Button';

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'outlined' | 'ghost' | 'icon';
}

export function SubmitButton({ children, className, variant = 'primary' }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} isLoading={pending} variant={variant} className={className}>
      {children}
    </Button>
  );
}
