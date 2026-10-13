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
  RefreshCw,
  ArrowRight,
  Zap,
  Radio,
  Lock,
  Calendar,
  Clock,
  Layers,
  ChevronRight
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
      if (scannerMode === 'GATE') {
        const evId = targetEventId === 'ALL' ? undefined : targetEventId;
        const res = await verifyGateEntry(token.trim(), selectedGate, currentUser.fullName, evId);

        if (res.success && res.result === 'VALID') {
          setVerdict({
            status: 'SUCCESS',
            resultCode: res.result,
            message: res.message,
            passData: res.data
          });
        } else {
          setVerdict({
            status: 'ERROR',
            resultCode: res.result,
            message: res.message,
            passData: res.data
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
            passData: res.data
          });
        } else {
          setVerdict({
            status: 'ERROR',
            resultCode: res.result,
            message: res.message,
            passData: res.data
          });
        }
      }
    } catch (err: any) {
      setVerdict({
        status: 'ERROR',
        resultCode: 'SYSTEM_ERROR',
        message: err.message || 'Verification network failure.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero */}
      <div className="cp-page-hero" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8' }}>
                Volunteer Gate Operator Console
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Turnstile & Dining QR Scanner HUD
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', maxWidth: '580px', lineHeight: 1.5 }}>
              High-speed cryptographic QR verification with instant turnstile anti-passback security and single-use meal validation.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="cp-tabs" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '4px' }}>
            <button
              type="button"
              className={`cp-tab${scannerMode === 'GATE' ? ' active' : ''}`}
              style={{ color: scannerMode === 'GATE' ? '#0f172a' : '#ffffff' }}
              onClick={() => {
                setScannerMode('GATE');
                setVerdict({ status: 'IDLE' });
              }}
            >
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Event Entry Gate
            </button>
            <button
              type="button"
              className={`cp-tab${scannerMode === 'LUNCH' ? ' active' : ''}`}
              style={{ color: scannerMode === 'LUNCH' ? '#0f172a' : '#ffffff' }}
              onClick={() => {
                setScannerMode('LUNCH');
                setVerdict({ status: 'IDLE' });
              }}
            >
              <Utensils size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Dining Hall Counter
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Controls Bar */}
      <div className="cp-section-card">
        <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
          {scannerMode === 'GATE' ? (
            <>
              <div>
                <label className="cp-label">Operating Gate Station</label>
                <select
                  className="cp-select"
                  style={{ width: '100%' }}
                  value={selectedGate}
                  onChange={(e) => setSelectedGate(e.target.value)}
                >
                  <option value="Gate A - Main Auditorium">Gate A - Main Auditorium</option>
                  <option value="Gate B - Engineering Quadrangle">Gate B - Engineering Quadrangle</option>
                  <option value="Gate C - Computer Center">Gate C - Computer Center</option>
                  <option value="Gate D - Sports Arena">Gate D - Sports Arena</option>
                </select>
              </div>

              <div>
                <label className="cp-label">Target Event Filter</label>
                <select
                  className="cp-select"
                  style={{ width: '100%' }}
                  value={targetEventId}
                  onChange={(e) => setTargetEventId(e.target.value)}
                >
                  <option value="ALL">All Active Campus Events</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="cp-label">Dining Counter Station</label>
              <select
                className="cp-select"
                style={{ width: '100%' }}
                value={selectedLunchCounter}
                onChange={(e) => setSelectedLunchCounter(e.target.value)}
              >
                <option value="Counter 1 - Dining Hall A">Counter 1 - Dining Hall A (Main)</option>
                <option value="Counter 2 - Dining Hall B">Counter 2 - Dining Hall B</option>
                <option value="Counter 3 - North Lawn Catering">Counter 3 - North Lawn Catering</option>
              </select>
            </div>
          )}

          <div>
            <label className="cp-label">Authorized Volunteer</label>
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
              gap: '8px'
            }}>
              <User size={14} style={{ color: '#0284c7' }} />
              <span>{currentUser.fullName} ({currentUser.role})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scanner Section: Camera Viewfinder + Instant Verdict Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
        {/* Left: Viewfinder & Input */}
        <div className="cp-section-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Optical Scanner Reticle
            </h3>
            <button
              className="cp-btn cp-btn-outline cp-btn-sm"
              onClick={cameraActive ? stopCamera : startCamera}
            >
              <Camera size={13} />
              {cameraActive ? 'Deactivate Camera' : 'Activate Camera'}
            </button>
          </div>

          {/* Viewfinder Window with Optical Reticle Framing */}
          <div style={{
            height: '240px',
            borderRadius: '16px',
            backgroundColor: '#0f172a',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Corner Reticle Brackets */}
            <div className="cp-qr-corner tl" style={{ borderColor: '#38bdf8', width: '22px', height: '22px', top: '14px', left: '14px' }} />
            <div className="cp-qr-corner tr" style={{ borderColor: '#38bdf8', width: '22px', height: '22px', top: '14px', right: '14px' }} />
            <div className="cp-qr-corner bl" style={{ borderColor: '#38bdf8', width: '22px', height: '22px', bottom: '14px', left: '14px' }} />
            <div className="cp-qr-corner br" style={{ borderColor: '#38bdf8', width: '22px', height: '22px', bottom: '14px', right: '14px' }} />

            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: '#94a3b8',
                padding: '24px',
                position: 'relative',
                zIndex: 2
              }}>
                <Scan size={44} style={{ margin: '0 auto 10px auto', opacity: 0.8, color: '#38bdf8' }} />
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#cbd5e1' }}>
                  Camera in standby. Click "Activate Camera" or test instant credentials with 1-click test injections below.
                </p>
                {cameraError && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '11.5px', color: '#f87171' }}>{cameraError}</p>
                )}
              </div>
            )}

            {/* Target Reticle Crosshairs */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '130px',
              height: '130px',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '16px',
              pointerEvents: 'none',
              zIndex: 4
            }} />
          </div>

          {/* Manual Token Submission Bar */}
          <div>
            <label className="cp-label">Manual QR Token or Barcode Entry</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="cp-input"
                placeholder="Paste encrypted QR token string here..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
              />
              <button
                className="cp-btn cp-btn-primary"
                onClick={() => handleVerify(manualToken)}
                disabled={isScanning || !manualToken.trim()}
                style={{ flexShrink: 0 }}
              >
                <Zap size={14} />
                Verify
              </button>
            </div>
          </div>
        </div>

        {/* Right: Instant Verdict Display Card */}
        <div className="cp-section-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>
            Turnstile Verdict & Participant Card
          </h3>

          {verdict.status === 'IDLE' ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              border: '1.5px dashed #e2e8f0'
            }}>
              <Scan size={44} style={{ color: '#94a3b8', marginBottom: '14px', opacity: 0.5 }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                Waiting for Pass Scan
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '320px', lineHeight: 1.5 }}>
                Present attendee QR code to the scanner camera or select a test pass below to simulate turnstile check-in.
              </p>
            </div>
          ) : verdict.status === 'SUCCESS' ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '22px',
              borderRadius: '16px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0'
            }}>
              {/* Success Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
                }}>
                  <CheckCircle size={26} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803d' }}>
                    ACCESS GRANTED • ATOMIC CHECK-IN
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {verdict.message}
                  </h3>
                </div>
              </div>

              {/* Attendee Details Card */}
              {verdict.passData && (
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #bbf7d0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Attendee Name</span>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{verdict.passData.studentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Student Roll No</span>
                    <strong style={{ color: '#0f172a' }}>{verdict.passData.studentId}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Event</span>
                    <span style={{ color: '#0f172a' }}>{verdict.passData.eventTitle}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>
                      {scannerMode === 'GATE' ? 'Pass Type' : 'Dietary Preference'}
                    </span>
                    <strong style={{ color: '#0284c7' }}>
                      {scannerMode === 'GATE'
                        ? (verdict.passData as DigitalEventPass).passType
                        : (verdict.passData as LunchPass).dietaryPreference}
                    </strong>
                  </div>
                </div>
              )}

              <button
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={() => setVerdict({ status: 'IDLE' })}
                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
              >
                Scan Next Attendee
              </button>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '22px',
              borderRadius: '16px',
              backgroundColor: '#fee2e2',
              border: '1.5px solid #fecaca'
            }}>
              {/* Error Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(185, 28, 28, 0.25)'
                }}>
                  <XCircle size={26} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#b91c1c' }}>
                    ACCESS DENIED • {verdict.resultCode}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {verdict.message}
                  </h3>
                </div>
              </div>

              {/* Error Explanation */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #fecaca',
                fontSize: '12px',
                color: '#64748b',
                lineHeight: 1.5
              }}>
                {verdict.resultCode === 'ALREADY_USED' && (
                  <div>
                    <strong>Duplicate Entry Attempt Detected:</strong> This digital pass has already been scanned and checked in. Turnstile access is strictly restricted to one single-use entry.
                  </div>
                )}
                {verdict.resultCode === 'REVOKED' && (
                  <div>
                    <strong>Pass Revoked:</strong> This ticket was voided by institutional administrators. Attendee must report to the Event Helpdesk.
                  </div>
                )}
                {verdict.resultCode === 'ALREADY_REDEEMED' && (
                  <div>
                    <strong>Meal Voucher Already Claimed:</strong> This dining pass has already been redeemed at a catering station.
                  </div>
                )}
                {verdict.resultCode === 'INVALID_TOKEN' && (
                  <div>
                    <strong>Cryptographic Mismatch:</strong> Pass signature failed verification. Possible fraudulent copy or unissued token.
                  </div>
                )}
              </div>

              <button
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={() => setVerdict({ status: 'IDLE' })}
                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
              >
                Dismiss & Scan Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Test Simulator Panel */}
      <div className="cp-section-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: '#d97706' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Quick-Test Pass Simulator (1-Click Test Injections)
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Test turnstile entry scenarios without needing an external smartphone camera
          </span>
        </div>

        {scannerMode === 'GATE' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {passes.slice(0, 6).map((pass) => (
              <button
                key={pass.id}
                type="button"
                onClick={() => handleVerify(pass.qrToken)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
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

            {/* Test Corrupted Token button */}
            <button
              type="button"
              onClick={() => handleVerify('CORRUPTED-FAKE-TOKEN-999')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#fee2e2',
                border: '1.5px dashed #fecaca',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <strong style={{ fontSize: '13px', color: '#b91c1c', display: 'block' }}>
                  Simulate Fraudulent Token
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Tampered HMAC Signature
                </span>
              </div>
              <span className="cp-badge cp-badge-full">
                INVALID
              </span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {lunchPasses.slice(0, 6).map((lp) => (
              <button
                key={lp.id}
                type="button"
                onClick={() => handleVerify(lp.qrToken)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <History size={16} style={{ color: '#0284c7' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Recent Turnstile Scan Activity Log
          </h3>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="cp-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Attendee</th>
                <th>Event</th>
                <th>Station / Gate</th>
                <th>Volunteer</th>
                <th>Verdict</th>
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
    </div>
  );
};
