import React from 'react';
import Hero37 from '../ui/hero-37';
import { Footer2 } from '../ui/footer2';
import LogoIcon, { CampusPassWatermark } from '@/assets/logo-icon';
import { FaDiscord, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { useCampusPass } from '../../context/CampusPassContext';

interface LandingPageProps {
  onExploreEvents?: () => void;
  onNavigate: (view: string, customPath?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreEvents, onNavigate }) => {
  const { institutionProfile, events, registrations, passes, theme } = useCampusPass();
  const isDark = theme === 'dark';

  const openEventsCount = events.filter(e => e.status === 'OPEN').length || 9;
  const totalPassesIssued = passes.length || registrations.filter(r => r.status === 'APPROVED').length || 8;

  const handleExplore = () => {
    if (onExploreEvents) {
      onExploreEvents();
    } else {
      onNavigate('DISCOVER', '/students');
    }
  };

  const socialLinks = [
    { icon: <FaDiscord className="h-3.5 w-3.5" />, href: "https://discord.com", label: "Discord" },
    { icon: <FaXTwitter className="h-3.5 w-3.5" />, href: "https://x.com", label: "X (Twitter)" },
    { icon: <FaLinkedin className="h-3.5 w-3.5" />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <FaGithub className="h-3.5 w-3.5" />, href: "https://github.com", label: "GitHub" },
  ];

  const linkGroups = [
    {
      title: "Explore",
      links: [
        {
          label: "Platform",
          href: "/students",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('DISCOVER', '/students');
          },
        },
        {
          label: "Solutions",
          href: "/students/applications",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('APPLICATIONS', '/students/applications');
          },
        },
        {
          label: "Integrations",
          href: "/admin",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('ADMIN', '/admin');
          },
        },
        {
          label: "Pricing",
          href: "/admin/analytics",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('ANALYTICS', '/admin/analytics');
          },
        },
        {
          label: "Changelog",
          href: "/admin/organizer",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('ORGANIZER', '/admin/organizer');
          },
        },
      ],
    },
    {
      title: "Organization",
      links: [
        { label: "About Us", href: "#", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: "Careers", href: "#", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: "Legal", href: "#", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: "Privacy Policy", href: "#", onClick: (e: React.MouseEvent) => e.preventDefault() },
      ],
    },
  ];

  return (
    <div className="dark bg-[#110d0a] text-white selection:bg-white/20 selection:text-white min-h-screen w-full flex flex-col justify-between overflow-x-hidden">
      {/* ── Hero Section (Hero37 Pattern) ────────────────────────── */}
      <Hero37
        onExploreEvents={handleExplore}
        onNavigate={onNavigate}
        brandName="CampusPass"
        headlineLine1="Where Innovation"
        headlineLine2="Meets Impact."
        subtitle="Empowering students to build, compete, and lead in premier hackathons, workshops, and cultural fests with instant cryptographic gate passes."
        ctaText="Explore"
        stat1Value={`${openEventsCount} Live Events`}
        stat1Label="Hackathons & Cultural Fests"
        stat2Value={`${totalPassesIssued} Passes Issued`}
        stat2Label="Atomic Turnstile Verification"
        tagline="Centralized College Event & Digital Pass Infrastructure"
      />

      {/* ── CampusPass Footer2 ─────── */}
      <Footer2
        dark={true}
        logo={<LogoIcon className="h-7 w-7 text-white" />}
        brandName="CampusPass"
        tagline="Centralized College Event & Digital Pass Infrastructure."
        socialText="Connect with us"
        socialLinks={socialLinks}
        linkGroups={linkGroups}
        newsletterSubtitle="The future of campus events is here."
        newsletterTitle="Join the CampusPass platform."
        newsletterPlaceholder="Enter email address"
        newsletterButtonText="Subscribe"
        copyright="© 2026 CampusPass Inc. All rights reserved."
        floatingIcon={<CampusPassWatermark className="w-full h-full" />}
      />
    </div>
  );
};

export default LandingPage;

