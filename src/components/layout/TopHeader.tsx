import React, { useState } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import { 
  Search, 
  Bell, 
  Menu, 
  CheckCircle, 
  ShieldCheck, 
  X, 
  Ticket, 
  Plus, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface TopHeaderProps {
  onToggleSidebar?: () => void;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  onNavigate,
  searchQuery,
  onSearchChange
}) => {
  const { announcements, currentUser } = useCampusPass();
  const [showAnnouncementsDrawer, setShowAnnouncementsDrawer] = useState(false);

  return (
    <header className="wm-topbar">
      {/* Left: Mobile Toggle & Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '580px' }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              padding: '6px'
            }}
          >
            <Menu size={20} />
          </button>
        )}

        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search events, roll number, passes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="wm-input"
            style={{
              paddingLeft: '36px',
              paddingRight: '12px',
              height: '38px',
              fontSize: '13px',
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Right: Telemetry & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Turnstile Live Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <span className="wm-pulse-dot" />
          <span style={{ fontWeight: 600 }}>Turnstiles Live</span>
        </div>

        {/* Announcements Button */}
        <button
          type="button"
          onClick={() => setShowAnnouncementsDrawer(!showAnnouncementsDrawer)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
          title="Announcements"
        >
          <Bell size={17} />
          {announcements.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-amber)'
            }} />
          )}
        </button>

      </div>

      {/* Announcements Dropdown Overlay */}
      {showAnnouncementsDrawer && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '28px',
          width: '380px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              Campus Broadcasts ({announcements.length})
            </strong>
            <button
              type="button"
              onClick={() => setShowAnnouncementsDrawer(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {announcements.map(a => (
              <div
                key={a.id}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{a.title}</strong>
                  <Badge variant={a.priority === 'URGENT' || a.priority === 'DEADLINE' ? 'destructive' : 'info'}>
                    {a.priority}
                  </Badge>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {a.message || a.content}
                </p>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(a.publishedAt || a.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
