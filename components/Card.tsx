// components/Card.tsx
import React from 'react';

interface CardProps {
  /** Content inside the card */
  children: React.ReactNode;
  /** Additional Tailwind CSS classes */
  className?: string;
  /** Optional background color (hex, rgb, or CSS variable) */
  bgColor?: string;
}

/**
 * A reusable card container with rounded corners, shadow, and custom background.
 */
const Card: React.FC<CardProps> = ({ children, className = '', bgColor = '#F2EAE2' }) => {
  return (
    <div
      className={`rounded-2xl shadow-md p-4 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  );
};

export default Card;