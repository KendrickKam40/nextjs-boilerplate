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
  }) => {
    const base = 'font-bold py-3 px-6 rounded-lg focus:outline-none transition cursor-pointer';
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
        {children}
      </button>
    );
  };
  
  export default Button;
  