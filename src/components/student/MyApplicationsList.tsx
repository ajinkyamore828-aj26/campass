import React, { useState, useMemo } from 'react';
import type { CampusRegistration } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  FileText,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Hourglass,
  Trash2,
  Ticket,
  Utensils,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Building,
  MapPin,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface MyApplicationsListProps {
  onOpenPassWallet: () => void;
  onBrowseEvents: () => void;
}

type FilterTab = 'ALL' | 'PENDING' | 'APPROVED' | 'WAITLISTED' | 'REJECTED';

export const MyApplicationsList: React.FC<MyApplicationsListProps> = ({
  onOpenPassWallet,
  onBrowseEvents
}) => {
  const { registrations, events, currentUser, cancelRegistration } = useCampusPass();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter current student's registrations
  const studentRegistrations = registrations.filter(r => r.studentId === currentUser.studentId);

  const pendingCount = studentRegistrations.filter(r => r.status === 'PENDING').length;
  const approvedCount = studentRegistrations.filter(r => r.status === 'APPROVED').length;
  const waitlistCount = studentRegistrations.filter(r => r.status === 'WAITLISTED').length;

  const filteredRegistrations = useMemo(() => {
    if (activeTab === 'ALL') return studentRegistrations;
    return studentRegistrations.filter(r => r.status === activeTab);
  }, [studentRegistrations, activeTab]);

  const handleCancel = async (id: string, eventTitle: string) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${eventTitle}"?`)) {
      return;
    }

    setCancellingId(id);
    setFeedbackMessage(null);

    try {
      const res = await cancelRegistration(id);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: `Successfully withdrawn application for ${eventTitle}.` });
      } else {
        setFeedbackMessage({ type: 'error', text: res.message || 'Failed to cancel application.' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Error occurred.' });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero */}
      <div className="cp-page-hero" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#166534' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86efac' }}>
                Application Tracking Portal
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              My Event Applications & Submissions
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', maxWidth: '580px', lineHeight: 1.5 }}>
              Track approval lifecycles, team member confirmations, seat confirmations, and organizer review notes in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="cp-btn cp-btn-primary cp-btn-sm"
              onClick={onBrowseEvents}
            >
              Browse Events
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="cp-stats-grid">
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>
            <FileText size={15} />
          </div>
          <div className="cp-stat-value">{studentRegistrations.length}</div>
          <div className="cp-stat-label">Total Submissions</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Submitted by your account</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Hourglass size={15} />
          </div>
          <div className="cp-stat-value">{pendingCount}</div>
          <div className="cp-stat-label">Under Review</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Awaiting organizer decision</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle size={15} />
          </div>
          <div className="cp-stat-value">{approvedCount}</div>
          <div className="cp-stat-label">Approved & Confirmed</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Gate pass generated</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <Clock size={15} />
          </div>
          <div className="cp-stat-value">{waitlistCount}</div>
          <div className="cp-stat-label">Waitlisted</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Priority queue queueing</div>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '12px',
          backgroundColor: feedbackMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${feedbackMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: feedbackMessage.type === 'success' ? '#15803d' : '#b91c1c',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {feedbackMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span style={{ flex: 1 }}>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main List Card Container */}
      <div className="cp-section-card">
        {/* Navigation Tabs Header */}
        <div className="cp-section-card-header" style={{ padding: '12px 20px', flexWrap: 'wrap' }}>
          <div className="cp-tabs">
            {[
              { id: 'ALL', label: `All (${studentRegistrations.length})` },
              { id: 'PENDING', label: `Pending (${pendingCount})` },
              { id: 'APPROVED', label: `Approved (${approvedCount})` },
              { id: 'WAITLISTED', label: `Waitlisted (${waitlistCount})` },
              { id: 'REJECTED', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`cp-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id as FilterTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {filteredRegistrations.length} of {studentRegistrations.length} applications
          </span>
        </div>

        {/* Applications List */}
        <div style={{ padding: '20px' }}>
          {filteredRegistrations.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <FileText size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                No Applications in this Category
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '400px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                Try selecting a different filter tab or apply for new campus events from the discovery catalog.
              </p>
              <button className="cp-btn cp-btn-primary cp-btn-sm" onClick={onBrowseEvents}>
                Browse Published Events
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredRegistrations.map(reg => {
                const event = events.find(e => e.id === reg.eventId);

                // Status Badge metadata
                const getStatusMeta = () => {
                  switch (reg.status) {
                    case 'APPROVED':
                      return { cls: 'cp-badge cp-badge-open', label: 'Approved & Pass Issued', icon: CheckCircle };
                    case 'PENDING':
                      return { cls: 'cp-badge cp-badge-closing', label: 'Under Review', icon: Hourglass };
                    case 'WAITLISTED':
                      return { cls: 'cp-badge cp-badge-wait', label: 'Waitlisted', icon: Clock };
                    case 'REJECTED':
                      return { cls: 'cp-badge cp-badge-full', label: 'Application Rejected', icon: XCircle };
                    case 'CANCELLED':
                      return { cls: 'cp-badge cp-badge-closed', label: 'Withdrawn', icon: Trash2 };
                  }
                };

                const statusMeta = getStatusMeta();
                const StatusIcon = statusMeta.icon;

                return (
                  <div
                    key={reg.id}
                    style={{
                      background: '#ffffff',
                      border: reg.status === 'APPROVED' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                  >
                    {/* Top Row: Ref + Status */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                            REF: {reg.referenceNumber || reg.id}
                          </span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            Submitted on {new Date(reg.createdAt || reg.submittedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                          {reg.eventTitle}
                        </h3>

                        {event && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: '#166534' }}>{event.category}</span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} style={{ color: '#94a3b8' }} />
                              <span>{event.startDate || event.date}</span>
                            </div>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} style={{ color: '#94a3b8' }} />
                              <span>{event.venue}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className={statusMeta.cls} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <StatusIcon size={12} />
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    {/* Team Preview if applicable */}
                    {reg.participationType === 'TEAM' && (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                          <Users size={14} style={{ color: '#166534' }} />
                          <span>Team Roster: {reg.teamName}</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {reg.teamMembers?.map(m => (
                            <div
                              key={m.studentId}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                fontSize: '11px',
                                color: '#374151'
                              }}
                            >
                              <strong>{m.name}</strong> ({m.role || 'Member'})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rejection notice if applicable */}
                    {reg.status === 'REJECTED' && reg.rejectionReason && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '12px'
                      }}>
                        <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Reviewer Feedback:</strong> {reg.rejectionReason}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                        {reg.dietaryPreference && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Utensils size={12} style={{ color: '#0f766e' }} />
                            <span>Meal: <strong>{reg.dietaryPreference}</strong></span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {reg.status === 'APPROVED' && (
                          <button
                            className="cp-btn cp-btn-primary cp-btn-sm"
                            onClick={onOpenPassWallet}
                          >
                            <Ticket size={13} />
                            View Digital Gate Pass
                          </button>
                        )}

                        {(reg.status === 'PENDING' || reg.status === 'WAITLISTED') && (
                          <button
                            className="cp-btn cp-btn-danger cp-btn-sm"
                            onClick={() => handleCancel(reg.id, reg.eventTitle)}
                            disabled={cancellingId === reg.id}
                          >
                            <Trash2 size={13} />
                            {cancellingId === reg.id ? 'Withdrawing...' : 'Withdraw Application'}
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
      </div>
    </div>
  );
};
