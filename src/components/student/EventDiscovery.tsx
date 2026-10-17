import React, { useState, useMemo, useEffect } from 'react';
import type { CampusEvent, EventCategory, RegistrationMode } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { CampusEventFilters, CampusFilter } from './CampusEventFilters';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  Utensils,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
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
  Globe,
  Lightbulb,
  PartyPopper,
  Mail,
  GraduationCap,
  Plus,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Timer,
  Edit3,
  ShieldCheck,
  Type,
  LayoutGrid,
  Sliders
} from 'lucide-react';
import { EventDetailModal } from './EventDetailModal';
import { FaqPro, type FaqProItem } from '@/components/ui/faq-pro';
import { EventRegistrationModal } from './EventRegistrationModal';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { DynamicNeuroNoise } from '@/components/ui/dynamic-neuro-noise';
import { EditFeaturedEventModal } from './EditFeaturedEventModal';
import { EditEventRegistryModal } from './EditEventRegistryModal';
import { EditHeroTextModal } from './EditHeroTextModal';
import { EditBentoCardsModal } from './EditBentoCardsModal';

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
const FAQ_ITEMS: FaqProItem[] = [
  {
    id: 'pass-delivery',
    question: 'How does event pass delivery work?',
    answer: 'Event passes are configured by campus organizers and administrators per event. If an event issues an official pass (e.g. Hackathons, Coding Contests, Campus Drives, Freshers Party), it is dispatched directly to your registered college email address.',
  },
  {
    id: 'mandatory-passes',
    question: 'Are passes mandatory for every event?',
    answer: 'No. Passes are not mandatory for all events. Open attendance events like Ideathons, Placement Aptitude assessments, Bootcamps, and Seminars do not require a pass — your seat is confirmed immediately upon registration, and you enter with your college ID card.',
  },
  {
    id: 'access-resend',
    question: 'How do I access or resend my email pass?',
    answer: 'Navigate to "My Applications" from the navigation menu. For any approved pass-required event, you can view the official email receipt details or click "Resend Email Pass" for instantaneous delivery.',
  },
  {
    id: 'multiple-registrations',
    question: 'Can I register for multiple events at once?',
    answer: 'Yes! You can explore, filter, and register for Hackathons, Ideathons, Coding Competitions, Bootcamps, Seminars, and Campus Recruitment Drives concurrently using your student profile.',
  },
  {
    id: 'team-registration',
    question: 'How does team leader registration work?',
    answer: 'For team events like Hackathons and Ideathons, the team leader registers the team name and invites members. Each member receives their individual QR gate pass once the registration is approved.',
  },
  {
    id: 'meal-vouchers',
    question: 'How do lunch passes & meal vouchers get verified?',
    answer: 'Meal passes feature rotating cryptographic tokens. Dining hall volunteers scan your digital voucher at the counter, instantly validating dietary preferences and preventing duplicate claims.',
  },
];

export const EventDiscovery: React.FC<EventDiscoveryProps> = ({
  onSelectEvent,
  onRegisterEvent,
  onOpenRegistrations,
  onOpenPassWallet,
  searchOverride,
}) => {
  const {
    events,
    registrations,
    currentUser,
    activePortal,
    updateEvent,
    createEvent,
    heroConfig,
    updateHeroConfig,
    resetHeroConfig,
    bentoCards,
    updateBentoCard,
    updateAllBentoCards,
    resetBentoCards
  } = useCampusPass();

  const isManager = activePortal === 'ADMIN' || activePortal === 'ORGANIZER' || currentUser.role === 'ADMIN' || currentUser.role === 'ORGANIZER';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>('ALL');
  const [activeCampusFilters, setActiveCampusFilters] = useState<CampusFilter[]>([]);
  const [participationFilter, setParticipationFilter] = useState<'ALL' | RegistrationMode>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSING_SOON' | 'FULL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCampusFilters, selectedCategory, searchQuery]);

  // Modals for Student Discovery
  const [detailEvent, setDetailEvent] = useState<CampusEvent | null>(null);
  const [registerEvent, setRegisterEvent] = useState<CampusEvent | null>(null);

  // Modals for Organizer & Admin Editing
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isBentoModalOpen, setIsBentoModalOpen] = useState(false);
  const [selectedBentoCardIdForEdit, setSelectedBentoCardIdForEdit] = useState<string | undefined>(undefined);
  const [editingEventForRegistry, setEditingEventForRegistry] = useState<CampusEvent | null>(null);
  const [pinnedFeaturedId, setPinnedFeaturedId] = useState<string | null>(
    () => localStorage.getItem('cp_pinned_featured_id') || null
  );

  const handleSetPinnedFeaturedId = (id: string) => {
    setPinnedFeaturedId(id);
    localStorage.setItem('cp_pinned_featured_id', id);
  };

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
      // 1. Choice Chips category filter
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;

      // 2. Linear-style Segmented Campus Filters
      for (const f of activeCampusFilters) {
        if (!f.values || f.values.length === 0) continue;

        if (f.type === 'Category') {
          const match = f.values.includes(e.category);
          if (f.operator === 'is' && !match) return false;
          if (f.operator === 'is any of' && !match) return false;
          if (f.operator === 'is not' && match) return false;
        }

        if (f.type === 'Status') {
          const match = f.values.includes(e.status);
          if (f.operator === 'is' && !match) return false;
          if (f.operator === 'is any of' && !match) return false;
          if (f.operator === 'is not' && match) return false;
        }

        if (f.type === 'Participation') {
          const mode = e.registrationMode || e.participationType;
          const match = f.values.some(v => v === mode || (v === 'BOTH' && mode === 'BOTH') || (mode === 'BOTH'));
          if (f.operator === 'is' && !match) return false;
          if (f.operator === 'is any of' && !match) return false;
          if (f.operator === 'is not' && match) return false;
        }

        if (f.type === 'Department') {
          const match = f.values.includes(e.department);
          if (f.operator === 'is' && !match) return false;
          if (f.operator === 'is any of' && !match) return false;
          if (f.operator === 'is not' && match) return false;
        }

        if (f.type === 'Fee') {
          const isFree = !e.fee || e.fee === 0;
          const match = (f.values.includes('FREE') && isFree) || (f.values.includes('PAID') && !isFree);
          if (f.operator === 'is' && !match) return false;
          if (f.operator === 'is any of' && !match) return false;
          if (f.operator === 'is not' && match) return false;
        }

        if (f.type === 'Meal Pass') {
          const hasMeal = Boolean(e.includesLunch || e.lunchProvided);
          const match = (f.values.includes('YES') && hasMeal) || (f.values.includes('NO') && !hasMeal);
          if (f.operator === 'is' && !match) return false;
          if (f.operator === 'is any of' && !match) return false;
          if (f.operator === 'is not' && match) return false;
        }
      }

      // 3. Fallback legacy filters
      const mode = e.registrationMode || e.participationType;
      if (participationFilter !== 'ALL' && mode !== participationFilter && mode !== 'BOTH') return false;
      if (departmentFilter !== 'ALL' && e.department !== departmentFilter) return false;
      if (statusFilter === 'OPEN' && e.status !== 'OPEN') return false;
      if (statusFilter === 'CLOSING_SOON' && e.status !== 'CLOSING_SOON') return false;
      if (statusFilter === 'FULL' && e.status !== 'FULL' && e.status !== 'WAITLIST_ONLY') return false;

      // 4. Keyword search
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
  }, [events, selectedCategory, activeCampusFilters, participationFilter, departmentFilter, statusFilter, searchQuery, searchOverride]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginated = filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const featuredEvent = useMemo(() => {
    if (pinnedFeaturedId) {
      const pinned = events.find(e => e.id === pinnedFeaturedId);
      if (pinned) return pinned;
    }
    return events.find(e => e.status === 'OPEN') || events[0];
  }, [events, pinnedFeaturedId]);

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

      {/* ── Organizer & Admin Management Navigation Bar ── */}
      {isManager && (
        <div className="cp-manager-nav-bar">
          <div className="cp-manager-nav-badge">
            <ShieldCheck size={20} />
            <div>
              <span className="cp-manager-nav-title">Organizer &amp; Admin Portal Active</span>
              <span className="cp-manager-nav-sub">Live Event Discovery &amp; Registry Editor</span>
            </div>
          </div>
          <div className="cp-manager-nav-actions">
            <button
              className="cp-hero-btn-secondary"
              onClick={() => setIsHeroModalOpen(true)}
              style={{ fontSize: '12.5px', padding: '7px 14px', borderRadius: '8px', color: '#ffffff', background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.28)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Type size={14} />
              <span>Edit Hero Text</span>
            </button>
            <button
              className="cp-hero-btn-secondary"
              onClick={() => setIsBentoModalOpen(true)}
              style={{ fontSize: '12.5px', padding: '7px 14px', borderRadius: '8px', color: '#ffffff', background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.28)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <LayoutGrid size={14} />
              <span>Edit Highlight Cards</span>
            </button>
            <button
              className="cp-hero-btn-secondary"
              onClick={() => setIsFeaturedModalOpen(true)}
              style={{ fontSize: '12.5px', padding: '7px 14px', borderRadius: '8px', color: '#ffffff', background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.28)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Star size={14} />
              <span>Edit Featured</span>
            </button>
            <button
              className="cp-hero-btn-secondary"
              onClick={() => {
                setEditingEventForRegistry(null);
                setIsRegistryModalOpen(true);
              }}
              style={{ fontSize: '12.5px', padding: '7px 14px', borderRadius: '8px', color: '#ffffff', background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.28)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Calendar size={14} />
              <span>Event Registry</span>
            </button>
            <button
              className="cp-hero-pill-btn cp-hero-pill-btn-solid"
              onClick={() => {
                setEditingEventForRegistry(null);
                setIsRegistryModalOpen(true);
              }}
              style={{ fontSize: '12.5px', padding: '7px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#09090b', background: '#ffffff', border: '1px solid #ffffff', cursor: 'pointer', fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Dynamic NeuroNoise Shader Hero (1:1 with Attached Reference) ── */}
      <div className="cp-page-hero">
        <DynamicNeuroNoise
          scale={0.65}
          speed={1.0}
          colorBack="#09090b"
          colorFront="rgba(255, 255, 255, 0.35)"
          colorMid="rgba(255, 255, 255, 0.9)"
          brightness={0.02}
          contrast={0.95}
        />
        <div className="cp-hero-overlay" />

        <div className="cp-hero-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '34px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
                {heroConfig.headline}
              </h1>
              {isManager && (
                <button
                  type="button"
                  onClick={() => setIsHeroModalOpen(true)}
                  title="Edit hero headline & subtitle text"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 9px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <Type size={12} />
                  <span>Edit Text</span>
                </button>
              )}
            </div>
            <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: 1.6, maxWidth: '560px', margin: '0 0 24px 0' }}>
              {heroConfig.subtitle}
            </p>

            {/* Action Buttons matching attached image 1:1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="cp-hero-btn-primary"
                onClick={() => onOpenRegistrations?.()}
              >
                <span>{heroConfig.primaryCtaText || 'My Registrations'}</span>
                <ArrowUpRight size={16} />
              </button>
              {onOpenPassWallet && (
                <button
                  className="cp-hero-btn-secondary"
                  onClick={onOpenPassWallet}
                >
                  <Ticket size={16} />
                  <span>{heroConfig.secondaryCtaText || 'Pass Wallet'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Elevated Floating Glass Stats Panel */}
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

      {/* ── KPI Metric Cards (1:1 with Reference Image 1) ── */}
      <div className="cp-stats-grid">
        {/* Card 1: Pitch Black Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#09090b', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>Total Events</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{events.length.toLocaleString()}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(34, 197, 94, 0.22)', color: '#4ade80' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              11.4%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Vs last month: <strong style={{ color: '#ffffff' }}>{Math.max(1, events.length - 2)}</strong>
          </div>
        </div>

        {/* Card 2: Vibrant Purple Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#9333ea', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Applications</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{totalRegs.toLocaleString()}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              8.2%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Vs last month: <strong style={{ color: '#ffffff' }}>{Math.max(0, totalRegs - 4)}</strong>
          </div>
        </div>

        {/* Card 3: Royal Blue Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#2563eb', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Passes Issued</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{approvedPasses.toLocaleString()}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              14.5%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Vs last month: <strong style={{ color: '#ffffff' }}>{Math.max(0, approvedPasses - 2)}</strong>
          </div>
        </div>

        {/* Card 4: Clinical Teal Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#0d9488', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Campus Occupancy</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{totalCapacity > 0 ? Math.round((totalRegs / totalCapacity) * 100) : 0}%</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              3.5%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Vs last month: <strong style={{ color: '#ffffff' }}>82.0%</strong>
          </div>
        </div>
      </div>

      {/* ── Watermelon: Featured Event (Marketing Block) ── */}
      {featuredEvent && (
        <div className="cp-featured-card">
          <DynamicNeuroNoise speed={0.7} scale={0.8} />
          <div className="cp-hero-overlay" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={13} style={{ color: '#fde047' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Featured Event
                </span>
              </div>
              {isManager && (
                <span style={{ fontSize: '10.5px', color: '#86efac', background: 'rgba(22, 101, 52, 0.65)', border: '1px solid rgba(134, 239, 172, 0.3)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  Admin Featured Control Active
                </span>
              )}
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
              {isManager && (
                <button
                  className="cp-hero-pill-btn"
                  onClick={() => setIsFeaturedModalOpen(true)}
                  style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}
                >
                  <Edit3 size={14} />
                  <span>Edit Featured Event</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bento Grid Cards (1:1 with Reference Image 2) ── */}
      {isManager && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '-6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <LayoutGrid size={14} />
            <span>Featured Highlight Showcase (4 Cards)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedBentoCardIdForEdit(undefined);
              setIsBentoModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#09090b',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Sliders size={13} />
            <span>Edit Highlight Cards</span>
          </button>
        </div>
      )}
      <div className="cp-bento-grid">
        {bentoCards.map((card, idx) => {
          const handleClick = () => {
            if (card.targetCategory === 'PASSES') {
              onOpenRegistrations?.();
            } else if (card.targetCategory === 'ALL') {
              setSelectedCategory('ALL');
            } else {
              setSelectedCategory(card.targetCategory as any);
            }
          };

          return (
            <div
              key={card.id}
              className="cp-bento-card-v2"
              style={{ background: card.bg, borderColor: card.border, position: 'relative' }}
              onClick={handleClick}
            >
              {isManager && (
                <button
                  type="button"
                  title={`Edit "${card.title}"`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBentoCardIdForEdit(card.id);
                    setIsBentoModalOpen(true);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <Edit3 size={13} />
                </button>
              )}
              <div>
                <div className="cp-bento-tag">
                  <span className="cp-bento-tag-dot" style={{ background: card.tagColor }} />
                  <span style={{ color: card.tagColor }}>{card.tag}</span>
                </div>
                <h3 className="cp-bento-title">{card.title}</h3>
                <p className="cp-bento-desc">{card.description}</p>
              </div>
              <span className="cp-bento-link">
                <span>{card.linkLabel}</span>
                <ArrowRight size={13} />
              </span>
              {/* Preserved High-Fidelity 3D Geometric Shapes matching attached Image 2 */}
              {idx === 0 && (
                <svg className="cp-bento-3d-graphic" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="peach3d1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                    <linearGradient id="peach3d2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fed7aa" />
                      <stop offset="100%" stopColor="#fdba74" />
                    </linearGradient>
                  </defs>
                  <polygon points="50,15 85,32 50,49 15,32" fill="url(#peach3d2)" opacity="0.9" />
                  <polygon points="15,32 50,49 50,85 15,68" fill="url(#peach3d1)" />
                  <polygon points="50,49 85,32 85,68 50,85" fill="#c2410c" opacity="0.85" />
                  <circle cx="50" cy="32" r="5" fill="#ffffff" opacity="0.8" />
                </svg>
              )}
              {idx === 1 && (
                <svg className="cp-bento-3d-graphic" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="sky3d1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient id="sky3d2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#7dd3fc" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="50" cy="30" rx="32" ry="14" fill="url(#sky3d2)" />
                  <path d="M18,30 v30 c0,7.7 14.3,14 32,14 c17.7,0 32,-6.3 32,-14 v-30" fill="url(#sky3d1)" />
                  <ellipse cx="50" cy="60" rx="32" ry="14" fill="none" stroke="#e0f2fe" strokeWidth="2" opacity="0.6" />
                </svg>
              )}
              {idx === 2 && (
                <svg className="cp-bento-3d-graphic" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="purp3d1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                    <linearGradient id="purp3d2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f3e8ff" />
                      <stop offset="100%" stopColor="#d8b4fe" />
                    </linearGradient>
                  </defs>
                  <polygon points="50,12 80,48 50,56 20,48" fill="url(#purp3d2)" />
                  <polygon points="20,48 50,56 50,90 20,70" fill="url(#purp3d1)" />
                  <polygon points="50,56 80,48 80,70 50,90" fill="#6b21a8" opacity="0.85" />
                </svg>
              )}
              {idx === 3 && (
                <svg className="cp-bento-3d-graphic" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="mint3d1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="mint3d2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#dcfce7" />
                      <stop offset="100%" stopColor="#86efac" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="30" fill="url(#mint3d1)" />
                  <ellipse cx="50" cy="50" rx="38" ry="12" fill="none" stroke="url(#mint3d2)" strokeWidth="4" transform="rotate(-25 50 50)" />
                </svg>
              )}
            </div>
          );
        })}
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
            {isManager && (
              <>
                <button
                  className="cp-btn cp-btn-primary cp-btn-sm"
                  onClick={() => {
                    setEditingEventForRegistry(null);
                    setIsRegistryModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Edit3 size={13} />
                  <span>Edit Registry</span>
                </button>
                <button
                  className="cp-btn cp-btn-secondary cp-btn-sm"
                  onClick={() => {
                    setEditingEventForRegistry(null);
                    setIsRegistryModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Plus size={13} />
                  <span>New Event</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Linear-Style Interactive Segmented Filter Bar (Height Animation & Flow) ── */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <CampusEventFilters
            filters={activeCampusFilters}
            setFilters={setActiveCampusFilters}
            availableDepartments={departments}
            totalMatches={filteredEvents.length}
          />
        </div>

        {/* Choice Chips — Category Tabs (1:1 with Reference Image 4) */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div className="cp-chips-card-container" style={{ margin: 0 }}>
            <div className="cp-chips-row">
              {CATEGORY_CHIPS.map(chip => (
                <button
                  key={chip.value}
                  className={`cp-chip${selectedCategory === chip.value ? ' active' : ''}`}
                  onClick={() => { setSelectedCategory(chip.value); setCurrentPage(1); }}
                >
                  <chip.icon size={13} />
                  {chip.label}
                </button>
              ))}
            </div>
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
                      {/* Rescheduled warning pill */}
                      {event.scheduleUpdate?.isRescheduled && (
                        <span style={{
                          position: 'absolute', top: '38px', right: '10px',
                          padding: '2px 7px', borderRadius: '6px',
                          fontSize: '9.5px', fontWeight: 800,
                          background: 'rgba(120, 53, 15, 0.92)',
                          color: '#fef08a',
                          border: '1px solid rgba(253, 224, 71, 0.4)',
                          display: 'flex', alignItems: 'center', gap: '3px',
                          backdropFilter: 'blur(6px)'
                        }}>
                          <AlertTriangle size={9} /> Rescheduled
                        </span>
                      )}
                      {/* Banner Bottom Badges Row */}
                      <div style={{
                        position: 'absolute', bottom: '10px', left: '10px', right: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '6px', pointerEvents: 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Multi-round badge */}
                          {event.rounds && event.rounds.length > 1 && (
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              padding: '3px 8px', borderRadius: '8px',
                              background: 'rgba(20, 83, 45, 0.88)', color: '#86efac',
                              fontSize: '10px', fontWeight: 700,
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(74, 222, 128, 0.3)',
                            }}>
                              <Trophy size={10} />
                              {event.rounds.length} Rounds
                            </div>
                          )}
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

                      {/* Action Buttons: '+' inspect button on left + Edit button (for manager) + Primary Action Button */}
                      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Plus button for details */}
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

                        {/* Direct Edit Button for Organizers & Admins */}
                        {isManager && (
                          <button
                            className="cp-btn cp-btn-icon"
                            style={{
                              background: '#1c1c1f',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                              color: '#38bdf8',
                              borderRadius: '12px',
                              width: '38px',
                              height: '38px',
                              flexShrink: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.12s'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEventForRegistry(event);
                              setIsRegistryModalOpen(true);
                            }}
                            title="Edit Event in Registry"
                            aria-label="Edit Event in Registry"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

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

      {/* ── FAQ Section (FaqPro Design) ── */}
      <div className="cp-section-card" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="cp-icon-box" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
              <HelpCircle size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Pass & Gate Verification FAQ</h4>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Search common questions about digital passes, teams & meal vouchers</p>
            </div>
          </div>
        </div>

        <FaqPro
          items={FAQ_ITEMS}
          searchPlaceholder="Search FAQs about passes, gate check-in & meals..."
          defaultOpenFirst={false}
          className="w-full max-w-none"
        />
      </div>

      {/* ── CTA Banner (Dark Caustic Shader Aesthetic) ── */}
      <div style={{
        background: '#09090b',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
        boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.5)',
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.01em' }}>
            Ready to join the festival?
          </h3>
          <p style={{ fontSize: '13.5px', color: '#a1a1aa' }}>
            Register for your events and get your digital gate pass instantly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
          {onOpenPassWallet && (
            <button className="cp-hero-btn-secondary" onClick={onOpenPassWallet}>
              <Ticket size={14} />
              <span>My Passes</span>
            </button>
          )}
          <button
            className="cp-hero-btn-primary"
            onClick={() => setSelectedCategory('ALL')}
          >
            <span>Browse Events</span>
            <ArrowUpRight size={14} />
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
      {/* Organizer & Admin Modals */}
      {isFeaturedModalOpen && featuredEvent && (
        <EditFeaturedEventModal
          events={events}
          featuredEvent={featuredEvent}
          onClose={() => setIsFeaturedModalOpen(false)}
          onSetPinnedFeaturedId={handleSetPinnedFeaturedId}
          onUpdateEvent={updateEvent}
          onSuccessNotice={(msg) => showToast(msg)}
        />
      )}

      {isRegistryModalOpen && (
        <EditEventRegistryModal
          events={events}
          onClose={() => {
            setIsRegistryModalOpen(false);
            setEditingEventForRegistry(null);
          }}
          onSetPinnedFeaturedId={handleSetPinnedFeaturedId}
          pinnedFeaturedId={pinnedFeaturedId}
          onUpdateEvent={updateEvent}
          onCreateEvent={createEvent}
          onSuccessNotice={(msg) => showToast(msg)}
          initialEditingEvent={editingEventForRegistry}
        />
      )}

      {/* Hero Text Customizer Modal */}
      {isHeroModalOpen && (
        <EditHeroTextModal
          heroConfig={heroConfig}
          onClose={() => setIsHeroModalOpen(false)}
          onUpdateHero={updateHeroConfig}
          onResetHero={resetHeroConfig}
          onSuccessNotice={(msg) => showToast(msg)}
        />
      )}

      {/* Bento Highlight Cards Customizer Modal */}
      {isBentoModalOpen && (
        <EditBentoCardsModal
          bentoCards={bentoCards}
          onClose={() => {
            setIsBentoModalOpen(false);
            setSelectedBentoCardIdForEdit(undefined);
          }}
          onUpdateCard={updateBentoCard}
          onUpdateAllCards={updateAllBentoCards}
          onResetCards={resetBentoCards}
          onSuccessNotice={(msg) => showToast(msg)}
          initialCardId={selectedBentoCardIdForEdit}
        />
      )}
    </div>
  );
};
