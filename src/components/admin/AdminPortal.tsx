import React, { useState, useMemo } from 'react';
import type { CampusUser, UserRole, DigitalEventPass, AuditLog, CampusEvent, EventRound } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { exportToCsv } from '../../utils/exportCsv';
import { DynamicNeuroNoise } from '@/components/ui/dynamic-neuro-noise';
import {
  ShieldCheck,
  Users,
  Ticket,
  BarChart3,
  FileText,
  Bell,
  Download,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  RefreshCw,
  Building,
  Calendar,
  Utensils,
  Plus,
  X,
  ChevronRight,
  TrendingUp,
  Server,
  Activity,
  Award,
  Layers,
  Send,
  Type,
  LayoutGrid,
  Trophy,
  Clock,
  Edit3,
  Filter,
  Image as ImageIcon,
  MoreHorizontal,
  ArrowUp
} from 'lucide-react';
import { EditHeroTextModal } from '../student/EditHeroTextModal';
import { EditBentoCardsModal } from '../student/EditBentoCardsModal';
import { ManageEventRoundsModal } from './ManageEventRoundsModal';
import { RescheduleEventModal } from './RescheduleEventModal';
import { EditEventRegistryModal } from '../student/EditEventRegistryModal';
import { ChangeCardImageModal } from './ChangeCardImageModal';

export const AdminPortal: React.FC = () => {
  const {
    events,
    registrations,
    passes,
    lunchPasses,
    scanLogs,
    auditLogs,
    users,
    announcements,
    currentUser,
    institutionProfile,
    revokePass,
    reissuePass,
    updateUserRole,
    toggleUserStatus,
    createUser,
    publishAnnouncement,
    createEvent,
    updateEvent,
    heroConfig,
    updateHeroConfig,
    resetHeroConfig,
    bentoCards,
    updateBentoCard,
    updateAllBentoCards,
    resetBentoCards,
    allowConcurrentRegistrations,
    toggleAllowConcurrentRegistrations,
    theme
  } = useCampusPass();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'EVENTS' | 'USERS' | 'PASSES' | 'AUDIT' | 'ANNOUNCEMENTS'>('ANALYTICS');

  // Event & Rounds Management states
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('ALL');
  const [eventFilterMode, setEventFilterMode] = useState<'ALL' | 'MULTI_ROUND' | 'RESCHEDULED'>('ALL');
  const [selectedEventForRounds, setSelectedEventForRounds] = useState<CampusEvent | null>(null);
  const [selectedEventForReschedule, setSelectedEventForReschedule] = useState<CampusEvent | null>(null);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<CampusEvent | null>(null);
  const [selectedEventForImage, setSelectedEventForImage] = useState<CampusEvent | null>(null);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [pinnedFeaturedId, setPinnedFeaturedId] = useState<string | null>(null);

  // Hero & Bento customizer modals
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isBentoModalOpen, setIsBentoModalOpen] = useState(false);

  // User management states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<Partial<CampusUser>>({
    fullName: '',
    email: '',
    studentId: '',
    department: institutionProfile.departments[0],
    academicYear: '1st Year',
    phone: '',
    role: 'STUDENT',
    status: 'ACTIVE'
  });

  // Pass Revocation state
  const [revokingPass, setRevokingPass] = useState<DigitalEventPass | null>(null);
  const [revocationReason, setRevocationReason] = useState('');

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchesName = u.fullName.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesId = u.studentId?.toLowerCase().includes(q) || false;
        const matchesDept = u.department?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesEmail && !matchesId && !matchesDept) return false;
      }
      return true;
    });
  }, [users, userRoleFilter, userSearchQuery]);

  // Filtered Events for Admin Management
  const filteredAdminEvents = useMemo(() => {
    return events.filter(e => {
      if (eventCategoryFilter !== 'ALL' && e.category !== eventCategoryFilter) return false;
      if (eventFilterMode === 'MULTI_ROUND' && (e.rounds?.length || 0) <= 1) return false;
      if (eventFilterMode === 'RESCHEDULED' && !e.scheduleUpdate?.isRescheduled) return false;
      if (eventSearchQuery.trim()) {
        const q = eventSearchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesDept = e.department?.toLowerCase().includes(q) || false;
        const matchesVenue = e.venue?.toLowerCase().includes(q) || false;
        const matchesId = e.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDept && !matchesVenue && !matchesId) return false;
      }
      return true;
    });
  }, [events, eventCategoryFilter, eventFilterMode, eventSearchQuery]);

  // Multi-Round and Reschedule Handlers
  const handleSaveRounds = async (eventId: string, updatedRounds: EventRound[]) => {
    try {
      const res = await updateEvent(eventId, { rounds: updatedRounds });
      if (res.success) {
        setFeedback({ type: 'success', message: `Updated competition stages for event.` });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update competition rounds.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRescheduleEvent = async (eventId: string, updates: any) => {
    try {
      const res = await updateEvent(eventId, updates);
      if (res.success) {
        setFeedback({ type: 'success', message: `Event schedule successfully updated and broadcasted.` });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to reschedule event.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleBroadcastFromReschedule = async (title: string, message: string) => {
    try {
      await publishAnnouncement({
        title,
        message,
        priority: 'URGENT',
        createdBy: currentUser.fullName
      });
    } catch {
      // ignore
    }
  };

  // KPIs
  const totalRegistrations = registrations.length;
  const approvedRegistrations = registrations.filter(r => r.status === 'APPROVED').length;
  const activePassesCount = passes.filter(p => p.status === 'ACTIVE').length;
  const checkInsCount = passes.filter(p => p.status === 'USED').length;
  const mealsRedeemedCount = lunchPasses.filter(lp => lp.status === 'REDEEMED').length;
  const securityIncidents = scanLogs.filter(s => s.result !== 'VALID').length;

  // Department distribution
  const departmentStats = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      counts[r.department] = (counts[r.department] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  // Revoke pass handler
  const handleRevokePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingPass) return;
    if (!revocationReason.trim()) {
      alert('Please provide a reason for pass revocation.');
      return;
    }

    try {
      const res = await revokePass(revokingPass.id, revocationReason.trim());
      if (res.success) {
        setFeedback({ type: 'success', message: `Pass ${revokingPass.id} successfully revoked.` });
        setRevokingPass(null);
        setRevocationReason('');
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to revoke pass.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Reissue pass handler
  const handleReissuePass = async (passId: string) => {
    try {
      const res = await reissuePass(passId);
      if (res.success) {
        setFeedback({ type: 'success', message: `Pass reissued with fresh cryptographic token.` });
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to reissue pass.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // User Role update
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        setFeedback({ type: 'success', message: `User permissions updated to ${newRole}.` });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update user role.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // User Status Toggle (Suspend / Activate)
  const handleToggleStatus = async (user: CampusUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await toggleUserStatus(user.id, nextStatus);
      if (res.success) {
        setFeedback({ type: 'success', message: `User status changed to ${nextStatus}.` });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to change user status.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Add User submit
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName || !newUserForm.email) {
      alert('Full Name and Email are required.');
      return;
    }

    try {
      const res = await createUser(newUserForm);
      if (res.success) {
        setFeedback({ type: 'success', message: `Account for ${newUserForm.fullName} created.` });
        setIsAddUserModalOpen(false);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to create user.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Announcement submit
  const handlePublishAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    try {
      const res = await publishAnnouncement({
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        priority: announcementPriority,
        createdBy: currentUser.fullName
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Campus-wide announcement broadcasted.' });
        setAnnouncementTitle('');
        setAnnouncementMessage('');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to publish announcement.' });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Toggle Concurrent / Multiple Event Registration Policy
  const handleToggleConcurrentPolicy = async (targetState: boolean) => {
    try {
      const res = await toggleAllowConcurrentRegistrations(targetState);
      setFeedback({
        type: 'success',
        message: res
          ? 'Concurrent Registration Policy: ALLOWED. Students can now register for multiple overlapping events at the same day & time.'
          : 'Concurrent Registration Policy: RESTRICTED. Strict schedule conflict guard is active (time conflicts blocked).'
      });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update concurrent registration policy.' });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  // Export Audit CSV
  const handleExportAuditCsv = () => {
    const rows = auditLogs.map(a => ({
      Timestamp: a.timestamp,
      ActorName: a.actorName,
      ActorRole: a.actorRole,
      Action: a.action,
      TargetId: a.resourceId,
      Details: a.details
    }));
    exportToCsv(`CampusPass_AuditLogs_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  // Export Pass Registry CSV
  const handleExportPassesCsv = () => {
    const rows = passes.map(p => ({
      PassID: p.id,
      EventTitle: p.eventTitle,
      AttendeeName: p.studentName,
      StudentID: p.studentId,
      PassType: p.passType,
      Status: p.status,
      IssuedAt: p.issuedAt,
      CheckInTime: p.checkInTime || 'N/A',
      CheckInGate: p.checkInGate || 'N/A'
    }));
    exportToCsv(`CampusPass_PassRegistry_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero */}
      <div className="cp-page-hero">
        <DynamicNeuroNoise />
        <div className="cp-hero-overlay" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#86efac' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac' }}>
                System Administration Authority
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
              Institution Command & Governance Center
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)', margin: 0, maxWidth: '580px', lineHeight: 1.55 }}>
              {institutionProfile.collegeName} • Central access policy, immutable audit trails, credential revocations, and system health telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="cp-hero-btn-secondary"
              onClick={() => setIsHeroModalOpen(true)}
              style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '8px', color: '#ffffff', background: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.28)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Type size={14} />
              <span>Edit Hero Text</span>
            </button>
            <button
              className="cp-hero-btn-secondary"
              onClick={() => setIsBentoModalOpen(true)}
              style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '8px', color: '#ffffff', background: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.28)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <LayoutGrid size={14} />
              <span>Edit Highlight Cards</span>
            </button>
            <button
              className="cp-hero-btn-secondary"
              onClick={() => handleToggleConcurrentPolicy(!allowConcurrentRegistrations)}
              style={{
                fontSize: '13px',
                padding: '8px 14px',
                borderRadius: '8px',
                color: allowConcurrentRegistrations ? '#86efac' : '#fca5a5',
                background: allowConcurrentRegistrations ? 'rgba(22, 101, 52, 0.45)' : 'rgba(239, 68, 68, 0.22)',
                borderColor: allowConcurrentRegistrations ? 'rgba(74, 222, 128, 0.45)' : 'rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
              title="Click to toggle whether students can apply for multiple events at the same time and day"
            >
              {allowConcurrentRegistrations ? <Unlock size={14} /> : <Lock size={14} />}
              <span>Multiple Entries: {allowConcurrentRegistrations ? 'Allowed' : 'Restricted'}</span>
            </button>
            <button
              className="cp-hero-pill-btn cp-hero-pill-btn-solid"
              onClick={() => setIsAddUserModalOpen(true)}
              style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', color: '#09090b', background: '#ffffff', border: '1px solid #ffffff', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}
            >
              <Plus size={14} />
              <span>Add User Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row (1:1 with Reference Image 2 cp-kpi-card-v1 aesthetic) */}
      <div className="cp-stats-grid six-cols">
        {/* Card 1: Pitch Black Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#09090b', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>Published Events</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{events.length}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(34, 197, 94, 0.22)', color: '#4ade80' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              12.4%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Active campus fests
          </div>
        </div>

        {/* Card 2: Deep Vibrant Purple Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#8b5cf6', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Total Applications</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{totalRegistrations}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              {Math.round((approvedRegistrations / Math.max(1, totalRegistrations)) * 100)}%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            {Math.round((approvedRegistrations / Math.max(1, totalRegistrations)) * 100)}% approved
          </div>
        </div>

        {/* Card 3: Royal Blue Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#2563eb', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Active Credentials</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{activePassesCount}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              98.2%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            HMAC verified
          </div>
        </div>

        {/* Card 4: Clinical Teal Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#0d9488', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Gate Turnstile Passes</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{checkInsCount}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              100%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Verified attendance
          </div>
        </div>

        {/* Card 5: Warm Amber Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#d97706', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Meal Vouchers</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{mealsRedeemedCount}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              95.6%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Atomic check-in
          </div>
        </div>

        {/* Card 6: Crimson/Rose Surface */}
        <div className="cp-kpi-card-v1" style={{ background: '#e11d48', color: '#ffffff' }}>
          <div className="cp-kpi-top">
            <span className="cp-kpi-title" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Security Interceptions</span>
            <button className="cp-kpi-more-btn" title="Options" aria-label="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="cp-kpi-mid">
            <span className="cp-kpi-big-value">{securityIncidents}</span>
            <span className="cp-kpi-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff' }}>
              <ArrowUp size={11} strokeWidth={2.5} />
              0.0%
            </span>
          </div>
          <div className="cp-kpi-bot" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Duplicate/Invalid blocked
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '12px',
          backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span style={{ flex: 1 }}>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Segmented Control Navigation */}
      <div className="cp-section-card">
        <div className="cp-section-card-header" style={{ padding: '12px 20px', flexWrap: 'wrap' }}>
          <div className="cp-tabs">
            <button
              className={`cp-tab${activeTab === 'ANALYTICS' ? ' active' : ''}`}
              onClick={() => setActiveTab('ANALYTICS')}
            >
              Institution KPIs
            </button>
            <button
              className={`cp-tab${activeTab === 'EVENTS' ? ' active' : ''}`}
              onClick={() => setActiveTab('EVENTS')}
            >
              Event Registry &amp; Rounds ({events.length})
            </button>
            <button
              className={`cp-tab${activeTab === 'USERS' ? ' active' : ''}`}
              onClick={() => setActiveTab('USERS')}
            >
              User Directory ({users.length})
            </button>
            <button
              className={`cp-tab${activeTab === 'PASSES' ? ' active' : ''}`}
              onClick={() => setActiveTab('PASSES')}
            >
              Pass Authority ({passes.length})
            </button>
            <button
              className={`cp-tab${activeTab === 'AUDIT' ? ' active' : ''}`}
              onClick={() => setActiveTab('AUDIT')}
            >
              Audit Trail ({auditLogs.length})
            </button>
            <button
              className={`cp-tab${activeTab === 'ANNOUNCEMENTS' ? ' active' : ''}`}
              onClick={() => setActiveTab('ANNOUNCEMENTS')}
            >
              Broadcast Notice
            </button>
          </div>
        </div>

        {/* TAB 1: ANALYTICS & KPIS */}
        {activeTab === 'ANALYTICS' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Department Breakdown */}
            <div style={{
              background: isDark ? '#141416' : '#f8fafc',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: isDark ? '#f4f4f5' : '#09090b' }}>
                Department Participation Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(departmentStats).map(([dept, count]) => {
                  const pct = Math.round((count / Math.max(1, totalRegistrations)) * 100);
                  return (
                    <div key={dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: isDark ? '#f4f4f5' : '#09090b' }}>{dept}</span>
                        <span style={{ color: isDark ? '#a1a1aa' : '#64748b' }}>{count} candidates ({pct}%)</span>
                      </div>
                      <div className="cp-progress">
                        <div className="cp-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS & MULTI-ROUND SCHEDULE MANAGEMENT */}
        {activeTab === 'EVENTS' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* ── Policy Banner: Concurrent / Multiple Event Entries ── */}
            <div style={{
              background: allowConcurrentRegistrations ? 'rgba(22, 101, 52, 0.14)' : 'rgba(24, 24, 27, 0.85)',
              border: `1px solid ${allowConcurrentRegistrations ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '680px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: allowConcurrentRegistrations ? '#166534' : '#27272a',
                  color: allowConcurrentRegistrations ? '#86efac' : '#f87171',
                  border: `1px solid ${allowConcurrentRegistrations ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {allowConcurrentRegistrations ? <Unlock size={20} /> : <Lock size={20} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                      Concurrent Event Entries Policy (Same Day &amp; Time)
                    </h4>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: allowConcurrentRegistrations ? 'rgba(22, 101, 52, 0.6)' : 'rgba(239, 68, 68, 0.2)',
                      color: allowConcurrentRegistrations ? '#86efac' : '#fca5a5',
                      border: `1px solid ${allowConcurrentRegistrations ? 'rgba(74, 222, 128, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      letterSpacing: '0.04em'
                    }}>
                      {allowConcurrentRegistrations ? 'MULTIPLE ENTRIES PERMITTED' : 'TIME CONFLICT RESTRICTED'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa', lineHeight: 1.45 }}>
                    {allowConcurrentRegistrations
                      ? 'Admins have allowed students to register for multiple competitions and events happening at the same time on the same day. The "Time Conflict" lock is deactivated.'
                      : 'Students cannot apply for two events occurring on the same date and overlapping time. The student portal strictly blocks conflicting registrations.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleToggleConcurrentPolicy(!allowConcurrentRegistrations)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    background: allowConcurrentRegistrations ? '#166534' : '#27272a',
                    color: allowConcurrentRegistrations ? '#ffffff' : '#f87171',
                    border: `1px solid ${allowConcurrentRegistrations ? '#22c55e' : 'rgba(239, 68, 68, 0.4)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: allowConcurrentRegistrations ? '0 2px 10px rgba(22, 101, 52, 0.35)' : 'none'
                  }}
                >
                  {allowConcurrentRegistrations ? <Lock size={14} /> : <Unlock size={14} />}
                  <span>
                    {allowConcurrentRegistrations
                      ? 'Enforce Strict Conflict (Block)'
                      : 'Allow Multiple Entries (Same Time)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Bar & Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="cp-input"
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    placeholder="Search events by title, venue, or department..."
                    style={{ paddingLeft: '34px', height: '36px', fontSize: '12.5px' }}
                  />
                </div>

                {/* Filter Mode Buttons */}
                <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setEventFilterMode('ALL')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: eventFilterMode === 'ALL' ? 700 : 500,
                      background: eventFilterMode === 'ALL' ? (isDark ? '#27272a' : '#09090b') : (isDark ? '#18181b' : '#f8fafc'),
                      color: eventFilterMode === 'ALL' ? '#ffffff' : (isDark ? '#d4d4d8' : '#475569'),
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    All Events ({events.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventFilterMode('MULTI_ROUND')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: eventFilterMode === 'MULTI_ROUND' ? 700 : 500,
                      background: eventFilterMode === 'MULTI_ROUND' ? '#166534' : (isDark ? '#18181b' : '#f8fafc'),
                      color: eventFilterMode === 'MULTI_ROUND' ? '#ffffff' : (isDark ? '#d4d4d8' : '#475569'),
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trophy size={12} />
                    <span>Multi-Round ({events.filter(e => (e.rounds?.length || 0) > 1).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventFilterMode('RESCHEDULED')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: eventFilterMode === 'RESCHEDULED' ? 700 : 500,
                      background: eventFilterMode === 'RESCHEDULED' ? '#b45309' : (isDark ? '#18181b' : '#f8fafc'),
                      color: eventFilterMode === 'RESCHEDULED' ? '#ffffff' : (isDark ? '#d4d4d8' : '#475569'),
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <AlertTriangle size={12} />
                    <span>Rescheduled / Delayed ({events.filter(e => e.scheduleUpdate?.isRescheduled).length})</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary cp-btn-sm"
                  onClick={() => {
                    setSelectedEventForEdit(null);
                    setIsRegistryModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}
                >
                  <Plus size={14} />
                  <span>Register New Event</span>
                </button>
              </div>
            </div>

            {/* Event List Table */}
            <div className="cp-table-container">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Event &amp; Details</th>
                    <th>Category</th>
                    <th>Current Schedule</th>
                    <th>Multi-Round Stages</th>
                    <th>Schedule Status</th>
                    <th>Capacity</th>
                    <th style={{ textAlign: 'right' }}>Admin Management</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 12px', color: '#94a3b8' }}>
                        No events found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminEvents.map(ev => {
                      const roundCount = ev.rounds?.length || 0;
                      const isRescheduled = ev.scheduleUpdate?.isRescheduled;
                      return (
                        <tr key={ev.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                onClick={() => setSelectedEventForImage(ev)}
                                title="Click to change event card image"
                                style={{
                                  position: 'relative',
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  background: '#f1f5f9',
                                  cursor: 'pointer',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                <img src={ev.bannerUrl} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                                >
                                  <ImageIcon size={14} color="#ffffff" />
                                </div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '13.5px', color: isDark ? '#f8fafc' : '#0f172a' }}>
                                  {ev.title}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span>{ev.department}</span>
                                  <span>•</span>
                                  <span>ID: {ev.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="cp-badge cp-badge-open" style={{ fontSize: '10px' }}>
                              {ev.category}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 600 }}>
                              {ev.date}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {ev.startTime} - {ev.endTime}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                              {ev.venue}
                            </div>
                          </td>
                          <td>
                            {roundCount > 1 ? (
                              <div>
                                <span style={{
                                  background: '#dcfce7',
                                  color: '#166534',
                                  border: '1px solid #bbf7d0',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Trophy size={11} />
                                  {roundCount} Competition Rounds
                                </span>
                                <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '4px', maxWidth: '240px', lineHeight: 1.3 }}>
                                  {ev.rounds?.map((r, i) => `${i + 1}. ${r.name.replace(/^Round \d+:\s*/i, '')}`).join(' → ')}
                                </div>
                              </div>
                            ) : (
                              <span style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                Single Stage
                              </span>
                            )}
                          </td>
                          <td>
                            {isRescheduled ? (
                              <div>
                                <span style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <AlertTriangle size={11} />
                                  Delayed / Rescheduled
                                </span>
                                {ev.scheduleUpdate?.reason && (
                                  <div style={{ fontSize: '10.5px', color: '#92400e', marginTop: '4px', maxWidth: '200px', lineHeight: 1.3 }} title={ev.scheduleUpdate.reason}>
                                    Reason: {ev.scheduleUpdate.reason}
                                  </div>
                                )}
                                {ev.scheduleUpdate?.originalDate && (
                                  <div style={{ fontSize: '10px', color: '#78350f', marginTop: '2px' }}>
                                    Was: <span style={{ textDecoration: 'line-through' }}>{ev.scheduleUpdate.originalDate} ({ev.scheduleUpdate.originalStartTime})</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{
                                background: '#f0fdf4',
                                color: '#15803d',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                On Schedule
                              </span>
                            )}
                            {ev.allowConcurrentRegistration && (
                              <div style={{ marginTop: '4px' }}>
                                <span style={{
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  color: '#0284c7',
                                  border: '1px solid rgba(56, 189, 248, 0.3)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  display: 'inline-block'
                                }}>
                                  Concurrent Allowed
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
                              {ev.registeredCount} / {ev.capacity}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                              {Math.round((ev.registeredCount / Math.max(1, ev.capacity)) * 100)}% filled
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className="cp-btn cp-btn-secondary cp-btn-sm"
                                onClick={() => setSelectedEventForRounds(ev)}
                                title="Configure Multi-Round Stages"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 9px' }}
                              >
                                <Trophy size={12} color="#166534" />
                                <span>Manage Rounds</span>
                              </button>
                              <button
                                type="button"
                                className="cp-btn cp-btn-secondary cp-btn-sm"
                                onClick={() => setSelectedEventForReschedule(ev)}
                                title="Reschedule or Delay Timing"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 9px' }}
                              >
                                <Calendar size={12} color="#b45309" />
                                <span>Reschedule</span>
                              </button>
                              <button
                                type="button"
                                className="cp-btn cp-btn-secondary cp-btn-sm"
                                onClick={() => setSelectedEventForImage(ev)}
                                title="Change Event Card Image"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 9px' }}
                              >
                                <ImageIcon size={12} color="#0284c7" />
                                <span>Card Image</span>
                              </button>
                              <button
                                type="button"
                                className="cp-btn cp-btn-secondary cp-btn-sm"
                                onClick={() => setSelectedEventForEdit(ev)}
                                title="Edit Full Event Details"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '5px 9px' }}
                              >
                                <Edit3 size={12} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY & ROLES */}
        {activeTab === 'USERS' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="cp-search-wrap">
                <span className="cp-search-icon"><Search size={14} /></span>
                <input
                  className="cp-search-input"
                  placeholder="Search user name, email, roll no..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="cp-select"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="ORGANIZER">Event Organizer</option>
                <option value="VOLUNTEER">Gate Volunteer</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>Department</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong style={{ color: isDark ? '#f8fafc' : '#0f172a', display: 'block', fontSize: '13px' }}>{u.fullName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {u.email} {u.studentId ? `• ${u.studentId}` : ''}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '12.5px', color: isDark ? '#cbd5e1' : '#0f172a' }}>{u.department}</span>
                      </td>

                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="cp-select"
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="ORGANIZER">ORGANIZER</option>
                          <option value="VOLUNTEER">VOLUNTEER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td>
                        <span className={u.status === 'ACTIVE' ? 'cp-badge cp-badge-open' : 'cp-badge cp-badge-full'}>
                          {u.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="cp-btn cp-btn-outline cp-btn-sm"
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            color: u.status === 'ACTIVE' ? '#b91c1c' : '#15803d',
                            borderColor: u.status === 'ACTIVE' ? '#fecaca' : '#bbf7d0'
                          }}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL PASS AUTHORITY */}
        {activeTab === 'PASSES' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                Issued Digital Credentials ({passes.length})
              </span>
              <button
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={handleExportPassesCsv}
              >
                <Download size={13} />
                Export Pass Registry CSV
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Pass ID</th>
                    <th>Attendee</th>
                    <th>Event</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Security Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passes.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>{p.id}</td>
                      <td>
                        <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{p.studentName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{p.studentId}</span>
                      </td>
                      <td style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 500 }}>{p.eventTitle}</td>
                      <td style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>{p.passType}</td>
                      <td>
                        <span className={
                          p.status === 'ACTIVE' ? 'cp-badge cp-badge-open' :
                          p.status === 'USED' ? 'cp-badge cp-badge-wait' :
                          'cp-badge cp-badge-full'
                        }>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {p.status !== 'REVOKED' && (
                            <button
                              className="cp-btn cp-btn-danger cp-btn-sm"
                              onClick={() => setRevokingPass(p)}
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            className="cp-btn cp-btn-outline cp-btn-sm"
                            onClick={() => handleReissuePass(p.id)}
                          >
                            Reissue
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'AUDIT' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                Compliance Audit Trail ({auditLogs.length} events logged)
              </span>
              <button
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={handleExportAuditCsv}
              >
                <Download size={13} />
                Export Audit Trail (CSV)
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{a.actorName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{a.actorRole}</span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '12px', color: isDark ? '#f8fafc' : '#0f172a' }}>{a.action}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' }}>{a.resourceId}</td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{a.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Post Announcement Form */}
            <div style={{ background: isDark ? '#141416' : '#f8fafc', border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: isDark ? '#f4f4f5' : '#09090b' }}>
                Broadcast Campus Notice
              </h3>
              <form onSubmit={handlePublishAnnouncementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cp-form-group">
                  <label className="cp-label">Title *</label>
                  <input
                    required
                    className="cp-input"
                    value={announcementTitle}
                    onChange={e => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Turnstiles Open at 09:00 AM, Food Hall Relocation"
                  />
                </div>

                <div className="cp-form-group">
                  <label className="cp-label">Message *</label>
                  <textarea
                    rows={4}
                    required
                    className="cp-input"
                    value={announcementMessage}
                    onChange={e => setAnnouncementMessage(e.target.value)}
                    placeholder="Full text of notification broadcasted to all students..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="cp-form-group">
                  <label className="cp-label">Priority</label>
                  <select
                    className="cp-select"
                    value={announcementPriority}
                    onChange={e => setAnnouncementPriority(e.target.value as any)}
                  >
                    <option value="NORMAL">Normal Information</option>
                    <option value="URGENT">Urgent Broadcast</option>
                  </select>
                </div>

                <button type="submit" className="cp-btn cp-btn-primary" style={{ alignSelf: 'flex-start' }}>
                  <Send size={13} />
                  Broadcast Notice
                </button>
              </form>
            </div>

            {/* Published Announcements List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: isDark ? '#f4f4f5' : '#09090b' }}>
                Active Broadcasts
              </h3>
              {announcements.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#141416' : '#ffffff',
                    border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: isDark ? '#f4f4f5' : '#09090b' }}>{a.title}</strong>
                    <span className={a.priority === 'URGENT' ? 'cp-badge cp-badge-full' : 'cp-badge cp-badge-wait'}>
                      {a.priority}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#d4d4d8' : '#64748b', lineHeight: 1.45 }}>{a.message || a.content}</p>
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '10.5px', color: '#a1a1aa' }}>
                    {new Date(a.createdAt || a.publishedAt).toLocaleString()} by {a.createdBy || a.authorName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PASS REVOCATION MODAL */}
      {revokingPass && (
        <div className="cp-modal-overlay" onClick={() => setRevokingPass(null)}>
          <div className="cp-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#f87171' }}>
                Revoke Digital Pass
              </h3>
              <button
                type="button"
                onClick={() => setRevokingPass(null)}
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

            <form onSubmit={handleRevokePassSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
              <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#d4d4d8', lineHeight: 1.5 }}>
                  You are about to revoke pass <strong style={{ color: '#ffffff' }}>{revokingPass.id}</strong> issued to <strong style={{ color: '#ffffff' }}>{revokingPass.studentName}</strong> for <em style={{ color: '#86efac' }}>{revokingPass.eventTitle}</em>. The turnstile will immediately reject this QR token.
                </p>

                <div className="cp-form-group">
                  <label className="cp-label">Revocation Reason *</label>
                  <textarea
                    rows={3}
                    required
                    className="cp-input"
                    value={revocationReason}
                    onChange={e => setRevocationReason(e.target.value)}
                    placeholder="e.g. Disciplinary breach, duplicate registration, or ticket compromised."
                    style={{ resize: 'vertical' }}
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
                  onClick={() => setRevokingPass(null)}
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
                  Confirm Revocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="cp-modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="cp-modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  User Management
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff' }}>
                  Add New Campus User Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
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
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
              <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cp-form-group">
                  <label className="cp-label">Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="cp-input"
                    value={newUserForm.fullName}
                    onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  />
                </div>

                <div className="cp-form-group">
                  <label className="cp-label">College Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.sharma@axiogen.in"
                    className="cp-input"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div className="cp-form-group">
                    <label className="cp-label">Student Roll No</label>
                    <input
                      placeholder="e.g. STU-2026-099"
                      className="cp-input"
                      value={newUserForm.studentId}
                      onChange={e => setNewUserForm({ ...newUserForm, studentId: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Role</label>
                    <select
                      className="cp-select"
                      style={{ width: '100%', cursor: 'pointer' }}
                      value={newUserForm.role}
                      onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="ORGANIZER">Event Organizer</option>
                      <option value="VOLUNTEER">Gate Volunteer</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="cp-form-group">
                  <label className="cp-label">Department</label>
                  <select
                    className="cp-select"
                    style={{ width: '100%', cursor: 'pointer' }}
                    value={newUserForm.department}
                    onChange={e => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  >
                    {institutionProfile.departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
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
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: '#166534',
                    color: '#ffffff',
                    border: '1px solid #166534',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 101, 52, 0.4)'
                  }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Text Customizer Modal */}
      {isHeroModalOpen && (
        <EditHeroTextModal
          heroConfig={heroConfig}
          onClose={() => setIsHeroModalOpen(false)}
          onUpdateHero={updateHeroConfig}
          onResetHero={resetHeroConfig}
          onSuccessNotice={(msg) => setFeedback({ type: 'success', message: msg })}
        />
      )}

      {/* Bento Highlight Cards Customizer Modal */}
      {isBentoModalOpen && (
        <EditBentoCardsModal
          bentoCards={bentoCards}
          onClose={() => setIsBentoModalOpen(false)}
          onUpdateCard={updateBentoCard}
          onUpdateAllCards={updateAllBentoCards}
          onResetCards={resetBentoCards}
          onSuccessNotice={(msg) => setFeedback({ type: 'success', message: msg })}
        />
      )}

      {/* Multi-Round Stage Configurator Modal */}
      {selectedEventForRounds && (
        <ManageEventRoundsModal
          event={selectedEventForRounds}
          onClose={() => setSelectedEventForRounds(null)}
          onSaveRounds={handleSaveRounds}
        />
      )}

      {/* Reschedule & Delay Management Modal */}
      {selectedEventForReschedule && (
        <RescheduleEventModal
          event={selectedEventForReschedule}
          onClose={() => setSelectedEventForReschedule(null)}
          onReschedule={handleRescheduleEvent}
          onBroadcastAnnouncement={handleBroadcastFromReschedule}
        />
      )}

      {/* Full Event Registry Editor Modal */}
      {(isRegistryModalOpen || selectedEventForEdit) && (
        <EditEventRegistryModal
          events={events}
          onClose={() => {
            setIsRegistryModalOpen(false);
            setSelectedEventForEdit(null);
          }}
          initialEditingEvent={selectedEventForEdit}
          onSetPinnedFeaturedId={(id) => setPinnedFeaturedId(id)}
          pinnedFeaturedId={pinnedFeaturedId}
          onUpdateEvent={updateEvent}
          onCreateEvent={createEvent}
          onSuccessNotice={(msg) => setFeedback({ type: 'success', message: msg })}
        />
      )}

      {/* Event Card Image Customizer Modal */}
      {selectedEventForImage && (
        <ChangeCardImageModal
          event={selectedEventForImage}
          onClose={() => setSelectedEventForImage(null)}
          onUpdateEvent={updateEvent}
          onSuccessNotice={(msg) => setFeedback({ type: 'success', message: msg })}
        />
      )}
    </div>
  );
};
