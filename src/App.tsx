import React, { useState, useEffect, useCallback } from 'react';
import { useCampusPass } from './context/CampusPassContext';
import { StudentPortalLayout } from './components/student/StudentPortalLayout';
import { AdminPortalLayout } from './components/admin/AdminPortalLayout';
import { LandingPage } from './components/landing/LandingPage';
import { SidebarDemo } from './components/ui/demo';
import Auth8 from './components/ui/auth-8';

interface ParsedRoute {
  portal: 'LANDING' | 'STUDENT' | 'ADMIN' | 'SIDEBAR_DEMO' | 'LOGIN';
  view: string;
  path: string;
}

const parseRoute = (pathname: string, hash: string): ParsedRoute => {
  const normalizedPath = pathname.toLowerCase();
  const normalizedHash = hash.replace(/^#/, '').toLowerCase();

  // 0. Dedicated Login routing: /login, /login/student, /login/admin
  if (normalizedPath === '/login/student' || normalizedPath === '/login/student/') {
    return { portal: 'LOGIN', view: 'STUDENT', path: '/login/student' };
  }
  if (normalizedPath === '/login/admin' || normalizedPath === '/login/admin/') {
    return { portal: 'LOGIN', view: 'ADMIN', path: '/login/admin' };
  }
  if (normalizedPath === '/login' || normalizedPath === '/login/' || normalizedPath === '/auth' || normalizedPath === '/auth/') {
    return { portal: 'LOGIN', view: 'STUDENT', path: '/login' };
  }
  if (normalizedHash === 'login-student') {
    return { portal: 'LOGIN', view: 'STUDENT', path: '/login/student' };
  }
  if (normalizedHash === 'login-admin') {
    return { portal: 'LOGIN', view: 'ADMIN', path: '/login/admin' };
  }

  // 0. Sidebar Demo routing: /sidebar or /demo
  if (
    normalizedPath === '/sidebar' ||
    normalizedPath === '/sidebar/' ||
    normalizedPath === '/demo' ||
    normalizedPath === '/demo/' ||
    normalizedHash === 'sidebar'
  ) {
    return { portal: 'SIDEBAR_DEMO', view: 'SIDEBAR_DEMO', path: '/sidebar' };
  }

  // 1. Direct pathname routing: /admin
  if (normalizedPath === '/admin' || normalizedPath === '/admin/') {
    return { portal: 'ADMIN', view: 'ADMIN', path: '/admin' };
  }
  if (normalizedPath === '/admin/events' || normalizedPath === '/admin/discover') {
    return { portal: 'ADMIN', view: 'DISCOVER', path: '/admin/events' };
  }
  if (normalizedPath === '/admin/organizer') {
    return { portal: 'ADMIN', view: 'ORGANIZER', path: '/admin/organizer' };
  }
  if (normalizedPath === '/admin/analytics') {
    return { portal: 'ADMIN', view: 'ANALYTICS', path: '/admin/analytics' };
  }
  if (normalizedPath.startsWith('/admin')) {
    return { portal: 'ADMIN', view: 'ADMIN', path: '/admin' };
  }

  // 2. Direct pathname routing: /students or /student
  if (
    normalizedPath === '/students' ||
    normalizedPath === '/students/' ||
    normalizedPath === '/student' ||
    normalizedPath === '/student/'
  ) {
    return { portal: 'STUDENT', view: 'DISCOVER', path: '/students' };
  }
  if (
    normalizedPath === '/students/applications' ||
    normalizedPath === '/students/passes' ||
    normalizedPath === '/student/applications' ||
    normalizedPath === '/student/passes'
  ) {
    return { portal: 'STUDENT', view: 'APPLICATIONS', path: '/students/applications' };
  }
  if (normalizedPath.startsWith('/students') || normalizedPath.startsWith('/student')) {
    return { portal: 'STUDENT', view: 'DISCOVER', path: '/students' };
  }

  // 3. Fallback for hash navigations from bookmarks or older references
  if (normalizedHash === 'admin') {
    return { portal: 'ADMIN', view: 'ADMIN', path: '/admin' };
  }
  if (normalizedHash === 'organizer') {
    return { portal: 'ADMIN', view: 'ORGANIZER', path: '/admin/organizer' };
  }
  if (normalizedHash === 'analytics') {
    return { portal: 'ADMIN', view: 'ANALYTICS', path: '/admin/analytics' };
  }
  if (['events', 'discover'].includes(normalizedHash)) {
    return { portal: 'STUDENT', view: 'DISCOVER', path: '/students' };
  }
  if (['passes', 'applications'].includes(normalizedHash)) {
    return { portal: 'STUDENT', view: 'APPLICATIONS', path: '/students/applications' };
  }

  // 4. Default to Welcome Landing Page (/)
  return { portal: 'LANDING', view: 'LANDING', path: '/' };
};

export const App: React.FC = () => {
  const { activePortal, setActivePortal, currentUser, switchUserRole } = useCampusPass();

  const [route, setRoute] = useState<ParsedRoute>(() => {
    return parseRoute(window.location.pathname, window.location.hash);
  });

  // Handle browser back/forward buttons (popstate) & initial URL normalization
  useEffect(() => {
    const initialRoute = parseRoute(window.location.pathname, window.location.hash);
    if (window.location.hash && window.location.pathname === '/') {
      // Normalize URL path cleanly
      window.history.replaceState(
        { path: initialRoute.path, view: initialRoute.view, portal: initialRoute.portal },
        '',
        initialRoute.path
      );
    }

    const handlePopState = () => {
      const current = parseRoute(window.location.pathname, window.location.hash);
      setRoute(current);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize RBAC role & context when portal changes
  useEffect(() => {
    if (route.portal === 'ADMIN') {
      if (activePortal !== 'ADMIN') {
        setActivePortal('ADMIN');
      }
      if (currentUser.role !== 'ADMIN') {
        switchUserRole('ADMIN');
      }
    } else if (route.portal === 'STUDENT') {
      if (activePortal !== 'STUDENT') {
        setActivePortal('STUDENT');
      }
      if (currentUser.role !== 'STUDENT') {
        switchUserRole('STUDENT');
      }
    }
  }, [route.portal, activePortal, currentUser.role, setActivePortal, switchUserRole]);

  // Centralized navigation handler
  const handleNavigate = useCallback((view: string, customPath?: string) => {
    let targetPath = customPath;

    if (!targetPath) {
      if (view === 'LANDING') {
        targetPath = '/';
      } else if (view === 'ADMIN') {
        targetPath = '/admin';
      } else if (view === 'ORGANIZER') {
        targetPath = '/admin/organizer';
      } else if (view === 'ANALYTICS') {
        targetPath = '/admin/analytics';
      } else if (view === 'APPLICATIONS') {
        targetPath = '/students/applications';
      } else if (view === 'DISCOVER') {
        targetPath = route.portal === 'ADMIN' ? '/admin/events' : '/students';
      } else if (view === 'LOGIN_STUDENT') {
        targetPath = '/login/student';
      } else if (view === 'LOGIN_ADMIN') {
        targetPath = '/login/admin';
      } else if (view === 'LOGIN') {
        targetPath = '/login';
      } else if (view === 'SIDEBAR_DEMO') {
        targetPath = '/sidebar';
      } else {
        targetPath = '/';
      }
    }

    const nextRoute = parseRoute(targetPath, '');
    if (window.location.pathname !== nextRoute.path) {
      window.history.pushState(
        { path: nextRoute.path, view: nextRoute.view, portal: nextRoute.portal },
        '',
        nextRoute.path
      );
    }
    setRoute(nextRoute);
  }, [route.portal]);

  // 0. Dedicated Login Page (Auth8 Component for Student and Admin)
  if (route.portal === 'LOGIN') {
    return (
      <Auth8
        initialRole={route.view === 'ADMIN' ? 'ADMIN' : 'STUDENT'}
        onLoginSuccess={(role) => {
          if (role === 'ADMIN') {
            handleNavigate('ADMIN', '/admin');
          } else {
            handleNavigate('DISCOVER', '/students');
          }
        }}
        onBack={() => handleNavigate('LANDING', '/')}
      />
    );
  }

  // 1. Dedicated Sidebar Demo Showcase
  if (route.portal === 'SIDEBAR_DEMO') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col gap-6">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate('LANDING', '/')}
              className="cp-btn cp-btn-secondary cp-btn-sm"
              style={{ cursor: 'pointer' }}
            >
              ← Back to CampusPass
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Aceternity Animated Sidebar Showcase</h1>
              <p className="text-xs text-neutral-400">Desktop hover-expandable (60px ↔ 300px) & mobile responsive drawer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">Component: <code className="text-neutral-200">/components/ui/sidebar.tsx</code></span>
          </div>
        </div>
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center">
          <SidebarDemo />
        </div>
      </div>
    );
  }

  // 2. Admin Portal Layout: Dedicated /admin Route
  if (route.portal === 'ADMIN') {
    return (
      <AdminPortalLayout
        currentView={route.view}
        onNavigate={handleNavigate}
      />
    );
  }

  // 3. Student Portal Layout: Dedicated /students Route
  if (route.portal === 'STUDENT') {
    return (
      <StudentPortalLayout
        currentView={route.view}
        onNavigate={handleNavigate}
      />
    );
  }

  // 4. Welcome Landing Page: Root (/) Route
  return (
    <LandingPage
      onExploreEvents={() => handleNavigate('LOGIN_STUDENT', '/login/student')}
      onNavigate={handleNavigate}
    />
  );
};

export default App;
