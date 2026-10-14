import React, { useState, useEffect } from 'react';
import type { LunchPass } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import {
  Utensils,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Copy,
  ShieldCheck,
  RefreshCw,
  Check,
  Info,
  Apple,
  Salad,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';

export const LunchPassView: React.FC = () => {
  const { lunchPasses, currentUser, institutionProfile } = useCampusPass();
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Passes belonging to current student
  const studentLunchPasses = lunchPasses.filter(lp => lp.studentId === currentUser.studentId);
  const activeCount = studentLunchPasses.filter(lp => lp.status === 'ACTIVE').length;
  const redeemedCount = studentLunchPasses.filter(lp => lp.status === 'REDEEMED').length;

  useEffect(() => {
    studentLunchPasses.forEach(lp => {
      if (!qrImages[lp.id]) {
        generateQrDataUrl(lp.qrToken).then(url => {
          setQrImages(prev => ({ ...prev, [lp.id]: url }));
        });
      }
    });
  }, [studentLunchPasses, qrImages]);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero */}
      <div className="cp-page-hero" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d97706' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fcd34d' }}>
                Institutional Dining Service
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Campus Meal Vouchers & Dining Passes
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', maxWidth: '580px', lineHeight: 1.5 }}>
              Single-use institutional dining tokens automatically granted for eligible full-day events, hackathons, and symposiums. Present at dining hall check-in counters.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#ffffff'
            }}>
              <ShieldCheck size={14} style={{ color: '#86efac' }} />
              Anti-Fraud Atomic Redemption
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="cp-stats-grid">
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Utensils size={15} />
          </div>
          <div className="cp-stat-value">{studentLunchPasses.length}</div>
          <div className="cp-stat-label">Total Meal Passes</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Issued to your profile</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <Clock size={15} />
          </div>
          <div className="cp-stat-value">{activeCount}</div>
          <div className="cp-stat-label">Available for Use</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ready to scan at lunch</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle size={15} />
          </div>
          <div className="cp-stat-value">{redeemedCount}</div>
          <div className="cp-stat-label">Claimed Meals</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Verified & consumed</div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#f0fdf4', color: '#14532d' }}>
            <MapPin size={15} />
          </div>
          <div className="cp-stat-value">Central Hall</div>
          <div className="cp-stat-label">Dining Facility</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Active dining wing</div>
        </div>
      </div>

      {/* Passes Grid */}
      {studentLunchPasses.length === 0 ? (
        <div className="cp-section-card" style={{ padding: '64px 20px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#94a3b8'
          }}>
            <Utensils size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Meal Vouchers Currently Available
          </h3>
          <p style={{ color: '#64748b', fontSize: '13.5px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
            Meal passes are automatically provisioned when an event you registered for provides lunch catering and your application is approved.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {studentLunchPasses.map(pass => {
            const isRedeemed = pass.status === 'REDEEMED';
            const isActive = pass.status === 'ACTIVE';

            return (
              <div
                key={pass.id}
                className="cp-credential"
                style={{
                  border: isRedeemed ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '16px 20px',
                  background: isRedeemed
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #0d3822 0%, #166534 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '74px',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac', fontWeight: 700 }}>
                      COLLEGE DINING VOUCHER
                    </span>
                    <h3 style={{
                      fontSize: '15px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff',
                      lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {pass.eventTitle}
                    </h3>
                  </div>

                  <span className={isRedeemed ? 'cp-badge cp-badge-open' : 'cp-badge cp-badge-wait'} style={{
                    background: isRedeemed ? '#dcfce7' : '#dcfce7',
                    color: isRedeemed ? '#15803d' : '#166534',
                    flexShrink: 0
                  }}>
                    {isRedeemed ? 'Redeemed' : 'Active'}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {/* Meal info box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#475569',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    padding: '12px',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} style={{ color: '#0f766e' }} />
                        <strong style={{ color: '#0f172a' }}>{pass.mealDate}</strong>
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: pass.dietaryPreference === 'VEG'
                          ? '#dcfce7'
                          : pass.dietaryPreference === 'NON_VEG'
                          ? '#fee2e2'
                          : '#fef3c7',
                        color: pass.dietaryPreference === 'VEG'
                          ? '#15803d'
                          : pass.dietaryPreference === 'NON_VEG'
                          ? '#b91c1c'
                          : '#b45309'
                      }}>
                        {pass.dietaryPreference === 'VEG' ? 'Vegetarian' : pass.dietaryPreference === 'NON_VEG' ? 'Non-Vegetarian' : 'Jain Diet'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} style={{ color: '#0f766e' }} />
                      <span>Service Window: 12:30 PM – 02:45 PM</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} style={{ color: '#0f766e' }} />
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{pass.diningLocation || 'Central Dining Mess, Ground Floor'}</span>
                    </div>
                  </div>

                  {/* QR Presentation Box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    position: 'relative'
                  }}>
                    <div className="cp-qr-frame">
                      <div className="cp-qr-corner tl" />
                      <div className="cp-qr-corner tr" />
                      <div className="cp-qr-corner bl" />
                      <div className="cp-qr-corner br" />

                      {isRedeemed && (
                        <div style={{
                          position: 'absolute',
                          inset: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.94)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 5,
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <CheckCircle size={36} style={{ color: '#15803d', marginBottom: '6px' }} />
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#15803d' }}>
                            MEAL CLAIMED
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Verified at {pass.redeemedCounter || 'Counter #2'}
                          </span>
                          {pass.redeemedAt && (
                            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                              {new Date(pass.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}

                      {qrImages[pass.id] ? (
                        <img
                          src={qrImages[pass.id]}
                          alt="Meal QR Voucher"
                          style={{
                            width: '144px',
                            height: '144px',
                            display: 'block',
                            borderRadius: '6px',
                            filter: isRedeemed ? 'grayscale(100%) opacity(30%)' : 'none'
                          }}
                        />
                      ) : (
                        <div style={{ width: '144px', height: '144px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RefreshCw size={24} style={{ color: '#94a3b8' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                        VOUCHER: {pass.id}
                      </span>
                    </div>
                  </div>

                  {/* Holder Info */}
                  <div className="cp-credential-meta" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <div className="cp-credential-meta-cell">
                      <span className="cp-credential-meta-label">Student Name</span>
                      <span className="cp-credential-meta-value">{pass.studentName}</span>
                    </div>
                    <div className="cp-credential-meta-cell">
                      <span className="cp-credential-meta-label">Roll Number</span>
                      <span className="cp-credential-meta-value cp-mono">{pass.studentId}</span>
                    </div>
                  </div>

                  {/* Cryptographic Signature Copy */}
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
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      Token: {pass.qrToken.substring(0, 16)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(pass.qrToken)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedToken === pass.qrToken ? '#15803d' : '#0f766e',
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
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy Token
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
