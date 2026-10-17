import React, { useState } from 'react';
import { useCampusPass } from '../../context/CampusPassContext';
import { DynamicNeuroNoise } from '@/components/ui/dynamic-neuro-noise';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Calendar,
  Ticket,
  Utensils,
  Building,
  Clock,
  Filter,
  Download,
  ArrowUpRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { events, registrations, passes, lunchPasses, institutionProfile } = useCampusPass();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Computed Metrics
  const totalRegistrations = registrations.length;
  const approvedRegistrations = registrations.filter(r => r.status === 'APPROVED').length;
  const pendingRegistrations = registrations.filter(r => r.status === 'PENDING').length;
  const waitlistedRegistrations = registrations.filter(r => r.status === 'WAITLISTED').length;
  const approvalRate = totalRegistrations > 0 ? Math.round((approvedRegistrations / totalRegistrations) * 100) : 0;

  const totalCapacity = events.reduce((acc, e) => acc + (e.capacity || 0), 0);
  const totalRegisteredSeats = events.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
  const capacityOccupancy = totalCapacity > 0 ? Math.round((totalRegisteredSeats / totalCapacity) * 100) : 0;

  const totalMealPasses = lunchPasses.length;
  const redeemedMealPasses = lunchPasses.filter(lp => lp.status === 'REDEEMED').length;
  const mealClaimRate = totalMealPasses > 0 ? Math.round((redeemedMealPasses / totalMealPasses) * 100) : 0;

  // Department breakdown
  const deptCounts: Record<string, number> = {};
  registrations.forEach(r => {
    const dept = r.department || 'General';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  // Category breakdown
  const categoryStats: Record<string, { count: number; capacity: number; registered: number }> = {};
  events.forEach(e => {
    const cat = e.category || 'TECHNICAL';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, capacity: 0, registered: 0 };
    }
    categoryStats[cat].count += 1;
    categoryStats[cat].capacity += (e.capacity || 0);
    categoryStats[cat].registered += (e.registeredCount || 0);
  });

  // Dietary breakdown
  const dietCounts: Record<string, number> = { VEG: 0, NON_VEG: 0, JAIN: 0 };
  lunchPasses.forEach(lp => {
    if (lp.dietaryPreference) {
      dietCounts[lp.dietaryPreference] = (dietCounts[lp.dietaryPreference] || 0) + 1;
    }
  });

  // Filtered Events for table
  const filteredEvents = selectedCategory === 'ALL'
    ? events
    : events.filter(e => e.category === selectedCategory);

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Title', 'Category', 'Capacity', 'Registered', 'Fill Rate %', 'Status'];
    const rows = events.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.capacity,
      e.registeredCount,
      e.capacity ? Math.round((e.registeredCount / e.capacity) * 100) : 0,
      e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campuspass_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Banner (Mid Dark Green Secondary Canvas) */}
      <div className="cp-page-hero">
        <DynamicNeuroNoise />
        <div className="cp-hero-overlay" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="cp-page-hero-tag" style={{ color: '#86efac' }}>
                <span className="cp-indicator-dot" style={{ background: '#166534' }} />
                Executive Business Intelligence
              </span>
              <span style={{ fontSize: '11px', color: '#86efac', opacity: 0.8 }}>
                Live Institutional Telemetry
              </span>
            </div>
            <h1 className="cp-page-hero-title">
              Campus Platform Analytics
            </h1>
            <p className="cp-page-hero-desc">
              Real-time audit of registrations, seat occupancy, pass issuance, and dining demand across all departments.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleExportCSV}
              className="cp-hero-pill-btn cp-hero-pill-btn-solid"
            >
              <Download size={14} />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Hero KPI Stat Strip */}
        <div className="cp-page-hero-stats">
          <div className="cp-page-hero-stat-card">
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {totalRegistrations}
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#86efac', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Applications
            </div>
          </div>
          <div className="cp-page-hero-stat-card">
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {capacityOccupancy}%
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#86efac', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Seat Occupancy
            </div>
          </div>
          <div className="cp-page-hero-stat-card">
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {passes.length}
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#86efac', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Passes Issued
            </div>
          </div>
          <div className="cp-page-hero-stat-card">
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {events.length}
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#86efac', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Published Events
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Operational KPI Cards */}
      <div className="cp-stats-grid">
        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <Users size={16} />
          </div>
          <div className="cp-stat-value">{approvedRegistrations}</div>
          <div className="cp-stat-label">Approved Attendees</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {approvalRate}% overall approval rate
          </div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={16} />
          </div>
          <div className="cp-stat-value">{pendingRegistrations}</div>
          <div className="cp-stat-label">Pending Reviews</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {waitlistedRegistrations} on waitlist roster
          </div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#14532d' }}>
            <Ticket size={16} />
          </div>
          <div className="cp-stat-value">{passes.length}</div>
          <div className="cp-stat-label">Active Digital Passes</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Cryptographically signed
          </div>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
            <Utensils size={16} />
          </div>
          <div className="cp-stat-value">{redeemedMealPasses} / {totalMealPasses}</div>
          <div className="cp-stat-label">Meal Vouchers Redeemed</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {mealClaimRate}% dining claim rate
          </div>
        </div>
      </div>

      {/* Main Grid: Department Matrix + Dietary Demand */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
        {/* Department Participation Card */}
        <div className="cp-section-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="cp-icon-box" style={{ background: '#dcfce7', color: '#166534' }}>
                <Building size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Department Participation
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Registrations categorized by academic branch
                </p>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
              {sortedDepts.length} Branches
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sortedDepts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                No registration records available yet
              </div>
            ) : (
              sortedDepts.map(([dept, count]) => {
                const pct = totalRegistrations > 0 ? Math.round((count / totalRegistrations) * 100) : 0;
                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{dept}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        {count} students <span style={{ color: '#94a3b8', fontWeight: 500 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="cp-progress">
                      <div className="cp-progress-fill" style={{ width: `${pct}%`, background: '#166534' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dietary & Catering Allocation Card */}
        <div className="cp-section-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="cp-icon-box" style={{ background: '#dcfce7', color: '#166534' }}>
                <Utensils size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Dining Allocation & Demand
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Kitchen catering procurement distribution
                </p>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
              {totalMealPasses} Coupons
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Veg Diet</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#14532d', marginTop: '4px' }}>{dietCounts.VEG || 0}</div>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                {totalMealPasses > 0 ? Math.round(((dietCounts.VEG || 0) / totalMealPasses) * 100) : 0}% share
              </span>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase' }}>Non-Veg</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b', marginTop: '4px' }}>{dietCounts.NON_VEG || 0}</div>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                {totalMealPasses > 0 ? Math.round(((dietCounts.NON_VEG || 0) / totalMealPasses) * 100) : 0}% share
              </span>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>Jain Diet</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#92400e', marginTop: '4px' }}>{dietCounts.JAIN || 0}</div>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                {totalMealPasses > 0 ? Math.round(((dietCounts.JAIN || 0) / totalMealPasses) * 100) : 0}% share
              </span>
            </div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              <ShieldCheck size={14} style={{ color: '#166534' }} />
              <span>Zero-Wastage Kitchen Forecast</span>
            </div>
            Estimated pantry inventory covers {totalMealPasses} authenticated attendees with 99.2% redemption projection during festival dining windows.
          </div>
        </div>
      </div>

      {/* Category Performance Matrix */}
      <div className="cp-section-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Event Category Capacity & Occupancy Matrix
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Performance summary across major collegiate festival tracks
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'TECHNICAL', 'HACKATHON', 'CULTURAL', 'WORKSHOP', 'SPORTS'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cp-chip${selectedCategory === cat ? ' active' : ''}`}
                style={{ fontSize: '11px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="cp-table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Venue</th>
                <th>Registered / Capacity</th>
                <th>Fill Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => {
                const fillPct = event.capacity ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
                return (
                  <tr key={event.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{event.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{event.department}</div>
                    </td>
                    <td>
                      <span className="cp-badge cp-badge-open" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                        {event.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569' }}>{event.venue}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {event.registeredCount} / {event.capacity}
                      </span>
                    </td>
                    <td style={{ minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="cp-progress" style={{ flex: 1 }}>
                          <div
                            className="cp-progress-fill"
                            style={{
                              width: `${fillPct}%`,
                              background: fillPct >= 90 ? '#b91c1c' : fillPct >= 70 ? '#166534' : '#14532d'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', width: '32px', textAlign: 'right' }}>
                          {fillPct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={event.status === 'OPEN' ? 'cp-badge cp-badge-open' : 'cp-badge cp-badge-closed'}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
