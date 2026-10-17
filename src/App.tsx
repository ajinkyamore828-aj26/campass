import React, { useState, useEffect } from 'react';
import { useCampusPass } from './context/CampusPassContext';
import { DemostackTopbar } from './components/layout/DemostackTopbar';
import { EventDiscovery } from './components/student/EventDiscovery';
import { DigitalPassWallet } from './components/student/DigitalPassWallet';
import { LunchPassView } from './components/student/LunchPassView';
import { MyApplicationsList } from './components/student/MyApplicationsList';
import { OrganizerStudio } from './components/organizer/OrganizerStudio';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { AdminPortal } from './components/admin/AdminPortal';
import { LandingPage } from './components/landing/LandingPage';

export const App: React.FC = () => {
  const { activePortal } = useCampusPass();

  const getViewFromHash = (hash: string): string => {
    const clean = hash.replace('#', '').toLowerCase();
    if (['events', 'discover'].includes(clean)) return 'DISCOVER';
    if (['passes', 'applications'].includes(clean)) return 'APPLICATIONS';
    if (['organizer'].includes(clean)) return 'ORGANIZER';
    if (['analytics'].includes(clean)) return 'ANALYTICS';
    if (['admin'].includes(clean)) return 'ADMIN';
    return 'LANDING';
  };

  const getHashForView = (view: string): string => {
    switch (view) {
      case 'DISCOVER':
        return '#events';
      case 'APPLICATIONS':
        return '#passes';
      case 'ORGANIZER':
        return '#organizer';
      case 'ANALYTICS':
        return '#analytics';
      case 'ADMIN':
        return '#admin';
      case 'LANDING':
      default:
        return '#campuspass';
    }
  };

  // Navigation View: LANDING | DISCOVER | APPLICATIONS | ORGANIZER | ANALYTICS | ADMIN
  const [currentView, setCurrentView] = useState<string>(() => {
    return getViewFromHash(window.location.hash);
  });
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const initialView = getViewFromHash(window.location.hash);
    const initialHash = getHashForView(initialView);
    // Normalize URL: replaces stale hash (e.g. #contact) immediately with #campuspass
    window.history.replaceState({ view: initialView }, '', initialHash);

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        const view = getViewFromHash(window.location.hash);
        setCurrentView(view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: string) => {
    if (view === currentView) return;
    const targetHash = getHashForView(view);
    window.history.pushState({ view }, '', targetHash);
    setCurrentView(view);
  };

  // Sync currentView when activePortal changes externally and enforce RBAC
  useEffect(() => {
    const isManager = activePortal === 'ADMIN' || activePortal === 'ORGANIZER';
    if (activePortal === 'STUDENT' && !['DISCOVER', 'APPLICATIONS', 'LANDING'].includes(currentView)) {
      handleNavigate('DISCOVER');
    } else if (isManager && !['DISCOVER', 'ORGANIZER', 'ADMIN', 'ANALYTICS', 'APPLICATIONS', 'LANDING'].includes(currentView)) {
      handleNavigate('DISCOVER');
    }
  }, [activePortal]);

  // ── Standalone Landing Page View (NO Dashboard Shell, NO Sidebar, NO Topbar) ──
  if (currentView === 'LANDING') {
    return (
      <LandingPage
        onExploreEvents={() => handleNavigate('DISCOVER')}
        onNavigate={handleNavigate}
      />
    );
  }

  // ── CampusPass Platform Dashboard ─────────────────────────────────────────────
  return (
    <div className="demostack-shell">
      {/* Demostack Main Container (Full width) */}
      <div className="ds-main">
        {/* Demostack Topbar with Animated Hamburger Nav + Portal Switcher + Notifications */}
        <DemostackTopbar
          currentView={currentView}
          onNavigate={handleNavigate}
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
        </main>
      </div>
    </div>
  );
};
