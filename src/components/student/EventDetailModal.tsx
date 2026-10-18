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
  Trophy,
  Lock,
  Layers
} from 'lucide-react';
import { useCampusPass } from '../../context/CampusPassContext';
import { getEventStudentActionState } from '../../lib/scheduleCollision';

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
  const { currentUser, registrations, events, allowConcurrentRegistrations, theme } = useCampusPass();
  const isDark = theme === 'dark';
  const actionState = getEventStudentActionState(event, currentUser?.studentId, currentUser?.email, registrations, events, allowConcurrentRegistrations);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isFull = event.status === 'FULL' || (event.capacity > 0 && event.registeredCount >= event.capacity);
  const isWaitlist = event.status === 'WAITLIST_ONLY' || actionState.status === 'WAITLIST';

  return (
    <div className="cp-modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.65)' }}>
      <div
        className="cp-modal cp-modal-white"
        style={{
          maxWidth: '640px',
          background: isDark ? '#141416' : '#ffffff',
          color: isDark ? '#f4f4f5' : '#09090b',
          border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
          borderRadius: '24px',
          boxShadow: isDark ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)' : '0 25px 60px -15px rgba(0, 0, 0, 0.22)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(90vh, 850px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-bleed hero banner photo (Pinned top, flexShrink: 0) */}
        <div style={{ position: 'relative', height: '190px', width: '100%', flexShrink: 0, overflow: 'hidden', background: isDark ? '#18181b' : '#f4f4f5' }}>
          <img
            src={event.bannerUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Subtle light/dark gradient vignette at bottom */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.35) 50%, rgba(15, 23, 42, 0.98) 100%)'
              : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
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
              background: isDark ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
              color: isDark ? '#f1f5f9' : '#09090b',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              {event.category}
            </span>

            {event.requiresPass !== false ? (
              <span style={{
                background: isDark ? 'rgba(22, 101, 52, 0.85)' : 'rgba(240, 253, 244, 0.95)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: isDark ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(34, 197, 94, 0.35)',
                color: isDark ? '#86efac' : '#15803d',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}>
                <Ticket size={12} />
                Pass Required
              </span>
            ) : (
              <span style={{
                background: isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                color: isDark ? '#d4d4d8' : '#52525b',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
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
              top: '14px',
              right: '16px',
              background: isDark ? 'rgba(24, 24, 27, 0.92)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: isDark ? '#f4f4f5' : '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'background-color 0.15s, transform 0.12s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Modal Body (Pure White/Matte Black Card Surface) */}
        <div className="cp-modal-body" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px 24px',
          background: isDark ? '#141416' : '#ffffff',
          color: isDark ? '#f4f4f5' : '#09090b'
        }}>
          {/* Urgent Reschedule / Delay Notification Alert */}
          {event.scheduleUpdate?.isRescheduled && (
            <div style={{
              background: '#fefce8',
              border: '1px solid #fde047',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#ca8a04" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#a16207', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Official Notice: Schedule Updated / Delayed
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#854d0e', lineHeight: 1.45 }}>
                {event.scheduleUpdate.reason}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#713f12', marginTop: '4px', flexWrap: 'wrap' }}>
                <span>
                  Revised Date: <strong style={{ color: '#15803d' }}>{event.date} ({event.startTime} - {event.endTime})</strong>
                </span>
                {event.scheduleUpdate.originalDate && (
                  <span>
                    Original Date: <span style={{ color: '#854d0e', textDecoration: 'line-through' }}>{event.scheduleUpdate.originalDate} ({event.scheduleUpdate.originalStartTime})</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Schedule Collision Alert */}
          {actionState.status === 'TIME_CONFLICT' && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#dc2626" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Ineligible: Schedule Collision with Registered Event
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#991b1b', lineHeight: 1.45 }}>
                You are already registered for <strong>{actionState.conflictingEvent?.title}</strong> on <strong>{event.date}</strong> ({actionState.conflictingEvent?.startTime} – {actionState.conflictingEvent?.endTime}). One person cannot be present at two different events or competitions at the same time.
              </div>
            </div>
          )}

          {/* Concurrent Registration Permitted Banner */}
          {actionState.hasConcurrentOverlap && (actionState.status === 'AVAILABLE' || actionState.status === 'WAITLIST') && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#0284c7" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Multiple Event Entries Allowed by Policy
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#0369a1', lineHeight: 1.45 }}>
                This event has a time overlap with <strong>{actionState.conflictingEvent?.title}</strong> on <strong>{event.date}</strong> ({actionState.conflictingEvent?.startTime} – {actionState.conflictingEvent?.endTime}), but multiple entries at the same time are currently permitted by campus admin policy.
              </div>
            </div>
          )}

          {/* Title Header with Organizer Metadata */}
          <div>
            <h2 style={{
              color: isDark ? '#f8fafc' : '#09090b',
              margin: '0 0 6px 0',
              fontSize: '22px',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              {event.title}
            </h2>
            <div style={{ fontSize: '12.5px', color: isDark ? '#94a3b8' : '#71717a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Organized by <strong style={{ color: isDark ? '#f1f5f9' : '#09090b' }}>{event.organizerName}</strong></span>
              <span>•</span>
              <span style={{ color: isDark ? '#4ade80' : '#15803d', fontWeight: 600 }}>{event.department}</span>
            </div>
          </div>

          {/* Key Logistics strip (Clean White-Grey Cards / Slate Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '10px',
            background: isDark ? '#18181b' : '#f8fafc',
            border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '14px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                background: isDark ? '#141416' : '#ffffff',
                border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px',
                color: '#15803d',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <Calendar size={15} />
              </div>
              <div>
                <strong style={{ color: isDark ? '#f4f4f5' : '#09090b', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Date & Schedule
                </strong>
                <div style={{ color: isDark ? '#d4d4d8' : '#334155' }}>{event.date || event.startDate}</div>
                <div style={{ color: isDark ? '#a1a1aa' : '#64748b', fontSize: '11px' }}>{event.startTime} - {event.endTime}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                background: isDark ? '#141416' : '#ffffff',
                border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px',
                color: '#0284c7',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <MapPin size={15} />
              </div>
              <div>
                <strong style={{ color: isDark ? '#f4f4f5' : '#09090b', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Venue & Room
                </strong>
                <div style={{ color: isDark ? '#d4d4d8' : '#334155' }}>{event.venue}</div>
                <div style={{ color: isDark ? '#a1a1aa' : '#64748b', fontSize: '11px' }}>{event.roomLocation || 'Campus Ground'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                background: isDark ? '#141416' : '#ffffff',
                border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px',
                color: '#d97706',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <Users size={15} />
              </div>
              <div>
                <strong style={{ color: isDark ? '#f4f4f5' : '#09090b', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Registration Mode
                </strong>
                <div style={{ color: isDark ? '#d4d4d8' : '#334155' }}>
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
                background: isDark ? '#141416' : '#ffffff',
                border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px',
                color: '#db2777',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <Utensils size={15} />
              </div>
              <div>
                <strong style={{ color: isDark ? '#f4f4f5' : '#09090b', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Catering Included
                </strong>
                <div style={{ color: isDark ? '#d4d4d8' : '#334155' }}>
                  {event.includesLunch ? 'Lunch Voucher Provided' : 'No meal pass included'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', gridColumn: '1 / -1' }}>
              <div style={{
                background: isDark ? '#141416' : '#ffffff',
                border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px',
                color: event.requiresPass !== false ? '#15803d' : '#64748b',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                {event.requiresPass !== false ? <Mail size={15} /> : <CheckCircle size={15} />}
              </div>
              <div>
                <strong style={{ color: isDark ? '#f4f4f5' : '#09090b', display: 'block', fontSize: '11.5px', marginBottom: '2px' }}>
                  Pass Delivery Policy
                </strong>
                <div style={{ color: event.requiresPass !== false ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#a1a1aa' : '#64748b'), fontWeight: 600 }}>
                  {event.requiresPass !== false
                    ? 'Official Smart Pass will be sent directly to your registered email upon confirmation.'
                    : 'Open Entry Event — No gate pass or email verification needed.'}
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div style={{
            background: isDark ? '#18181b' : '#f8fafc',
            border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, color: isDark ? '#d4d4d8' : '#334155' }}>
                Seat Availability: <strong style={{ color: isDark ? '#f4f4f5' : '#09090b' }}>{event.registeredCount} / {event.capacity}</strong> registered
              </span>
              <span style={{ fontWeight: 700, color: isFull ? '#ef4444' : (isDark ? '#4ade80' : '#15803d') }}>
                {isFull ? (isWaitlist ? 'Waitlist Open' : 'Event Full') : `${event.capacity - event.registeredCount} spots available`}
              </span>
            </div>
            <div style={{
              height: '7px',
              background: isDark ? '#27272a' : '#e2e8f0',
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
                    : (isDark ? '#38bdf8' : '#09090b'),
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          {/* Overview / Description */}
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>
              About the Event
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#d4d4d8' : '#334155', lineHeight: 1.6 }}>
              {event.description}
            </p>
          </div>

          {/* Multi-Round Stages & Competition Pipeline */}
          {event.rounds && event.rounds.length > 0 && (
            <div style={{
              background: isDark ? '#18181b' : '#f8fafc',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', color: isDark ? '#86efac' : '#15803d', padding: '6px', borderRadius: '8px', border: isDark ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid #bbf7d0' }}>
                    <Trophy size={15} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b', margin: 0 }}>
                      Competition Pipeline ({event.rounds.length} Rounds)
                    </h3>
                    <span style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                      Official stage structure, evaluation criteria, and venues
                    </span>
                  </div>
                </div>
                <span style={{
                  background: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                  color: isDark ? '#86efac' : '#15803d',
                  border: isDark ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid #bbf7d0',
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
                      background: isDark ? '#141416' : '#ffffff',
                      border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: isDark ? '#27272a' : '#f1f5f9',
                          color: isDark ? '#f4f4f5' : '#09090b',
                          border: isDark ? '1px solid #3f3f46' : '1px solid #cbd5e1',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          Round {rnd.roundNumber}
                        </span>
                        <strong style={{ color: isDark ? '#f4f4f5' : '#09090b', fontSize: '13px' }}>
                          {rnd.name}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                          color: isDark ? '#7dd3fc' : '#0369a1',
                          border: isDark ? '1px solid rgba(2, 132, 199, 0.35)' : '1px solid #bae6fd',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700
                        }}>
                          {rnd.type}
                        </span>
                        {rnd.eliminationRound && (
                          <span style={{
                            background: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2',
                            color: isDark ? '#fca5a5' : '#b91c1c',
                            border: isDark ? '1px solid rgba(220, 38, 38, 0.35)' : '1px solid #fecaca',
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
                      <div style={{ fontSize: '12px', color: isDark ? '#d4d4d8' : '#475569', lineHeight: 1.45 }}>
                        {rnd.description}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '11px',
                      color: isDark ? '#a1a1aa' : '#64748b',
                      marginTop: '2px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} color="#15803d" /> {rnd.date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} color="#0284c7" /> {rnd.startTime} - {rnd.endTime}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} color="#d97706" /> {rnd.venue}
                      </span>
                      {rnd.qualifyingCriteria && (
                        <span style={{ color: isDark ? '#fde047' : '#a16207', fontWeight: 600 }}>
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
              background: isDark ? '#18181b' : '#f8fafc',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px 16px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>
                Rules & Participation Guidelines
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '18px',
                fontSize: '12px',
                color: isDark ? '#d4d4d8' : '#334155',
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
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>
              Eligibility Criteria
            </h4>
            <div style={{
              fontSize: '12.5px',
              color: isDark ? '#d4d4d8' : '#334155',
              background: isDark ? '#18181b' : '#f8fafc',
              padding: '10px 14px',
              borderRadius: '12px',
              border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0'
            }}>
              {event.eligibilityCriteria || 'Open to all registered undergraduate and postgraduate students.'}
            </div>
          </div>

          {/* FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>
                Frequently Asked Questions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {event.faqs.map((faq, i) => (
                  <div key={i} style={{
                    background: isDark ? '#18181b' : '#f8fafc',
                    border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 700, color: isDark ? '#f4f4f5' : '#09090b', marginBottom: '2px' }}>{faq.q}</div>
                    <div style={{ color: isDark ? '#a1a1aa' : '#475569', lineHeight: 1.45 }}>{faq.a}</div>
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
            borderTop: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
            paddingTop: '12px',
            fontSize: '11.5px',
            color: isDark ? '#a1a1aa' : '#64748b'
          }}>
            <span>Organizer: <strong style={{ color: isDark ? '#f4f4f5' : '#09090b' }}>{event.organizerName}</strong> ({event.department})</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} style={{ color: '#15803d' }} /> {event.contactEmail}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} style={{ color: '#15803d' }} /> {event.contactPhone}
              </span>
            </div>
          </div>
        </div>

        {/* Pinned Bottom Action Footer (ALWAYS 100% visible inside the modal!) */}
        <div className="cp-modal-footer" style={{
          padding: '14px 24px',
          borderTop: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
          background: isDark ? '#141416' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              background: isDark ? '#18181b' : '#f4f4f5',
              border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
              color: isDark ? '#f4f4f5' : '#18181b',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
          >
            Close
          </button>

          {actionState.status === 'APPLIED' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(22, 101, 52, 0.25)' : '#f0fdf4',
              color: isDark ? '#86efac' : '#15803d',
              border: isDark ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid #bbf7d0',
              fontSize: '13px',
              fontWeight: 700
            }}>
              <CheckCircle size={15} />
              Already Applied
            </div>
          ) : actionState.status === 'TIME_CONFLICT' ? (
            <button
              type="button"
              disabled
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                background: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fef2f2',
                color: isDark ? '#fca5a5' : '#b91c1c',
                border: isDark ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid #fecaca',
                cursor: 'not-allowed',
              }}
              title={actionState.reason}
            >
              <AlertTriangle size={15} style={{ color: '#dc2626' }} />
              Time Conflict
            </button>
          ) : actionState.status === 'NO_SEATS' ? (
            <button
              type="button"
              disabled
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                background: isDark ? '#18181b' : '#f4f4f5',
                color: isDark ? '#71717a' : '#71717a',
                border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
                cursor: 'not-allowed',
              }}
              title="All seats are completely filled"
            >
              <Lock size={14} />
              No Seats Available
            </button>
          ) : actionState.status === 'EXPIRED' ? (
            <button
              type="button"
              disabled
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                background: isDark ? '#18181b' : '#f4f4f5',
                color: isDark ? '#71717a' : '#71717a',
                border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
                cursor: 'not-allowed',
              }}
              title="Registration deadline has expired"
            >
              <Clock size={14} />
              Registration Closed
            </button>
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
                background: isDark ? '#f8fafc' : '#09090b',
                color: isDark ? '#09090b' : '#ffffff',
                border: isDark ? '1px solid #f8fafc' : '1px solid #09090b',
                cursor: 'pointer',
                boxShadow: isDark ? '0 4px 14px rgba(255, 255, 255, 0.12)' : '0 4px 14px rgba(0, 0, 0, 0.15)',
                transition: 'background-color 0.15s, transform 0.1s'
              }}
            >
              {actionState.status === 'WAITLIST' ? 'Join Waitlist' : 'Apply & Register Now'}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
