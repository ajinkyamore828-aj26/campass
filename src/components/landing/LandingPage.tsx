import React from 'react';
import Hero37 from '../ui/hero-37';
import { Footer3 } from '../ui/footer-3';
import LogoIcon from '@/assets/logo-icon';
import { FaLinkedinIn, FaXTwitter, FaInstagram } from 'react-icons/fa6';
import { useCampusPass } from '../../context/CampusPassContext';

interface LandingPageProps {
  onExploreEvents?: () => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreEvents, onNavigate }) => {
  const { institutionProfile, events, registrations, passes } = useCampusPass();

  const openEventsCount = events.filter(e => e.status === 'OPEN').length || 9;
  const totalPassesIssued = passes.length || registrations.filter(r => r.status === 'APPROVED').length || 8;

  const handleExplore = () => {
    if (onExploreEvents) {
      onExploreEvents();
    } else {
      onNavigate('DISCOVER');
    }
  };

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
            onNavigate('DISCOVER');
          },
        },
        {
          label: "My Passes",
          href: "#passes",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('APPLICATIONS');
          },
        },
        {
          label: "Analytics",
          href: "#analytics",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('ANALYTICS');
          },
        },
        {
          label: "Organizer Studio",
          href: "#organizer",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate('ORGANIZER');
          },
        },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Campus Guidelines", href: "#campuspass", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: "Gate Turnstile FAQ", href: "#campuspass", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: "Security & Verification", href: "#campuspass", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: "Developer API", href: "#campuspass", onClick: (e: React.MouseEvent) => e.preventDefault() },
      ],
    },
    {
      title: "Campus",
      links: [
        { label: institutionProfile?.collegeName || "Apex Institute of Science & Technology", href: "#campuspass", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: "Sector 4, University Enclave", href: "#campuspass", onClick: (e: React.MouseEvent) => e.preventDefault() },
        { label: institutionProfile?.supportEmail || "events@apex.edu", href: `mailto:${institutionProfile?.supportEmail || 'events@apex.edu'}` },
        { label: institutionProfile?.supportPhone || "+91 98765 01001", href: `tel:${institutionProfile?.supportPhone || '+91 98765 01001'}` },
      ],
    },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#campuspass" },
    { label: "Terms of Service", href: "#campuspass" },
    { label: "Cookies", href: "#campuspass" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#110d0a] text-white selection:bg-white/20 selection:text-white flex flex-col justify-between overflow-x-hidden">
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

      {/* ── Footer exclusively on the Standalone Landing Page ────── */}
      <Footer3
        logo={<LogoIcon className="size-8" />}
        brandName="CampusPass"
        description="Next-generation college event infrastructure with instant cryptographic passes, seamless registrations, and real-time gate turnstile analytics."
        socialLinks={socialLinks}
        linkGroups={linkGroups}
        copyright="© 2026 CampusPass Platform. All rights reserved."
        legalLinks={legalLinks}
      />
    </div>
  );
};

export default LandingPage;

