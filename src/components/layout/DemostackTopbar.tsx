import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  Bell,
  ShieldCheck,
  Calendar,
  BarChart3,
  Compass,
  FileText,
  ShieldAlert,
  Building,
  GraduationCap,
  User,
} from 'lucide-react';
import { MenuIcon } from '@/components/ui/icons-menu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface DemostackTopbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ROLES = [
  { value: 'STUDENT' as const, label: 'Student Portal', desc: 'Event discovery & passes' },
  { value: 'ADMIN' as const, label: 'Organizer & Admin Portal', desc: 'Event studio, registries, approvals & controls' },
];

export const DemostackTopbar: React.FC<DemostackTopbarProps> = ({
  currentView,
  onNavigate,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const {
    activePortal,
    switchUserRole,
    currentUser,
    institutionProfile,
    events,
    registrations,
    announcements,
    theme,
  } = useCampusPass();
  const isDark = theme === 'dark';

  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotifCat, setSelectedNotifCat] = useState<string>('all');

  const navMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = announcements.length;
  const isManager = activePortal === 'ADMIN' || activePortal === 'ORGANIZER';
  const currentRole = isManager ? ROLES[1] : ROLES[0];

  const pendingApprovals = registrations.filter(r => r.status === 'PENDING').length;
  const openEvents = events.filter(e => e.status === 'OPEN').length;

  // Filter navigation items strictly based on the user's active portal role
  const navOptions = useMemo(() => {
    if (!isManager) {
      return [
        {
          id: 'DISCOVER',
          icon: <Compass size={16} strokeWidth={1.8} />,
          label: 'Event Discovery',
          desc: 'Browse & register for events',
          badge: openEvents > 0 ? `${openEvents} open` : undefined,
          badgeColor: 'green',
        },
        {
          id: 'APPLICATIONS',
          icon: <FileText size={16} strokeWidth={1.8} />,
          label: 'My Applications',
          desc: 'Digital credentials & passes',
        },
      ];
    }

    // UNIFIED ORGANIZER & ADMIN PORTAL
    return [
      {
        id: 'DISCOVER',
        icon: <Compass size={16} strokeWidth={1.8} />,
        label: 'Event Discovery & Registry',
        desc: 'Browse, edit featured & event registry',
        badge: openEvents > 0 ? `${openEvents} open` : undefined,
        badgeColor: 'green',
      },
      {
        id: 'ORGANIZER',
        icon: <Calendar size={16} strokeWidth={1.8} />,
        label: 'Organizer Studio',
        desc: 'Event planning, applications & approvals',
        badge: pendingApprovals > 0 ? `${pendingApprovals} pending` : undefined,
        badgeColor: 'amber',
      },
      {
        id: 'ADMIN',
        icon: <ShieldAlert size={16} strokeWidth={1.8} />,
        label: 'Admin Control Center',
        desc: 'Platform system governance & user roles',
      },
      {
        id: 'ANALYTICS',
        icon: <BarChart3 size={16} strokeWidth={1.8} />,
        label: 'Platform Analytics',
        desc: 'Live participation & telemetry',
        badge: 'LIVE',
        badgeColor: 'green',
      },
    ];
  }, [isManager, openEvents, pendingApprovals]);

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedNotifCat === 'all') return true;
    const isAlert = a.priority === 'URGENT' || a.title?.toLowerCase().includes('guideline') || a.title?.toLowerCase().includes('alert') || a.title?.toLowerCase().includes('gate');
    const isReminder = a.title?.toLowerCase().includes('close') || a.title?.toLowerCase().includes('reminder') || a.title?.toLowerCase().includes('registration');
    if (selectedNotifCat === 'alerts') return isAlert;
    if (selectedNotifCat === 'reminders') return isReminder;
    if (selectedNotifCat === 'updates') return !isAlert && !isReminder;
    return true;
  });

  // Close menus on Escape shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavMenuOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (navMenuRef.current && !navMenuRef.current.contains(target)) {
        setNavMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="ds-topbar flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Mobile Hamburger Menu (Mobile Only) + Desktop Sidebar Reopen + Institution Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Animated Hamburger Icon Button - ONLY VISIBLE ON MOBILE PHONES */}
          <div className="ds-mobile-hamburger" style={{ position: 'relative' }} ref={navMenuRef}>
            <button
              type="button"
              onClick={() => {
                setNavMenuOpen(!navMenuOpen);
                setNotifOpen(false);
              }}
              title={navMenuOpen ? 'Close navigation options' : 'Open navigation options'}
              aria-label="Navigation Menu"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: navMenuOpen ? '#166534' : '#334155',
                backgroundColor: navMenuOpen ? '#f0fdf4' : '#ffffff',
                border: navMenuOpen ? '1px solid #86efac' : '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!navMenuOpen) e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (!navMenuOpen) e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <MenuIcon
                size={19}
                animate={navMenuOpen ? 'animate' : 'initial'}
              />
            </button>

            {/* Navigation Options Dropdown */}
            {navMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: 'min(calc(100vw - 24px), 290px)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 150,
                  padding: '8px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '6px 10px 8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {!isManager ? 'Student Navigation' : 'Organizer & Admin Navigation'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
                  {navOptions.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id);
                          setNavMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                          backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                          color: isActive ? '#14532d' : '#334155',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isActive ? '#dcfce7' : '#f1f5f9',
                            color: isActive ? '#166534' : '#64748b',
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12.5px', fontWeight: isActive ? 700 : 600, color: isActive ? '#14532d' : '#0f172a', lineHeight: 1.2 }}>
                            {item.label}
                          </p>
                          <p style={{ fontSize: '10.5px', color: '#64748b', marginTop: '1px' }}>
                            {item.desc}
                          </p>
                        </div>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '9999px',
                              backgroundColor: item.badgeColor === 'green' ? '#dcfce7' : '#fef3c7',
                              color: item.badgeColor === 'green' ? '#166534' : '#92400e',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Current View Title on PC Screens */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              {currentView === 'DISCOVER' && 'Event Discovery'}
              {currentView === 'APPLICATIONS' && 'My Applications & Passes'}
              {currentView === 'ORGANIZER' && 'Organizer Studio'}
              {currentView === 'ANALYTICS' && 'Analytics Hub'}
              {currentView === 'ADMIN' && 'Admin Control Portal'}
            </span>
          </div>

          {/* Institution Brand - visible on mobile or when sidebar is collapsed on PC */}
          <div className={`flex ${isSidebarOpen ? 'md:hidden' : 'md:flex'}`} style={{ alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #166534, #14532d)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={17} />
            </div>
            <div className="min-w-0 max-w-[110px] sm:max-w-[180px] md:max-w-[220px]">
              <p className="truncate" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {institutionProfile.collegeName}
              </p>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 500, lineHeight: 1 }}>
                CampusPass Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Portal Switcher (Shifted left of bell) + Notifications + Status + User */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Active Portal Badge (Static, no direct role switching) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 10px',
              borderRadius: '10px',
              backgroundColor: isDark ? '#18181b' : '#f8fafc',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                backgroundColor: currentRole.value === 'ADMIN' ? '#0284c7' : '#166534',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Building size={14} />
            </div>
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <p className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#f4f4f5' : '#0f172a', lineHeight: 1.15 }}>
                <span className="hidden sm:inline">{currentRole.label}</span>
                <span className="sm:hidden">{currentRole.value === 'ADMIN' ? 'Admin' : 'Student'}</span>
              </p>
              <p className="truncate hidden md:block" style={{ fontSize: '9.5px', color: isDark ? '#a1a1aa' : '#64748b', marginTop: '1px', lineHeight: 1 }}>
                {currentRole.desc}
              </p>
            </div>
          </div>

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle variant="portal" />

          {/* Notifications Bell & Popover */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setNavMenuOpen(false);
              }}
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
              {unread > 0 && (
                <span
                  style={{
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
                    boxSizing: 'border-box',
                  }}
                >
                  {unread}
                </span>
              )}
            </button>

            {/* Notifications Popover - Exactly matching uploaded screenshot */}
            {notifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 'min(calc(100vw - 24px), 340px)',
                  backgroundColor: isDark ? '#141416' : '#ffffff',
                  border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.7)' : '0 12px 36px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.04)',
                  zIndex: 150,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: isDark ? '#f4f4f5' : '#09090b', letterSpacing: '-0.01em' }}>
                    Campus Announcements
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#16a34a',
                      backgroundColor: '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {unread} new
                  </span>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {announcements.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#a1a1aa', fontSize: '12.5px' }}>
                      No announcements at this time
                    </div>
                  ) : (
                    announcements.map((a, idx) => (
                      <div
                        key={a.id}
                        style={{
                          padding: '12px 18px',
                          borderBottom: idx < announcements.length - 1 ? (isDark ? '1px solid #27272a' : '1px solid #f1f5f9') : 'none',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = isDark ? '#222226' : '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = isDark ? '#141416' : '#ffffff';
                        }}
                      >
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: isDark ? '#f4f4f5' : '#09090b',
                            lineHeight: 1.35,
                            margin: '0 0 4px 0',
                          }}
                        >
                          {a.title}
                        </p>
                        <p
                          style={{
                            fontSize: '11.5px',
                            color: isDark ? '#a1a1aa' : '#64748b',
                            lineHeight: 1.45,
                            margin: 0,
                          }}
                        >
                          {a.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Mini Pill */}
          <div
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: '7px',
              padding: '3px 8px 3px 4px',
              borderRadius: '9999px',
              backgroundColor: isDark ? '#18181b' : '#f8fafc',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#166534',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {(currentUser.fullName || 'User').charAt(0)}
            </div>
            <span className="hidden md:inline" style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#f4f4f5' : '#09090b' }}>
              {currentUser.fullName || 'Ajinkya More'}
            </span>
          </div>
        </div>
      </header>
    </>
  );
};

export default DemostackTopbar;
