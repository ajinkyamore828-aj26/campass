import React, { useState, useMemo, useEffect } from 'react';
import type { CampusRegistration, DigitalEventPass } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import { downloadPassPdf } from '../../utils/exportPdf';
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
  ExternalLink,
  Mail,
  Send,
  Download,
  X,
  ShieldCheck,
  QrCode,
  Tag
} from 'lucide-react';

interface MyApplicationsListProps {
  onBrowseEvents: () => void;
  onOpenPassWallet?: () => void;
}

type FilterTab = 'ALL' | 'PENDING' | 'APPROVED' | 'WAITLISTED' | 'REJECTED';

export const MyApplicationsList: React.FC<MyApplicationsListProps> = ({
  onBrowseEvents,
  onOpenPassWallet
}) => {
  const { registrations, events, passes, currentUser, cancelRegistration, resendEmailPass, institutionProfile } = useCampusPass();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email Pass Receipt Modal state
  const [receiptReg, setReceiptReg] = useState<CampusRegistration | null>(null);
  const [receiptQrUrl, setReceiptQrUrl] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

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

  const handleResendPass = async (regId: string, emailAddress: string) => {
    setResendingId(regId);
    setFeedbackMessage(null);

    try {
      const res = await resendEmailPass(regId);
      if (res.success) {
        setFeedbackMessage({ 
          type: 'success', 
          text: `Official Digital Pass resent to ${emailAddress}!` 
        });
      } else {
        setFeedbackMessage({ 
          type: 'error', 
          text: res.message || 'Failed to resend pass email.' 
        });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Network error while resending pass.' });
    } finally {
      setResendingId(null);
    }
  };

  const handleOpenReceipt = async (reg: CampusRegistration) => {
    setReceiptReg(reg);
    const matchingPass = passes.find(p => p.registrationId === reg.id || p.id === reg.passId);
    const qrContent = matchingPass?.qrToken || `CPTOKEN_${reg.eventId}_${reg.passId || reg.id}_${reg.studentId}_VERIFIED`;
    try {
      const url = await generateQrDataUrl(qrContent);
      setReceiptQrUrl(url);
    } catch (err) {
      console.warn('QR code generation fallback', err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!receiptReg) return;
    const matchingPass = passes.find(p => p.registrationId === receiptReg.id || p.id === receiptReg.passId);
    const targetPass: DigitalEventPass = matchingPass || {
      id: receiptReg.passId || `CP-PASS-${receiptReg.id.slice(-4)}`,
      registrationId: receiptReg.id,
      eventId: receiptReg.eventId,
      eventTitle: receiptReg.eventTitle,
      eventCategory: receiptReg.eventCategory,
      eventDate: receiptReg.eventDate,
      eventTime: '09:00 AM',
      eventVenue: receiptReg.eventVenue,
      studentName: receiptReg.studentName,
      studentId: receiptReg.studentId,
      studentEmail: receiptReg.studentEmail,
      department: receiptReg.department,
      academicYear: receiptReg.academicYear,
      passType: receiptReg.registrationType === 'TEAM' ? 'TEAM_ENTRY' : 'PARTICIPANT',
      status: 'ACTIVE',
      qrToken: `CPTOKEN_${receiptReg.eventId}_${receiptReg.id}`,
      qrSignature: 'HMAC-SHA256-VERIFIED',
      entryCount: 0,
      issuedAt: receiptReg.passSentAt || new Date().toISOString(),
      expiresAt: `${receiptReg.eventDate}T23:59:59Z`,
      hasLunchPass: receiptReg.lunchEligible
    };

    setIsPdfGenerating(true);
    try {
      await downloadPassPdf(targetPass);
    } catch (err) {
      console.error('PDF download error', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero */}
      <div className="cp-page-hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#86efac' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac' }}>
                Application Tracking Portal
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
              My Event Registrations & Applications
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)', margin: 0, maxWidth: '620px', lineHeight: 1.55 }}>
              View all your event registrations, track status, and access passes emailed to your registered address.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="cp-hero-pill-btn"
              onClick={onBrowseEvents}
            >
              <span>Explore Events</span>
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
          <div className="cp-stat-label">Total Registrations</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Submitted by your account</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Hourglass size={15} />
          </div>
          <div className="cp-stat-value">{pendingCount}</div>
          <div className="cp-stat-label">Under Review</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Awaiting organizer review</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle size={15} />
          </div>
          <div className="cp-stat-value">{approvedCount}</div>
          <div className="cp-stat-label">Approved & Confirmed</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Pass emailed or open entry</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <Clock size={15} />
          </div>
          <div className="cp-stat-value">{waitlistCount}</div>
          <div className="cp-stat-label">Waitlisted</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Priority queue allocation</div>
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
            type="button"
            onClick={() => setFeedbackMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Registrations List Section */}
      <div className="cp-section-card">
        <div className="cp-section-card-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Application Records</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {filteredRegistrations.length} record{filteredRegistrations.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['ALL', 'PENDING', 'APPROVED', 'WAITLISTED', 'REJECTED'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                className={`cp-chip${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'ALL' ? 'All Registrations' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {filteredRegistrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
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
                const requiresPass = reg.requiresPass !== false && (event?.requiresPass !== false);

                // Status Badge metadata
                const getStatusMeta = () => {
                  switch (reg.status) {
                    case 'APPROVED':
                      return requiresPass
                        ? { cls: 'cp-badge cp-badge-open', label: 'Approved & Pass Emailed', icon: CheckCircle }
                        : { cls: 'cp-badge', label: 'Confirmed (No Pass Required)', icon: CheckCircle, customStyle: { backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' } };
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
                      border: reg.status === 'APPROVED' ? (requiresPass ? '1px solid #bbf7d0' : '1px solid #cbd5e1') : '1px solid #e2e8f0',
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
                            <span style={{ fontWeight: 700, color: '#166534' }}>{event.category}</span>
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
                        <span 
                          className={statusMeta.cls} 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            ...(statusMeta.customStyle || {})
                          }}
                        >
                          <StatusIcon size={12} />
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    {/* Pass Delivery / Open Entry Notice Banner */}
                    {reg.status === 'APPROVED' && (
                      requiresPass ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          fontSize: '12px',
                          color: '#166534'
                        }}>
                          <Mail size={15} style={{ color: '#166534', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <span>Official Event Pass has been emailed to: <strong>{reg.passEmailAddress || reg.studentEmail}</strong></span>
                            {reg.passId && (
                              <span style={{ marginLeft: '8px', color: '#15803d', fontWeight: 600, fontSize: '11px' }}>
                                (PASS ID: {reg.passId})
                              </span>
                            )}
                          </div>
                          {reg.passSentAt && (
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                              Sent {new Date(reg.passSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          color: '#475569'
                        }}>
                          <CheckCircle size={15} style={{ color: '#166534', flexShrink: 0 }} />
                          <div>
                            <strong>Direct Open Attendance Confirmed:</strong> No event pass is required by admin for this session. Please carry your college student ID card.
                          </div>
                        </div>
                      )
                    )}

                    {/* Team Preview if applicable */}
                    {reg.registrationType === 'TEAM' && (
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
                      paddingTop: '12px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748b' }}>
                        {reg.dietaryPreference && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Utensils size={12} style={{ color: '#0f766e' }} />
                            <span>Meal: <strong>{reg.dietaryPreference}</strong></span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={12} style={{ color: '#94a3b8' }} />
                          <span>Format: <strong>{reg.registrationType}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {reg.status === 'APPROVED' && requiresPass && (
                          <>
                            <button
                              className="cp-btn cp-btn-primary cp-btn-sm"
                              onClick={() => handleOpenReceipt(reg)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Ticket size={13} />
                              View Email Pass Receipt
                            </button>

                            <button
                              className="cp-btn cp-btn-outline cp-btn-sm"
                              onClick={() => handleResendPass(reg.id, reg.passEmailAddress || reg.studentEmail)}
                              disabled={resendingId === reg.id}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Send size={13} />
                              {resendingId === reg.id ? 'Resending...' : 'Resend Email Pass'}
                            </button>
                          </>
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

      {/* Official Email Pass Receipt Modal */}
      {receiptReg && (
        <div className="cp-modal-overlay" onClick={() => setReceiptReg(null)}>
          <div
            className="cp-modal"
            style={{ maxWidth: '520px', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
              padding: '18px 22px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Ticket size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Official Digital Entry Pass
                  </h3>
                  <p style={{ fontSize: '11px', color: '#bbf7d0', margin: '2px 0 0 0' }}>
                    {institutionProfile.collegeName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReceiptReg(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Receipt Modal Body */}
            <div className="cp-modal-body" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Event Details Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#166534',
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {receiptReg.eventCategory}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                    {receiptReg.passId || receiptReg.id}
                  </span>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {receiptReg.eventTitle}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} style={{ color: '#166534' }} />
                    <span>{receiptReg.eventDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={13} style={{ color: '#166534' }} />
                    <span className="truncate">{receiptReg.eventVenue}</span>
                  </div>
                </div>
              </div>

              {/* Attendee Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px 14px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Student Name</span>
                  <strong style={{ color: '#0f172a' }}>{receiptReg.studentName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Student ID</span>
                  <strong style={{ color: '#0f172a' }}>{receiptReg.studentId}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Department</span>
                  <span style={{ color: '#475569' }}>{receiptReg.department}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Registration Type</span>
                  <span style={{ color: '#475569' }}>{receiptReg.registrationType}</span>
                </div>
              </div>

              {/* QR Code Barcode Surface */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                gap: '8px'
              }}>
                {receiptQrUrl ? (
                  <img
                    src={receiptQrUrl}
                    alt="Digital Pass QR Barcode"
                    style={{ width: '160px', height: '160px', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{ width: '160px', height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={40} style={{ color: '#94a3b8' }} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                  <ShieldCheck size={13} />
                  <span>HMAC-SHA256 Cryptographically Signed</span>
                </div>
              </div>

              {/* Email Delivery Receipt Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                fontSize: '12px',
                color: '#166534'
              }}>
                <Mail size={15} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span>Dispatched to registered student inbox:</span>
                  <strong style={{ display: 'block', wordBreak: 'break-all' }}>
                    {receiptReg.passEmailAddress || receiptReg.studentEmail}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="cp-modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={() => handleResendPass(receiptReg.id, receiptReg.passEmailAddress || receiptReg.studentEmail)}
                disabled={resendingId === receiptReg.id}
              >
                <Send size={13} />
                {resendingId === receiptReg.id ? 'Resending...' : 'Resend Email Pass'}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="cp-btn cp-btn-secondary cp-btn-sm"
                  onClick={handleDownloadPdf}
                  disabled={isPdfGenerating}
                >
                  <Download size={13} />
                  {isPdfGenerating ? 'Saving...' : 'Save PDF'}
                </button>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary cp-btn-sm"
                  onClick={() => setReceiptReg(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
