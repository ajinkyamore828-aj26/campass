import React, { useState } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  GraduationCap,
  Compass,
  Ticket,
  Utensils,
  FileText,
  Calendar,
  ShieldAlert,
  ChevronDown,
  Server,
  Activity,
  Users,
  Settings,
  LogOut,
  User,
  Building,
  Bell,
  BarChart3,
  ShieldCheck,
  Home,
  PanelLeftClose,
} from 'lucide-react';

interface DemostackSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ROLES = [
  { value: 'STUDENT' as const, label: 'Student Portal', desc: 'Event discovery & passes' },
  { value: 'ORGANIZER' as const, label: 'Event Organizer', desc: 'Manage your events' },
  { value: 'ADMIN' as const, label: 'Administrator', desc: 'Full system control' },
];

export const DemostackSidebar: React.FC<DemostackSidebarProps> = ({ currentView, onNavigate, isOpen = true, onClose }) => {
  const {
    activePortal,
    switchUserRole,
    currentUser,
    institutionProfile,
    events,
    passes,
    lunchPasses,
    registrations,
  } = useCampusPass();

  const [orgOpen, setOrgOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const studentPasses = passes.filter(p => p.studentId === currentUser.studentId);
  const studentLunchPasses = lunchPasses.filter(lp => lp.studentId === currentUser.studentId);
  const pendingApprovals = registrations.filter(r => r.status === 'PENDING').length;
  const openEvents = events.filter(e => e.status === 'OPEN').length;

  const handleRoleSwitch = (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    switchUserRole(role as any);
    setOrgOpen(false);
    if (role === 'STUDENT') onNavigate('DISCOVER');
    if (role === 'ORGANIZER') onNavigate('ORGANIZER');
    if (role === 'ADMIN') onNavigate('ADMIN');
  };

  const studentNav = [
    { id: 'DISCOVER', icon: Compass, label: 'Event Discovery', badge: openEvents > 0 ? String(openEvents) : undefined, badgeColor: 'cyan' },
    { id: 'APPLICATIONS', icon: FileText, label: 'My Applications' },
  ];

  const adminNav = [
    { id: 'DISCOVER', icon: Compass, label: 'Event Discovery', badge: openEvents > 0 ? String(openEvents) : undefined, badgeColor: 'cyan' },
    { id: 'ORGANIZER', icon: Calendar, label: 'Organizer Studio', badge: pendingApprovals > 0 ? String(pendingApprovals) : undefined, badgeColor: 'amber' },
    { id: 'ANALYTICS', icon: BarChart3, label: 'Analytics Hub' },
    { id: 'ADMIN', icon: ShieldAlert, label: 'Admin Control' },
  ];

  const currentRole = ROLES.find(r => r.value === activePortal) ?? ROLES[0];
  const currentNavItems = activePortal === 'STUDENT' ? studentNav : adminNav;

  return (
    <aside className={`ds-sidebar${!isOpen ? ' is-collapsed' : ''}`}>
      <div className="ds-sidebar-inner">
        {/* Header: Brand */}
        <div className="ds-sidebar-header">
          {/* Institution Brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '6px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div
                className="cp-icon-box"
                style={{
                  background: 'linear-gradient(135deg, #166534, #14532d)',
                  color: '#fff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <GraduationCap size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="truncate" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  {institutionProfile.collegeName}
                </p>
                <p style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                  CampusPass Platform
                </p>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Hide sidebar"
                aria-label="Hide sidebar"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <PanelLeftClose size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {/* Main Section */}
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 2px 8px 2px' }}>
            {activePortal === 'STUDENT' ? 'Student Workspace' : 'Management'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '16px' }}>
            {currentNavItems.map(item => (
              <button
                key={item.id}
                className={`ds-nav-item${currentView === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
                style={{ width: '100%' }}
              >
                <item.icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span className={`ds-nav-badge${item.badgeColor ? ` ${item.badgeColor}` : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* System Links — visible to everyone */}
          <div className="cp-divider" />
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 2px 8px 2px' }}>
            System Infrastructure
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <button
              type="button"
              className={`ds-nav-item${currentView === 'ANALYTICS' ? ' active' : ''}`}
              onClick={() => onNavigate('ANALYTICS')}
              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
              title="Open full campus analytics dashboard"
            >
              <BarChart3 size={15} />
              <span style={{ flex: 1, fontSize: '12.5px' }}>Platform Analytics</span>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>LIVE</span>
            </button>
          </div>
        </nav>

        {/* Footer: Portal Switcher (Shifted Down) + User Profile */}
        <div style={{ padding: '10px 10px 12px 10px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Role/Org Switcher — Shifted Down */}
          <div style={{ position: 'relative' }}>
            <button
              className="ds-org-switcher"
              onClick={() => {
                setOrgOpen(!orgOpen);
                setUserOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: orgOpen ? '#f1f5f9' : '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'background-color 0.12s, border-color 0.12s',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#166534',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building size={14} />
              </div>
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <p className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {currentRole.label}
                </p>
                <p className="truncate" style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  {currentRole.desc}
                </p>
              </div>
              <ChevronDown
                size={14}
                style={{
                  color: '#94a3b8',
                  transform: orgOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                  flexShrink: 0,
                }}
              />
            </button>

            {orgOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  padding: '4px',
                  overflow: 'hidden',
                }}
              >
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 10px 4px 10px' }}>
                  Switch Portal
                </p>
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSwitch(role.value)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activePortal === role.value ? '#f0fdf4' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => { if (activePortal !== role.value) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (activePortal !== role.value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: activePortal === role.value ? '#166534' : '#0f172a' }}>
                      {role.label}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{role.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: userOpen ? '#f1f5f9' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '10px',
                padding: '6px 8px',
                transition: 'background-color 0.12s',
              }}
              onClick={() => {
                setUserOpen(!userOpen);
                setOrgOpen(false);
              }}
              onMouseEnter={e => { if (!userOpen) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!userOpen) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <div
                className="cp-avatar"
                style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #166534, #14532d)', color: '#fff', fontSize: '12px', fontWeight: 800 }}
              >
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <p className="truncate" style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                  {currentUser.fullName}
                </p>
                <p className="truncate" style={{ fontSize: '11px', color: '#64748b' }}>
                  {currentUser.email || `${currentUser.studentId}@campus.edu`}
                </p>
              </div>
              <ChevronDown size={13} style={{ color: '#94a3b8', flexShrink: 0, transform: userOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
            </button>

            {userOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  padding: '4px',
                }}
              >
              {[
                { icon: User, label: 'Profile Settings' },
                { icon: Bell, label: 'Notifications' },
                { icon: Settings, label: 'Account Settings' },
              ].map(item => (
                <button
                  key={item.label}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#374151',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <item.icon size={14} style={{ color: '#64748b' }} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setUserOpen(false);
                  onNavigate('LANDING');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#374151',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <Home size={14} style={{ color: '#64748b' }} />
                Public Landing Page
              </button>
              <div className="cp-divider" style={{ margin: '4px 0' }} />
              <button
                onClick={() => {
                  setUserOpen(false);
                  onNavigate('LANDING');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#b91c1c',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </aside>
);
};
