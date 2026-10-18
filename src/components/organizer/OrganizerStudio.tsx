import React, { useState, useMemo } from 'react';
import type { CampusEvent, CampusRegistration, EventCategory, RegistrationMode } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { exportToCsv } from '../../utils/exportCsv';
import { DynamicNeuroNoise } from '@/components/ui/dynamic-neuro-noise';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Download,
  Search,
  Edit3,
  AlertCircle,
  Utensils,
  BarChart3,
  UserCheck,
  Check,
  X,
  ShieldCheck,
  Filter,
  ChevronRight,
  TrendingUp,
  Server,
  Activity,
  Award,
  Layers,
  Building,
  MoreHorizontal,
  ArrowUp,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const OrganizerStudio: React.FC = () => {
  const {
    events,
    registrations,
    passes,
    scanLogs,
    currentUser,
    institutionProfile,
    createEvent,
    updateEvent,
    approveRegistration,
    rejectRegistration,
    theme
  } = useCampusPass();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'EVENTS' | 'TELEMETRY'>('APPLICATIONS');

  // Filter states for Application Review Desk
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection modal
  const [rejectingReg, setRejectingReg] = useState<CampusRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Create / Edit Event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Action status feedback
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      if (selectedEventId !== 'ALL' && r.eventId !== selectedEventId) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.studentName.toLowerCase().includes(q);
        const matchesId = r.studentId.toLowerCase().includes(q);
        const matchesRef = (r.referenceNumber || r.id).toLowerCase().includes(q);
        const matchesTeam = r.teamName?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesId && !matchesRef && !matchesTeam) return false;
      }
      return true;
    });
  }, [registrations, selectedEventId, statusFilter, searchQuery]);

  const pendingCount = registrations.filter(r => r.status === 'PENDING').length;
  const approvedCount = registrations.filter(r => r.status === 'APPROVED').length;
  const verifiedCheckIns = passes.filter(p => p.status === 'USED').length;

  // Sorting, selection & pagination states for Application Review Desk
  const [sortField, setSortField] = useState<'studentName' | 'eventTitle' | 'referenceNumber' | 'dietaryPreference' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRegistrations, setSelectedRegistrations] = useState<Record<string, boolean>>({});
  const [pageSize, setPageSize] = useState<number>(5);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const sortedRegistrations = useMemo(() => {
    if (!sortField) return filteredRegistrations;
    return [...filteredRegistrations].sort((a, b) => {
      let valA: any = (a as any)[sortField] || '';
      let valB: any = (b as any)[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRegistrations, sortField, sortDirection]);

  const paginatedRegistrations = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedRegistrations.slice(start, start + pageSize);
  }, [sortedRegistrations, pageIndex, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedRegistrations.length / pageSize));

  const allCurrentPageSelected = paginatedRegistrations.length > 0 && paginatedRegistrations.every(r => selectedRegistrations[r.id]);
  const someCurrentPageSelected = paginatedRegistrations.some(r => selectedRegistrations[r.id]) && !allCurrentPageSelected;

  const toggleSelectAll = (checked: boolean) => {
    setSelectedRegistrations(prev => {
      const next = { ...prev };
      paginatedRegistrations.forEach(r => {
        if (checked) {
          next[r.id] = true;
        } else {
          delete next[r.id];
        }
      });
      return next;
    });
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    setSelectedRegistrations(prev => {
      const next = { ...prev };
      if (checked) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const handleSort = (field: 'studentName' | 'eventTitle' | 'referenceNumber' | 'dietaryPreference' | 'status') => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle Approve
  const handleApprove = async (reg: CampusRegistration) => {
    try {
      const res = await approveRegistration(reg.id, currentUser.fullName);
      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Application ${reg.referenceNumber || reg.id} (${reg.studentName}) approved. Digital Pass issued!`
        });
      } else {
        setActionNotice({ type: 'error', message: res.message || 'Approval failed.' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error approving application.' });
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Reject Submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReg) return;
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }

    try {
      const res = await rejectRegistration(rejectingReg.id, rejectionReason.trim(), currentUser.fullName);
      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Application ${rejectingReg.referenceNumber || rejectingReg.id} rejected.`
        });
        setRejectingReg(null);
        setRejectionReason('');
      } else {
        setActionNotice({ type: 'error', message: res.message || 'Rejection failed.' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error rejecting application.' });
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Export Applications to CSV
  const handleExportCsv = () => {
    const rows = filteredRegistrations.map(r => ({
      ReferenceNumber: r.referenceNumber || r.id,
      EventTitle: r.eventTitle,
      StudentName: r.studentName,
      StudentID: r.studentId,
      Department: r.department,
      AcademicYear: r.academicYear,
      Email: r.studentEmail,
      Phone: r.phone || r.studentPhone || 'N/A',
      ParticipationType: r.registrationType || r.participationType,
      TeamName: r.teamName || 'N/A',
      DietaryPreference: r.dietaryPreference || 'N/A',
      Status: r.status,
      AppliedAt: r.submittedAt || r.createdAt,
      ReviewedBy: r.reviewedBy || 'N/A'
    }));

    exportToCsv(`CampusPass_Registrations_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  // Form state for Event Modal
  const [eventForm, setEventForm] = useState<Partial<CampusEvent>>({
    title: '',
    shortDescription: '',
    description: '',
    category: 'TECHNICAL',
    department: currentUser.department || 'Computer Science & Engineering',
    venue: '',
    startDate: '2026-10-25',
    endDate: '2026-10-25',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    registrationDeadline: '2026-10-24T23:59:59Z',
    capacity: 100,
    waitlistLimit: 25,
    registrationMode: 'INDIVIDUAL',
    minTeamSize: 1,
    maxTeamSize: 1,
    fee: 0,
    requiresApproval: true,
    requiresPass: true,
    includesLunch: true,
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    tags: ['Technical', 'Campus', 'Festival'],
    rules: ['Valid college ID mandatory at entry', 'Adhere to institutional conduct rules'],
    faqs: [{ q: 'Is attendance recorded?', a: 'Via digital pass verification or check-in desk.' }],
    contactEmail: currentUser.email,
    contactPhone: currentUser.phone || '+91 98765 01001'
  });

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      shortDescription: '',
      description: '',
      category: 'HACKATHON',
      department: currentUser.department || 'Computer Science & Engineering',
      venue: 'Main Auditorium',
      date: '2026-10-25',
      startDate: '2026-10-25',
      endDate: '2026-10-25',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      registrationDeadline: '2026-10-24T23:59:59Z',
      capacity: 100,
      waitlistLimit: 25,
      registrationMode: 'INDIVIDUAL',
      minTeamSize: 1,
      maxTeamSize: 1,
      fee: 0,
      requiresApproval: true,
      requiresPass: true,
      includesLunch: true,
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      tags: ['Technical', 'Campus', 'CollegeFestival'],
      rules: ['Student ID card mandatory', 'Arrive 15 minutes prior to start time'],
      faqs: [{ q: 'Who is eligible?', a: 'All verified students of the college.' }],
      contactEmail: currentUser.email,
      contactPhone: currentUser.phone || '+91 98765 01001'
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (event: CampusEvent) => {
    setEditingEventId(event.id);
    setEventForm({ ...event });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.venue) {
      alert('Title and Venue are required.');
      return;
    }

    try {
      if (editingEventId) {
        const res = await updateEvent(editingEventId, eventForm);
        if (res.success) {
          setActionNotice({ type: 'success', message: `Event "${eventForm.title}" updated successfully!` });
        }
      } else {
        const res = await createEvent({
          ...eventForm,
          organizerId: currentUser.id,
          organizerName: currentUser.fullName
        });
        if (res.success) {
          setActionNotice({ type: 'success', message: `Event "${eventForm.title}" published successfully!` });
        }
      }
      setIsEventModalOpen(false);
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to save event.' });
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Studio Header Page Hero */}
      <div className="cp-page-hero">
        <DynamicNeuroNoise />
        <div className="cp-hero-overlay" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#86efac' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac' }}>
                Event Operations Studio
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
              Organizer Management Command
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)', margin: 0, maxWidth: '580px', lineHeight: 1.55 }}>
              Review student registrations, publish new festival events, oversee check-ins, and manage participant quotas.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="cp-hero-pill-btn cp-hero-pill-btn-solid"
              onClick={handleOpenCreateModal}
            >
              <Plus size={15} />
              <span>Create New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row (1:1 with Image 1 UI) */}
      <div className="cp-stats-grid">
        {/* Card 1: Pitch Black Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#09090b', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>Pending Reviews</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{pendingCount}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(34, 197, 94, 0.22)', color: '#4ade80' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              6.4%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Awaiting decision
          </div>
        </div>

        {/* Card 2: Deep Vibrant Purple Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#8b5cf6', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Approved Attendees</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{approvedCount}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              12.8%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Digital passes issued
          </div>
        </div>

        {/* Card 3: Royal Blue Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#2563eb', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Managed Events</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{events.length}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              8.3%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Published on platform
          </div>
        </div>

        {/* Card 4: Clinical Teal Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#0d9488', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Gate Check-Ins</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{verifiedCheckIns}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              14.5%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Verified attendance
          </div>
        </div>
      </div>

      {/* Feedback Notice Banner */}
      {actionNotice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '12px',
          backgroundColor: actionNotice.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${actionNotice.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: actionNotice.type === 'success' ? '#15803d' : '#b91c1c',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {actionNotice.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span style={{ flex: 1 }}>{actionNotice.message}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Segmented Tabs Bar */}
      <div className="cp-section-card">
        <div className="cp-section-card-header" style={{ padding: '12px 20px', flexWrap: 'wrap' }}>
          <div className="cp-tabs">
            <button
              className={`cp-tab${activeTab === 'APPLICATIONS' ? ' active' : ''}`}
              onClick={() => setActiveTab('APPLICATIONS')}
            >
              Application Review Desk ({pendingCount})
            </button>
            <button
              className={`cp-tab${activeTab === 'EVENTS' ? ' active' : ''}`}
              onClick={() => setActiveTab('EVENTS')}
            >
              Managed Events ({events.length})
            </button>
            <button
              className={`cp-tab${activeTab === 'TELEMETRY' ? ' active' : ''}`}
              onClick={() => setActiveTab('TELEMETRY')}
            >
              Gate Telemetry Logs ({scanLogs.length})
            </button>
          </div>

          {activeTab === 'APPLICATIONS' && (
            <button
              className="cp-btn cp-btn-outline cp-btn-sm"
              onClick={handleExportCsv}
            >
              <Download size={13} />
              Export Participant CSV
            </button>
          )}
        </div>

        {/* TAB 1: APPLICATION REVIEW DESK */}
        {activeTab === 'APPLICATIONS' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Controls Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '12px', alignItems: 'center' }}>
              <div>
                <select
                  className="cp-select"
                  style={{ width: '100%' }}
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="ALL">All Events ({events.length})</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="cp-select"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Application Statuses</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved & Issued</option>
                  <option value="WAITLISTED">Waitlisted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="cp-search-wrap">
                <span className="cp-search-icon"><Search size={14} /></span>
                <input
                  className="cp-search-input"
                  placeholder="Search student, roll no, team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Applications Table (shadcn Table Architecture) */}
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead style={{ width: '40px' }} className="h-11 px-3">
                      <Checkbox
                        checked={allCurrentPageSelected || (someCurrentPageSelected && "indeterminate")}
                        onCheckedChange={(val) => toggleSelectAll(!!val)}
                        aria-label="Select all current page"
                      />
                    </TableHead>
                    <TableHead
                      className="h-11 cursor-pointer select-none font-semibold text-xs tracking-wider"
                      onClick={() => handleSort('studentName')}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>Applicant Details</span>
                        {sortField === 'studentName' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} className="opacity-70" /> : <ChevronDown size={14} className="opacity-70" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="h-11 cursor-pointer select-none font-semibold text-xs tracking-wider"
                      onClick={() => handleSort('eventTitle')}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>Event &amp; Mode</span>
                        {sortField === 'eventTitle' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} className="opacity-70" /> : <ChevronDown size={14} className="opacity-70" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="h-11 cursor-pointer select-none font-semibold text-xs tracking-wider"
                      style={{ width: '150px' }}
                      onClick={() => handleSort('referenceNumber')}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>Reference</span>
                        {sortField === 'referenceNumber' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} className="opacity-70" /> : <ChevronDown size={14} className="opacity-70" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="h-11 cursor-pointer select-none font-semibold text-xs tracking-wider"
                      style={{ width: '100px' }}
                      onClick={() => handleSort('dietaryPreference')}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>Meal Pref</span>
                        {sortField === 'dietaryPreference' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} className="opacity-70" /> : <ChevronDown size={14} className="opacity-70" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="h-11 cursor-pointer select-none font-semibold text-xs tracking-wider"
                      style={{ width: '120px' }}
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp size={14} className="opacity-70" /> : <ChevronDown size={14} className="opacity-70" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="h-11 text-right font-semibold text-xs tracking-wider" style={{ width: '160px' }}>
                      Review Decision
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No applications found matching the selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRegistrations.map((reg) => (
                      <TableRow
                        key={reg.id}
                        data-state={selectedRegistrations[reg.id] && "selected"}
                        className="transition-colors border-b border-border"
                      >
                        <TableCell className="px-3" style={{ width: '40px' }}>
                          <Checkbox
                            checked={!!selectedRegistrations[reg.id]}
                            onCheckedChange={(val) => toggleSelectRow(reg.id, !!val)}
                            aria-label={`Select ${reg.studentName}`}
                          />
                        </TableCell>

                        <TableCell>
                          <strong className="block text-sm font-semibold text-foreground">{reg.studentName}</strong>
                          <span className="text-xs text-muted-foreground">
                            {reg.studentId} • {reg.department}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="block font-medium text-foreground text-sm">{reg.eventTitle}</span>
                          <span className="text-xs text-muted-foreground">
                            {(reg.registrationType || reg.participationType) === 'TEAM'
                              ? `Team: ${reg.teamName} (${reg.teamMembers?.length || 0} pax)`
                              : 'Individual Entry'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            {reg.referenceNumber || reg.id}
                          </span>
                        </TableCell>

                        <TableCell>
                          {reg.dietaryPreference ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {reg.dietaryPreference}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className={
                            reg.status === 'APPROVED' ? 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' :
                            reg.status === 'PENDING' ? 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30' :
                            reg.status === 'REJECTED' ? 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30' :
                            'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30'
                          }>
                            {reg.status}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          {reg.status === 'PENDING' ? (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                className="cp-btn cp-btn-primary cp-btn-sm"
                                onClick={() => handleApprove(reg)}
                              >
                                <Check size={12} />
                                Approve
                              </button>
                              <button
                                className="cp-btn cp-btn-danger cp-btn-sm"
                                onClick={() => setRejectingReg(reg)}
                              >
                                <X size={12} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {reg.reviewedBy ? `Reviewed by ${reg.reviewedBy}` : 'Processed'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between gap-4 pt-4 px-1 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">
                  Rows per page
                </label>
                <select
                  className="text-xs py-1 px-2 h-8 rounded border border-border bg-background text-foreground cursor-pointer focus:outline-none"
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                >
                  {[5, 10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {sortedRegistrations.length === 0 ? 0 : pageIndex * pageSize + 1}-
                  {Math.min((pageIndex + 1) * pageSize, sortedRegistrations.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{sortedRegistrations.length}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 disabled:opacity-40"
                  onClick={() => setPageIndex(0)}
                  disabled={pageIndex === 0}
                  title="First page"
                >
                  <ChevronFirst size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 disabled:opacity-40"
                  onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                  title="Previous page"
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-xs font-medium px-2 text-foreground">
                  Page {pageIndex + 1} of {totalPages}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 disabled:opacity-40"
                  onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))}
                  disabled={pageIndex >= totalPages - 1}
                  title="Next page"
                >
                  <ChevronRight size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 disabled:opacity-40"
                  onClick={() => setPageIndex(totalPages - 1)}
                  disabled={pageIndex >= totalPages - 1}
                  title="Last page"
                >
                  <ChevronLast size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGED EVENTS */}
        {activeTab === 'EVENTS' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {events.map((ev) => {
                const percentFilled = Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100));
                const eventPasses = passes.filter(p => p.eventId === ev.id);
                const checkedInCount = eventPasses.filter(p => p.status === 'USED').length;

                return (
                  <div key={ev.id} className="cp-event-card">
                    <div style={{ height: '140px', position: 'relative', background: '#141416' }}>
                      <img
                        src={ev.bannerUrl}
                        alt={ev.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(9, 9, 11, 0.4) 0%, transparent 40%, rgba(9, 9, 11, 0.8) 100%)'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: 'rgba(9, 9, 11, 0.85)',
                        color: '#ffffff'
                      }}>
                        {ev.category}
                      </span>
                      <span className="cp-badge cp-badge-open" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        {ev.status}
                      </span>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
                        {ev.title}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} style={{ color: '#166534' }} />
                          <span>{ev.date || ev.startDate} • {ev.startTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={12} style={{ color: '#166534' }} />
                          <span className="truncate">{ev.venue}</span>
                        </div>
                      </div>

                      {/* Capacity progress */}
                      <div style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: isDark ? '#141416' : '#f8fafc',
                        border: isDark ? '1px solid #27272a' : '1px solid #f1f5f9',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b' }}>Registration Fill:</span>
                          <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{ev.registeredCount} / {ev.capacity} ({percentFilled}%)</strong>
                        </div>
                        <div className="cp-progress" style={{ marginBottom: '6px' }}>
                          <div className="cp-progress-fill" style={{ width: `${percentFilled}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                          <span>Gate Check-Ins:</span>
                          <strong style={{ color: '#15803d' }}>{checkedInCount} verified</strong>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '4px' }}>
                        <button
                          className="cp-btn cp-btn-outline cp-btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleOpenEditModal(ev)}
                        >
                          <Edit3 size={12} />
                          Edit Event
                        </button>
                        <button
                          className="cp-btn cp-btn-primary cp-btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            setActiveTab('APPLICATIONS');
                          }}
                        >
                          Review Desk
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TURNSTILE TELEMETRY */}
        {activeTab === 'TELEMETRY' && (
          <div style={{ padding: '20px' }}>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="h-11 font-semibold text-xs tracking-wider">Timestamp</TableHead>
                    <TableHead className="h-11 font-semibold text-xs tracking-wider">Attendee</TableHead>
                    <TableHead className="h-11 font-semibold text-xs tracking-wider">Event</TableHead>
                    <TableHead className="h-11 font-semibold text-xs tracking-wider">Gate Station</TableHead>
                    <TableHead className="h-11 font-semibold text-xs tracking-wider">Operator</TableHead>
                    <TableHead className="h-11 font-semibold text-xs tracking-wider">Verdict</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No check-in activity recorded yet. Check-ins will appear here once attendees are verified.
                      </TableCell>
                    </TableRow>
                  ) : (
                    scanLogs.map((log) => (
                      <TableRow key={log.id} className="transition-colors border-b border-border">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(log.timestamp || log.scannedAt || Date.now()).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <strong className="block text-sm font-semibold text-foreground">{log.studentName}</strong>
                          <span className="text-xs text-muted-foreground font-mono">{log.studentId}</span>
                        </TableCell>
                        <TableCell className="font-medium text-foreground text-sm">{log.eventTitle}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.gateOrStation || log.gate}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.operatorName || log.scannedBy}
                        </TableCell>
                        <TableCell>
                          <span className={log.result === 'VALID' ? 'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'}>
                            {log.result}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectingReg && (
        <div className="cp-modal-overlay" onClick={() => setRejectingReg(null)}>
          <div className="cp-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#f87171' }}>
                Reject Application
              </h3>
              <button
                type="button"
                onClick={() => setRejectingReg(null)}
                aria-label="Close"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  color: '#d4d4d8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
              <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#d4d4d8', lineHeight: 1.5 }}>
                  Please state the official reason for rejecting <strong style={{ color: '#ffffff' }}>{rejectingReg.studentName}</strong>'s application for <em style={{ color: '#86efac' }}>{rejectingReg.eventTitle}</em>.
                </p>

                <div className="cp-form-group">
                  <label className="cp-label">Rejection Reason *</label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="e.g. Prerequisites not met, duplicate registration, or incomplete document upload."
                    className="cp-input"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>
              </div>

              <div className="cp-modal-footer">
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e4e4e7',
                    cursor: 'pointer'
                  }}
                  onClick={() => setRejectingReg(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: '#b91c1c',
                    color: '#ffffff',
                    border: '1px solid #b91c1c',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isEventModalOpen && (
        <div className="cp-modal-overlay" onClick={() => setIsEventModalOpen(false)}>
          <div className="cp-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Event Studio Desk
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff', lineHeight: 1.25 }}>
                  {editingEventId ? 'Edit Event Configuration' : 'Create & Publish New Campus Event'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                aria-label="Close"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: '#d4d4d8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.12s'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSaveEvent}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <div
                className="cp-modal-body"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div className="cp-form-group">
                  <label className="cp-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Axiogen HackSprint 2026: 24–Hour National Hackathon"
                    className="cp-input"
                    value={eventForm.title}
                    onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px' }}>
                  <div className="cp-form-group">
                    <label className="cp-label">Category</label>
                    <select
                      className="cp-select"
                      style={{ width: '100%', cursor: 'pointer' }}
                      value={eventForm.category}
                      onChange={e => setEventForm({ ...eventForm, category: e.target.value as any })}
                    >
                      <option value="HACKATHON">HACKATHON</option>
                      <option value="IDEATHON">IDEATHON</option>
                      <option value="CODING_COMPETITION">CODING COMPETITION</option>
                      <option value="APTITUDE">APTITUDE EVENT</option>
                      <option value="CULTURAL">CULTURAL EVENT</option>
                      <option value="FRESHER_PARTY">FRESHER PARTY EVENT</option>
                      <option value="BOOTCAMP">BOOTCAMP REGISTRATION</option>
                      <option value="CAMPUS_DRIVE">CAMPUS DRIVE</option>
                      <option value="SEMINAR">SEMINAR</option>
                      <option value="TECHNICAL">TECHNICAL</option>
                      <option value="SPORTS">SPORTS</option>
                      <option value="WORKSHOP">WORKSHOP</option>
                      <option value="LITERARY">LITERARY</option>
                      <option value="MANAGEMENT">MANAGEMENT</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Department / Organizing Host</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Engineering"
                      className="cp-input"
                      value={eventForm.department}
                      onChange={e => setEventForm({ ...eventForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="cp-form-group">
                  <label className="cp-label">Short Summary</label>
                  <input
                    type="text"
                    placeholder="Brief 1-sentence teaser for cards"
                    className="cp-input"
                    value={eventForm.summary || eventForm.shortDescription || ''}
                    onChange={e => setEventForm({ ...eventForm, summary: e.target.value, shortDescription: e.target.value })}
                  />
                </div>

                <div className="cp-form-group">
                  <label className="cp-label">Full Description</label>
                  <textarea
                    rows={3}
                    className="cp-input"
                    placeholder="Comprehensive event details, agenda, rewards, and eligibility..."
                    style={{ resize: 'vertical' }}
                    value={eventForm.description}
                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px' }}>
                  <div className="cp-form-group">
                    <label className="cp-label">Venue *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Central Innovation Complex, Arena 1"
                      className="cp-input"
                      value={eventForm.venue}
                      onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Participation Mode</label>
                    <select
                      className="cp-select"
                      style={{ width: '100%', cursor: 'pointer' }}
                      value={eventForm.registrationMode || eventForm.participationType}
                      onChange={e => setEventForm({ ...eventForm, registrationMode: e.target.value as any, participationType: e.target.value as any })}
                    >
                      <option value="INDIVIDUAL">INDIVIDUAL ONLY</option>
                      <option value="TEAM">TEAM ONLY</option>
                      <option value="BOTH">BOTH (Individual or Team)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div className="cp-form-group">
                    <label className="cp-label">Date</label>
                    <input
                      type="date"
                      className="cp-input"
                      value={eventForm.date || eventForm.startDate}
                      onChange={e => setEventForm({ ...eventForm, date: e.target.value, startDate: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Start Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM"
                      className="cp-input"
                      value={eventForm.startTime}
                      onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Capacity (Seats)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      className="cp-input"
                      value={eventForm.capacity}
                      onChange={e => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Checkbox configs container */}
                <div style={{
                  background: '#1c1c1f',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#ffffff', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={eventForm.requiresApproval}
                        onChange={e => setEventForm({ ...eventForm, requiresApproval: e.target.checked })}
                        style={{ accentColor: '#166534', width: '16px', height: '16px' }}
                      />
                      <span>Requires Organizer Approval</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#ffffff', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={eventForm.includesLunch || eventForm.lunchProvided}
                        onChange={e => setEventForm({ ...eventForm, includesLunch: e.target.checked, lunchProvided: e.target.checked })}
                        style={{ accentColor: '#166534', width: '16px', height: '16px' }}
                      />
                      <span>Includes Lunch Voucher</span>
                    </label>
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    background: eventForm.requiresPass ? 'rgba(22, 101, 52, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: eventForm.requiresPass ? '1px solid rgba(134, 239, 172, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <input
                      type="checkbox"
                      checked={eventForm.requiresPass ?? true}
                      onChange={e => setEventForm({ ...eventForm, requiresPass: e.target.checked })}
                      style={{ accentColor: '#166534', width: '16px', height: '16px', marginTop: '2px' }}
                    />
                    <div>
                      <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>
                        Issue Digital Entry Pass via Email
                      </strong>
                      <div style={{ fontSize: '11px', color: '#a1a1aa', lineHeight: 1.45 }}>
                        When enabled, approved students receive an official barcode pass sent to their registered college email. If unchecked, event is open attendance with student ID.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Pinned Action Footer (ALWAYS 100% visible inside the card!) */}
              <div className="cp-modal-footer">
                <button
                  type="button"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e4e4e7',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsEventModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: '#166534',
                    color: '#ffffff',
                    border: '1px solid #166534',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 101, 52, 0.4)'
                  }}
                >
                  {editingEventId ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
