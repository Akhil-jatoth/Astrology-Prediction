import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div
      className={`glass-panel p-6 ${glow ? 'glow-cta' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
