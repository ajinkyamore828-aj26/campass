"use client";

import * as React from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Props interface for type safety and reusability
export interface AnimatedStatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  primaryValue: number;
  secondaryValue: number | string;
  secondaryLabel: string;
  icon: React.ReactNode;
  subtitle?: string;
  unit?: string;
  statusBadge?: string;
  statusColor?: string;
  compact?: boolean;
  decimals?: number;
}

const AnimatedStatsCard = React.forwardRef<HTMLDivElement, AnimatedStatsCardProps>(
  (
    {
      title,
      primaryValue,
      secondaryValue,
      secondaryLabel,
      icon,
      subtitle,
      unit,
      statusBadge,
      statusColor = '#15803d',
      compact = false,
      decimals = 1,
      className,
      ...props
    },
    ref
  ) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { once: true, margin: "-50px" });

    // Spring animation for a more natural number count-up
    const spring = useSpring(0, {
      damping: 45,
      stiffness: 180,
      mass: 0.9,
    });
    
    // Transform the motion value to format it with specified decimal places
    const displayValue = useTransform(spring, (current) => current.toFixed(decimals));

    // Update spring value when component is in view
    React.useEffect(() => {
      if (isInView) {
        spring.set(primaryValue);
      }
    }, [isInView, primaryValue, spring]);

    // Compact layout: engineered for the Campus Platform & Cloud Telemetry section
    if (compact) {
      return (
        <div
          ref={cardRef}
          className={cn(
            "relative flex flex-col justify-between overflow-hidden rounded-xl p-3.5 transition-all",
            "bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
            "before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.035)_2%,transparent_2%)] before:bg-[length:14px_14px]",
            className
          )}
          {...props}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[12.5px] font-bold text-slate-900 truncate leading-tight">
                  {title}
                </h4>
                {subtitle && (
                  <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5 leading-tight">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {statusBadge && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md leading-none">
                  {statusBadge}
                </span>
              )}
              <div className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                {icon}
              </div>
            </div>
          </div>

          {/* Metric Row with count-up, divider bar & secondary stats */}
          <div className="flex items-end justify-between gap-3 pt-3">
            {/* Primary Value with Unit */}
            <div className="flex items-baseline shrink-0" aria-live="polite">
              <motion.span className="text-[22px] font-black tracking-tight text-slate-900 leading-none">
                {displayValue}
              </motion.span>
              {unit && (
                <span className="text-[11px] font-bold text-slate-500 ml-0.5 leading-none">
                  {unit}
                </span>
              )}
            </div>

            {/* Horizontal Line with subtle progress fill */}
            <div className="mb-2 h-1.5 w-full flex-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(15, primaryValue))}%` }}
              />
            </div>

            {/* Secondary Value & Label */}
            <div className="flex flex-col items-end text-right shrink-0">
              <span className="text-[15px] font-bold tracking-tight text-slate-800 leading-none">
                {secondaryValue}
              </span>
              <span className="text-[10px] font-medium text-slate-500 mt-1 leading-none">
                {secondaryLabel}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Default / Standard layout (for demo or standalone display)
    return (
      <div
        ref={cardRef}
        className={cn(
          "relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl p-6",
          "bg-primary text-primary-foreground",
          "shadow-lg transition-all hover:shadow-2xl",
          "before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary-foreground)/0.05)_2%,transparent_2%)] before:bg-[length:20px_20px]",
          className
        )}
        {...props}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-primary-foreground/90">{title}</h2>
            {subtitle && <p className="text-xs text-primary-foreground/70 mt-0.5">{subtitle}</p>}
          </div>
          <div className="rounded-full bg-primary-foreground/10 p-2">{icon}</div>
        </div>

        {/* Main Content */}
        <div className="z-10 flex flex-1 items-end justify-between gap-4 pt-8">
          {/* Animated Primary Value */}
          <div className="flex items-baseline" aria-live="polite">
            <motion.h1 className="text-5xl font-bold tracking-tighter">
              {displayValue}
            </motion.h1>
            {unit && <span className="text-lg font-semibold ml-1">{unit}</span>}
          </div>
          {/* Horizontal Line */}
          <div className="mb-4 h-1 w-full flex-1 rounded-full bg-primary-foreground/20" />
          {/* Secondary Value */}
          <div className="flex flex-col items-center text-right">
            <span className="text-3xl font-semibold tracking-tight">
              {secondaryValue}
            </span>
            <span className="text-sm font-light text-primary-foreground/80">
              {secondaryLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

AnimatedStatsCard.displayName = "AnimatedStatsCard";

export { AnimatedStatsCard };
