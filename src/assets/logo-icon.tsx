import React from 'react';
import logoImg from './campuspass-logo.png';

export interface CampusPassLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  size?: number | string;
  variant?: 'duotone' | 'monochrome' | 'dark' | 'light';
  primaryColor?: string;
  accentColor?: string;
  apertureColor?: string;
}

/**
 * CampusPass Official Logo Mark — Selected by user:
 * campuspass_logo_mark_v2_1792344740048.jpg
 * 
 * - Monolithic dark slate credential badge
 * - Lanyard slot cutout at top
 * - Architectural collegiate campus archway portal in crisp solid white
 * - Single celestial sky-blue verification dot
 */
export const CampusPassLogo: React.FC<CampusPassLogoProps> = ({
  className = 'size-8',
  size,
  variant,
  primaryColor,
  accentColor,
  apertureColor,
  style,
  alt = 'CampusPass Logo',
  ...props
}) => {
  const sizeStyle: React.CSSProperties = {
    ...(size ? { width: size, height: size } : {}),
    ...style,
  };

  return (
    <img
      src={logoImg}
      alt={alt}
      className={`object-contain rounded-md select-none ${className}`}
      style={sizeStyle}
      draggable={false}
      {...props}
    />
  );
};

/**
 * Drop-in backwards-compatible LogoIcon export
 */
export const LogoIcon: React.FC<CampusPassLogoProps> = (props) => {
  return <CampusPassLogo {...props} />;
};

/**
 * Large Architectural Gateway Watermark for hero backdrops and footers
 */
export function CampusPassWatermark({ className = 'w-full h-full', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 84 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect
        x="12"
        y="8"
        width="60"
        height="68"
        rx="16"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <rect
        x="34"
        y="16"
        width="16"
        height="4"
        rx="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M26 64V38C26 29.1634 33.1634 22 42 22C50.8366 22 58 29.1634 58 38V64H46V40C46 37.7909 44.2091 36 42 36C39.7909 36 38 37.7909 38 40V64H26Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
}

export default LogoIcon;
