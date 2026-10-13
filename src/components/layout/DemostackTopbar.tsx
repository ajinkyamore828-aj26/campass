import React, { useState, useEffect, useRef } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  Search,
  Bell,
  ChevronRight,
  X,
  Scan,
  ShieldCheck,
  Clock,
  Calendar,
  Info,
} from 'lucide-react';

interface DemostackTopbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  DISCOVER:     { title: 'Event Discovery',           subtitle: 'Browse & register for campus events' },
  PASSES:       { title: 'Smart Pass Wallet',         subtitle: 'Your digital gate credentials' },
  LUNCH:        { title: 'Meal Vouchers',              subtitle: 'Dining hall pass distribution' },
  APPLICATIONS: { title: 'My Applications',           subtitle: 'Track your registration status' },
  ORGANIZER:    { title: 'Event Operations Studio',   subtitle: 'Manage events & approvals' },
  SCANNER:      { title: 'Gate Scanner HUD',          subtitle: 'QR verification & attendance' },
  ADMIN:        { title: 'Admin Control Center',      subtitle: 'System administration' },
};

export const DemostackTopbar: React.FC<DemostackTopbarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { announcements } = useCampusPass();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = announcements.length;
  const meta = PAGE_META[currentView] ?? { title: 'CampusPass', subtitle: '' };

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setNotifOpen(false);
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  return (
    <header className="ds-topbar">
      {/* Left: Breadcrumb + Page Title */}
      <div className="flex-center gap-8">
        <div className="flex-center gap-6" style={{ fontSize: '12px', color: '#94a3b8' }}>
          <span style={{ fontWeight: 600 }}>CampusPass</span>
          <ChevronRight size={12} style={{ color: '#cbd5e1' }} />
          <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}>{meta.title}</span>
        </div>

        {/* Breadcrumb subtitle — hidden on small widths */}
        <span style={{
          fontSize: '11px',
          color: '#94a3b8',
          paddingLeft: '8px',
          borderLeft: '1px solid #e2e8f0',
        }}>
          {meta.subtitle}
        </span>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex-center gap-2">
        {/* ⌘K Search */}
        <div className="cp-search-wrap" style={{ width: '220px' }}>
          <span className="cp-search-icon">
            <Search size={14} />
          </span>
          <input
            ref={searchRef}
            className="cp-search-input"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ paddingRight: '42px' }}
          />
          {!searchFocused && !searchQuery && (
            <div style={{
              position: 'absolute',
              right: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#94a3b8',
              background: '#f1f5f9',
              padding: '2px 5px',
              borderRadius: '5px',
              pointerEvents: 'none',
            }}>
              ⌘K
            </div>
          )}
          {searchQuery && (
            <button
              style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
              onClick={() => onSearchChange('')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Gate Scanner Quick Access */}
        <button
          className="cp-btn cp-btn-secondary cp-btn-sm"
          onClick={() => onNavigate('SCANNER')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Scan size={13} />
          <span style={{ fontSize: '12px' }}>Scan Pass</span>
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="cp-btn cp-btn-outline cp-btn-icon"
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ position: 'relative' }}
          >
            <Bell size={15} />
            {unread > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: '#b91c1c',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #fff',
              }}>
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '300px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px 10px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex-center gap-2">
                  <Bell size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Notifications</span>
                </div>
                {unread > 0 && (
                  <span className="cp-badge cp-badge-pending">{unread} new</span>
                )}
              </div>
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {announcements.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No notifications
                  </div>
                ) : (
                  announcements.slice(0, 5).map((a, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid #f8fafc',
                        background: i === 0 ? '#f0f9ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s',
                      }}
                    >
                      <div className="flex-center gap-2" style={{ marginBottom: '3px' }}>
                        <Info size={12} style={{ color: '#0284c7', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: '12.5px', color: '#0f172a' }}>{a.title}</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                        {a.content || a.message}
                      </p>
                      <div className="flex-center gap-1" style={{ marginTop: '5px' }}>
                        <Clock size={10} style={{ color: '#94a3b8' }} />
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <button className="cp-btn cp-btn-outline cp-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Turnstile Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          fontSize: '11px',
          fontWeight: 700,
          color: '#15803d',
        }}>
          <ShieldCheck size={12} />
          <span>System OK</span>
        </div>
      </div>
    </header>
  );
};
