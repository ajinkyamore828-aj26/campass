import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  CheckCircle,
  AlertCircle,
  RotateCw,
  X,
  Database,
  Globe,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthData {
  status: string;
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  metrics: {
    events: number;
    registrations: number;
    passes: number;
    lunchPasses: number;
    auditLogs: number;
  };
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:4000/api/health', {
        headers: { 'Accept': 'application/json' }
      });
      const end = performance.now();
      setLatency(Math.round(end - start));
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to backend on port 4000');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'Active';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cp-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              className="cp-icon-box"
              style={{ background: '#dcfce7', color: '#166534' }}
            >
              <Server size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                API Backend Telemetry & Health
              </h2>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                Live microservice inspection • port 4000
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderRadius: '12px',
            background: error ? '#fef2f2' : '#f0fdf4',
            border: error ? '1px solid #fecaca' : '1px solid #bbf7d0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {error ? (
                <AlertCircle size={20} style={{ color: '#b91c1c' }} />
              ) : (
                <CheckCircle size={20} style={{ color: '#166534' }} />
              )}
              <div>
                <strong style={{ fontSize: '14px', color: error ? '#991b1b' : '#14532d' }}>
                  {error ? 'Backend Offline or Unreachable' : 'Backend Microservice Online'}
                </strong>
                <div style={{ fontSize: '11.5px', color: error ? '#b91c1c' : '#166534' }}>
                  {error ? error : 'http://localhost:4000 • Connected & responding normally'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: error ? '#b91c1c' : '#166534',
                background: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                border: error ? '1px solid #fecaca' : '1px solid #bbf7d0',
                fontFamily: 'var(--font-mono)'
              }}>
                {latency !== null ? `${latency} ms` : '—'}
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                Roundtrip Latency
              </span>
            </div>
          </div>

          {/* Quick Metrics from Server */}
          {health && (
            <div>
              <span className="cp-label">Live State Stored in Database Engine</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Events</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {health.metrics.events}
                  </div>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Applications</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {health.metrics.registrations}
                  </div>
                </div>
                <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Active Passes</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {health.metrics.passes}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Endpoint Registry List */}
          <div>
            <span className="cp-label">Active REST Endpoints (Express Engine)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { method: 'GET', path: '/api/health', desc: 'System heartbeats & memory metrics', status: '200 OK' },
                { method: 'GET', path: '/api/events', desc: 'Catalog of open & featured college events', status: '200 OK' },
                { method: 'GET', path: '/api/registrations', desc: 'Student registrations & team rosters', status: '200 OK' },
                { method: 'GET', path: '/api/passes', desc: 'HMAC-SHA256 digital student gate passes', status: '200 OK' },
                { method: 'GET', path: '/api/announcements', desc: 'Campus broadcast notifications stream', status: '200 OK' },
              ].map(ep => (
                <div
                  key={ep.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#166534',
                      background: '#dcfce7',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f172a' }}>
                      {ep.path}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Spec Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            padding: '12px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '11.5px',
            color: '#64748b'
          }}>
            <div>
              <span>Server Runtime: </span>
              <strong style={{ color: '#0f172a' }}>Node.js / Express (Port 4000)</strong>
            </div>
            <div>
              <span>Uptime: </span>
              <strong style={{ color: '#0f172a' }}>{formatUptime(health?.uptime)}</strong>
            </div>
            <div>
              <span>CORS: </span>
              <strong style={{ color: '#166534' }}>Enabled (Origin: localhost:5173)</strong>
            </div>
            <div>
              <span>Crypto Engine: </span>
              <strong style={{ color: '#0f172a' }}>HMAC-SHA256 Native</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cp-modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="cp-btn cp-btn-secondary cp-btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Pinging...' : 'Ping Server Now'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="cp-btn cp-btn-primary cp-btn-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
