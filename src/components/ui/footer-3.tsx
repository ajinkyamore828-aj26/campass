import React from 'react';
import { FaLinkedinIn, FaXTwitter, FaInstagram } from 'react-icons/fa6';

export interface Footer3LinkGroup {
  title: string;
  links: { label: string; href: string; onClick?: (e: React.MouseEvent) => void }[];
}

export interface Footer3SocialLink {
  icon: React.ReactNode;
  href: string;
  label?: string;
}

export interface Footer3Props {
  logo?: React.ReactNode;
  brandName?: string;
  description?: string;
  socialLinks?: Footer3SocialLink[];
  linkGroups?: Footer3LinkGroup[];
  copyright?: string;
  legalLinks?: { label: string; href: string }[];
}

export function Footer3({
  logo,
  brandName,
  description,
  socialLinks = [],
  linkGroups = [],
  copyright,
  legalLinks = [],
}: Footer3Props) {
  return (
    <footer
      style={{
        width: '100%',
        backgroundColor: '#110d0a',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '64px',
        paddingBottom: '0',
        boxSizing: 'border-box',
      }}
    >
      {/* Main content grid */}
      <div
        style={{
          width: '100%',
          paddingLeft: '8%',
          paddingRight: '8%',
          boxSizing: 'border-box',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 md:gap-12 pb-12 w-full">
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Logo + brand name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              {logo && <div style={{ color: '#ffffff' }}>{logo}</div>}
              {brandName && (
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {brandName}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                {description}
              </p>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label || 'Social link'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.65)',
                      transition: 'background-color 0.15s, color 0.15s',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.14)';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)';
                    }}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link group columns */}
          {linkGroups.map((group, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {group.title}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      onClick={link.onClick}
                      style={{
                        fontSize: '13.5px',
                        color: 'rgba(255,255,255,0.55)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)'; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '8%',
          paddingRight: '8%',
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {copyright && (
          <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{copyright}</p>
        )}
        {legalLinks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {legalLinks.map((link, index) => (
              <React.Fragment key={index}>
                <a
                  href={link.href}
                  onClick={(e) => { if (link.href?.startsWith('#')) e.preventDefault(); }}
                  style={{
                    fontSize: '12.5px',
                    color: 'rgba(255,255,255,0.4)',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'; }}
                >
                  {link.label}
                </a>
                {index < legalLinks.length - 1 && (
                  <span style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer3;
