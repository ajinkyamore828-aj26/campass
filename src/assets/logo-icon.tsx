import React from 'react';

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function LogoIcon({ className = 'size-8', ...props }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="36" height="36" rx="10" fill="white" />
      <circle cx="13" cy="18" r="2.2" fill="#d83c14" />
      <circle cx="23" cy="18" r="2.2" fill="#d83c14" />
    </svg>
  );
}

export function CampusPassWatermark({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M40 70C40 32 68 18 100 18C132 18 160 32 160 70C160 115 135 165 100 165C65 165 40 115 40 70Z" />
      <circle cx="78" cy="80" r="10" fill="#171717" />
      <circle cx="122" cy="80" r="10" fill="#171717" />
    </svg>
  );
}

export default LogoIcon;

