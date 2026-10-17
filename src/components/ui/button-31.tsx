import React from 'react';
import { Button } from '@/components/base-ui/button';

export interface Button31Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const Button31: React.FC<Button31Props> = ({
  children = "Get Started",
  className = "",
  style,
  ...props
}) => {
  return (
    <Button
      className={`from-primary via-primary/60 to-primary bg-transparent bg-gradient-to-r [background-size:200%_auto] hover:bg-transparent hover:bg-[99%_center] transition-all duration-300 cursor-pointer ${className}`}
      style={{
        paddingLeft: '26px',
        paddingRight: '26px',
        paddingTop: '12px',
        paddingBottom: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button31;
export { Button31 };
