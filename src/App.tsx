import React, { useState, useEffect } from 'react';
import { useCampusPass } from './context/CampusPassContext';
import { DemostackSidebar } from './components/layout/DemostackSidebar';
import { DemostackTopbar } from './components/layout/DemostackTopbar';
import { EventDiscovery } from './components/student/EventDiscovery';
import { DigitalPassWallet } from './components/student/DigitalPassWallet';
import { LunchPassView } from './components/student/LunchPassView';
import { MyApplicationsList } from './components/student/MyApplicationsList';
import { OrganizerStudio } from './components/organizer/OrganizerStudio';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { AdminPortal } from './components/admin/AdminPortal';
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Lock
} from 'lucide-react';

export const App: React.FC = () => {
  const { activePortal, institutionProfile } = useCampusPass();

  // Navigation View: DISCOVER | APPLICATIONS | ORGANIZER | ANALYTICS | ADMIN
  const [currentView, setCurrentView] = useState<string>('DISCOVER');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Sync currentView when activePortal changes externally
  useEffect(() => {
    if (activePortal === 'STUDENT' && !['DISCOVER', 'APPLICATIONS'].includes(currentView)) {
      setCurrentView('DISCOVER');
    } else if (activePortal === 'ORGANIZER') {
      setCurrentView('ORGANIZER');
    } else if (activePortal === 'ADMIN') {
      setCurrentView('ADMIN');
    }
  }, [activePortal]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  return (
    <div className="demostack-shell">
      {/* Watermelon UI: Demostack Floating Sidebar */}
      <DemostackSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Demostack Main Container */}
      <div className="ds-main">
        {/* Demostack Floating Topbar */}
        <DemostackTopbar
          currentView={currentView}
          onNavigate={handleNavigate}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Dynamic Content Surface */}
        <main className="ds-content">
          {currentView === 'DISCOVER' && (
            <EventDiscovery
              searchOverride={globalSearch}
              onOpenRegistrations={() => setCurrentView('APPLICATIONS')}
            />
          )}

          {currentView === 'APPLICATIONS' && (
            <MyApplicationsList
              onBrowseEvents={() => setCurrentView('DISCOVER')}
            />
          )}

          {currentView === 'ORGANIZER' && (
            <OrganizerStudio />
          )}

          {currentView === 'ANALYTICS' && (
            <AnalyticsDashboard />
          )}

          {currentView === 'ADMIN' && (
            <AdminPortal />
          )}

          {/* Institutional Enterprise Footer */}
          <footer style={{
            marginTop: '40px',
            borderRadius: '16px',
            border: '1px solid #166534',
            backgroundColor: '#0d3822',
            color: '#dcfce7',
            padding: '28px 24px 20px 24px'
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {/* Institution summary */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', marginBottom: '8px' }}>
                    <GraduationCap size={20} style={{ color: '#86efac' }} />
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>{institutionProfile.collegeName}</span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', lineHeight: 1.5, color: '#86efac', opacity: 0.85 }}>
                    Centralized College Event Registration, Turnstile Digital Pass Generation, and Dining Allocation Engine.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#86efac', opacity: 0.7 }}>
                    <MapPin size={13} />
                    <span>{institutionProfile.address}</span>
                  </div>
                </div>

                {/* Cryptographic Standards */}
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Security & Compliance
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: '#86efac' }} />
                      <span>HMAC-SHA256 Signed Dynamic QR Passes</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} style={{ color: '#86efac' }} />
                      <span>Atomic Anti-Duplicate Turnstile Enforcement</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: '#86efac' }} />
                      <span>Single-Use Meal Voucher Claim Engine</span>
                    </li>
                  </ul>
                </div>

                {/* Helpdesk Contacts */}
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Student Helpdesk & Support
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} style={{ color: '#86efac' }} />
                      <span>{institutionProfile.supportEmail}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} style={{ color: '#86efac' }} />
                      <span>{institutionProfile.supportPhone}</span>
                    </div>
                    <span style={{ color: '#86efac', opacity: 0.7, marginTop: '4px', fontSize: '11px' }}>
                      Operational during campus festival hours (08:30 AM - 09:00 PM IST)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '18px',
                fontSize: '11px',
                color: '#64748b'
              }}>
                <div>
                  © 2026 {institutionProfile.collegeName} • CampusPass System. All rights reserved.
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span>Privacy Regulations</span>
                  <span>•</span>
                  <span>Terms of Participation</span>
                  <span>•</span>
                  <span>Event Code of Conduct</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
