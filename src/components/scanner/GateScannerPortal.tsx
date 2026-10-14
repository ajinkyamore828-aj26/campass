import React, { useState, useRef, useEffect } from 'react';
import type { DigitalEventPass, LunchPass } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  Scan,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Utensils,
  MapPin,
  User,
  History,
  Zap,
  Lock,
  Calendar,
  Clock,
  Activity,
  Terminal,
  Fingerprint,
  RotateCcw,
  ShieldAlert,
  Hash,
  BadgeCheck
} from 'lucide-react';

export const GateScannerPortal: React.FC = () => {
  const {
    passes,
    lunchPasses,
    events,
    scanLogs,
    currentUser,
    verifyGateEntry,
    verifyLunchPass
  } = useCampusPass();

  // Mode: Entry Gate vs Lunch Distribution Counter
  const [scannerMode, setScannerMode] = useState<'GATE' | 'LUNCH'>('GATE');
  const [selectedGate, setSelectedGate] = useState('Gate A - Main Auditorium');
  const [selectedLunchCounter, setSelectedLunchCounter] = useState('Counter 1 - Dining Hall A');
  const [targetEventId, setTargetEventId] = useState<string>('ALL');

  // Manual token input
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Verdict state
  const [verdict, setVerdict] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    resultCode?: string;
    message?: string;
    passData?: DigitalEventPass | LunchPass;
    timestamp?: string;
  }>({ status: 'IDLE' });

  // Web camera video ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Camera stream handler
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera access is not supported on this browser or requires HTTPS.');
      }
    } catch (err: any) {
      setCameraError('Could not access device camera. Please check permissions or use manual test input.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Verification executor
  const handleVerify = async (token: string) => {
    if (!token.trim()) return;
    setIsScanning(true);
    setVerdict({ status: 'IDLE' });

    try {
      const nowStr = new Date().toLocaleTimeString();
      if (scannerMode === 'GATE') {
        const evId = targetEventId === 'ALL' ? undefined : targetEventId;
        const res = await verifyGateEntry(token.trim(), selectedGate, currentUser.fullName, evId);

        if (res.success && res.result === 'VALID') {
          setVerdict({
            status: 'SUCCESS',
            resultCode: res.result,
            message: res.message,
            passData: res.data,
            timestamp: nowStr
          });
        } else {
          setVerdict({
            status: 'ERROR',
            resultCode: res.result,
            message: res.message,
            passData: res.data,
            timestamp: nowStr
          });
        }
      } else {
        // Lunch Mode
        const res = await verifyLunchPass(token.trim(), selectedLunchCounter, currentUser.fullName);
        if (res.success && res.result === 'VALID') {
          setVerdict({
            status: 'SUCCESS',
            resultCode: res.result,
            message: res.message,
            passData: res.data,
            timestamp: nowStr
          });
        } else {
          setVerdict({
            status: 'ERROR',
            resultCode: res.result,
            message: res.message,
            passData: res.data,
            timestamp: nowStr
          });
        }
      }
    } catch (err: any) {
      setVerdict({
        status: 'ERROR',
        resultCode: 'SYSTEM_ERROR',
        message: err.message || 'Verification network failure.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Mock cryptographic hash preview for attendee dossier
  const getFingerprint = (data?: DigitalEventPass | LunchPass) => {
    if (!data) return 'SHA256: 7f83b165...e2d3';
    const raw = `${data.id}:${data.studentId}:${data.eventId}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `SHA256: ${Math.abs(hash).toString(16).padStart(8, '0')}8fa9...c4b2`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero */}
      <div className="cp-page-hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="cp-scanner-status-dot" />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac' }}>
                Turnstile Station Online • Optical Reticle Active
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
              Turnstile & Dining Optical Scanner HUD
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)', margin: 0, maxWidth: '620px', lineHeight: 1.55 }}>
              Institutional hardware workstation for instantaneous cryptographic QR validation, single-use anti-passback enforcement, and meal tracking.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="cp-tabs" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '4px' }}>
            <button
              type="button"
              className={`cp-tab${scannerMode === 'GATE' ? ' active' : ''}`}
              style={{ color: scannerMode === 'GATE' ? '#166534' : '#ffffff' }}
              onClick={() => {
                setScannerMode('GATE');
                setVerdict({ status: 'IDLE' });
              }}
            >
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Turnstile Entry Gate
            </button>
            <button
              type="button"
              className={`cp-tab${scannerMode === 'LUNCH' ? ' active' : ''}`}
              style={{ color: scannerMode === 'LUNCH' ? '#166534' : '#ffffff' }}
              onClick={() => {
                setScannerMode('LUNCH');
                setVerdict({ status: 'IDLE' });
              }}
            >
              <Utensils size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Dining Distribution Station
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry & Configuration Bar */}
      <div className="cp-section-card">
        <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
          {scannerMode === 'GATE' ? (
            <>
              <div>
                <label className="cp-label">Turnstile Checkpoint</label>
                <select
                  className="cp-select"
                  style={{ width: '100%' }}
                  value={selectedGate}
                  onChange={(e) => setSelectedGate(e.target.value)}
                >
                  <option value="Gate A - Main Auditorium">Gate A - Main Auditorium (Turnstile 01)</option>
                  <option value="Gate B - Engineering Quadrangle">Gate B - Engineering Quadrangle (Turnstile 02)</option>
                  <option value="Gate C - Computer Center">Gate C - Computer Center (Turnstile 03)</option>
                  <option value="Gate D - Sports Arena">Gate D - Sports Arena (Turnstile 04)</option>
                </select>
              </div>

              <div>
                <label className="cp-label">Enforced Event Context</label>
                <select
                  className="cp-select"
                  style={{ width: '100%' }}
                  value={targetEventId}
                  onChange={(e) => setTargetEventId(e.target.value)}
                >
                  <option value="ALL">All Active Campus Events (Permissive)</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="cp-label">Dining Distribution Counter</label>
              <select
                className="cp-select"
                style={{ width: '100%' }}
                value={selectedLunchCounter}
                onChange={(e) => setSelectedLunchCounter(e.target.value)}
              >
                <option value="Counter 1 - Dining Hall A">Counter 1 - Dining Hall A (Main Dining)</option>
                <option value="Counter 2 - Dining Hall B">Counter 2 - Dining Hall B (South Wing)</option>
                <option value="Counter 3 - North Lawn Catering">Counter 3 - North Lawn Catering (Open Court)</option>
              </select>
            </div>
          )}

          <div>
            <label className="cp-label">Station Operator Credentials</label>
            <div style={{
              padding: '9px 12px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} style={{ color: '#166534' }} />
                <span>{currentUser.fullName}</span>
              </div>
              <span className="cp-badge cp-badge-open" style={{ fontSize: '10.5px' }}>
                VERIFIED OPERATOR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workstation: Industrial Scanner Terminal (Left) + Verdict Dossier (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        
        {/* Left: Industrial Scanner Hardware Terminal */}
        <div className="cp-scanner-terminal">
          <div className="cp-scanner-terminal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={14} style={{ color: '#86efac' }} />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f1f5f9' }}>
                TERMINAL::NODE-01
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', borderLeft: '1px solid #334155', paddingLeft: '8px' }}>
                60 FPS • 48ms ENGINE
              </span>
            </div>

            <button
              type="button"
              className="cp-btn cp-btn-sm"
              style={{
                backgroundColor: cameraActive ? '#334155' : '#1e293b',
                color: cameraActive ? '#f8fafc' : '#94a3b8',
                border: '1px solid #475569',
                fontSize: '11px',
                padding: '4px 10px'
              }}
              onClick={cameraActive ? stopCamera : startCamera}
            >
              <Camera size={12} style={{ marginRight: '5px' }} />
              {cameraActive ? 'Deactivate Lens' : 'Activate Optical Lens'}
            </button>
          </div>

          {/* Viewport with matte precision reticle */}
          <div className="cp-scanner-viewport">
            <div className="cp-scanner-grid-overlay" />
            
            {/* Corner Telemetry Tags */}
            <div className="cp-scanner-tag tl">LENS: OPTICAL 1080p</div>
            <div className="cp-scanner-tag tr">HMAC-SHA256 SECURED</div>
            <div className="cp-scanner-tag bl">LATENCY: 42ms</div>
            <div className="cp-scanner-tag br">PASSBACK: ENFORCED</div>

            {/* Sweep Scanline (Subtle matte motion, no glowing halo) */}
            <div className="cp-scanner-scanline" />

            {/* Target Reticle Frame */}
            <div className="cp-scanner-reticle-frame">
              <div className="cp-scanner-reticle-corner tl" />
              <div className="cp-scanner-reticle-corner tr" />
              <div className="cp-scanner-reticle-corner bl" />
              <div className="cp-scanner-reticle-corner br" />
              <div className="cp-scanner-reticle-crosshair" />
            </div>

            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '24px'
              }}>
                <Scan size={36} style={{ color: '#86efac', opacity: 0.8, marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  Optical Sensor Standby
                </h4>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', maxWidth: '300px', lineHeight: 1.4 }}>
                  Activate hardware camera or use 1-click test injections below to simulate credential check-in.
                </p>
                {cameraError && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#f87171' }}>{cameraError}</p>
                )}
              </div>
            )}
          </div>

          {/* Terminal Manual Token Input Bar */}
          <div className="cp-scanner-terminal-footer">
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Direct Token Buffer / Barcode Wedge
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="cp-input"
                style={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px'
                }}
                placeholder="Paste encrypted QR payload string here..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
              />
              <button
                type="button"
                className="cp-btn cp-btn-primary"
                onClick={() => handleVerify(manualToken)}
                disabled={isScanning || !manualToken.trim()}
                style={{ flexShrink: 0, padding: '0 16px', fontSize: '12.5px' }}
              >
                <Zap size={13} style={{ marginRight: '6px' }} />
                Verify
              </button>
            </div>
          </div>
        </div>

        {/* Right: Turnstile Verdict & Attendee Dossier Workstation */}
        <div className="cp-verdict-dossier">
          <div className="cp-verdict-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={15} style={{ color: '#166534' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Verification Verdict Dossier
              </h3>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
              STATUS: {verdict.status}
            </span>
          </div>

          {verdict.status === 'IDLE' ? (
            <div className="cp-verdict-idle-hud">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                color: '#64748b'
              }}>
                <Scan size={26} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                Awaiting Optical Presentation
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', maxWidth: '340px', lineHeight: 1.5 }}>
                Position attendee digital pass in the optical reticle or trigger instant test credentials from the simulation suite below.
              </p>

              {/* Station Readiness Specifications */}
              <div className="cp-verdict-idle-spec-grid">
                <div className="cp-verdict-idle-spec-item">
                  <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Station Moniker
                  </span>
                  <strong style={{ fontSize: '12px', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {selectedGate.split(' - ')[0]}
                  </strong>
                </div>

                <div className="cp-verdict-idle-spec-item">
                  <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Security Policy
                  </span>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>
                    Single-Use Atomic
                  </strong>
                </div>

                <div className="cp-verdict-idle-spec-item">
                  <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Engine Mode
                  </span>
                  <strong style={{ fontSize: '12px', color: '#166534' }}>
                    {scannerMode === 'GATE' ? 'Turnstile Entry' : 'Meal Counter'}
                  </strong>
                </div>

                <div className="cp-verdict-idle-spec-item">
                  <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recent Scan Logs
                  </span>
                  <strong style={{ fontSize: '12px', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {scanLogs.length} Logged
                  </strong>
                </div>
              </div>
            </div>
          ) : verdict.status === 'SUCCESS' ? (
            <div className="cp-verdict-granted">
              {/* Verdict Header Banner */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803d', display: 'block' }}>
                      ACCESS GRANTED • ATOMIC CHECK-IN
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      {verdict.message}
                    </h3>
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#15803d', fontWeight: 600 }}>
                  {verdict.timestamp}
                </span>
              </div>

              {/* Verified Attendee Dossier Card */}
              {verdict.passData && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginBottom: '16px'
                }}>
                  {/* Attendee Identity Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {verdict.passData.studentName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                        {verdict.passData.studentName}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        Roll No: {verdict.passData.studentId}
                      </span>
                    </div>
                    <span className="cp-badge cp-badge-open" style={{ fontSize: '11px' }}>
                      <BadgeCheck size={12} style={{ marginRight: '4px' }} />
                      VALIDATED
                    </span>
                  </div>

                  {/* Attribute Matrix */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    fontSize: '11.5px'
                  }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>Registered Event</span>
                      <strong style={{ color: '#0f172a', fontSize: '12px' }}>{verdict.passData.eventTitle}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block' }}>
                        {scannerMode === 'GATE' ? 'Assigned Pass Tier' : 'Dietary Preference'}
                      </span>
                      <strong style={{ color: '#166534', fontSize: '12px' }}>
                        {scannerMode === 'GATE'
                          ? (verdict.passData as DigitalEventPass).passType
                          : (verdict.passData as LunchPass).dietaryPreference}
                      </strong>
                    </div>
                  </div>

                  {/* Cryptographic Telemetry Stamp */}
                  <div style={{
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono)',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px dashed #e2e8f0',
                    paddingTop: '10px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Fingerprint size={12} style={{ color: '#166534' }} />
                      {getFingerprint(verdict.passData)}
                    </span>
                    <span>ATOMIC PASSBACK: CONSUMED</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={() => setVerdict({ status: 'IDLE' })}
                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
              >
                <RotateCcw size={12} style={{ marginRight: '6px' }} />
                Scan Next Attendee
              </button>
            </div>
          ) : (
            <div className="cp-verdict-denied">
              {/* Verdict Header Banner */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#b91c1c',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <XCircle size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#b91c1c', display: 'block' }}>
                      ACCESS DENIED • {verdict.resultCode}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      {verdict.message}
                    </h3>
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#b91c1c', fontWeight: 600 }}>
                  {verdict.timestamp}
                </span>
              </div>

              {/* Institutional Incident Explanation & SOP */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#334155',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 700 }}>
                  <ShieldAlert size={15} />
                  <span>Turnstile Security Violation Breakdown</span>
                </div>

                {verdict.resultCode === 'ALREADY_USED' && (
                  <div>
                    <strong>Anti-Passback Breach Detected:</strong> This digital pass has already been scanned and checked in at a campus turnstile. Re-entry with the same single-use token is blocked by campus security policy.
                  </div>
                )}
                {verdict.resultCode === 'REVOKED' && (
                  <div>
                    <strong>Revoked Pass Credential:</strong> Ticket invalidated by campus event administration. Request attendee report to Central Registration Desk 04.
                  </div>
                )}
                {verdict.resultCode === 'ALREADY_REDEEMED' && (
                  <div>
                    <strong>Catering Voucher Consumed:</strong> This dining voucher was previously marked as dispensed.
                  </div>
                )}
                {verdict.resultCode === 'INVALID_TOKEN' && (
                  <div>
                    <strong>Cryptographic Checksum Failure:</strong> HMAC signature could not be verified against the campus authority keystore. Potential fraudulent reproduction.
                  </div>
                )}
                {verdict.resultCode === 'SYSTEM_ERROR' && (
                  <div>
                    <strong>Station Connectivity Exception:</strong> Verification service did not reply in time.
                  </div>
                )}

                <div style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#fef2f2',
                  fontSize: '11px',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                  <span>SOP: Turnstile gate locked. Direct attendee to Helpdesk if dispute arises.</span>
                </div>
              </div>

              <button
                type="button"
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={() => setVerdict({ status: 'IDLE' })}
                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
              >
                <RotateCcw size={12} style={{ marginRight: '6px' }} />
                Dismiss & Scan Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Structured Turnstile QA Simulation Suite */}
      <div className="cp-section-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: '#d97706' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Turnstile Quality Assurance & Simulation Suite
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Direct hardware simulation for all pass conditions and edge cases
          </span>
        </div>

        {scannerMode === 'GATE' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section 1: Standard Active Passes */}
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', marginBottom: '8px' }}>
                Standard Issue Passes
              </div>
              <div className="cp-qa-suite-grid">
                {passes.slice(0, 4).map((pass) => (
                  <button
                    key={pass.id}
                    type="button"
                    className="cp-qa-card"
                    onClick={() => handleVerify(pass.qrToken)}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                        {pass.studentName} ({pass.passType})
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {pass.eventTitle}
                      </span>
                    </div>
                    <span className={pass.status === 'ACTIVE' ? 'cp-badge cp-badge-open' : pass.status === 'USED' ? 'cp-badge cp-badge-wait' : 'cp-badge cp-badge-full'}>
                      {pass.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Security Violations & Edge Cases */}
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#b91c1c', marginBottom: '8px' }}>
                Security & Anti-Passback Test Vectors
              </div>
              <div className="cp-qa-suite-grid">
                {/* Corrupted Token */}
                <button
                  type="button"
                  className="cp-qa-card danger"
                  onClick={() => handleVerify('CORRUPTED-FAKE-TOKEN-999')}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: '#b91c1c', display: 'block' }}>
                      Tampered HMAC Signature
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Cryptographic mismatch vector
                    </span>
                  </div>
                  <span className="cp-badge cp-badge-full">
                    INVALID
                  </span>
                </button>

                {/* Revoked Token */}
                <button
                  type="button"
                  className="cp-qa-card danger"
                  onClick={() => {
                    const revoked = passes.find(p => p.status === 'REVOKED');
                    if (revoked) {
                      handleVerify(revoked.qrToken);
                    } else {
                      handleVerify(passes[0]?.qrToken || 'TEST');
                    }
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: '#b91c1c', display: 'block' }}>
                      Revoked Ticket Simulation
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Administrative ban status
                    </span>
                  </div>
                  <span className="cp-badge cp-badge-full">
                    REVOKED
                  </span>
                </button>

                {/* Double-tap Passback Test */}
                <button
                  type="button"
                  className="cp-qa-card danger"
                  onClick={() => {
                    const used = passes.find(p => p.status === 'USED');
                    if (used) {
                      handleVerify(used.qrToken);
                    } else {
                      handleVerify(passes[0]?.qrToken || 'TEST');
                    }
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: '#b91c1c', display: 'block' }}>
                      Duplicate Passback Attempt
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Second turnstile check-in attempt
                    </span>
                  </div>
                  <span className="cp-badge cp-badge-wait">
                    USED
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="cp-qa-suite-grid">
            {lunchPasses.slice(0, 6).map((lp) => (
              <button
                key={lp.id}
                type="button"
                className="cp-qa-card"
                onClick={() => handleVerify(lp.qrToken)}
              >
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                    {lp.studentName} ({lp.dietaryPreference})
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {lp.eventTitle}
                  </span>
                </div>
                <span className={lp.status === 'AVAILABLE' || lp.status === 'ACTIVE' ? 'cp-badge cp-badge-open' : 'cp-badge cp-badge-wait'}>
                  {lp.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Turnstile Scan History Table Card */}
      <div className="cp-section-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} style={{ color: '#166534' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Turnstile Audit & Scan Activity Stream
            </h3>
          </div>
          <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
            RECORDS: {scanLogs.length} EVENTS
          </span>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="cp-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Attendee Identity</th>
                <th>Target Event</th>
                <th>Checkpoint Station</th>
                <th>Operator</th>
                <th>Cryptographic Verdict</th>
              </tr>
            </thead>
            <tbody>
              {scanLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 14px', textAlign: 'center', color: '#64748b' }}>
                    No turnstile scans recorded yet in this session.
                  </td>
                </tr>
              ) : (
                scanLogs.slice(0, 8).map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                      {new Date(log.timestamp || log.scannedAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{log.studentName}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{log.studentId}</span>
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
    </div>
  );
};
