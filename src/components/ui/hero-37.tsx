import React from "react";
import LogoIcon from "@/assets/logo-icon";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button31 } from "@/components/ui/button-31";

export interface Hero37Props {
  onExploreEvents?: () => void;
  onNavigate?: (view: string, customPath?: string) => void;
  brandName?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  subtitle?: string;
  ctaText?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  tagline?: string;
}

export default function Hero37({
  onExploreEvents,
  onNavigate,
  brandName = "CampusPass",
  headlineLine1 = "Where Innovation",
  headlineLine2 = "Meets Impact.",
  subtitle = "CampusPass empowers students to build, explore, and participate in premier college hackathons, technical workshops, and cultural fests with cryptographic instant passes.",
  ctaText = "Explore College Events",
}: Hero37Props) {
  // Nav: drops from top with blur — settles fast so it doesn't steal focus
  const navVariants: Variants = {
    hidden: { opacity: 0, y: -20, filter: 'blur(8px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 22, stiffness: 180, delay: 0.05 },
    },
  };

  // Background glow: fade + very subtle scale reveal
  const bgGlowVariants: Variants = {
    hidden: { opacity: 0, scale: 1.06 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0 },
    },
  };

  // Headline container: staggers each line
  const headlineContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.16, delayChildren: 0.35 },
    },
  };

  const headlineLineVariants: Variants = {
    hidden: { opacity: 0, y: 52, filter: 'blur(18px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 28, stiffness: 78, mass: 1.3 },
    },
  };

  const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 26, stiffness: 105, delay: 0.95 },
    },
  };

  // CTA button: scale + fade after subtitle
  const ctaVariants: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.93 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 22, stiffness: 120, delay: 1.18 },
    },
  };

  const handleNavClick = (view: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(view);
    }
  };

  return (
    <div
      className="dark relative min-h-screen w-full overflow-hidden antialiased selection:bg-white/20 selection:text-white"
      style={{ backgroundColor: '#110d0a' }}
    >
      <motion.div
        variants={bgGlowVariants}
        initial="hidden"
        animate="show"
        className="pointer-events-none absolute inset-0 z-0 will-change-transform select-none"
      >
        <img
          src="https://assets.watermelon.sh/bg-hero-37.avif"
          alt="Dramatic glow wave background"
          className="h-full w-full object-cover opacity-100"
        />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 20, display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <motion.nav
          variants={navVariants}
          initial="hidden"
          animate="show"
          className="hero-nav"
          style={{
            display: 'flex',
            width: '100%',
            boxSizing: 'border-box',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '8%',
            paddingRight: '8%',
            paddingTop: '24px',
            paddingBottom: '24px',
          }}
        >
          {/* Logo — grid icon + brand wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={handleNavClick('LANDING')}>
            <LogoIcon className="size-8" />
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff' }}>
              {brandName}
            </span>
          </div>
        </motion.nav>

        {/* ── Main hero content (exact original for web) */}
        <main
          className="hero-main"
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            boxSizing: 'border-box',
            paddingLeft: '8%',
            paddingRight: '8%',
            paddingTop: '40px',
            paddingBottom: '48px',
          }}
        >
          {/* Upper content — headline, subtitle, CTA */}
          <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Headline — two lines, each animates independently */}
            <motion.h1
              variants={headlineContainerVariants}
              initial="hidden"
              animate="show"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.08, fontWeight: 400, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}
            >
              <motion.span
                variants={headlineLineVariants}
                style={{ display: 'block' }}
                className="will-change-transform"
              >
                {headlineLine1}
              </motion.span>
              <motion.span
                variants={headlineLineVariants}
                style={{ display: 'block' }}
                className="will-change-transform"
              >
                {headlineLine2}
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={subtitleVariants}
              initial="hidden"
              animate="show"
              style={{
                marginTop: '20px',
                maxWidth: '460px',
                fontSize: '14px',
                lineHeight: 1.6,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.75)',
              }}
              className="will-change-transform"
            >
              {subtitle}
            </motion.p>

            {/* CTA buttons — Dedicated Student & Admin Portals */}
            <motion.div
              variants={ctaVariants}
              initial="hidden"
              animate="show"
              className="hero-cta-container relative z-30"
              style={{ marginTop: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 30 }}
            >
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('LOGIN_STUDENT', '/login/student') : (window.location.href = '/login/student')}
                style={{
                  paddingLeft: '28px',
                  paddingRight: '28px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#09090b',
                }}
                className="hero-cta-btn group min-h-[44px] text-[14.5px] font-bold tracking-[-0.005em] shadow-[0_1px_3px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.96] cursor-pointer hover:bg-zinc-100 transition-all"
              >
                <span style={{ color: '#09090b', fontWeight: 700 }}>Enter Student Portal</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1"
                  style={{ color: '#09090b' }}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('LOGIN_ADMIN', '/login/admin');
                  } else {
                    window.location.href = '/login/admin';
                  }
                }}
                style={{
                  paddingLeft: '28px',
                  paddingRight: '28px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#09090b',
                }}
                className="hero-cta-btn group min-h-[44px] text-[14.5px] font-bold tracking-[-0.005em] shadow-[0_1px_3px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.96] cursor-pointer hover:bg-zinc-100 transition-all"
              >
                <span style={{ color: '#09090b', fontWeight: 700 }}>Admin &amp; Faculty Portal</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1"
                  style={{ color: '#09090b' }}
                  aria-hidden="true"
                />
              </button>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Scoped CSS: ONLY active on mobile screens, zero effect on desktop web */}
      <style>{`
        @media (max-width: 768px) {
          .hero-nav {
            padding-left: 20px !important;
            padding-right: 20px !important;
            padding-top: 18px !important;
            padding-bottom: 18px !important;
          }
          .hero-main {
            padding-left: 20px !important;
            padding-right: 20px !important;
            padding-top: 24px !important;
            padding-bottom: 36px !important;
          }
          .hero-cta-container {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            position: relative !important;
            z-index: 40 !important;
          }
          .hero-cta-container > *,
          .hero-cta-btn {
            width: 100% !important;
            justify-content: center !important;
            min-height: 48px !important;
            background-color: #ffffff !important;
            opacity: 1 !important;
            color: #09090b !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.2) !important;
            border: 1px solid #ffffff !important;
            position: relative !important;
            z-index: 40 !important;
          }
          .hero-cta-btn span,
          .hero-cta-btn svg {
            color: #09090b !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
export { Hero37 };
