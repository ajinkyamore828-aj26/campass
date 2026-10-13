import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, style, ...props }, ref) => {
    return (
      <div className="wm-select-wrapper">
        <select
          ref={ref}
          className={`wm-select ${className}`}
          style={style}
          {...props}
        >
          {children}
        </select>
        <span className="wm-select-arrow" style={{ pointerEvents: 'none' }}>
          <ChevronDown size={15} />
        </span>
      </div>
    );
  }
);

Select.displayName = 'Select';
