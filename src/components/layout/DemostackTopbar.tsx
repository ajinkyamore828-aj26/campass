import React, { useState, useEffect, useRef } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  Search,
  Bell,
  ChevronRight,
  X,
  ShieldCheck,
  Clock,
  Calendar,
  Info,
  BarChart3,
  Filter,
  AlertCircle,
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
  ANALYTICS:    { title: 'Platform Analytics',         subtitle: 'Event capacity, participation & metrics' },
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
  const [selectedNotifCat, setSelectedNotifCat] = useState<string>('all');

  const filteredAnnouncements = announcements.filter(a => {
    if (selectedNotifCat === 'all') return true;
    const isAlert = a.priority === 'URGENT' || a.title?.toLowerCase().includes('guideline') || a.title?.toLowerCase().includes('alert') || a.title?.toLowerCase().includes('gate');
    const isReminder = a.title?.toLowerCase().includes('close') || a.title?.toLowerCase().includes('reminder') || a.title?.toLowerCase().includes('registration');
    if (selectedNotifCat === 'alerts') return isAlert;
    if (selectedNotifCat === 'reminders') return isReminder;
    if (selectedNotifCat === 'updates') return !isAlert && !isReminder;
    return true;
  });

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

        {/* Notifications Bell & Filter Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="cp-btn cp-btn-outline cp-btn-icon"
            onClick={() => setNotifOpen(!notifOpen)}
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

          {notifOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '340px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 16px 36px -4px rgba(0,0,0,0.15)',
              zIndex: 200,
              overflow: 'hidden',
            }}>
              {/* Header with filter */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Notifications</span>
                </div>
                {unread > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: '#dcfce7',
                    color: '#166534',
                  }}>
                    {unread} Total
                  </span>
                )}
              </div>

              {/* Category buttons strip */}
              <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', borderBottom: '1px solid #f1f5f9', background: '#ffffff', overflowX: 'auto' }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'updates', label: 'Updates' },
                  { key: 'alerts', label: 'Alerts' },
                  { key: 'reminders', label: 'Reminders' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedNotifCat(cat.key)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedNotifCat === cat.key ? '#0f172a' : '#f1f5f9',
                      color: selectedNotifCat === cat.key ? '#ffffff' : '#475569',
                      transition: 'all 0.12s',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Notifications list */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredAnnouncements.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px' }}>
                    No notifications in this category
                  </div>
                ) : (
                  filteredAnnouncements.map((a, i) => {
                    const isAlert = a.priority === 'URGENT' || a.title?.toLowerCase().includes('guideline') || a.title?.toLowerCase().includes('alert');
                    const isReminder = a.title?.toLowerCase().includes('close') || a.title?.toLowerCase().includes('reminder');

                    return (
                      <div
                        key={i}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f8fafc',
                          background: i === 0 ? 'rgba(240, 253, 244, 0.4)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            {isAlert ? (
                              <AlertCircle size={13} style={{ color: '#b91c1c', flexShrink: 0 }} />
                            ) : isReminder ? (
                              <Calendar size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                            ) : (
                              <Info size={13} style={{ color: '#166534', flexShrink: 0 }} />
                            )}
                            <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>{a.title}</span>
                          </div>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Today'}
                          </span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45, margin: 0, paddingLeft: '20px' }}>
                          {a.content || a.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', textAlign: 'center' }}>
                <button
                  className="cp-btn cp-btn-outline cp-btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}
                  onClick={() => setNotifOpen(false)}
                >
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
