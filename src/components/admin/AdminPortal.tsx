import React, { useState, useMemo } from 'react';
import type { CampusUser, UserRole, DigitalEventPass, AuditLog } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { exportToCsv } from '../../utils/exportCsv';
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
  Send
} from 'lucide-react';

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
    publishAnnouncement
  } = useCampusPass();

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'USERS' | 'PASSES' | 'AUDIT' | 'ANNOUNCEMENTS'>('ANALYTICS');

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
      <div className="cp-page-hero" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8' }}>
                System Administration Authority
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Institution Command & Governance Center
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', maxWidth: '580px', lineHeight: 1.5 }}>
              {institutionProfile.collegeName} • Central access policy, immutable audit trails, credential revocations, and system health telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="cp-btn cp-btn-cyan cp-btn-sm"
              onClick={() => setIsAddUserModalOpen(true)}
            >
              <Plus size={14} />
              Add User Account
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="cp-stats-grid">
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Calendar size={15} />
          </div>
          <div className="cp-stat-value">{events.length}</div>
          <div className="cp-stat-label">Published Events</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Active campus fests</div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#ccfbf1', color: '#0f766e' }}>
            <FileText size={15} />
          </div>
          <div className="cp-stat-value">{totalRegistrations}</div>
          <div className="cp-stat-label">Total Applications</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            {Math.round((approvedRegistrations / Math.max(1, totalRegistrations)) * 100)}% approved
          </div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>
            <Ticket size={15} />
          </div>
          <div className="cp-stat-value">{activePassesCount}</div>
          <div className="cp-stat-label">Active Credentials</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>HMAC verified</div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <ShieldCheck size={15} />
          </div>
          <div className="cp-stat-value">{checkInsCount}</div>
          <div className="cp-stat-label">Gate Turnstile Passes</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Verified attendance</div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Utensils size={15} />
          </div>
          <div className="cp-stat-value">{mealsRedeemedCount}</div>
          <div className="cp-stat-label">Meal Vouchers Redeemed</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Atomic check-in</div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: securityIncidents > 0 ? '#fee2e2' : '#dcfce7', color: securityIncidents > 0 ? '#b91c1c' : '#15803d' }}>
            <AlertTriangle size={15} />
          </div>
          <div className="cp-stat-value">{securityIncidents}</div>
          <div className="cp-stat-label">Security Interceptions</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Duplicate/Invalid blocked</div>
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
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>
                Department Participation Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(departmentStats).map(([dept, count]) => {
                  const pct = Math.round((count / Math.max(1, totalRegistrations)) * 100);
                  return (
                    <div key={dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{dept}</span>
                        <span style={{ color: '#64748b' }}>{count} candidates ({pct}%)</span>
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
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px' }}>{u.fullName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {u.email} {u.studentId ? `• ${u.studentId}` : ''}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '12.5px', color: '#0f172a' }}>{u.department}</span>
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
                        <strong style={{ color: '#0f172a' }}>{p.studentName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{p.studentId}</span>
                      </td>
                      <td style={{ color: '#0f172a', fontWeight: 500 }}>{p.eventTitle}</td>
                      <td style={{ fontSize: '12px', color: '#0284c7' }}>{p.passType}</td>
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
                        <strong style={{ color: '#0f172a' }}>{a.actorName}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{a.actorRole}</span>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>{a.action}</td>
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
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>
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
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Active Broadcasts
              </h3>
              {announcements.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{a.title}</strong>
                    <span className={a.priority === 'URGENT' ? 'cp-badge cp-badge-full' : 'cp-badge cp-badge-wait'}>
                      {a.priority}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>{a.message || a.content}</p>
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '10.5px', color: '#94a3b8' }}>
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
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#b91c1c' }}>
                Revoke Digital Pass
              </h3>
              <button type="button" onClick={() => setRevokingPass(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRevokePassSubmit}>
              <div className="cp-modal-body">
                <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  You are about to revoke pass <strong>{revokingPass.id}</strong> issued to <strong>{revokingPass.studentName}</strong> for <em>{revokingPass.eventTitle}</em>. The turnstile will immediately reject this QR token.
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
                <button type="button" className="cp-btn cp-btn-outline" onClick={() => setRevokingPass(null)}>
                  Cancel
                </button>
                <button type="submit" className="cp-btn cp-btn-danger">
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
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Add New Campus User Account
              </h3>
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit}>
              <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="cp-form-group">
                  <label className="cp-label">Full Name *</label>
                  <input
                    required
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
                    className="cp-input"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="cp-form-group">
                    <label className="cp-label">Student Roll No</label>
                    <input
                      className="cp-input"
                      value={newUserForm.studentId}
                      onChange={e => setNewUserForm({ ...newUserForm, studentId: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label className="cp-label">Role</label>
                    <select
                      className="cp-select"
                      style={{ width: '100%' }}
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
                    style={{ width: '100%' }}
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
                <button type="button" className="cp-btn cp-btn-outline" onClick={() => setIsAddUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="cp-btn cp-btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
