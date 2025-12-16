import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-bold text-primary">{label}</label>}
      <input ref={ref} className={`input-edged ${error ? 'border-red-500' : ''} ${className || ''}`} {...props} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
