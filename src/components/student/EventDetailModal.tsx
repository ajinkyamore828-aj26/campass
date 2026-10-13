import React from 'react';
import type { CampusEvent } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Utensils,
  HelpCircle,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface EventDetailModalProps {
  event: CampusEvent;
  onClose: () => void;
  onRegisterClick: (event: CampusEvent) => void;
  hasRegistered?: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onRegisterClick,
  hasRegistered = false
}) => {
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isFull = event.registeredCount >= event.capacity;
  const isWaitlist = isFull && event.registeredCount < (event.capacity + event.waitlistLimit);

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner image with category pill */}
        <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
          <img
            src={event.bannerUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.2) 60%)',
          }} />

          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ position: 'absolute', bottom: '12px', left: '18px', right: '18px' }}>
            <span style={{
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {event.category}
            </span>
            <h2 style={{ color: '#ffffff', margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, lineHeight: 1.25 }}>
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Logistics strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Calendar size={15} style={{ color: '#0284c7', marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>Date & Schedule</strong>
                <div style={{ color: '#64748b' }}>{event.date || event.startDate}</div>
                <div style={{ color: '#64748b' }}>{event.startTime} - {event.endTime}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={15} style={{ color: '#d97706', marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>Venue & Room</strong>
                <div style={{ color: '#64748b' }}>{event.venue}</div>
                <div style={{ color: '#64748b' }}>{event.roomLocation || 'Campus Ground'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Users size={15} style={{ color: '#0f766e', marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>Registration Mode</strong>
                <div style={{ color: '#64748b' }}>
                  {event.registrationMode === 'BOTH' ? 'Individual or Teams (2-4)' : event.registrationMode === 'TEAM' ? `Team Only (${event.minTeamSize}-${event.maxTeamSize} members)` : 'Individual Registration'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Utensils size={15} style={{ color: '#b45309', marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>Catering Included</strong>
                <div style={{ color: '#64748b' }}>
                  {event.includesLunch ? 'Complimentary Lunch Voucher Issued' : 'No meal pass included'}
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>
                Seat Availability: <strong>{event.registeredCount} / {event.capacity}</strong> registered
              </span>
              <span style={{ fontWeight: 700, color: isFull ? '#b91c1c' : '#0284c7' }}>
                {isFull ? (isWaitlist ? 'Waitlist Open' : 'Event Full') : `${event.capacity - event.registeredCount} spots available`}
              </span>
            </div>
            <div className="cp-progress">
              <div
                className={`cp-progress-fill${isFull ? ' danger' : percentFilled > 80 ? ' warning' : ''}`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>

          {/* Overview / Description */}
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              About the Event
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
              {event.description}
            </p>
          </div>

          {/* Rules and Guidelines */}
          {event.rules && event.rules.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                Rules & Participation Guidelines
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {event.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility Criteria */}
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              Eligibility
            </h4>
            <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {event.eligibilityCriteria || 'Open to all registered undergraduate and postgraduate students.'}
            </div>
          </div>

          {/* FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                Frequently Asked Questions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {event.faqs.map((faq, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{faq.q}</div>
                    <div style={{ color: '#64748b' }}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizer Contact */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: '#64748b' }}>
            <span>Organizer: <strong>{event.organizerName}</strong> ({event.department})</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} /> {event.contactEmail}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {event.contactPhone}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="cp-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="cp-btn cp-btn-outline"
          >
            Close
          </button>

          {hasRegistered ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              fontSize: '12.5px',
              fontWeight: 700
            }}>
              <CheckCircle size={14} />
              Already Applied
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegisterClick(event);
              }}
              className="cp-btn cp-btn-primary"
            >
              {isWaitlist ? 'Join Waitlist' : isFull ? 'Event Full' : 'Apply & Register Now'}
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
