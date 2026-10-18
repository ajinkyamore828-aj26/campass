import React from 'react';
import { useCampusPass } from '@/context/CampusPassContext';

export interface FooterLink {
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface Footer2Props {
  logo?: React.ReactNode;
  brandName?: string;
  tagline?: string;
  socialLinks?: SocialLink[];
  socialText?: string;
  linkGroups?: FooterLinkGroup[];
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  copyright?: string;
  floatingIcon?: React.ReactNode;
  className?: string;
  forceDark?: boolean;
  dark?: boolean;
}

// CampusPass organic watermark
function CampusPassWatermarkBlob() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}
    >
      <path d="M45 75C45 35 72 18 105 18C138 18 165 35 165 75C165 120 140 170 105 170C70 170 45 120 45 75Z" />
      <circle cx="82" cy="85" r="9.5" fill="#171717" />
      <circle cx="128" cy="85" r="9.5" fill="#171717" />
    </svg>
  );
}

// Default CampusPass Logo
function DefaultCampusPassLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="white" />
      <circle cx="11.5" cy="16" r="2.2" fill="#d83c14" />
      <circle cx="20.5" cy="16" r="2.2" fill="#d83c14" />
    </svg>
  );
}

export function Footer2({
  logo,
  brandName = 'CampusPass',
  tagline = 'Centralized College Event & Digital Pass Infrastructure.',
  socialLinks = [],
  socialText = 'Connect with us',
  linkGroups = [],
  newsletterTitle = 'Join the CampusPass platform.',
  newsletterSubtitle = 'Next-generation campus event experiences.',
  newsletterPlaceholder = 'Enter email address',
  newsletterButtonText = 'Subscribe',
  copyright = '© 2026 CampusPass Inc. All rights reserved.',
  floatingIcon,
  className = '',
  forceDark,
  dark,
}: Footer2Props) {
  const { theme } = useCampusPass();
  const isDark = forceDark !== undefined ? forceDark : dark !== undefined ? dark : true;

  return (
    <footer
      className={className}
      style={{
        width: '100%',
        backgroundColor: isDark ? '#110d0a' : '#faf7f2',
        padding: '36px clamp(16px, 2vw, 36px) 48px clamp(16px, 2vw, 36px)',
        boxSizing: 'border-box',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* ── Main Container: Cards ALWAYS side-by-side on desktop & tablet ── */}
      <div
        className="footer2-container"
        style={{
          maxWidth: '1760px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Left Card: Warm Amber / Silk Wave Gradient matching Landing Page ──────── */}
        <div
          className="footer2-left-card"
          style={{
            flex: '0 0 clamp(420px, 28vw, 500px)',
            maxWidth: '100%',
            background: 'linear-gradient(145deg, #f86522 0%, #dc4218 52%, #b32d06 100%)',
            backgroundColor: '#dc4218',
            color: '#ffffff',
            borderRadius: '40px',
            padding: '44px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            minHeight: '480px',
            boxShadow: '0 20px 45px rgba(220, 66, 24, 0.28)',
          }}
        >
          {/* Top: Logo + Brand Name */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {logo ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{logo}</div>
              ) : (
                <DefaultCampusPassLogo />
              )}
              <span style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                {brandName}
              </span>
            </div>

            {/* Middle: Tagline */}
            <div className="footer2-tagline-container" style={{ marginTop: '80px' }}>
              <h2
                className="footer2-tagline"
                style={{
                  fontSize: '35px',
                  fontWeight: 700,
                  lineHeight: 1.18,
                  letterSpacing: '-0.025em',
                  color: '#ffffff',
                  margin: 0,
                  maxWidth: '380px',
                }}
              >
                {tagline}
              </h2>
            </div>
          </div>

          {/* Bottom: Social Bar */}
          <div className="footer2-social-bar" style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', opacity: 0.95, whiteSpace: 'nowrap' }}>
              {socialText}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#2b0c03',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#180601';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2b0c03';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Card: Dark Carbon / Clean White Links & Newsletter Block ── */}
        <div
          className="footer2-right-card"
          style={{
            flex: 1,
            backgroundColor: isDark ? '#171717' : '#ffffff',
            borderRadius: '40px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e2e8f0',
            padding: '44px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
            minHeight: '480px',
            boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 12px 30px rgba(0, 0, 0, 0.05)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Faint Organic Watermark in Top Right */}
          <div
            className="footer2-watermark"
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '270px',
              height: '270px',
              color: isDark ? '#222222' : '#f8fafc',
              pointerEvents: 'none',
              userSelect: 'none',
              transform: 'rotate(12deg)',
              zIndex: 1,
            }}
          >
            {floatingIcon || <CampusPassWatermarkBlob />}
          </div>

          {/* Top: Navigation Link Groups */}
          <div
            className="footer2-links-group"
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '100px',
            }}
          >
            {linkGroups.map((group, idx) => (
              <div key={idx} style={{ minWidth: '120px' }}>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
                    letterSpacing: '-0.01em',
                    margin: '0 0 22px 0',
                  }}
                >
                  {group.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {group.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.href}
                        onClick={link.onClick}
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isDark ? '#ffffff' : '#0f172a',
                          textDecoration: 'none',
                          display: 'inline-block',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f86522';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isDark ? '#ffffff' : '#0f172a';
                        }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom: Copyright on Left, Newsletter Form on Right */}
          <div
            className="footer2-bottom-row"
            style={{
              position: 'relative',
              zIndex: 2,
              marginTop: 'auto',
              paddingTop: '40px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {/* Copyright */}
            <div className="footer2-copyright" style={{ fontSize: '12px', fontWeight: 400, color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#94a3b8', whiteSpace: 'nowrap' }}>
              {copyright}
            </div>

            {/* Newsletter Subscription Box */}
            <div className="footer2-newsletter-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '380px', width: '100%' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#64748b', margin: '0 0 4px 0' }}>
                {newsletterSubtitle}
              </p>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.01em' }}>
                {newsletterTitle}
              </h4>
              <form
                className="footer2-newsletter-form"
                onSubmit={(e) => e.preventDefault()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  height: '46px',
                  borderRadius: '9999px',
                  backgroundColor: isDark ? '#242424' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                  padding: '4px 4px 4px 18px',
                  boxSizing: 'border-box',
                }}
              >
                <input
                  type="email"
                  placeholder={newsletterPlaceholder}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '13.5px',
                    paddingRight: '10px',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '38px',
                    padding: '0 20px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #f86522 0%, #dc4218 100%)',
                    backgroundColor: '#dc4218',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 10px rgba(220, 66, 24, 0.35)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff7438 0%, #e04a1f 100%)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f86522 0%, #dc4218 100%)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {newsletterButtonText}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          .footer2-container {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .footer2-left-card {
            width: 100% !important;
            flex: none !important;
            min-height: auto !important;
            padding: 32px 24px !important;
            border-radius: 28px !important;
          }
          .footer2-tagline-container {
            margin-top: 36px !important;
          }
          .footer2-tagline {
            font-size: 26px !important;
            line-height: 1.22 !important;
            max-width: 100% !important;
          }
          .footer2-social-bar {
            margin-top: 36px !important;
            padding-top: 24px !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          .footer2-right-card {
            width: 100% !important;
            padding: 32px 24px 28px 24px !important;
            border-radius: 28px !important;
            min-height: auto !important;
          }
          .footer2-watermark {
            width: 180px !important;
            height: 180px !important;
            top: -20px !important;
            right: -20px !important;
            opacity: 0.12 !important;
          }
          .footer2-links-group {
            gap: 32px 48px !important;
          }
          .footer2-bottom-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 24px !important;
            margin-top: 36px !important;
          }
          .footer2-newsletter-box {
            max-width: 100% !important;
            width: 100% !important;
          }
          .footer2-newsletter-form {
            width: 100% !important;
          }
          .footer2-copyright {
            order: 2 !important;
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .footer2-left-card {
            padding: 24px 18px !important;
            border-radius: 24px !important;
          }
          .footer2-tagline {
            font-size: 23px !important;
          }
          .footer2-right-card {
            padding: 28px 18px 24px 18px !important;
            border-radius: 24px !important;
          }
          .footer2-links-group {
            gap: 24px 36px !important;
          }
          .footer2-newsletter-form {
            padding-left: 14px !important;
          }
          .footer2-newsletter-form button {
            padding: 0 14px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer2;
