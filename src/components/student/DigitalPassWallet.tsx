import React, { useState, useEffect } from 'react';
import type { DigitalEventPass } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import { downloadPassPdf } from '../../utils/exportPdf';
import confetti from 'canvas-confetti';
import { DynamicNeuroNoise } from '@/components/ui/dynamic-neuro-noise';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  Maximize2,
  X,
  Lock,
  Utensils,
  Sparkles,
  QrCode,
  Scan,
  Share2,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Hash
} from 'lucide-react';

interface DigitalPassWalletProps {
  onBrowseEvents: () => void;
}

export const DigitalPassWallet: React.FC<DigitalPassWalletProps> = ({ onBrowseEvents }) => {
  const { passes, currentUser, institutionProfile } = useCampusPass();
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [enlargedPass, setEnlargedPass] = useState<DigitalEventPass | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter passes belonging to current student
  const studentPasses = passes.filter(p => p.studentId === currentUser.studentId);

  // Pre-generate high-res QR data URLs for student passes
  useEffect(() => {
    studentPasses.forEach(pass => {
      if (!qrImages[pass.id]) {
        generateQrDataUrl(pass.qrToken).then(url => {
          setQrImages(prev => ({ ...prev, [pass.id]: url }));
        });
      }
    });
  }, [studentPasses, qrImages]);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDownloadPdf = async (pass: DigitalEventPass) => {
    setDownloadingId(pass.id);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      await downloadPassPdf(pass);
    } catch (err) {
      console.error('Failed to download pass PDF', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Wallet Hero Header */}
      <div className="cp-page-hero">
        <DynamicNeuroNoise />
        <div className="cp-hero-overlay" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#86efac' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac' }}>
                Secure Smart Credentials
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
              Digital Event Pass Wallet
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)', margin: 0, maxWidth: '580px', lineHeight: 1.55 }}>
              HMAC-SHA256 cryptographically authenticated entry tokens. Present your pass at venue gates for instant verification.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '12.5px',
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Ticket size={14} style={{ color: '#86efac' }} />
              {studentPasses.length} {studentPasses.length === 1 ? 'Pass Issued' : 'Passes Issued'}
            </span>
            <button
              className="cp-hero-pill-btn"
              onClick={onBrowseEvents}
            >
              <span>Browse Events</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {studentPasses.length === 0 ? (
        <div className="cp-section-card" style={{ padding: '64px 20px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#64748b'
          }}>
            <Ticket size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Gate Passes Issued Yet
          </h3>
          <p style={{ color: '#64748b', fontSize: '13.5px', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            You haven't registered for any events or your applications are awaiting approval. Discover exciting fests, hackathons, and workshops to unlock your pass.
          </p>
          <button
            className="cp-btn cp-btn-primary"
            onClick={onBrowseEvents}
          >
            <Ticket size={15} />
            Explore Event Registry
          </button>
        </div>
      ) : (
        /* Re-engineered Smart Optical QR Credential Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {studentPasses.map(pass => {
            const isCheckedIn = pass.status === 'USED';
            const isRevoked = pass.status === 'REVOKED';
            const isValid = pass.status === 'ACTIVE';

            return (
              <div key={pass.id} className="cp-credential">
                {/* Holographic Header Bar */}
                <div className="cp-credential-header">
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac', fontWeight: 700 }}>
                        {institutionProfile.collegeCode} • SMART ADMIT PASS
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '15.5px', fontWeight: 800, color: '#ffffff', margin: '3px 0 0 0',
                      letterSpacing: '-0.01em', lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {pass.eventTitle}
                    </h3>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#86efac',
                    flexShrink: 0
                  }}>
                    <Lock size={10} />
                    <span>HMAC SECURED</span>
                  </div>
                </div>

                {/* Credential Interior */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {/* Status Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isCheckedIn ? (
                        <span className="cp-badge cp-badge-open" style={{ background: '#dcfce7', color: '#15803d' }}>
                          <CheckCircle size={11} />
                          Checked In
                        </span>
                      ) : isRevoked ? (
                        <span className="cp-badge cp-badge-full">
                          <AlertTriangle size={11} />
                          Revoked
                        </span>
                      ) : (
                        <span className="cp-badge cp-badge-wait" style={{ background: '#dcfce7', color: '#166534' }}>
                          <ShieldCheck size={11} />
                          Active & Verified
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 600 }}>
                      ID: {pass.id}
                    </span>
                  </div>

                  {/* Redesigned QR Presentation Box with Optical Viewfinder Reticle */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 16px',
                    position: 'relative'
                  }}>
                    <div className="cp-qr-frame">
                      {/* Viewfinder Reticle Brackets */}
                      <div className="cp-qr-corner tl" />
                      <div className="cp-qr-corner tr" />
                      <div className="cp-qr-corner bl" />
                      <div className="cp-qr-corner br" />

                      {qrImages[pass.id] ? (
                        <img
                          src={qrImages[pass.id]}
                          alt="QR Gate Pass"
                          style={{
                            width: '144px',
                            height: '144px',
                            display: 'block',
                            borderRadius: '6px',
                            filter: isRevoked ? 'grayscale(100%) opacity(40%)' : 'none'
                          }}
                        />
                      ) : (
                        <div style={{ width: '144px', height: '144px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RefreshCw size={24} style={{ color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
                        </div>
                      )}

                      {/* Status Overlay Watermark */}
                      {isCheckedIn && (
                        <div style={{
                          position: 'absolute',
                          inset: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.94)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '8px',
                          zIndex: 5
                        }}>
                          <CheckCircle size={36} style={{ color: '#15803d', marginBottom: '4px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803d', letterSpacing: '0.04em' }}>
                            CHECKED IN
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            Verified at {pass.checkInGate || 'Main Gate'}
                          </span>
                        </div>
                      )}

                      {isRevoked && (
                        <div style={{
                          position: 'absolute',
                          inset: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.94)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '8px',
                          zIndex: 5
                        }}>
                          <AlertTriangle size={36} style={{ color: '#b91c1c', marginBottom: '4px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.04em' }}>
                            PASS REVOKED
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            Voided by Administration
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tap to Enlarge Button */}
                    <button
                      type="button"
                      onClick={() => setEnlargedPass(pass)}
                      className="cp-btn cp-btn-outline cp-btn-sm"
                      style={{ marginTop: '12px', gap: '6px' }}
                    >
                      <Maximize2 size={12} />
                      <span>Enlarge Pass Fullscreen</span>
                    </button>
                  </div>

                  {/* Attendee Details Matrix */}
                  <div className="cp-credential-meta" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="cp-credential-meta-cell">
                      <span className="cp-credential-meta-label">Student Name</span>
                      <span className="cp-credential-meta-value">{pass.studentName}</span>
                    </div>
                    <div className="cp-credential-meta-cell">
                      <span className="cp-credential-meta-label">Student ID</span>
                      <span className="cp-credential-meta-value cp-mono">{pass.studentId}</span>
                    </div>
                    <div className="cp-credential-meta-cell">
                      <span className="cp-credential-meta-label">Access Tier</span>
                      <span className="cp-credential-meta-value" style={{ color: '#166534' }}>
                        {pass.passType?.replace('_', ' ') || 'GENERAL ENTRY'}
                      </span>
                    </div>
                    <div className="cp-credential-meta-cell">
                      <span className="cp-credential-meta-label">Issued On</span>
                      <span className="cp-credential-meta-value" style={{ fontSize: '11px', color: '#64748b' }}>
                        {pass.issuedAt ? new Date(pass.issuedAt).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Event Timing & Venue */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                      <Calendar size={13} style={{ color: '#166534', flexShrink: 0 }} />
                      <span>Date: <strong style={{ color: '#0f172a' }}>{pass.eventDate}</strong></span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <Clock size={13} style={{ color: '#166534', flexShrink: 0 }} />
                      <span>Time: <strong style={{ color: '#0f172a' }}>{pass.eventTime}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                      <MapPin size={13} style={{ color: '#166534', flexShrink: 0 }} />
                      <span className="truncate">Venue: <strong style={{ color: '#0f172a' }}>{pass.venue}</strong></span>
                    </div>
                  </div>

                  {/* Cryptographic Signature Copy Pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px'
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
                      Token: {pass.qrToken.substring(0, 16)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(pass.qrToken)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedToken === pass.qrToken ? '#15803d' : '#166534',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700
                      }}
                    >
                      {copiedToken === pass.qrToken ? (
                        <>
                          <Check size={12} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy Token
                        </>
                      )}
                    </button>
                  </div>

                  {/* Download Official PDF Action */}
                  <button
                    className="cp-btn cp-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', height: '40px' }}
                    onClick={() => handleDownloadPdf(pass)}
                    disabled={downloadingId === pass.id}
                  >
                    <Download size={14} />
                    {downloadingId === pass.id ? 'Generating A6 PDF Pass...' : 'Download Official A6 Pass (PDF)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Resolution Gate Turnstile Presentation Modal */}
      {enlargedPass && (
        <div className="cp-modal-overlay" onClick={() => setEnlargedPass(null)}>
          <div
            className="cp-modal"
            style={{ maxWidth: '440px', padding: '28px', textAlign: 'center', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEnlargedPass(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
              <Ticket size={14} style={{ color: '#166534' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#166534' }}>
                Official Event Pass Verification Mode
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', letterSpacing: '-0.01em' }}>
              {enlargedPass.eventTitle}
            </h3>

            {/* High-Contrast Frame */}
            <div style={{
              padding: '24px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '2px solid #e2e8f0',
              display: 'inline-block',
              boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <div className="cp-qr-corner tl" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
              <div className="cp-qr-corner tr" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
              <div className="cp-qr-corner bl" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
              <div className="cp-qr-corner br" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />

              {qrImages[enlargedPass.id] && (
                <img
                  src={qrImages[enlargedPass.id]}
                  alt="Enlarged QR Gate Pass"
                  style={{ width: '230px', height: '230px', display: 'block', borderRadius: '4px' }}
                />
              )}
            </div>

            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800, marginBottom: '2px' }}>
              {enlargedPass.studentName}
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#64748b', marginBottom: '12px' }}>
              Roll: {enlargedPass.studentId} • Ref: {enlargedPass.id}
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Present this verified digital QR pass at {enlargedPass.venue} for event admission.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
