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
  ArrowRight,
  Sparkles,
  Ticket
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
        style={{
          maxWidth: '680px',
          background: '#141416',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.85)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-bleed hero banner photo */}
        <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
          <img
            src={event.bannerUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Subtle gradient vignette blending into obsidian body */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(20, 20, 22, 0.2) 0%, rgba(20, 20, 22, 0.4) 50%, #141416 100%)',
          }} />

          {/* Floating Category and Pass Policy Glass Pills on Top Left */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 5
          }}>
            <span style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {event.category}
            </span>

            {event.requiresPass !== false ? (
              <span style={{
                background: 'rgba(22, 101, 52, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(134, 239, 172, 0.3)',
                color: '#86efac',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Ticket size={12} />
                Pass Required
              </span>
            ) : (
              <span style={{
                background: 'rgba(39, 39, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#d4d4d8',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle size={12} />
                Open Entry
              </span>
            )}
          </div>

          {/* Floating circular translucent X close button on top right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '16px',
              right: '18px',
              background: 'rgba(20, 20, 22, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              transition: 'background-color 0.15s, transform 0.12s'
            }}
          >
            <X size={18} />
          </button>

          {/* Bottom Title inside hero area */}
          <div style={{ position: 'absolute', bottom: '12px', left: '24px', right: '24px' }}>
            <h2 style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '22px',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="cp-modal-body" style={{
          padding: '20px 24px 24px 24px',
          background: '#141416',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* Key Logistics strip (Dark obsidian cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            background: '#1c1c1f',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '12.5px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#86efac'
              }}>
                <Calendar size={16} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px', marginBottom: '2px' }}>
                  Date & Schedule
                </strong>
                <div style={{ color: '#d4d4d8' }}>{event.date || event.startDate}</div>
                <div style={{ color: '#a1a1aa', fontSize: '11.5px' }}>{event.startTime} - {event.endTime}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#38bdf8'
              }}>
                <MapPin size={16} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px', marginBottom: '2px' }}>
                  Venue & Room
                </strong>
                <div style={{ color: '#d4d4d8' }}>{event.venue}</div>
                <div style={{ color: '#a1a1aa', fontSize: '11.5px' }}>{event.roomLocation || 'Campus Ground'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#fbbf24'
              }}>
                <Users size={16} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px', marginBottom: '2px' }}>
                  Registration Mode
                </strong>
                <div style={{ color: '#d4d4d8' }}>
                  {event.registrationMode === 'BOTH'
                    ? 'Individual or Teams (2-4)'
                    : event.registrationMode === 'TEAM'
                    ? `Team Only (${event.minTeamSize}-${event.maxTeamSize} members)`
                    : 'Individual Registration'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#f472b6'
              }}>
                <Utensils size={16} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px', marginBottom: '2px' }}>
                  Catering Included
                </strong>
                <div style={{ color: '#d4d4d8' }}>
                  {event.includesLunch ? 'Lunch Voucher Provided' : 'No meal pass included'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', gridColumn: 'span 2' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: event.requiresPass !== false ? '#86efac' : '#a1a1aa'
              }}>
                {event.requiresPass !== false ? <Mail size={16} /> : <CheckCircle size={16} />}
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px', marginBottom: '2px' }}>
                  Pass Delivery Policy
                </strong>
                <div style={{ color: event.requiresPass !== false ? '#86efac' : '#a1a1aa', fontWeight: 600 }}>
                  {event.requiresPass !== false
                    ? 'Official Smart Pass will be sent directly to your registered email upon confirmation.'
                    : 'Open Entry Event — No gate pass or email verification needed.'}
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div style={{
            background: '#1c1c1f',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: '#e4e4e7' }}>
                Seat Availability: <strong style={{ color: '#ffffff' }}>{event.registeredCount} / {event.capacity}</strong> registered
              </span>
              <span style={{ fontWeight: 700, color: isFull ? '#ef4444' : '#86efac' }}>
                {isFull ? (isWaitlist ? 'Waitlist Open' : 'Event Full') : `${event.capacity - event.registeredCount} spots available`}
              </span>
            </div>
            <div style={{
              height: '8px',
              background: '#27272a',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: '9999px',
                  width: `${percentFilled}%`,
                  background: isFull
                    ? '#ef4444'
                    : percentFilled > 80
                    ? '#f59e0b'
                    : 'linear-gradient(90deg, #166534 0%, #22c55e 100%)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          {/* Overview / Description */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              About the Event
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#d4d4d8', lineHeight: 1.65 }}>
              {event.description}
            </p>
          </div>

          {/* Rules and Guidelines */}
          {event.rules && event.rules.length > 0 && (
            <div style={{
              background: '#1c1c1f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px 16px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 800, color: '#ffffff' }}>
                Rules & Participation Guidelines
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '12.5px',
                color: '#d4d4d8',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {event.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility Criteria */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              Eligibility Criteria
            </h4>
            <div style={{
              fontSize: '12.5px',
              color: '#d4d4d8',
              background: '#1c1c1f',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {event.eligibilityCriteria || 'Open to all registered undergraduate and postgraduate students.'}
            </div>
          </div>

          {/* FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                Frequently Asked Questions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {event.faqs.map((faq, i) => (
                  <div key={i} style={{
                    background: '#1c1c1f',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{faq.q}</div>
                    <div style={{ color: '#a1a1aa', lineHeight: 1.5 }}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizer Contact */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '14px',
            fontSize: '12px',
            color: '#a1a1aa'
          }}>
            <span>Organizer: <strong style={{ color: '#ffffff' }}>{event.organizerName}</strong> ({event.department})</span>
            <div style={{ display: 'flex', gap: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mail size={13} style={{ color: '#86efac' }} /> {event.contactEmail}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={13} style={{ color: '#86efac' }} /> {event.contactPhone}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="cp-modal-footer" style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#141416',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e4e4e7',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
          >
            Close
          </button>

          {hasRegistered ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(22, 101, 52, 0.25)',
              color: '#86efac',
              border: '1px solid rgba(134, 239, 172, 0.35)',
              fontSize: '13px',
              fontWeight: 700
            }}>
              <CheckCircle size={15} />
              Already Applied
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRegisterClick(event);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                background: '#166534',
                color: '#ffffff',
                border: '1px solid #166534',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22, 101, 52, 0.4)',
                transition: 'background-color 0.15s, transform 0.1s'
              }}
            >
              {isWaitlist ? 'Join Waitlist' : isFull ? 'Event Full' : 'Apply & Register Now'}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
