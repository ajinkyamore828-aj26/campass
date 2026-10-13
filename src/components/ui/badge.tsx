import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  icon,
  className = '',
  style,
  ...props
}) => {
  return (
    <span
      className={`wm-badge wm-badge-${variant} ${className}`}
      style={style}
      {...props}
    >
      {icon && <span className="wm-badge-icon">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
