import React, { useState, useMemo } from 'react';
import type { CampusEvent, EventCategory, RegistrationMode } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  Utensils,
  ArrowRight,
  CheckCircle,
  Building,
  SlidersHorizontal,
  Layers,
  Code,
  Cpu,
  Palette,
  Trophy,
  BookOpen,
  Feather,
  Briefcase,
  Compass,
  HelpCircle,
  ChevronDown,
  Server,
  Activity,
  Tag,
  Star,
  Ticket,
  ArrowUpRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Globe,
} from 'lucide-react';
import { EventDetailModal } from './EventDetailModal';
import { EventRegistrationModal } from './EventRegistrationModal';

interface EventDiscoveryProps {
  onSelectEvent?: (event: CampusEvent) => void;
  onRegisterEvent?: (event: CampusEvent) => void;
  onOpenPassWallet?: () => void;
  searchOverride?: string;
}

type CategoryValue = 'ALL' | EventCategory;

const CATEGORY_CHIPS: { label: string; value: CategoryValue; icon: React.ElementType }[] = [
  { label: 'All Events', value: 'ALL', icon: Layers },
  { label: 'Technical', value: 'TECHNICAL', icon: Code },
  { label: 'Hackathons', value: 'HACKATHON', icon: Cpu },
  { label: 'Cultural', value: 'CULTURAL', icon: Palette },
  { label: 'Sports', value: 'SPORTS', icon: Trophy },
  { label: 'Workshops', value: 'WORKSHOP', icon: BookOpen },
  { label: 'Literary', value: 'LITERARY', icon: Feather },
  { label: 'Management', value: 'MANAGEMENT', icon: Briefcase },
  { label: 'General', value: 'GENERAL', icon: Compass },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  OPEN:         { label: 'Open',         cls: 'cp-badge cp-badge-open' },
  CLOSING_SOON: { label: 'Closing Soon', cls: 'cp-badge cp-badge-closing' },
  FULL:         { label: 'Full',         cls: 'cp-badge cp-badge-full' },
  WAITLIST_ONLY:{ label: 'Waitlist',     cls: 'cp-badge cp-badge-wait' },
  CLOSED:       { label: 'Closed',       cls: 'cp-badge cp-badge-closed' },
};

const CATEGORY_COLORS: Record<string, string> = {
  TECHNICAL:  'linear-gradient(135deg, #0d3822 0%, #166534 100%)',
  HACKATHON:  'linear-gradient(135deg, #0a2f1c 0%, #14532d 100%)',
  CULTURAL:   'linear-gradient(135deg, #7c2d12 0%, #92400e 100%)',
  SPORTS:     'linear-gradient(135deg, #0f3822 0%, #15803d 100%)',
  WORKSHOP:   'linear-gradient(135deg, #0d3822 0%, #134e35 100%)',
  LITERARY:   'linear-gradient(135deg, #1c3328 0%, #2e4a3d 100%)',
  MANAGEMENT: 'linear-gradient(135deg, #0d3822 0%, #1c3829 100%)',
  GENERAL:    'linear-gradient(135deg, #0d3822 0%, #166534 100%)',
};

const PAGE_SIZE = 9;

// FAQ data
const FAQ_ITEMS = [
  {
    q: 'How do digital gate passes work at turnstiles?',
    a: 'Once your registration is approved or auto-confirmed, a unique QR pass appears in your Pass Wallet. Present it at the gate — our volunteers scan it in under 50ms using HMAC-SHA256 cryptographic verification.',
  },
  {
    q: 'Can I register for multiple events at the same time?',
    a: 'Yes! CampusPass supports multi-event registrations. Apply for hackathons, cultural fests, and workshops concurrently through your single student profile.',
  },
  {
    q: 'How do team invitations work?',
    a: 'A team leader creates a team and shares the event-specific invite code. Members accept the invitation, and once the minimum team size is met, the application is submitted — individual passes are issued to all members.',
  },
  {
    q: 'Where and when can I use my meal voucher?',
    a: 'For events with meal provision, an encrypted Lunch Pass is auto-attached to your wallet. Present it at the dining hall counter during service hours for contactless verification.',
  },
];

export const EventDiscovery: React.FC<EventDiscoveryProps> = ({
  onSelectEvent,
  onRegisterEvent,
  onOpenPassWallet,
  searchOverride,
}) => {
  const { events, registrations, currentUser } = useCampusPass();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>('ALL');
  const [participationFilter, setParticipationFilter] = useState<'ALL' | RegistrationMode>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSING_SOON' | 'FULL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [detailEvent, setDetailEvent] = useState<CampusEvent | null>(null);
  const [registerEvent, setRegisterEvent] = useState<CampusEvent | null>(null);

  const registeredEventIds = useMemo(() => new Set(
    registrations
      .filter(r => r.studentId === currentUser.studentId && r.status !== 'CANCELLED' && r.status !== 'REJECTED')
      .map(r => r.eventId)
  ), [registrations, currentUser.studentId]);

  const departments = useMemo(() => {
    const deps = new Set<string>();
    events.forEach(e => deps.add(e.department));
    return Array.from(deps);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
      const mode = e.registrationMode || e.participationType;
      if (participationFilter !== 'ALL' && mode !== participationFilter && mode !== 'BOTH') return false;
      if (departmentFilter !== 'ALL' && e.department !== departmentFilter) return false;
      if (statusFilter === 'OPEN' && e.status !== 'OPEN') return false;
      if (statusFilter === 'CLOSING_SOON' && e.status !== 'CLOSING_SOON') return false;
      if (statusFilter === 'FULL' && e.status !== 'FULL' && e.status !== 'WAITLIST_ONLY') return false;
      const search = (searchOverride || searchQuery).trim().toLowerCase();
      if (search) {
        return (
          e.title.toLowerCase().includes(search) ||
          (e.description || '').toLowerCase().includes(search) ||
          (e.organizerName || '').toLowerCase().includes(search) ||
          (e.venue || '').toLowerCase().includes(search) ||
          (e.tags?.some((t: string) => t.toLowerCase().includes(search)) ?? false)
        );
      }
      return true;
    });
  }, [events, selectedCategory, participationFilter, departmentFilter, statusFilter, searchQuery, searchOverride]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginated = filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const featuredEvent = useMemo(() =>
    events.find(e => e.status === 'OPEN') || events[0],
    [events]
  );

  // Platform stats
  const openCount = events.filter(e => e.status === 'OPEN').length;
  const totalRegs = registrations.length;
  const approvedPasses = registrations.filter(r => r.status === 'APPROVED').length;
  const totalCapacity = events.reduce((s, e) => s + (e.capacity || 0), 0);

  const handleSelectEvent = (event: CampusEvent) => {
    if (onSelectEvent) onSelectEvent(event);
    else setDetailEvent(event);
  };

  const handleRegisterEvent = (event: CampusEvent) => {
    if (onRegisterEvent) onRegisterEvent(event);
    else setRegisterEvent(event);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Watermelon: Announcement Block ── */}
      <div className="cp-announcement">
        <Zap size={12} />
        <span>Festival 2026 registration is now open — 48-hour hackathon prize pool of ₹2.5L</span>
        <ArrowRight size={12} />
      </div>

      {/* ── Watermelon: Hero Block — Platform Overview ── */}
      <div className="cp-page-hero">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Campus Festival 2026 — Live Registration
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '10px' }}>
              Discover & Register for<br />
              <span style={{ color: '#86efac' }}>College Events</span>
            </h1>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.55, maxWidth: '480px' }}>
              Apply for hackathons, cultural competitions, technical workshops, and sports events.
              Get your digital gate pass instantly after confirmation.
            </p>
            {onOpenPassWallet && (
              <button
                className="cp-btn cp-btn-primary"
                style={{ marginTop: '16px', display: 'inline-flex' }}
                onClick={onOpenPassWallet}
              >
                <Ticket size={14} />
                Open Pass Wallet
              </button>
            )}
          </div>

          {/* Bento-style mini stats on hero */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Live Events', value: String(openCount), icon: Globe },
              { label: 'Registrations', value: String(totalRegs), icon: Users },
              { label: 'Passes Issued', value: String(approvedPasses), icon: Ticket },
              { label: 'Total Seats', value: String(totalCapacity), icon: Award },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  minWidth: '100px',
                }}
              >
                <s.icon size={14} style={{ color: '#86efac', marginBottom: '6px' }} />
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Watermelon: Stats Block — 4 KPI Cards ── */}
      <div className="cp-stats-grid">
        {[
          { icon: Calendar, label: 'Total Events', value: String(events.length), sub: 'Across all categories', color: '#166534', bg: '#dcfce7' },
          { icon: Users, label: 'Applications', value: String(totalRegs), sub: 'Student registrations', color: '#0f766e', bg: '#ccfbf1' },
          { icon: CheckCircle, label: 'Approved', value: String(approvedPasses), sub: 'Passes issued', color: '#15803d', bg: '#dcfce7' },
          { icon: TrendingUp, label: 'Fill Rate', value: `${totalCapacity > 0 ? Math.round((totalRegs / totalCapacity) * 100) : 0}%`, sub: 'Avg seat occupancy', color: '#d97706', bg: '#fef3c7' },
        ].map(stat => (
          <div key={stat.label} className="cp-stat-card">
            <div className="cp-stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={15} />
            </div>
            <div className="cp-stat-value">{stat.value}</div>
            <div className="cp-stat-label">{stat.label}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Watermelon: Featured Event (Marketing Block) ── */}
      {featuredEvent && (
        <div className="cp-featured-card">
          <div
            style={{
              position: 'absolute', top: '-40px', right: '80px',
              width: '180px', height: '180px', borderRadius: '50%',
              background: 'rgba(22, 101, 52, 0.1)', pointerEvents: 'none',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Star size={12} style={{ color: '#d97706' }} />
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Featured Event
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.25 }}>
              {featuredEvent.title}
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px', maxWidth: '520px' }}>
              {featuredEvent.summary || featuredEvent.description}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { icon: Calendar, text: featuredEvent.date || featuredEvent.startDate },
                { icon: MapPin, text: featuredEvent.venue },
                { icon: Users, text: `${featuredEvent.registeredCount}/${featuredEvent.capacity} seats` },
              ].map((item, i) => item.text && (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
                  <item.icon size={12} style={{ color: '#166534' }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
            <button
              className="cp-btn cp-btn-primary"
              onClick={() => handleRegisterEvent(featuredEvent)}
            >
              Register Now
              <ArrowUpRight size={14} />
            </button>
            <button
              className="cp-btn cp-btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94a3b8' }}
              onClick={() => handleSelectEvent(featuredEvent)}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* ── Watermelon: Bento Grid — Quick Action Cards ── */}
      <div className="cp-bento-grid">
        {[
          { icon: Ticket, title: 'My Pass Wallet', desc: 'View & download digital gate passes', color: '#166534', bg: '#dcfce7', action: () => onOpenPassWallet?.() },
          { icon: Calendar, title: 'All Events', desc: `${events.length} events across 8 categories`, color: '#14532d', bg: '#f0fdf4', action: () => setSelectedCategory('ALL') },
          { icon: Award, title: 'Hackathons', desc: 'Compete for prizes & recognition', color: '#d97706', bg: '#fef3c7', action: () => setSelectedCategory('HACKATHON') },
          { icon: Zap, title: 'Quick Register', desc: 'Apply to open events instantly', color: '#166534', bg: '#f0fdf4', action: () => {} },
        ].map(card => (
          <div
            key={card.title}
            className="cp-bento-cell"
            onClick={card.action}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <card.icon size={17} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{card.title}</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }} className="truncate">{card.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Watermelon: Navigation / Search + Filters ── */}
      <div className="cp-section-card">
        <div className="cp-section-card-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Event Registry</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="cp-search-wrap" style={{ width: '220px' }}>
              <span className="cp-search-icon"><Search size={14} /></span>
              <input
                className="cp-search-input"
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button
              className={`cp-btn ${showFilters ? 'cp-btn-primary' : 'cp-btn-secondary'} cp-btn-sm`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Filter size={13} />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Disclosure (Animated) */}
        {showFilters && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="cp-label">Participation</label>
              <select
                className="cp-select"
                value={participationFilter}
                onChange={e => setParticipationFilter(e.target.value as 'ALL' | RegistrationMode)}
              >
                <option value="ALL">All Types</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="TEAM">Team</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="cp-label">Status</label>
              <select
                className="cp-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'ALL' | 'OPEN' | 'CLOSING_SOON' | 'FULL')}
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="CLOSING_SOON">Closing Soon</option>
                <option value="FULL">Full / Waitlist</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="cp-label">Department</label>
              <select
                className="cp-select"
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '16px' }}>
              <button
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={() => {
                  setParticipationFilter('ALL');
                  setStatusFilter('ALL');
                  setDepartmentFilter('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
              >
                Reset All
              </button>
            </div>
          </div>
        )}

        {/* Choice Chips — Category Tabs */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div className="cp-chips-row">
            {CATEGORY_CHIPS.map(chip => (
              <button
                key={chip.value}
                className={`cp-chip${selectedCategory === chip.value ? ' active' : ''}`}
                onClick={() => { setSelectedCategory(chip.value); setCurrentPage(1); }}
              >
                <chip.icon size={12} />
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid — Watermelon Cards */}
        <div style={{ padding: '20px' }}>
          {paginated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
              <Compass size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                No events found
              </p>
              <p style={{ fontSize: '13px' }}>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="cp-event-grid">
              {paginated.map(event => {
                const isRegistered = registeredEventIds.has(event.id);
                const isFull = event.status === 'FULL';
                const isWaitlist = event.status === 'WAITLIST_ONLY';
                const pct = event.capacity > 0 ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100)) : 0;
                const feeValue = event.registrationFee ?? event.fee ?? 0;
                const statusMeta = STATUS_BADGE[event.status] || STATUS_BADGE['CLOSED'];
                const bannerBg = CATEGORY_COLORS[event.category] || CATEGORY_COLORS['GENERAL'];

                return (
                  <div key={event.id} className="cp-event-card">
                    {/* Card Banner */}
                    <div className="cp-event-banner" style={{ background: bannerBg }}>
                      {/* Category badge */}
                      <span style={{
                        position: 'absolute', top: '10px', left: '10px',
                        padding: '3px 8px', borderRadius: '6px',
                        fontSize: '10px', fontWeight: 700,
                        background: 'rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}>
                        {event.category}
                      </span>
                      {/* Status badge */}
                      <span className={statusMeta.cls} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        {statusMeta.label}
                      </span>
                      {/* Meal badge */}
                      {(event.includesLunch || event.lunchProvided) && (
                        <div style={{
                          position: 'absolute', bottom: '10px', left: '10px',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '3px 8px', borderRadius: '6px',
                          background: 'rgba(13,40,26,0.85)', color: '#86efac',
                          fontSize: '10px', fontWeight: 700,
                          border: '1px solid rgba(74,222,128,0.25)',
                        }}>
                          <Utensils size={10} />
                          Meal Included
                        </div>
                      )}
                      {/* Fee badge */}
                      <div style={{
                        position: 'absolute', bottom: '10px', right: '10px',
                        padding: '3px 8px', borderRadius: '6px',
                        background: 'rgba(13,40,26,0.85)', color: '#ffffff',
                        fontSize: '10px', fontWeight: 800,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}>
                        {feeValue === 0 ? 'FREE' : `₹${feeValue}`}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="cp-event-body">
                      {/* Dept */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', fontWeight: 600, height: '18px' }}>
                        <Building size={12} style={{ color: '#166534', flexShrink: 0 }} />
                        <span className="truncate">{event.department}</span>
                      </div>

                      {/* Title — Strict 40px height so 1-line and 2-line titles occupy identical space */}
                      <h3 style={{
                        fontSize: '15px', fontWeight: 700, color: '#0f172a',
                        lineHeight: 1.33, margin: 0, height: '40px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {event.title}
                      </h3>

                      {/* Summary — Strict 36px height so all cards align horizontally */}
                      <p style={{
                        fontSize: '12px', color: '#64748b', lineHeight: 1.45, margin: 0, height: '36px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {event.summary || event.shortDescription || event.description}
                      </p>

                      {/* Logistics Box — Strict structured height (86px) */}
                      <div style={{
                        background: '#f8fafc', border: '1px solid #f1f5f9',
                        borderRadius: '10px', padding: '10px 12px',
                        display: 'flex', flexDirection: 'column', gap: '6px',
                        minHeight: '86px', justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#475569', minWidth: 0 }}>
                          <Calendar size={12} style={{ color: '#166534', flexShrink: 0 }} />
                          <strong className="truncate">{event.date || event.startDate}</strong>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <Clock size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          <span className="truncate" style={{ color: '#64748b' }}>{event.startTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#475569', minWidth: 0 }}>
                          <MapPin size={12} style={{ color: '#166534', flexShrink: 0 }} />
                          <span className="truncate" style={{ flex: 1 }}>{event.venue}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#475569', minWidth: 0 }}>
                          <Users size={12} style={{ color: '#166534', flexShrink: 0 }} />
                          <span className="truncate">
                            {(event.registrationMode || event.participationType) === 'INDIVIDUAL'
                              ? 'Individual Entry'
                              : (event.registrationMode || event.participationType) === 'TEAM'
                              ? `Teams of ${event.minTeamSize}–${event.maxTeamSize}`
                              : `Solo or Team (${event.minTeamSize}–${event.maxTeamSize})`}
                          </span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div style={{ minHeight: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                          <span>Seats filled</span>
                          <span style={{ fontWeight: 700, color: pct > 90 ? '#b91c1c' : pct > 75 ? '#d97706' : '#0f172a' }}>
                            {event.registeredCount}/{event.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="cp-progress">
                          <div
                            className={`cp-progress-fill${pct > 90 ? ' danger' : pct > 75 ? ' warning' : ''}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons — Pinned at bottom with identical heights */}
                      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                        <button
                          className="cp-btn cp-btn-outline"
                          style={{ flex: 1, justifyContent: 'center', height: '36px' }}
                          onClick={() => handleSelectEvent(event)}
                        >
                          Details
                        </button>
                        {isRegistered ? (
                          <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '5px', height: '36px', borderRadius: '10px',
                            background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0',
                            fontSize: '12px', fontWeight: 700,
                          }}>
                            <CheckCircle size={13} />
                            Applied
                          </div>
                        ) : isFull && !isWaitlist ? (
                          <button className="cp-btn cp-btn-outline" style={{ flex: 1, justifyContent: 'center', height: '36px', opacity: 0.5 }} disabled>
                            Full
                          </button>
                        ) : (
                          <button
                            className="cp-btn cp-btn-primary"
                            style={{ flex: 1, justifyContent: 'center', height: '36px' }}
                            onClick={() => handleRegisterEvent(event)}
                          >
                            {isWaitlist ? 'Waitlist' : 'Apply'}
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Watermelon: Pagination ── */}
        {totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Page {currentPage} of {totalPages} · {filteredEvents.length} events
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="cp-btn cp-btn-outline cp-btn-sm cp-btn-icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) + (i >= totalPages ? 0 : 0);
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={`cp-btn cp-btn-sm ${currentPage === p ? 'cp-btn-primary' : 'cp-btn-outline'}`}
                    style={{ minWidth: '32px', justifyContent: 'center', padding: '5px 8px' }}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                className="cp-btn cp-btn-outline cp-btn-sm cp-btn-icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Watermelon: Integrations Block — Campus Cloud Infrastructure Telemetry ── */}
      <div className="cp-section-card">
        <div className="cp-section-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="cp-icon-box" style={{ background: '#dcfce7', color: '#166534' }}>
              <Server size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Campus Platform & Cloud Telemetry</h4>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Real-time microservices, database clusters & dining sync engines</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
            <Activity size={13} />
            All Systems Operational
          </div>
        </div>
        <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {[
            { name: 'Core API Microservice', sub: 'Express Engine · Port 4000', status: '99.99%', color: '#15803d' },
            { name: 'Database Cluster', sub: 'Persistent Event Registry Store', status: 'ONLINE', color: '#15803d' },
            { name: 'HMAC Cryptographic Engine', sub: 'SHA-256 Token Verification', status: 'ONLINE', color: '#15803d' },
            { name: 'Dining Hall Allocation POS', sub: 'Meal Ticket Distribution Synced', status: 'SYNCED', color: '#166534' },
          ].map(g => (
            <div key={g.name} className="cp-integration-row">
              <div className="cp-integration-dot" style={{ background: '#22c55e' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{g.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{g.sub}</div>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: g.color, background: '#dcfce7', padding: '2px 7px', borderRadius: '5px', flexShrink: 0 }}>
                {g.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Watermelon: FAQ Accordion Block ── */}
      <div className="cp-section-card">
        <div className="cp-section-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="cp-icon-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
              <HelpCircle size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Pass & Gate Verification FAQ</h4>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Common questions about digital passes, teams & meal vouchers</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 20px' }}>
          <div className="cp-accordion">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="cp-accordion-item">
                  <button
                    className="cp-accordion-trigger"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span style={{ color: isOpen ? '#166534' : '#0f172a' }}>{item.q}</span>
                    <ChevronDown
                      size={15}
                      style={{
                        flexShrink: 0,
                        color: isOpen ? '#166534' : '#94a3b8',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div className="cp-accordion-content">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Watermelon: CTA Block ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d3822 0%, #166534 100%)',
        borderRadius: '14px',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.01em' }}>
            Ready to join the festival?
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Register for your events and get your digital gate pass instantly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          {onOpenPassWallet && (
            <button className="cp-btn cp-btn-secondary" onClick={onOpenPassWallet}>
              <Ticket size={14} />
              My Passes
            </button>
          )}
          <button
            className="cp-btn cp-btn-cyan"
            onClick={() => setSelectedCategory('ALL')}
          >
            Browse Events
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="cp-toast">
          <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span>{toastMessage}</span>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, marginLeft: '4px' }} onClick={() => setToastMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Modals */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onRegisterClick={ev => { setDetailEvent(null); handleRegisterEvent(ev); }}
          hasRegistered={registeredEventIds.has(detailEvent.id)}
        />
      )}
      {registerEvent && (
        <EventRegistrationModal
          event={registerEvent}
          onClose={() => setRegisterEvent(null)}
          onSuccess={() => {
            setRegisterEvent(null);
            showToast('Application submitted! Your digital pass has been issued.');
          }}
        />
      )}
    </div>
  );
};
