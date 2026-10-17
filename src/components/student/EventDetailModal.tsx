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
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Ticket,
  Trophy
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
        {/* Full-bleed hero banner photo (Pinned top, flexShrink: 0) */}
        <div style={{ position: 'relative', height: '180px', width: '100%', flexShrink: 0, overflow: 'hidden' }}>
          <img
            src={event.bannerUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Subtle gradient vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(20, 20, 22, 0.25) 0%, rgba(20, 20, 22, 0.5) 60%, #141416 100%)',
          }} />

          {/* Floating Category and Pass Policy Glass Pills on Top Left */}
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 5
          }}>
            <span style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '3px 9px',
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
                border: '1px solid rgba(134, 239, 172, 0.35)',
                color: '#86efac',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Ticket size={11} />
                Pass Required
              </span>
            ) : (
              <span style={{
                background: 'rgba(39, 39, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#d4d4d8',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle size={11} />
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
              top: '14px',
              right: '16px',
              background: 'rgba(20, 20, 22, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              transition: 'background-color 0.15s, transform 0.12s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Modal Body (All content fits and scrolls cleanly with zero clipping!) */}
        <div className="cp-modal-body" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingTop: '6px'
        }}>
          {/* Urgent Reschedule / Delay Notification Alert */}
          {event.scheduleUpdate?.isRescheduled && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.45) 0%, rgba(69, 26, 3, 0.65) 100%)',
              border: '1px solid rgba(253, 224, 71, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#fde047" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fde047', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Official Notice: Schedule Updated / Delayed
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#fef08a', lineHeight: 1.45 }}>
                {event.scheduleUpdate.reason}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#d4d4d8', marginTop: '4px', flexWrap: 'wrap' }}>
                <span>
                  Revised Date: <strong style={{ color: '#86efac' }}>{event.date} ({event.startTime} - {event.endTime})</strong>
                </span>
                {event.scheduleUpdate.originalDate && (
                  <span>
                    Original Date: <span style={{ color: '#a1a1aa', textDecoration: 'line-through' }}>{event.scheduleUpdate.originalDate} ({event.scheduleUpdate.originalStartTime})</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Title Header with Organizer Metadata */}
          <div>
            <h2 style={{
              color: '#ffffff',
              margin: '0 0 6px 0',
              fontSize: '20px',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              {event.title}
            </h2>
            <div style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Organized by <strong style={{ color: '#ffffff' }}>{event.organizerName}</strong></span>
              <span>•</span>
              <span style={{ color: '#86efac' }}>{event.department}</span>
            </div>
          </div>

          {/* Key Logistics strip (Dark obsidian cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '10px',
            background: '#1c1c1f',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '14px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#86efac'
              }}>
                <Calendar size={15} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Date & Schedule
                </strong>
                <div style={{ color: '#d4d4d8' }}>{event.date || event.startDate}</div>
                <div style={{ color: '#a1a1aa', fontSize: '11px' }}>{event.startTime} - {event.endTime}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#38bdf8'
              }}>
                <MapPin size={15} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Venue & Room
                </strong>
                <div style={{ color: '#d4d4d8' }}>{event.venue}</div>
                <div style={{ color: '#a1a1aa', fontSize: '11px' }}>{event.roomLocation || 'Campus Ground'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#fbbf24'
              }}>
                <Users size={15} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
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

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: '#f472b6'
              }}>
                <Utensils size={15} />
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Catering Included
                </strong>
                <div style={{ color: '#d4d4d8' }}>
                  {event.includesLunch ? 'Lunch Voucher Provided' : 'No meal pass included'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', gridColumn: '1 / -1' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '6px',
                color: event.requiresPass !== false ? '#86efac' : '#a1a1aa'
              }}>
                {event.requiresPass !== false ? <Mail size={15} /> : <CheckCircle size={15} />}
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
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
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, color: '#e4e4e7' }}>
                Seat Availability: <strong style={{ color: '#ffffff' }}>{event.registeredCount} / {event.capacity}</strong> registered
              </span>
              <span style={{ fontWeight: 700, color: isFull ? '#ef4444' : '#86efac' }}>
                {isFull ? (isWaitlist ? 'Waitlist Open' : 'Event Full') : `${event.capacity - event.registeredCount} spots available`}
              </span>
            </div>
            <div style={{
              height: '7px',
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
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', fontWeight: 800, color: '#ffffff' }}>
              About the Event
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#d4d4d8', lineHeight: 1.6 }}>
              {event.description}
            </p>
          </div>

          {/* Multi-Round Stages & Competition Pipeline */}
          {event.rounds && event.rounds.length > 0 && (
            <div style={{
              background: '#1c1c1f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#166534', color: '#86efac', padding: '5px', borderRadius: '8px' }}>
                    <Trophy size={15} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Competition Pipeline ({event.rounds.length} Rounds)
                    </h3>
                    <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                      Official stage structure, evaluation criteria, and venues
                    </span>
                  </div>
                </div>
                <span style={{
                  background: 'rgba(134, 239, 172, 0.15)',
                  color: '#86efac',
                  border: '1px solid rgba(134, 239, 172, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {event.rounds.length} Stages
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {event.rounds.map((rnd, idx) => (
                  <div
                    key={rnd.id || idx}
                    style={{
                      background: '#242428',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: '#27272a',
                          color: '#86efac',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          Round {rnd.roundNumber}
                        </span>
                        <strong style={{ color: '#ffffff', fontSize: '13px' }}>
                          {rnd.name}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700
                        }}>
                          {rnd.type}
                        </span>
                        {rnd.eliminationRound && (
                          <span style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700
                          }}>
                            Knockout
                          </span>
                        )}
                      </div>
                    </div>

                    {rnd.description && (
                      <div style={{ fontSize: '11.5px', color: '#d4d4d8', lineHeight: 1.4 }}>
                        {rnd.description}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '11px',
                      color: '#a1a1aa',
                      marginTop: '2px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} color="#86efac" /> {rnd.date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} color="#38bdf8" /> {rnd.startTime} - {rnd.endTime}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} color="#fbbf24" /> {rnd.venue}
                      </span>
                      {rnd.qualifyingCriteria && (
                        <span style={{ color: '#fef08a' }}>
                          • Criteria: {rnd.qualifyingCriteria}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules and Guidelines */}
          {event.rules && event.rules.length > 0 && (
            <div style={{
              background: '#1c1c1f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 14px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                Rules & Participation Guidelines
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '18px',
                fontSize: '12px',
                color: '#d4d4d8',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}>
                {event.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility Criteria */}
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', fontWeight: 800, color: '#ffffff' }}>
              Eligibility Criteria
            </h4>
            <div style={{
              fontSize: '12px',
              color: '#d4d4d8',
              background: '#1c1c1f',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {event.eligibilityCriteria || 'Open to all registered undergraduate and postgraduate students.'}
            </div>
          </div>

          {/* FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: 800, color: '#ffffff' }}>
                Frequently Asked Questions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {event.faqs.map((faq, i) => (
                  <div key={i} style={{
                    background: '#1c1c1f',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>{faq.q}</div>
                    <div style={{ color: '#a1a1aa', lineHeight: 1.45 }}>{faq.a}</div>
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
            paddingTop: '12px',
            fontSize: '11.5px',
            color: '#a1a1aa'
          }}>
            <span>Organizer: <strong style={{ color: '#ffffff' }}>{event.organizerName}</strong> ({event.department})</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} style={{ color: '#86efac' }} /> {event.contactEmail}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} style={{ color: '#86efac' }} /> {event.contactPhone}
              </span>
            </div>
          </div>
        </div>

        {/* Pinned Bottom Action Footer (ALWAYS 100% visible inside the card!) */}
        <div className="cp-modal-footer">
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
