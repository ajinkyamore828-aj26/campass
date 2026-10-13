import React, { useState } from 'react';
import type { CampusEvent } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { EventDiscovery } from './EventDiscovery';
import { EventDetailModal } from './EventDetailModal';
import { EventRegistrationModal } from './EventRegistrationModal';
import { DigitalPassWallet } from './DigitalPassWallet';
import { LunchPassView } from './LunchPassView';
import { MyApplicationsList } from './MyApplicationsList';
import { 
  Compass, 
  Ticket, 
  Utensils, 
  FileText,
  CheckCircle,
  Bell
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { passes, lunchPasses, registrations, currentUser, announcements } = useCampusPass();

  const [activeSubTab, setActiveSubTab] = useState<'DISCOVER' | 'PASSES' | 'LUNCH' | 'APPLICATIONS'>('DISCOVER');
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<CampusEvent | null>(null);
  const [registeringEvent, setRegisteringEvent] = useState<CampusEvent | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const studentPasses = passes.filter(p => p.studentId === currentUser.studentId);
  const studentLunchPasses = lunchPasses.filter(lp => lp.studentId === currentUser.studentId);
  const studentRegs = registrations.filter(r => r.studentId === currentUser.studentId);

  const handleRegistrationSuccess = (regId: string) => {
    setRegisteringEvent(null);
    setSuccessToast('Application submitted successfully! Check your pass wallet or applications list.');
    setActiveSubTab('PASSES');
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast alert if any */}
      {successToast && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: 'var(--success)',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Announcements Bar if any active announcements */}
      {announcements.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(217, 119, 6, 0.08)',
          border: '1px solid rgba(217, 119, 6, 0.25)',
          color: 'var(--text-main)',
          fontSize: '12px'
        }}>
          <Bell size={15} style={{ color: '#d97706', flexShrink: 0 }} />
          <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong>Announcement:</strong> {announcements[0].title} — {announcements[0].message}
          </div>
        </div>
      )}

      {/* Subtab Navigation Strip (Watermelon UI Segmented Control) */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px',
        borderRadius: '14px',
        backgroundColor: '#f1f5f9',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xs)',
        overflowX: 'auto',
        alignSelf: 'flex-start'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('DISCOVER')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'DISCOVER' ? 700 : 500,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeSubTab === 'DISCOVER' ? '#0f172a' : 'transparent',
            color: activeSubTab === 'DISCOVER' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Compass size={15} />
          <span>Explore Events</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('PASSES')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'PASSES' ? 700 : 500,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeSubTab === 'PASSES' ? '#0f172a' : 'transparent',
            color: activeSubTab === 'PASSES' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Ticket size={15} />
          <span>Digital Passes</span>
          {studentPasses.length > 0 && (
            <span style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeSubTab === 'PASSES' ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
              color: activeSubTab === 'PASSES' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700
            }}>
              {studentPasses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('LUNCH')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'LUNCH' ? 700 : 500,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeSubTab === 'LUNCH' ? '#0f172a' : 'transparent',
            color: activeSubTab === 'LUNCH' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Utensils size={15} />
          <span>Meal Passes</span>
          {studentLunchPasses.length > 0 && (
            <span style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeSubTab === 'LUNCH' ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
              color: activeSubTab === 'LUNCH' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700
            }}>
              {studentLunchPasses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('APPLICATIONS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'APPLICATIONS' ? 700 : 500,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeSubTab === 'APPLICATIONS' ? '#0f172a' : 'transparent',
            color: activeSubTab === 'APPLICATIONS' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={15} />
          <span>My Applications</span>
          {studentRegs.length > 0 && (
            <span style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: activeSubTab === 'APPLICATIONS' ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
              color: activeSubTab === 'APPLICATIONS' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700
            }}>
              {studentRegs.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeSubTab === 'DISCOVER' && (
          <EventDiscovery
            onSelectEvent={(event) => setSelectedDetailEvent(event)}
            onRegisterEvent={(event) => setRegisteringEvent(event)}
          />
        )}

        {activeSubTab === 'PASSES' && (
          <DigitalPassWallet
            onBrowseEvents={() => setActiveSubTab('DISCOVER')}
          />
        )}

        {activeSubTab === 'LUNCH' && (
          <LunchPassView />
        )}

        {activeSubTab === 'APPLICATIONS' && (
          <MyApplicationsList
            onOpenPassWallet={() => setActiveSubTab('PASSES')}
            onBrowseEvents={() => setActiveSubTab('DISCOVER')}
          />
        )}
      </div>

      {/* Event Logistics Modal */}
      {selectedDetailEvent && (
        <EventDetailModal
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
          onRegisterClick={(event) => {
            setSelectedDetailEvent(null);
            setRegisteringEvent(event);
          }}
          hasRegistered={registrations.some(
            r => r.eventId === selectedDetailEvent.id && r.studentId === currentUser.studentId && r.status !== 'CANCELLED'
          )}
        />
      )}

      {/* Event Registration Modal */}
      {registeringEvent && (
        <EventRegistrationModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};
