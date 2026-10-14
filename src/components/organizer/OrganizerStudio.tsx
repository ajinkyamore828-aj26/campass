import React, { useState, useMemo } from 'react';
import type { CampusEvent, CampusRegistration, EventCategory, RegistrationMode } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { exportToCsv } from '../../utils/exportCsv';
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
  Building
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
    rejectRegistration
  } = useCampusPass();

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
      <div className="cp-page-hero" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#166534' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86efac' }}>
                Event Operations Studio
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Organizer Management Command
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', maxWidth: '580px', lineHeight: 1.5 }}>
              Review student registrations, publish new festival events, oversee turnstile check-ins, and manage participant quotas.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="cp-btn cp-btn-primary"
              onClick={handleOpenCreateModal}
            >
              <Plus size={15} />
              Create New Event
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="cp-stats-grid">
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <UserCheck size={15} />
          </div>
          <div className="cp-stat-value">{pendingCount}</div>
          <div className="cp-stat-label">Pending Reviews</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Awaiting decision</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle size={15} />
          </div>
          <div className="cp-stat-value">{approvedCount}</div>
          <div className="cp-stat-label">Approved Attendees</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Digital passes issued</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>
            <Calendar size={15} />
          </div>
          <div className="cp-stat-value">{events.length}</div>
          <div className="cp-stat-label">Managed Events</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Published on platform</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <BarChart3 size={15} />
          </div>
          <div className="cp-stat-value">{verifiedCheckIns}</div>
          <div className="cp-stat-label">Gate Check-Ins</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Verified attendance</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', alignItems: 'center' }}>
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

            {/* Applications Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Applicant Details</th>
                    <th>Event & Mode</th>
                    <th>Reference</th>
                    <th>Meal Pref</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Review Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px 18px', textAlign: 'center', color: '#64748b' }}>
                        No applications found matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px' }}>{reg.studentName}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {reg.studentId} • {reg.department}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>{reg.eventTitle}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {(reg.registrationType || reg.participationType) === 'TEAM'
                              ? `Team: ${reg.teamName} (${reg.teamMembers?.length || 0} pax)`
                              : 'Individual Entry'}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>
                            {reg.referenceNumber || reg.id}
                          </span>
                        </td>

                        <td>
                          {reg.dietaryPreference ? (
                            <span className="cp-badge cp-badge-wait">
                              {reg.dietaryPreference}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>None</span>
                          )}
                        </td>

                        <td>
                          <span className={
                            reg.status === 'APPROVED' ? 'cp-badge cp-badge-open' :
                            reg.status === 'PENDING' ? 'cp-badge cp-badge-closing' :
                            reg.status === 'REJECTED' ? 'cp-badge cp-badge-full' :
                            'cp-badge cp-badge-closed'
                          }>
                            {reg.status}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          {reg.status === 'PENDING' ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {reg.reviewedBy ? `Reviewed by ${reg.reviewedBy}` : 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                    <div style={{ height: '140px', position: 'relative', background: '#0f172a' }}>
                      <img
                        src={ev.bannerUrl}
                        alt={ev.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, transparent 40%, rgba(15, 23, 42, 0.75) 100%)'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        color: '#ffffff'
                      }}>
                        {ev.category}
                      </span>
                      <span className="cp-badge cp-badge-open" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        {ev.status}
                      </span>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
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
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: '#64748b' }}>Registration Fill:</span>
                          <strong style={{ color: '#0f172a' }}>{ev.registeredCount} / {ev.capacity} ({percentFilled}%)</strong>
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
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Attendee</th>
                    <th>Event</th>
                    <th>Gate Station</th>
                    <th>Operator</th>
                    <th>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {scanLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px 14px', textAlign: 'center', color: '#64748b' }}>
                        No check-in activity recorded yet. Check-ins will appear here once attendees are verified.
                      </td>
                    </tr>
                  ) : (
                    scanLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                          {new Date(log.timestamp || log.scannedAt || Date.now()).toLocaleTimeString()}
                        </td>
                        <td>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{log.studentName}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{log.studentId}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{log.eventTitle}</td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#475569' }}>
                            {log.gateOrStation || log.gate}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {log.operatorName || log.scannedBy}
                          </span>
                        </td>
                        <td>
                          <span className={log.result === 'VALID' ? 'cp-badge cp-badge-open' : 'cp-badge cp-badge-full'}>
                            {log.result}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectingReg && (
        <div className="cp-modal-overlay" onClick={() => setRejectingReg(null)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#b91c1c' }}>
                Reject Application
              </h3>
              <button type="button" onClick={() => setRejectingReg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <div className="cp-modal-body">
                <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  Please state the official reason for rejecting <strong>{rejectingReg.studentName}</strong>'s application for <em>{rejectingReg.eventTitle}</em>.
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
                <button type="button" className="cp-btn cp-btn-outline" onClick={() => setRejectingReg(null)}>
                  Cancel
                </button>
                <button type="submit" className="cp-btn cp-btn-danger">
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
          <div className="cp-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {editingEventId ? 'Edit Event Configuration' : 'Create & Publish New Campus Event'}
              </h3>
              <button type="button" onClick={() => setIsEventModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cp-form-group">
                  <label className="cp-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    className="cp-input"
                    value={eventForm.title}
                    onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="cp-form-group">
                    <label className="cp-label">Category</label>
                    <select
                      className="cp-select"
                      style={{ width: '100%' }}
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
                    <label className="cp-label">Department</label>
                    <input
                      type="text"
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
                    style={{ resize: 'vertical' }}
                    value={eventForm.description}
                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="cp-form-group">
                    <label className="cp-label">Venue *</label>
                    <input
                      type="text"
                      required
                      className="cp-input"
                      value={eventForm.venue}
                      onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Participation Mode</label>
                    <select
                      className="cp-select"
                      style={{ width: '100%' }}
                      value={eventForm.registrationMode || eventForm.participationType}
                      onChange={e => setEventForm({ ...eventForm, registrationMode: e.target.value as any, participationType: e.target.value as any })}
                    >
                      <option value="INDIVIDUAL">INDIVIDUAL</option>
                      <option value="TEAM">TEAM</option>
                      <option value="BOTH">BOTH (Individual or Team)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
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
                      className="cp-input"
                      value={eventForm.startTime}
                      onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Capacity (Seats)</label>
                    <input
                      type="number"
                      className="cp-input"
                      value={eventForm.capacity}
                      onChange={e => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Checkbox configs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 0' }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={eventForm.requiresApproval}
                        onChange={e => setEventForm({ ...eventForm, requiresApproval: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>Requires Organizer Approval</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={eventForm.includesLunch || eventForm.lunchProvided}
                        onChange={e => setEventForm({ ...eventForm, includesLunch: e.target.checked, lunchProvided: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>Includes Lunch Voucher</span>
                    </label>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <input
                      type="checkbox"
                      checked={eventForm.requiresPass ?? true}
                      onChange={e => setEventForm({ ...eventForm, requiresPass: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <div>
                      <strong style={{ color: '#0f172a' }}>Issue Digital Pass via Email</strong>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        When enabled, approved students receive an encrypted barcode pass sent to their registered college email. If unchecked, event is open attendance with student ID.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="cp-modal-footer">
                <button type="button" className="cp-btn cp-btn-outline" onClick={() => setIsEventModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="cp-btn cp-btn-primary">
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
