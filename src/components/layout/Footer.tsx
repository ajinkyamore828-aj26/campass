import React from 'react';
import { Footer3 } from '../ui/footer-3';
import LogoIcon from '@/assets/logo-icon';
import { FaLinkedinIn, FaXTwitter, FaInstagram } from 'react-icons/fa6';

export interface FooterProps {
  onNavigate?: (view: string) => void;
  companyName?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  emailContact?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  companyName = 'CampusPass',
  addressLine1 = 'Axiogen Innovation Hub',
  addressLine2 = 'Sector 4, University Enclave',
  phone = '+91 98765 01001',
  emailContact = 'events@axiogen.in',
}) => {
  const socialLinks = [
    { icon: <FaLinkedinIn className="w-4 h-4" />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <FaXTwitter className="w-4 h-4" />, href: "https://x.com", label: "X (Twitter)" },
    { icon: <FaInstagram className="w-4 h-4" />, href: "https://instagram.com", label: "Instagram" },
  ];

  const linkGroups = [
    {
      title: "Platform",
      links: [
        {
          label: "Events",
          href: "#events",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate?.('DISCOVER');
          },
        },
        {
          label: "My Passes",
          href: "#passes",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate?.('APPLICATIONS');
          },
        },
        {
          label: "Analytics",
          href: "#analytics",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate?.('ANALYTICS');
          },
        },
        {
          label: "Organizer Studio",
          href: "#organizer",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate?.('ORGANIZER');
          },
        },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Campus Guidelines", href: "#guidelines" },
        { label: "Gate Turnstile FAQ", href: "#turnstiles" },
        { label: "Security & Verification", href: "#security" },
        { label: "Developer API", href: "#api" },
      ],
    },
    {
      title: "Campus",
      links: [
        { label: companyName, href: "#institution" },
        { label: `${addressLine1}, ${addressLine2}`, href: "#address" },
        { label: emailContact, href: `mailto:${emailContact}` },
        { label: phone, href: `tel:${phone}` },
      ],
    },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Cookies", href: "#cookies" },
  ];

  return (
    <Footer3
      logo={<LogoIcon className="size-8" />}
      brandName={companyName}
      description="Next-generation college event infrastructure with instant cryptographic passes, seamless registrations, and real-time gate turnstile analytics."
      socialLinks={socialLinks}
      linkGroups={linkGroups}
      copyright={`© 2026 ${companyName} Platform. All rights reserved.`}
      legalLinks={legalLinks}
    />
  );
};

export default Footer;
