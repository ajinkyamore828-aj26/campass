import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  CampusEvent, 
  CampusRegistration, 
  DigitalEventPass, 
  LunchPass, 
  CampusUser, 
  ScanLog, 
  AuditLog, 
  CampusAnnouncement, 
  ActivePortal, 
  UserRole,
  InstitutionProfile
} from '../types';

interface CampusPassContextType {
  activePortal: ActivePortal;
  setActivePortal: (portal: ActivePortal) => void;
  currentUser: CampusUser;
  switchUserRole: (role: UserRole) => void;
  
  // Data
  events: CampusEvent[];
  selectedEvent: CampusEvent | null;
  setSelectedEvent: (event: CampusEvent | null) => void;
  registrations: CampusRegistration[];
  passes: DigitalEventPass[];
  lunchPasses: LunchPass[];
  users: CampusUser[];
  scanLogs: ScanLog[];
  auditLogs: AuditLog[];
  announcements: CampusAnnouncement[];
  institutionProfile: InstitutionProfile;

  // Actions
  submitRegistration: (data: Partial<CampusRegistration>) => Promise<{ success: boolean; message: string; data?: CampusRegistration }>;
  approveRegistration: (id: string, reviewerName?: string) => Promise<{ success: boolean; message: string }>;
  rejectRegistration: (id: string, reason: string, reviewerName?: string) => Promise<{ success: boolean; message: string }>;
  cancelRegistration: (id: string) => Promise<{ success: boolean; message: string }>;
  resendEmailPass: (id: string) => Promise<{ success: boolean; message: string }>;
  
  createEvent: (data: Partial<CampusEvent>) => Promise<{ success: boolean; data?: CampusEvent }>;
  updateEvent: (id: string, data: Partial<CampusEvent>) => Promise<{ success: boolean; data?: CampusEvent }>;

  revokePass: (id: string, reason: string) => Promise<{ success: boolean; message: string }>;
  reissuePass: (id: string) => Promise<{ success: boolean; message: string; pass?: DigitalEventPass }>;

  verifyLunchPass: (qrToken: string, counterName?: string, operatorName?: string) => Promise<{ success: boolean; result: string; message: string; data?: LunchPass }>;
  verifyGateEntry: (qrToken: string, gateName?: string, operatorName?: string, eventId?: string) => Promise<{ success: boolean; result: string; message: string; data?: DigitalEventPass }>;

  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean }>;
  toggleUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED') => Promise<{ success: boolean }>;
  createUser: (user: Partial<CampusUser>) => Promise<{ success: boolean; data?: CampusUser }>;

  publishAnnouncement: (data: Partial<CampusAnnouncement>) => Promise<{ success: boolean; data?: CampusAnnouncement }>;
  refreshData: () => Promise<void>;
}

const CampusPassContext = createContext<CampusPassContextType | undefined>(undefined);

export const CampusPassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePortal, setActivePortal] = useState<ActivePortal>('STUDENT');

  const institutionProfile: InstitutionProfile = {
    collegeName: 'Apex Institute of Science & Technology',
    collegeCode: 'AIST-CAMPUS',
    tagline: 'College Event Registration & Digital Pass Management System',
    supportEmail: 'events@apex.edu',
    supportPhone: '+91 98765 01001',
    timezone: 'Asia/Kolkata',
    address: 'Apex Knowledge City, Sector 4, University Enclave',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Mechanical & Robotics Engineering',
      'Electronics & Communication',
      'Humanities & Cultural Council',
      'Law & Governance',
      'Physical Education & Sports'
    ],
    eventCategories: [
      'HACKATHON',
      'IDEATHON',
      'CODING_COMPETITION',
      'APTITUDE',
      'CULTURAL',
      'FRESHER_PARTY',
      'BOOTCAMP',
      'CAMPUS_DRIVE',
      'SEMINAR',
      'TECHNICAL',
      'SPORTS',
      'WORKSHOP',
      'LITERARY',
      'MANAGEMENT',
      'GENERAL'
    ]
  };

  const [users, setUsers] = useState<CampusUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CampusUser>({
    id: 'USR-STU-01',
    fullName: 'Ajinkya More',
    email: 'ajinkya.more@apex.edu',
    studentId: 'STU-2023-CS-041',
    department: 'Computer Science & Engineering',
    academicYear: '3rd Year',
    phone: '+91 98234 11001',
    role: 'STUDENT',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-08-01T10:00:00Z'
  });

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [registrations, setRegistrations] = useState<CampusRegistration[]>([]);
  const [passes, setPasses] = useState<DigitalEventPass[]>([]);
  const [lunchPasses, setLunchPasses] = useState<LunchPass[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);

  // Fetch data from backend
  const refreshData = async () => {
    try {
      const [
        evRes, 
        regRes, 
        passRes, 
        lunchRes, 
        userRes, 
        scanRes, 
        auditRes, 
        annRes
      ] = await Promise.all([
        fetch('/api/events').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/registrations').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/passes').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/lunch/passes').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/users').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/scanner/logs').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/admin/audit-logs').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/announcements').then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      if (evRes.data) setEvents(evRes.data);
      if (regRes.data) setRegistrations(regRes.data);
      if (passRes.data) setPasses(passRes.data);
      if (lunchRes.data) setLunchPasses(lunchRes.data);
      if (userRes.data) {
        setUsers(userRes.data);
        // Sync currentUser if updated
        const match = userRes.data.find((u: CampusUser) => u.id === currentUser.id);
        if (match) setCurrentUser(match);
      }
      if (scanRes.data) setScanLogs(scanRes.data);
      if (auditRes.data) setAuditLogs(auditRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } catch (err) {
      console.warn('Backend sync failed, using loaded state', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const switchUserRole = (newRole: UserRole) => {
    const match = users.find(u => u.role === newRole);
    if (match) {
      setCurrentUser(match);
    } else {
      setCurrentUser({
        ...currentUser,
        role: newRole,
        fullName: newRole === 'ADMIN' ? 'Dr. Rajesh Sharma' : newRole === 'ORGANIZER' ? 'Prof. Ananya Sen' : newRole === 'VOLUNTEER' ? 'Rohan Mehra' : 'Ajinkya More',
        studentId: newRole === 'STUDENT' ? 'STU-2023-CS-041' : undefined
      });
    }
    setActivePortal(newRole);
  };

  const submitRegistration = async (data: Partial<CampusRegistration>) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const approveRegistration = async (id: string, reviewerName?: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName: reviewerName || currentUser.fullName })
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const rejectRegistration = async (id: string, reason: string, reviewerName?: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, reviewerName: reviewerName || currentUser.fullName })
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const cancelRegistration = async (id: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const resendEmailPass = async (id: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to resend pass email' };
    }
  };

  const createEvent = async (data: Partial<CampusEvent>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateEvent = async (id: string, data: Partial<CampusEvent>) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const revokePass = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/passes/${id}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const reissuePass = async (id: string) => {
    try {
      const res = await fetch(`/api/passes/${id}/reissue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const verifyLunchPass = async (qrToken: string, counterName?: string, operatorName?: string) => {
    try {
      const res = await fetch('/api/lunch/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken,
          counterName: counterName || 'Dining Hall Station B',
          operatorName: operatorName || currentUser.fullName
        })
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, result: 'ERROR', message: err.message };
    }
  };

  const verifyGateEntry = async (qrToken: string, gateName?: string, operatorName?: string, eventId?: string) => {
    try {
      const res = await fetch('/api/scanner/verify-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken,
          gateName: gateName || 'Gate 1 (Main Entrance)',
          operatorName: operatorName || currentUser.fullName,
          eventId
        })
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, result: 'ERROR', message: err.message };
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      await refreshData();
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  };

  const toggleUserStatus = async (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await refreshData();
      return { success: res.ok };
    } catch {
      return { success: false };
    }
  };

  const createUser = async (user: Partial<CampusUser>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const publishAnnouncement = async (data: Partial<CampusAnnouncement>) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      await refreshData();
      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return (
    <CampusPassContext.Provider
      value={{
        activePortal,
        setActivePortal,
        currentUser,
        switchUserRole,
        events,
        selectedEvent,
        setSelectedEvent,
        registrations,
        passes,
        lunchPasses,
        users,
        scanLogs,
        auditLogs,
        announcements,
        institutionProfile,
        submitRegistration,
        approveRegistration,
        rejectRegistration,
        cancelRegistration,
        resendEmailPass,
        createEvent,
        updateEvent,
        revokePass,
        reissuePass,
        verifyLunchPass,
        verifyGateEntry,
        updateUserRole,
        toggleUserStatus,
        createUser,
        publishAnnouncement,
        refreshData
      }}
    >
      {children}
    </CampusPassContext.Provider>
  );
};

export const useCampusPass = (): CampusPassContextType => {
  const context = useContext(CampusPassContext);
  if (!context) {
    throw new Error('useCampusPass must be used within a CampusPassProvider');
  }
  return context;
};
