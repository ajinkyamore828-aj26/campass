import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, style, ...props }, ref) => {
    if (icon) {
      return (
        <div className="wm-input-wrapper">
          <span className="wm-input-icon">{icon}</span>
          <input
            ref={ref}
            className={`wm-input wm-input-with-icon ${className}`}
            style={style}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={`wm-input ${className}`}
        style={style}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
