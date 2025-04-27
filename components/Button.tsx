// components/Button.tsx
import React from 'react';

interface ButtonProps {
  /** Button label or content */
  children: React.ReactNode;
  /** Style variant: 'primary' for filled, 'outline' for bordered */
  variant?: 'primary' | 'outline';
  /** If true, button takes full width of its container */
  fullWidth?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional Tailwind CSS classes */
  className?: string;
  color?: string;
  loading?: boolean;
}

/**
 * A flexible button component supporting filled and outline styles.
 */
const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    onClick,
    className = '',
    color = '#F33550',
    loading = false,
  }) => {
    const base = 'font-bold py-3 px-6 rounded-lg focus:outline-none transition cursor-pointer flex items-center justify-center';
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Determine inline styles based on variant
    const styleProps =
      variant === 'primary'
        ? { backgroundColor: color, color: '#FFFFFF' }
        : { border: `1px solid ${color}`, backgroundColor: 'transparent', color: color };
  
    return (
      <button
        onClick={onClick}
        className={`${base} ${widthClass} ${className}`}
        style={styleProps}
      >
        {loading
        ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )
        : children
      }
      </button>
    );
  };
  
  export default Button;
  