import React from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import type { ActivePortal } from '../../types';
import { 
  GraduationCap, 
  Compass, 
  Ticket, 
  Utensils, 
  FileText, 
  Calendar, 
  Scan, 
  ShieldAlert, 
  User, 
  Layers, 
  CheckCircle,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { Badge } from '../ui/badge';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile
}) => {
  const { 
    activePortal, 
    switchUserRole, 
    currentUser, 
    institutionProfile,
    events, 
    passes, 
    lunchPasses, 
    registrations 
  } = useCampusPass();

  const studentPasses = passes.filter(p => p.studentId === currentUser.studentId);
  const studentLunchPasses = lunchPasses.filter(lp => lp.studentId === currentUser.studentId);
  const studentRegs = registrations.filter(r => r.studentId === currentUser.studentId);
  const pendingApprovals = registrations.filter(r => r.status === 'PENDING');

  const handleRoleChange = (role: 'STUDENT' | 'ORGANIZER' | 'VOLUNTEER' | 'ADMIN') => {
    switchUserRole(role);
    if (role === 'STUDENT') onNavigate('DISCOVER');
    if (role === 'ORGANIZER') onNavigate('ORGANIZER');
    if (role === 'VOLUNTEER') onNavigate('SCANNER');
    if (role === 'ADMIN') onNavigate('ADMIN');
  };

  return (
    <aside className="wm-sidebar">
      {/* Sidebar Header: Brand & Identity */}
      <div className="wm-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0f766e 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                CampusPass
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid rgba(2, 132, 199, 0.2)'
              }}>
                PRO
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, display: 'block' }}>
              {institutionProfile.collegeCode} • Enterprise
            </span>
          </div>
        </div>

        {/* Persona Switcher Selector */}
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          padding: '6px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Active Persona
            </span>
            <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <ArrowRightLeft size={10} />
              Switch
            </span>
          </div>
          <select
            value={activePortal}
            onChange={(e) => handleRoleChange(e.target.value as any)}
            className="wm-select"
            style={{
              padding: '6px 28px 6px 8px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: '#ffffff'
            }}
          >
            <option value="STUDENT">Student: Rohan Verma</option>
            <option value="ORGANIZER">Event Organizer: Dr. Sharma</option>
            <option value="VOLUNTEER">Gate Volunteer: Priya Nair</option>
            <option value="ADMIN">Administrator: System Dean</option>
          </select>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="wm-sidebar-body">
        {/* GROUP 1: Student Workspace */}
        <div className="wm-sidebar-group">
          <span className="wm-sidebar-label">Student Workspace</span>

          <button
            type="button"
            className={`wm-sidebar-nav-item ${currentView === 'DISCOVER' ? 'active' : ''}`}
            onClick={() => onNavigate('DISCOVER')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={16} className="wm-nav-icon" />
              <span>Explore Events</span>
            </div>
            <span className="wm-nav-badge">{events.length}</span>
          </button>

          <button
            type="button"
            className={`wm-sidebar-nav-item ${currentView === 'PASSES' ? 'active' : ''}`}
            onClick={() => onNavigate('PASSES')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ticket size={16} className="wm-nav-icon" />
              <span>Digital Pass Wallet</span>
            </div>
            {studentPasses.length > 0 && (
              <span className="wm-nav-badge" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                {studentPasses.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`wm-sidebar-nav-item ${currentView === 'LUNCH' ? 'active' : ''}`}
            onClick={() => onNavigate('LUNCH')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Utensils size={16} className="wm-nav-icon" />
              <span>Dining Meal Passes</span>
            </div>
            {studentLunchPasses.length > 0 && (
              <span className="wm-nav-badge" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                {studentLunchPasses.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`wm-sidebar-nav-item ${currentView === 'APPLICATIONS' ? 'active' : ''}`}
            onClick={() => onNavigate('APPLICATIONS')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={16} className="wm-nav-icon" />
              <span>My Applications</span>
            </div>
            {studentRegs.length > 0 && (
              <span className="wm-nav-badge">{studentRegs.length}</span>
            )}
          </button>
        </div>

        {/* GROUP 2: Event Operations */}
        <div className="wm-sidebar-group">
          <span className="wm-sidebar-label">Event Operations</span>

          <button
            type="button"
            className={`wm-sidebar-nav-item ${currentView === 'ORGANIZER' ? 'active' : ''}`}
            onClick={() => onNavigate('ORGANIZER')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} className="wm-nav-icon" />
              <span>Organizer Studio</span>
            </div>
            {pendingApprovals.length > 0 && (
              <span className="wm-nav-badge" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                {pendingApprovals.length} pending
              </span>
            )}
          </button>

          <button
            type="button"
            className={`wm-sidebar-nav-item ${currentView === 'SCANNER' ? 'active' : ''}`}
            onClick={() => onNavigate('SCANNER')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scan size={16} className="wm-nav-icon" />
              <span>Turnstile Gate HUD</span>
            </div>
            <span className="wm-nav-badge" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
              Live
            </span>
          </button>
        </div>

        {/* GROUP 3: Governance */}
        <div className="wm-sidebar-group">
          <span className="wm-sidebar-label">Institutional Control</span>

          <button
            type="button"
            className={`wm-sidebar-nav-item ${currentView === 'ADMIN' ? 'active' : ''}`}
            onClick={() => onNavigate('ADMIN')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={16} className="wm-nav-icon" />
              <span>Admin Command & Audit</span>
            </div>
          </button>
        </div>
      </div>

      {/* Sidebar Footer: Authenticated User & System Status */}
      <div className="wm-sidebar-footer">
        {/* System Health telemetry */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="wm-pulse-dot" />
            <span style={{ fontWeight: 600 }}>Engine Active</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>v2.4.0</span>
        </div>

        {/* User Persona Profile Card */}
        <div style={{
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '13px',
            flexShrink: 0
          }}>
            {currentUser.fullName.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.fullName}
            </strong>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.role} • {currentUser.studentId || currentUser.department.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
