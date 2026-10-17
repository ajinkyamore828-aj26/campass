import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  Bell,
  ChevronDown,
  ShieldCheck,
  Calendar,
  BarChart3,
  Compass,
  FileText,
  ShieldAlert,
  Building,
  GraduationCap,
  User,
  Check,
} from 'lucide-react';
import { MenuIcon } from '@/components/ui/icons-menu';

interface DemostackTopbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const ROLES = [
  { value: 'STUDENT' as const, label: 'Student Portal', desc: 'Event discovery & passes' },
  { value: 'ADMIN' as const, label: 'Organizer & Admin Portal', desc: 'Event studio, registries, approvals & controls' },
];

export const DemostackTopbar: React.FC<DemostackTopbarProps> = ({
  currentView,
  onNavigate,
}) => {
  const {
    activePortal,
    switchUserRole,
    currentUser,
    institutionProfile,
    events,
    registrations,
    announcements,
  } = useCampusPass();

  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotifCat, setSelectedNotifCat] = useState<string>('all');

  const navMenuRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = announcements.length;
  const isManager = activePortal === 'ADMIN' || activePortal === 'ORGANIZER';
  const currentRole = isManager ? ROLES[1] : ROLES[0];

  const pendingApprovals = registrations.filter(r => r.status === 'PENDING').length;
  const openEvents = events.filter(e => e.status === 'OPEN').length;

  const handleRoleSwitch = (role: 'STUDENT' | 'ADMIN') => {
    switchUserRole(role as any);
    setPortalOpen(false);
    if (role === 'STUDENT') onNavigate('DISCOVER');
    if (role === 'ADMIN') onNavigate('DISCOVER');
  };

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
        setPortalOpen(false);
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
      if (portalRef.current && !portalRef.current.contains(target)) {
        setPortalOpen(false);
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
      <header className="ds-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', height: '56px' }}>
        {/* Left Section: Animated Hamburger Menu + Institution Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Animated Hamburger Icon Button */}
          <div style={{ position: 'relative' }} ref={navMenuRef}>
            <button
              type="button"
              onClick={() => {
                setNavMenuOpen(!navMenuOpen);
                setPortalOpen(false);
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

          {/* Institution Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <div className="hidden sm:block" style={{ minWidth: 0, maxWidth: '200px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Switch Portal Dropdown (attached image 4) */}
          <div style={{ position: 'relative' }} ref={portalRef}>
            <button
              type="button"
              onClick={() => {
                setPortalOpen(!portalOpen);
                setNotifOpen(false);
                setNavMenuOpen(false);
              }}
              aria-label="Switch Portal"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 10px',
                borderRadius: '10px',
                backgroundColor: portalOpen ? '#f1f5f9' : '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!portalOpen) e.currentTarget.style.backgroundColor = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                if (!portalOpen) e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  backgroundColor: '#166534',
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
                <p className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', lineHeight: 1.15 }}>
                  <span className="hidden sm:inline">{currentRole.label}</span>
                  <span className="sm:hidden">{currentRole.value === 'ADMIN' ? 'Admin' : 'Student'}</span>
                </p>
                <p className="truncate hidden md:block" style={{ fontSize: '9.5px', color: '#64748b', marginTop: '1px', lineHeight: 1 }}>
                  {currentRole.desc}
                </p>
              </div>
              <ChevronDown
                size={13}
                style={{
                  color: '#94a3b8',
                  transform: portalOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                  flexShrink: 0,
                  marginLeft: '2px',
                }}
              />
            </button>

            {/* Switch Portal Dropdown Menu */}
            {portalOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: 'min(calc(100vw - 24px), 230px)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 120,
                  padding: '5px',
                  overflow: 'hidden',
                }}
              >
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 8px 4px 8px' }}>
                  Switch Portal
                </p>
                {ROLES.map(role => {
                  const isRoleActive = role.value === 'ADMIN' ? isManager : activePortal === 'STUDENT';
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSwitch(role.value)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px',
                        padding: '7px 8px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isRoleActive ? '#f0fdf4' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isRoleActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isRoleActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: isRoleActive ? '#166534' : '#0f172a' }}>
                          {role.label}
                        </span>
                        {isRoleActive && <Check size={13} style={{ color: '#166534' }} />}
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{role.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell & Popover */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              className="cp-btn cp-btn-outline cp-btn-icon"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setPortalOpen(false);
                setNavMenuOpen(false);
              }}
              style={{ position: 'relative', borderRadius: '50%', width: '38px', height: '38px' }}
            >
              <Bell size={16} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  borderRadius: '9999px',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                }}>
                  {unread}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {notifOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 'min(calc(100vw - 24px), 360px)',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'scaleIn 0.15s ease',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bell size={15} style={{ color: '#166534' }} />
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Campus Announcements</span>
                    </div>
                    <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#166534', padding: '1px 7px', borderRadius: '9999px', fontWeight: 600 }}>
                      {announcements.length} updates
                    </span>
                  </div>

                  {/* Notification Filter Chips */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['all', 'alerts', 'reminders', 'updates'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedNotifCat(cat)}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: selectedNotifCat === cat ? 700 : 500,
                          background: selectedNotifCat === cat ? '#166534' : '#f1f5f9',
                          color: selectedNotifCat === cat ? '#fff' : '#64748b',
                        }}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {filteredAnnouncements.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px' }}>
                      No announcements in this category
                    </div>
                  ) : (
                    filteredAnnouncements.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          padding: '10px 16px',
                          borderBottom: '1px solid #f8fafc',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#fff'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: a.priority === 'URGENT' ? '#ef4444' : '#22c55e',
                            flexShrink: 0,
                          }} />
                          <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', flex: 1 }}>
                            {a.title}
                          </p>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {a.publishedAt || a.createdAt || 'Just now'}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, paddingLeft: '12px' }}>
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '3px 8px 3px 4px',
              borderRadius: '9999px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
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
            <span className="hidden md:inline" style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
              {currentUser.fullName || 'Ajinkya More'}
            </span>
          </div>
        </div>
      </header>
    </>
  );
};

export default DemostackTopbar;
