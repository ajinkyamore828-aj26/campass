import React from 'react';
import { Footer2 } from './index';
import { FaDiscord, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import LogoIcon, { CampusPassWatermark } from '@/assets/logo-icon';

export default function Footer2Demo() {
  return (
    <div className="w-full bg-[#110d0a] min-h-screen flex items-center justify-center p-4">
      <Footer2
        logo={<LogoIcon className="h-7 w-7" />}
        brandName="CampusPass"
        tagline="Centralized College Event & Digital Pass Infrastructure."
        socialText="Connect with us"
        socialLinks={[
          {
            icon: <FaDiscord className="h-3.5 w-3.5" />,
            href: 'https://discord.com',
            label: 'Discord',
          },
          {
            icon: <FaXTwitter className="h-3.5 w-3.5" />,
            href: 'https://x.com',
            label: 'X (Twitter)',
          },
          {
            icon: <FaLinkedin className="h-3.5 w-3.5" />,
            href: 'https://linkedin.com',
            label: 'LinkedIn',
          },
          {
            icon: <FaGithub className="h-3.5 w-3.5" />,
            href: 'https://github.com',
            label: 'GitHub',
          },
        ]}
        linkGroups={[
          {
            title: 'Explore',
            links: [
              { label: 'Platform', href: '#' },
              { label: 'Solutions', href: '#' },
              { label: 'Integrations', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'Changelog', href: '#' },
            ],
          },
          {
            title: 'Organization',
            links: [
              { label: 'About Us', href: '#' },
              { label: 'Careers', href: '#' },
              { label: 'Legal', href: '#' },
              { label: 'Privacy Policy', href: '#' },
            ],
          },
        ]}
        newsletterSubtitle="Next-generation campus event experiences."
        newsletterTitle="Join the CampusPass platform."
        newsletterPlaceholder="Enter email address"
        newsletterButtonText="Subscribe"
        copyright="© 2026 CampusPass Inc. All rights reserved."
        floatingIcon={<CampusPassWatermark className="w-full h-full" />}
      />
    </div>
  );
}
