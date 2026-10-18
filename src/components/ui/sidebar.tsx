"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export interface Links {
  label: string;
  href?: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

// Universal Link component for React/Vite and Next.js environments
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href = "#", className, children, onClick, ...props }, ref) => {
    return (
      <a ref={ref} href={href} onClick={onClick} className={className} {...props}>
        {children}
      </a>
    );
  }
);
Link.displayName = "Link";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  mobileOpen: mobileOpenProp,
  setMobileOpen: setMobileOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [mobileOpenState, setMobileOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  const mobileOpen = mobileOpenProp !== undefined ? mobileOpenProp : mobileOpenState;
  const setMobileOpen = setMobileOpenProp !== undefined ? setMobileOpenProp : setMobileOpenState;

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, mobileOpen, setMobileOpen, animate }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  mobileOpen,
  setMobileOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider
      open={open}
      setOpen={setOpen}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      animate={animate}
    >
      {children}
    </SidebarProvider>
  );
};

export interface SidebarBodyProps extends Omit<React.ComponentProps<typeof motion.div>, "children"> {
  children?: React.ReactNode;
  hideMobileTrigger?: boolean;
}

export const SidebarBody = ({
  className,
  children,
  hideMobileTrigger = false,
  ...props
}: SidebarBodyProps) => {
  return (
    <>
      <DesktopSidebar className={className} {...props}>
        {children}
      </DesktopSidebar>
      <MobileSidebar
        className={className}
        hideTrigger={hideMobileTrigger}
        {...(props as React.ComponentProps<"div">)}
      >
        {children}
      </MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof motion.div>, "children"> & { children?: React.ReactNode }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-slate-100/90 dark:bg-zinc-900/95 border-r border-slate-200/80 dark:border-zinc-800 w-[280px] flex-shrink-0 transition-colors duration-200 select-none",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "64px") : "280px",
      }}
      transition={{
        duration: 0.25,
        ease: [0.25, 1, 0.5, 1],
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  hideTrigger = false,
  ...props
}: React.ComponentProps<"div"> & { hideTrigger?: boolean }) => {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <>
      {!hideTrigger && (
        <div
          className={cn(
            "h-12 px-4 flex flex-row md:hidden items-center justify-between bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 w-full"
          )}
          {...props}
        >
          <div className="flex justify-end z-20 w-full">
            <Menu
              className="text-slate-800 dark:text-zinc-200 cursor-pointer size-5"
              onClick={() => setMobileOpen(!mobileOpen)}
            />
          </div>
        </div>
      )}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-[99] backdrop-blur-xs md:hidden"
            />
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.28,
                ease: [0.25, 1, 0.5, 1],
              }}
              className={cn(
                "fixed top-0 bottom-0 left-0 h-full w-[285px] max-w-[85vw] bg-white dark:bg-[#121214] p-5 z-[100] flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-zinc-800 md:hidden overflow-y-auto",
                className
              )}
            >
              <div
                className="absolute right-3.5 top-3.5 z-50 text-slate-700 dark:text-zinc-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </div>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  props?: LinkProps;
}) => {
  const { open, animate, setMobileOpen } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileOpen(false);
    if (link.onClick) {
      e.preventDefault();
      link.onClick(e);
    } else if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Link
      href={link.href || "#"}
      onClick={handleClick}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2 px-2.5 rounded-lg transition-colors duration-150 cursor-pointer",
        link.active
          ? "bg-slate-200/90 text-slate-900 dark:bg-zinc-800 dark:text-white font-semibold shadow-2xs"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/70",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 flex items-center justify-center size-5 text-current">
        {link.icon}
      </div>
      <motion.div
        animate={{
          display: animate ? (open ? "flex" : "none") : "flex",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap min-w-0"
      >
        <span className="text-sm truncate group-hover/sidebar:translate-x-0.5 transition duration-150">
          {link.label}
        </span>
        {link.badge && (
          <span className="ml-2 text-[10.5px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200/90 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200">
            {link.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
};
