import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  style,
  disabled,
  ...props
}, ref) => {
  const baseClass = 'wm-btn';
  const variantClass = `wm-btn-${variant}`;
  const sizeClass = `wm-btn-${size}`;

  return (
    <button
      ref={ref}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      style={style}
      {...props}
    >
      {icon && <span className="wm-btn-icon">{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
