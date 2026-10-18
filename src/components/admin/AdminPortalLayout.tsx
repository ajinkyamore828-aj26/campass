import React, { useState, useRef, useEffect } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import { AdminPortal } from './AdminPortal';
import { EventDiscovery } from '../student/EventDiscovery';
import { OrganizerStudio } from '../organizer/OrganizerStudio';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import {
  GraduationCap,
  ShieldCheck,
  Compass,
  Calendar,
  BarChart3,
  ShieldAlert,
  Bell,
  Home,
  LogOut,
  User,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MenuIcon } from '@/components/ui/icons-menu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { CampusPassLogo } from '@/assets/logo-icon';

interface AdminPortalLayoutProps {
  currentView: string;
  onNavigate: (view: string, customPath?: string) => void;
  globalSearch?: string;
}

export const AdminPortalLayout: React.FC<AdminPortalLayoutProps> = ({
  currentView,
  onNavigate,
  globalSearch = '',
}) => {
  const {
    institutionProfile,
    currentUser,
    events,
    registrations,
    announcements,
    theme,
  } = useCampusPass();
  const isDark = theme === 'dark';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotifCat, setSelectedNotifCat] = useState<string>('all');

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const pendingApprovals = registrations.filter(r => r.status === 'PENDING').length;
  const openEvents = events.filter(e => e.status === 'OPEN').length;
  const unreadAnnouncements = announcements.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const adminNavItems = [
    {
      id: 'ADMIN',
      path: '/admin',
      icon: ShieldAlert,
      label: 'Admin Control Center',
      desc: 'Users, roles, passes, global controls',
    },
    {
      id: 'DISCOVER',
      path: '/admin/events',
      icon: Compass,
      label: 'Event Registry & Cards',
      desc: 'Live cards, cover images & details',
      badge: openEvents > 0 ? `${openEvents} live` : undefined,
    },
    {
      id: 'ORGANIZER',
      path: '/admin/organizer',
      icon: Calendar,
      label: 'Organizer Studio',
      desc: 'Multi-round stages & participant desk',
      badge: pendingApprovals > 0 ? `${pendingApprovals} pending` : undefined,
      badgeColor: 'amber',
    },
    {
      id: 'ANALYTICS',
      path: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics Hub',
      desc: 'Real-time velocity & metrics',
    },
  ];

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedNotifCat === 'all') return true;
    if (selectedNotifCat === 'alerts') return a.priority === 'URGENT';
    if (selectedNotifCat === 'reminders') return a.title?.toLowerCase().includes('reminder') || a.title?.toLowerCase().includes('close');
    return a.priority !== 'URGENT';
  });

  return (
    <div className="demostack-shell">
      {/* ── Admin Navigation Sidebar (Aceternity Animated Collapsible) ───────────────── */}
      <Sidebar
        open={isSidebarOpen}
        setOpen={setIsSidebarOpen}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      >
        <SidebarBody hideMobileTrigger className="justify-between gap-4 h-full">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Header: Brand & Security Badge */}
            {(isSidebarOpen || mobileMenuOpen) ? (
              <div className="flex items-center gap-3 py-1.5 px-1 min-w-0">
                <CampusPassLogo className="size-9 rounded-lg flex-shrink-0 object-contain shadow-xs bg-zinc-900 border border-zinc-800" />
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <span className="text-[13px] font-extrabold text-slate-900 dark:text-zinc-100 truncate leading-tight">
                    {institutionProfile.collegeName}
                  </span>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    Admin &amp; Faculty Portal
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-1.5">
                <CampusPassLogo
                  className="size-9 rounded-lg flex items-center justify-center object-contain shadow-xs bg-zinc-900 border border-zinc-800"
                  title={`${institutionProfile.collegeName} - Admin Portal`}
                />
              </div>
            )}

            {/* Section Label (Visible when expanded) */}
            {(isSidebarOpen || mobileMenuOpen) && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 pt-5 pb-1">
                Management Modules
              </p>
            )}

            {/* Navigation Links */}
            <div className={cn("flex flex-col gap-1.5", !(isSidebarOpen || mobileMenuOpen) && "mt-5")}>
              {adminNavItems.map((item) => (
                <SidebarLink
                  key={item.id}
                  link={{
                    label: item.label,
                    href: item.path,
                    icon: <item.icon className="size-4.5 flex-shrink-0" />,
                    active: currentView === item.id,
                    badge: item.badge,
                    badgeColor: item.badgeColor,
                    onClick: () => {
                      setMobileMenuOpen(false);
                      onNavigate(item.id, item.path);
                    },
                  }}
                />
              ))}
            </div>

            {/* System Status Pill (when open) */}
            {(isSidebarOpen || mobileMenuOpen) && (
              <div className="mt-4 p-2.5 rounded-lg border border-slate-200/90 dark:border-zinc-800 bg-slate-200/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Core Services Live</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                  API (:4000) &bull; Vite Client &bull; DB
                </div>
              </div>
            )}
          </div>

          {/* Footer: Admin Profile & Navigation Outlets */}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
            {/* Admin Profile Card */}
            <div
              className={cn(
                "flex items-center gap-2.5 p-1.5 rounded-lg transition-colors",
                isDark ? "bg-zinc-800/60" : "bg-slate-200/60"
              )}
            >
              <div className="size-7 rounded-full bg-zinc-900 border border-zinc-800 text-sky-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {(currentUser.fullName || 'A').charAt(0)}
              </div>
              {(isSidebarOpen || mobileMenuOpen) && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                    {currentUser.fullName || "System Administrator"}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Navigation Outlets */}
            {(isSidebarOpen || mobileMenuOpen) ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('LANDING', '/');
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold border border-slate-200 dark:border-zinc-700 transition cursor-pointer shadow-2xs"
                  title="Return to CampusPass Home"
                >
                  <Home className="size-3" />
                  <span>Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('LANDING', '/');
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-semibold border border-slate-200 dark:border-zinc-700 transition cursor-pointer shadow-2xs"
                  title="Sign Out of Admin Portal"
                >
                  <LogOut className="size-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('LANDING', '/');
                  }}
                  className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
                  title="Return to CampusPass Home"
                >
                  <Home className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('LANDING', '/');
                  }}
                  className="size-8 flex items-center justify-center rounded-md bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
                  title="Sign Out of Admin Portal"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </SidebarBody>
      </Sidebar>

      {/* ── Main Work Area ─────────────────────────────────────── */}
      <div className="ds-main">
        {/* Admin Topbar */}
        <header className="ds-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', height: '56px' }}>
          {/* Left: Mobile Hamburger (Mobile Only) + Desktop Re-expand + Current View Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Hamburger Button */}
            <div className="ds-mobile-hamburger">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                title="Admin Navigation"
                aria-label="Admin Navigation"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: mobileMenuOpen ? '#0284c7' : (isDark ? '#f4f4f5' : '#334155'),
                  backgroundColor: mobileMenuOpen ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#f0f9ff') : (isDark ? '#18181b' : '#ffffff'),
                  border: mobileMenuOpen ? '1px solid #7dd3fc' : (isDark ? '1px solid #27272a' : '1px solid #e2e8f0'),
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <MenuIcon size={19} animate={mobileMenuOpen ? 'animate' : 'initial'} />
              </button>
            </div>

            {/* Page Title on PC */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>
                {currentView === 'ADMIN' && 'Admin Control Center'}
                {currentView === 'DISCOVER' && 'Event Registry & Discovery Cards'}
                {currentView === 'ORGANIZER' && 'Organizer Studio'}
                {currentView === 'ANALYTICS' && 'Platform Analytics Hub'}
              </span>
            </div>

            {/* Institution Brand on Mobile */}
            <div className="flex md:hidden" style={{ alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #18181b, #27272a)',
                  color: '#38bdf8',
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={16} />
              </div>
              <p className="truncate text-slate-900 dark:text-zinc-100 font-extrabold text-[12px] m-0 max-w-[110px] xs:max-w-[150px]">
                Admin &bull; {institutionProfile.collegeName}
              </p>
            </div>
          </div>

          {/* Right Section: Theme Toggle + Announcements + Admin Profile + Quick Link to Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Toggle (Dark / Light Mode) */}
            <ThemeToggle variant="portal" />

            {/* Announcements Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                title="Campus Announcements"
                style={{
                  position: 'relative',
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#f4f4f5' : '#09090b',
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                  border: isDark ? '1px solid #27272a' : '2px solid #09090b',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'transform 0.1s ease',
                }}
              >
                <Bell size={18} strokeWidth={2.2} />
                {unreadAnnouncements > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '9999px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark ? '2px solid #141416' : '2px solid #ffffff',
                    boxSizing: 'border-box'
                  }}>
                    {unreadAnnouncements}
                  </span>
                )}
              </button>

              {/* Notification Popover - Exactly matching uploaded screenshot */}
              {notifOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 'min(calc(100vw - 24px), 340px)',
                  backgroundColor: isDark ? '#141416' : '#ffffff',
                  border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.7)' : '0 12px 36px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.04)',
                  zIndex: 150,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '14px 18px',
                    borderBottom: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: isDark ? '#f4f4f5' : '#09090b', letterSpacing: '-0.01em' }}>
                      Campus Announcements
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#166534',
                      background: '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}>
                      {unreadAnnouncements} new
                    </span>
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {announcements.map((a, idx) => (
                      <div
                        key={a.id}
                        style={{
                          padding: '12px 18px',
                          borderBottom: idx < announcements.length - 1 ? (isDark ? '1px solid #27272a' : '1px solid #f1f5f9') : 'none',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = isDark ? '#222226' : '#f8fafc';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = isDark ? '#141416' : '#ffffff';
                        }}
                      >
                        <p style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: isDark ? '#f4f4f5' : '#09090b',
                          margin: '0 0 4px 0',
                          lineHeight: 1.35
                        }}>
                          {a.title}
                        </p>
                        <p style={{
                          fontSize: '11.5px',
                          color: isDark ? '#a1a1aa' : '#64748b',
                          margin: 0,
                          lineHeight: 1.45
                        }}>
                          {a.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Pill (Desktop/Tablet; Mobile uses sliding drawer) */}
            <div className="hidden sm:flex" style={{
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px 4px 6px',
              borderRadius: '9999px',
              background: isDark ? '#18181b' : '#09090b',
              color: '#ffffff',
              border: isDark ? '1px solid #27272a' : '1px solid #27272a'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                A
              </div>
              <span className="hidden sm:inline" style={{ fontSize: '12px', fontWeight: 600 }}>
                Admin Desk
              </span>
            </div>

            {/* Exit to Landing Page (Visible on tablet/desktop, mobile uses drawer navigation) */}
            <button
              type="button"
              onClick={() => onNavigate('LANDING', '/')}
              className="hidden md:inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg border text-[11.5px] font-semibold cursor-pointer transition shadow-2xs"
              style={{
                border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                background: isDark ? '#18181b' : '#ffffff',
                color: isDark ? '#d4d4d8' : '#475569',
              }}
              title="Return to Welcome Landing Page"
            >
              <Home size={13} />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* Dynamic Admin Content Surface */}
        <main className="ds-content">
          {currentView === 'ADMIN' && (
            <AdminPortal />
          )}

          {currentView === 'DISCOVER' && (
            <EventDiscovery
              searchOverride={globalSearch}
            />
          )}

          {currentView === 'ORGANIZER' && (
            <OrganizerStudio />
          )}

          {currentView === 'ANALYTICS' && (
            <AnalyticsDashboard />
          )}
        </main>
      </div>
    </div>
  );
};
