import React from "react";
import LogoIcon from "@/assets/logo-icon";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button31 } from "@/components/ui/button-31";

export interface Hero37Props {
  onExploreEvents?: () => void;
  onNavigate?: (view: string) => void;
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
  stat1Value = "9 Live Events",
  stat1Label = "Competitions & Fests",
  stat2Value = "Instant Gate Pass",
  stat2Label = "Turnstile Verification",
  tagline = "Centralized College Event & Digital Pass Management Infrastructure",
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

  // Stats container: staggers each stat
  const statsContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 1.4 },
    },
  };

  // Each stat: rises from bottom with blur
  const statItemVariants: Variants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(7px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 24, stiffness: 100 },
    },
  };

  // Right tagline (bottom-right): fades in last
  const taglineVariants: Variants = {
    hidden: { opacity: 0, x: 18, filter: 'blur(5px)' },
    show: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 24, stiffness: 100, delay: 1.6 },
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
          className="h-full w-full object-cover"
        />
      </motion.div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <motion.nav
          variants={navVariants}
          initial="hidden"
          animate="show"
          style={{
            display: 'flex',
            width: '100%',
            boxSizing: 'border-box',
            alignItems: 'center',
            paddingLeft: '8%',
            paddingRight: '8%',
            paddingTop: '28px',
            paddingBottom: '28px',
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

        {/* ── Main hero content */}
        <main
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

            {/* CTA button — Button31 Design */}
            <motion.div
              variants={ctaVariants}
              initial="hidden"
              animate="show"
              style={{ marginTop: '28px' }}
              className="will-change-transform"
            >
              <Button31
                onClick={() => onExploreEvents ? onExploreEvents() : onNavigate?.('DISCOVER')}
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
                }}
                className="group min-h-[44px] text-[14.5px] font-semibold tracking-[-0.005em] shadow-[0_1px_3px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.96]"
              >
                <span>{ctaText}</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button31>
            </motion.div>
          </div>

        </main>
      </div>
    </div>
  );
}
export { Hero37 };
