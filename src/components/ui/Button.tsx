import React from 'react';

type ButtonVariant = 'primary' | 'outlined' | 'ghost' | 'icon' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const getVariantClass = (v: ButtonVariant) => {
      switch (v) {
        case 'primary':
          return 'btn-primary';
        case 'outlined':
          return 'btn-outlined';
        case 'ghost':
          return 'btn-ghost';
        case 'icon':
          return 'btn-icon';
        case 'danger':
          return 'bg-red-600 text-white hover:bg-red-700 shadow-[4px_4px_0px_#991b1b] border-2 border-red-800 rounded-xl active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all';
        default:
          return 'btn-primary';
      }
    };

    const getSizeClass = (s: ButtonSize) => {
      switch (s) {
        case 'sm':
          return 'text-xs py-1 px-3 h-8';
        case 'lg':
          return 'text-lg py-3 px-6 h-12';
        default:
          return ''; // Default from CSS usually covers md
      }
    };

    return (
      <button
        ref={ref}
        className={`${getVariantClass(variant)} ${getSizeClass(size)} ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        } ${className || ''}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
