import React from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import type { ActivePortal } from '../../types';
import { 
  ShieldCheck, 
  GraduationCap, 
  Scan, 
  Calendar, 
  ShieldAlert, 
  User, 
  Layers, 
  Bell, 
  Ticket, 
  Utensils 
} from 'lucide-react';

export const CampusPassNavbar: React.FC = () => {
  const { 
    activePortal, 
    setActivePortal, 
    currentUser, 
    switchUserRole, 
    passes, 
    lunchPasses, 
    registrations, 
    announcements 
  } = useCampusPass();

  const myPassesCount = passes.filter(p => p.studentId === currentUser.studentId).length;
  const pendingApprovalsCount = registrations.filter(r => r.status === 'PENDING').length;

  return (
    <header style={{
      background: '#0f172a',
      color: '#ffffff',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    }}>
      {/* Top Identity Ribbon */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #0f766e)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                CampusPass
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                ENTERPRISE
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
              Apex Institute of Science & Technology • Digital Credential Engine
            </div>
          </div>
        </div>

        {/* Central Role Portal Selector Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.06)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            type="button"
            onClick={() => switchUserRole('STUDENT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activePortal === 'STUDENT' ? '#ffffff' : 'transparent',
              color: activePortal === 'STUDENT' ? '#0f172a' : '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: activePortal === 'STUDENT' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={14} color={activePortal === 'STUDENT' ? '#0284c7' : '#94a3b8'} />
            <span>Student Portal</span>
            {myPassesCount > 0 && (
              <span style={{
                background: activePortal === 'STUDENT' ? '#e0f2fe' : 'rgba(255, 255, 255, 0.12)',
                color: activePortal === 'STUDENT' ? '#0369a1' : '#38bdf8',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '6px',
              }}>
                {myPassesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => switchUserRole('ORGANIZER')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activePortal === 'ORGANIZER' ? '#ffffff' : 'transparent',
              color: activePortal === 'ORGANIZER' ? '#0f172a' : '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: activePortal === 'ORGANIZER' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={14} color={activePortal === 'ORGANIZER' ? '#d97706' : '#94a3b8'} />
            <span>Organizer Studio</span>
            {pendingApprovalsCount > 0 && (
              <span style={{
                background: '#f59e0b',
                color: '#0f172a',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '6px',
              }}>
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => switchUserRole('VOLUNTEER')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activePortal === 'VOLUNTEER' ? '#ffffff' : 'transparent',
              color: activePortal === 'VOLUNTEER' ? '#0f172a' : '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: activePortal === 'VOLUNTEER' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Scan size={14} color={activePortal === 'VOLUNTEER' ? '#0284c7' : '#94a3b8'} />
            <span>Gate Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => switchUserRole('ADMIN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: activePortal === 'ADMIN' ? '#ffffff' : 'transparent',
              color: activePortal === 'ADMIN' ? '#0f172a' : '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: activePortal === 'ADMIN' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldAlert size={14} color={activePortal === 'ADMIN' ? '#0f766e' : '#94a3b8'} />
            <span>Admin Command</span>
          </button>
        </nav>

        {/* User Identity Session & System Telemetry Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Steady Online Status Badge (no pulse effects) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#cbd5e1'
          }}>
            <span className="wm-pulse-dot" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Turnstiles Live</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '5px 12px',
            borderRadius: '8px',
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
                {currentUser.fullName}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                {currentUser.role} • {currentUser.studentId || currentUser.department.split('&')[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
