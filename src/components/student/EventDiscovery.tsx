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
  Lightbulb,
  PartyPopper,
  Mail,
  GraduationCap,
  Plus
} from 'lucide-react';
import { EventDetailModal } from './EventDetailModal';
import { EventRegistrationModal } from './EventRegistrationModal';

interface EventDiscoveryProps {
  onSelectEvent?: (event: CampusEvent) => void;
  onRegisterEvent?: (event: CampusEvent) => void;
  onOpenRegistrations?: () => void;
  onOpenPassWallet?: () => void;
  searchOverride?: string;
}

type CategoryValue = 'ALL' | EventCategory;

const CATEGORY_CHIPS: { label: string; value: CategoryValue; icon: React.ElementType }[] = [
  { label: 'All Events', value: 'ALL', icon: Layers },
  { label: 'Hackathons', value: 'HACKATHON', icon: Cpu },
  { label: 'Ideathons', value: 'IDEATHON', icon: Lightbulb },
  { label: 'Coding Contests', value: 'CODING_COMPETITION', icon: Code },
  { label: 'Aptitude Tests', value: 'APTITUDE', icon: Award },
  { label: 'Cultural Events', value: 'CULTURAL', icon: Palette },
  { label: 'Fresher Parties', value: 'FRESHER_PARTY', icon: PartyPopper },
  { label: 'Bootcamps', value: 'BOOTCAMP', icon: BookOpen },
  { label: 'Campus Drives', value: 'CAMPUS_DRIVE', icon: Briefcase },
  { label: 'Seminars', value: 'SEMINAR', icon: GraduationCap },
  { label: 'Technical', value: 'TECHNICAL', icon: Compass },
  { label: 'Sports', value: 'SPORTS', icon: Trophy },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  OPEN:         { label: 'Open',         cls: 'cp-badge cp-badge-open' },
  CLOSING_SOON: { label: 'Closing Soon', cls: 'cp-badge cp-badge-closing' },
  FULL:         { label: 'Full',         cls: 'cp-badge cp-badge-full' },
  WAITLIST_ONLY:{ label: 'Waitlist',     cls: 'cp-badge cp-badge-wait' },
  CLOSED:       { label: 'Closed',       cls: 'cp-badge cp-badge-closed' },
};

const CATEGORY_COLORS: Record<string, string> = {
  HACKATHON:          'linear-gradient(135deg, #0a2f1c 0%, #14532d 100%)',
  IDEATHON:           'linear-gradient(135deg, #0d3822 0%, #166534 100%)',
  CODING_COMPETITION: 'linear-gradient(135deg, #062b1a 0%, #15803d 100%)',
  APTITUDE:           'linear-gradient(135deg, #1c3328 0%, #2e4a3d 100%)',
  CULTURAL:           'linear-gradient(135deg, #7c2d12 0%, #92400e 100%)',
  FRESHER_PARTY:      'linear-gradient(135deg, #14532d 0%, #166534 100%)',
  BOOTCAMP:           'linear-gradient(135deg, #0d3822 0%, #15803d 100%)',
  CAMPUS_DRIVE:       'linear-gradient(135deg, #0a2f1c 0%, #1c3829 100%)',
  SEMINAR:            'linear-gradient(135deg, #0d3822 0%, #134e35 100%)',
  TECHNICAL:          'linear-gradient(135deg, #0d3822 0%, #166534 100%)',
  SPORTS:             'linear-gradient(135deg, #0f3822 0%, #15803d 100%)',
  WORKSHOP:           'linear-gradient(135deg, #0d3822 0%, #134e35 100%)',
  LITERARY:           'linear-gradient(135deg, #1c3328 0%, #2e4a3d 100%)',
  MANAGEMENT:         'linear-gradient(135deg, #0d3822 0%, #1c3829 100%)',
  GENERAL:            'linear-gradient(135deg, #0d3822 0%, #166534 100%)',
};

const PAGE_SIZE = 9;

// FAQ data
const FAQ_ITEMS = [
  {
    q: 'How does event pass delivery work?',
    a: 'Event passes are configured by campus organizers and administrators per event. If an event issues an official pass (e.g. Hackathons, Coding Contests, Campus Drives, Freshers Party), it is dispatched directly to your registered college email address.',
  },
  {
    q: 'Are passes mandatory for every event?',
    a: 'No. Passes are not mandatory for all events. Open attendance events like Ideathons, Placement Aptitude assessments, Bootcamps, and Seminars do not require a pass — your seat is confirmed immediately upon registration, and you enter with your college ID card.',
  },
  {
    q: 'How do I access or resend my email pass?',
    a: 'Navigate to "My Registrations" in the sidebar. For any approved pass-required event, you can view the official email receipt details or click "Resend Email Pass" for instantaneous delivery.',
  },
  {
    q: 'Can I register for multiple events at once?',
    a: 'Yes! You can explore, filter, and register for Hackathons, Ideathons, Coding Competitions, Bootcamps, Seminars, and Campus Recruitment Drives concurrently using your student profile.',
  },
];

export const EventDiscovery: React.FC<EventDiscoveryProps> = ({
  onSelectEvent,
  onRegisterEvent,
  onOpenRegistrations,
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#86efac' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Campus Festival 2026 — Live Registration
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '12px' }}>
              Discover & Register for<br />
              <span style={{ color: '#86efac' }}>College Events</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.6, maxWidth: '520px', margin: '0 0 20px 0' }}>
              Apply for hackathons, cultural competitions, technical workshops, and sports events.
              Get your digital gate pass instantly after confirmation.
            </p>

            {/* Pill CTA Buttons matching reference image */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="cp-hero-pill-btn"
                onClick={() => onOpenRegistrations?.()}
              >
                <span>My Registrations</span>
                <ArrowRight size={14} />
              </button>
              {onOpenPassWallet && (
                <button
                  className="cp-hero-pill-btn"
                  onClick={onOpenPassWallet}
                >
                  <Ticket size={14} />
                  <span>Pass Wallet</span>
                </button>
              )}
            </div>
          </div>

          {/* Elevated Floating Glass Stats Panel on the waves */}
          <div className="cp-hero-stats-panel">
            <div className="cp-hero-stats-grid">
              {[
                { label: 'Live Events', value: String(openCount), icon: Globe },
                { label: 'Registrations', value: String(totalRegs), icon: Users },
                { label: 'Passes Issued', value: String(approvedPasses), icon: Ticket },
                { label: 'Total Seats', value: String(totalCapacity), icon: Award },
              ].map(s => (
                <div key={s.label} className="cp-hero-stat-box">
                  <s.icon size={15} className="cp-hero-stat-icon" />
                  <div className="cp-hero-stat-value">{s.value}</div>
                  <div className="cp-hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Star size={13} style={{ color: '#fde047' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Featured Event
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.25 }}>
              {featuredEvent.title}
            </h2>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.55, marginBottom: '16px', maxWidth: '540px' }}>
              {featuredEvent.summary || featuredEvent.description}
            </p>
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {[
                { icon: Calendar, text: featuredEvent.date || featuredEvent.startDate },
                { icon: MapPin, text: featuredEvent.venue },
                { icon: Users, text: `${featuredEvent.registeredCount}/${featuredEvent.capacity} seats` },
              ].map((item, i) => item.text && (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#d1fae5' }}>
                  <item.icon size={13} style={{ color: '#86efac' }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="cp-hero-pill-btn cp-hero-pill-btn-solid"
                onClick={() => handleRegisterEvent(featuredEvent)}
              >
                <span>Register Now</span>
                <ArrowUpRight size={14} />
              </button>
              <button
                className="cp-hero-pill-btn"
                onClick={() => handleSelectEvent(featuredEvent)}
              >
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Watermelon: Bento Grid — Quick Action Cards ── */}
      <div className="cp-bento-grid">
        {[
          { icon: Mail, title: 'My Registrations', desc: 'Track admissions & email pass delivery', color: '#166534', bg: '#dcfce7', action: () => onOpenRegistrations?.() },
          { icon: Cpu, title: 'Hackathons', desc: 'National coding & prototype sprints', color: '#14532d', bg: '#f0fdf4', action: () => setSelectedCategory('HACKATHON') },
          { icon: Briefcase, title: 'Campus Drives', desc: 'Tier-1 recruitment & tech placements', color: '#166534', bg: '#f0fdf4', action: () => setSelectedCategory('CAMPUS_DRIVE') },
          { icon: Palette, title: 'Cultural & Fests', desc: 'Gala nights, fresher parties & arts', color: '#d97706', bg: '#fef3c7', action: () => setSelectedCategory('CULTURAL') },
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
                    {/* Card Banner with Photo */}
                    <div className="cp-event-banner">
                      {event.bannerUrl ? (
                        <img src={event.bannerUrl} alt={event.title} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: bannerBg }} />
                      )}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(20, 20, 22, 0.85) 0%, rgba(20, 20, 22, 0.15) 50%, rgba(20, 20, 22, 0.4) 100%)',
                        pointerEvents: 'none'
                      }} />

                      {/* Category badge */}
                      <span style={{
                        position: 'absolute', top: '10px', left: '10px',
                        padding: '3px 8px', borderRadius: '8px',
                        fontSize: '10px', fontWeight: 700,
                        background: 'rgba(0, 0, 0, 0.65)',
                        color: '#ffffff',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                      }}>
                        {event.category}
                      </span>
                      {/* Status badge */}
                      <span className={statusMeta.cls} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        {statusMeta.label}
                      </span>
                      {/* Banner Bottom Badges Row */}
                      <div style={{
                        position: 'absolute', bottom: '10px', left: '10px', right: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '6px', pointerEvents: 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Meal badge */}
                          {(event.includesLunch || event.lunchProvided) && (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              padding: '3px 8px', borderRadius: '8px',
                              background: 'rgba(0, 0, 0, 0.75)', color: '#86efac',
                              fontSize: '10px', fontWeight: 700,
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(74, 222, 128, 0.25)',
                            }}>
                              <Utensils size={10} />
                              Meal Included
                            </div>
                          )}
                          {/* Pass policy badge */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '3px 8px', borderRadius: '8px',
                            background: event.requiresPass !== false ? 'rgba(0, 0, 0, 0.8)' : 'rgba(30, 41, 59, 0.85)',
                            color: event.requiresPass !== false ? '#86efac' : '#cbd5e1',
                            fontSize: '10px', fontWeight: 700,
                            backdropFilter: 'blur(6px)',
                            border: event.requiresPass !== false ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid rgba(148, 163, 184, 0.25)',
                          }}>
                            {event.requiresPass !== false ? <Mail size={10} /> : <CheckCircle size={10} />}
                            {event.requiresPass !== false ? 'Pass via Email' : 'No Pass Needed'}
                          </div>
                        </div>

                        {/* Fee badge */}
                        <div style={{
                          padding: '3px 8px', borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.75)', color: '#ffffff',
                          fontSize: '10px', fontWeight: 800,
                          backdropFilter: 'blur(6px)',
                          border: '1px solid rgba(255, 255, 255, 0.16)',
                          flexShrink: 0
                        }}>
                          {feeValue === 0 ? 'FREE' : `₹${feeValue}`}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="cp-event-body">
                      {/* Dept */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#a1a1aa', fontWeight: 500, height: '18px' }}>
                        <Building size={12} style={{ color: '#86efac', flexShrink: 0 }} />
                        <span className="truncate">{event.department}</span>
                      </div>

                      {/* Title — Strict 42px height so 1-line and 2-line titles occupy identical space */}
                      <h3 style={{
                        fontSize: '16px', fontWeight: 700, color: '#ffffff',
                        lineHeight: 1.3, margin: 0, height: '42px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        letterSpacing: '-0.015em'
                      }}>
                        {event.title}
                      </h3>

                      {/* Summary — Strict 36px height */}
                      <p style={{
                        fontSize: '12px', color: '#a1a1aa', lineHeight: 1.45, margin: 0, height: '36px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {event.summary || event.shortDescription || event.description}
                      </p>

                      {/* Logistics Box — Dark card container */}
                      <div style={{
                        background: '#1c1c1f', border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px', padding: '10px 12px',
                        display: 'flex', flexDirection: 'column', gap: '6px',
                        minHeight: '86px', justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#e4e4e7', minWidth: 0 }}>
                          <Calendar size={12} style={{ color: '#86efac', flexShrink: 0 }} />
                          <strong className="truncate">{event.date || event.startDate}</strong>
                          <span style={{ color: '#52525b' }}>•</span>
                          <Clock size={12} style={{ color: '#a1a1aa', flexShrink: 0 }} />
                          <span className="truncate" style={{ color: '#a1a1aa' }}>{event.startTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#e4e4e7', minWidth: 0 }}>
                          <MapPin size={12} style={{ color: '#86efac', flexShrink: 0 }} />
                          <span className="truncate" style={{ flex: 1 }}>{event.venue}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#e4e4e7', minWidth: 0 }}>
                          <Users size={12} style={{ color: '#86efac', flexShrink: 0 }} />
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                          <span>Seats filled</span>
                          <span style={{ fontWeight: 700, color: pct > 90 ? '#f87171' : pct > 75 ? '#fbbf24' : '#ffffff' }}>
                            {event.registeredCount}/{event.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="cp-progress" style={{ background: '#27272a' }}>
                          <div
                            className={`cp-progress-fill${pct > 90 ? ' danger' : pct > 75 ? ' warning' : ''}`}
                            style={{
                              width: `${pct}%`,
                              background: pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#166534'
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons: '+' inspect button on left + Primary Action Button */}
                      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Plus button replacing Details button */}
                        <button
                          className="cp-btn cp-btn-icon"
                          style={{
                            background: '#27272a',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#e4e4e7',
                            borderRadius: '12px',
                            width: '38px',
                            height: '38px',
                            flexShrink: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.12s'
                          }}
                          onClick={() => handleSelectEvent(event)}
                          title="View Event Details"
                          aria-label="View Event Details"
                        >
                          <Plus size={16} />
                        </button>

                        {isRegistered ? (
                          <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '6px', height: '38px', borderRadius: '12px',
                            background: 'rgba(22, 101, 52, 0.3)', color: '#86efac', border: '1px solid rgba(74, 222, 128, 0.3)',
                            fontSize: '12.5px', fontWeight: 700,
                          }}>
                            <CheckCircle size={14} />
                            Applied
                          </div>
                        ) : isFull && !isWaitlist ? (
                          <button
                            className="cp-btn"
                            style={{ flex: 1, justifyContent: 'center', height: '38px', opacity: 0.5, background: '#27272a', border: '1px solid rgba(255,255,255,0.08)', color: '#71717a', borderRadius: '12px' }}
                            disabled
                          >
                            Full
                          </button>
                        ) : (
                          <button
                            className="cp-btn cp-btn-primary"
                            style={{
                              flex: 1, justifyContent: 'center', height: '38px', borderRadius: '12px', fontSize: '12.5px', fontWeight: 700,
                              background: '#166534', color: '#ffffff', border: '1px solid #166534',
                              boxShadow: '0 2px 10px rgba(22, 101, 52, 0.3)'
                            }}
                            onClick={() => handleRegisterEvent(event)}
                          >
                            <span>{isWaitlist ? 'Join Waitlist' : 'Apply Now'}</span>
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
