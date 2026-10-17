import React from 'react';

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function LogoIcon({ className = 'size-8', ...props }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="#ffffff" fillOpacity="0.1" />
      <rect x="6" y="6" width="8" height="8" rx="2.5" fill="#ffffff" />
      <rect x="18" y="6" width="8" height="8" rx="2.5" fill="#ffffff" fillOpacity="0.8" />
      <rect x="6" y="18" width="8" height="8" rx="2.5" fill="#ffffff" fillOpacity="0.8" />
      <rect x="18" y="18" width="8" height="8" rx="2.5" fill="#ffffff" fillOpacity="0.4" />
    </svg>
  );
}
