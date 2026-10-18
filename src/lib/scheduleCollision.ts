import type { CampusEvent, CampusRegistration } from '../types';

/**
 * Parses time string like "09:00 AM", "2:30 PM", "14:00" into minutes from midnight (0..1439).
 * Also safely ignores trailing parentheses like "(Next Day)".
 */
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 9 * 60; // default 09:00 AM
  const clean = timeStr.replace(/\(.*?\)/g, '').trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timeOnly = clean.replace(/[AP]M/, '').trim();
  const parts = timeOnly.split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Normalizes date to "YYYY-MM-DD"
 */
export function normalizeDate(dateStr?: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : dateStr.trim();
}

/**
 * Checks if two events or their rounds have a schedule collision.
 * A collision happens when both events take place on the same date and their time intervals overlap.
 */
export function checkScheduleCollision(
  eventA: Partial<CampusEvent>,
  eventB: Partial<CampusEvent>
): { hasCollision: boolean; reason?: string } {
  const dateA = normalizeDate(eventA.date || eventA.startDate);
  const dateB = normalizeDate(eventB.date || eventB.startDate);

  // 1. Check round-level collision if both events define competition rounds
  if (eventA.rounds && eventA.rounds.length > 0 && eventB.rounds && eventB.rounds.length > 0) {
    for (const rA of eventA.rounds) {
      const rDateA = normalizeDate(rA.date);
      for (const rB of eventB.rounds) {
        const rDateB = normalizeDate(rB.date);
        if (rDateA && rDateB && rDateA === rDateB) {
          const startA = parseTimeToMinutes(rA.startTime);
          let endA = parseTimeToMinutes(rA.endTime);
          if (endA <= startA) endA = startA + 120;

          const startB = parseTimeToMinutes(rB.startTime);
          let endB = parseTimeToMinutes(rB.endTime);
          if (endB <= startB) endB = startB + 120;

          // Intervals overlap if max(start) < min(end)
          if (Math.max(startA, startB) < Math.min(endA, endB)) {
            return {
              hasCollision: true,
              reason: `Round "${rA.name}" clashes with "${rB.name}" of "${eventB.title}" on ${rDateA}`
            };
          }
        }
      }
    }
  }

  // 2. Check main event date & time collision
  if (dateA && dateB && dateA === dateB) {
    const startA = parseTimeToMinutes(eventA.startTime);
    let endA = parseTimeToMinutes(eventA.endTime);
    // If end is before or equal to start (e.g. overnight 24h event like Hackathon 09:00 AM to 09:00 AM Next Day)
    if (endA <= startA || (eventA.endTime && eventA.endTime.includes('Next Day'))) {
      endA = startA + 24 * 60; // 24 hours span
    }

    const startB = parseTimeToMinutes(eventB.startTime);
    let endB = parseTimeToMinutes(eventB.endTime);
    if (endB <= startB || (eventB.endTime && eventB.endTime.includes('Next Day'))) {
      endB = startB + 24 * 60;
    }

    // Two intervals [startA, endA] and [startB, endB] overlap if max(start) < min(end)
    if (Math.max(startA, startB) < Math.min(endA, endB)) {
      return {
        hasCollision: true,
        reason: `Overlaps with "${eventB.title}" on ${dateA} (${eventB.startTime} – ${eventB.endTime})`
      };
    }
  }

  return { hasCollision: false };
}

export type EventActionStatusType = 
  | 'APPLIED'
  | 'TIME_CONFLICT'
  | 'NO_SEATS'
  | 'EXPIRED'
  | 'WAITLIST'
  | 'AVAILABLE';

export interface EventStudentActionState {
  status: EventActionStatusType;
  label: string;
  canApply: boolean;
  reason?: string;
  conflictingEvent?: CampusEvent;
  appliedRegistration?: CampusRegistration;
  hasConcurrentOverlap?: boolean;
}

/**
 * Calculates the exact student registration status for any given event:
 * 1. APPLIED: If student has already registered
 * 2. TIME_CONFLICT: If student is registered for another event at the same date & overlapping time (and concurrent not allowed)
 * 3. EXPIRED: If registration deadline or event date has passed, or status is CLOSED
 * 4. NO_SEATS: If all seats are filled (registeredCount >= capacity) and no waitlist
 * 5. WAITLIST: If capacity full but waitlist open
 * 6. AVAILABLE: Eligible to register now
 */
export function getEventStudentActionState(
  event: CampusEvent,
  studentId: string | undefined,
  studentEmail: string | undefined,
  registrations: CampusRegistration[],
  allEvents: CampusEvent[],
  allowConcurrentGlobal: boolean = false
): EventStudentActionState {
  // 1. Check if already applied / registered
  const appliedRegistration = registrations.find(r =>
    r.eventId === event.id &&
    ((studentId && r.studentId === studentId) || (studentEmail && r.studentEmail === studentEmail)) &&
    r.status !== 'CANCELLED' && r.status !== 'REJECTED'
  );

  if (appliedRegistration) {
    return {
      status: 'APPLIED',
      label: 'Applied',
      canApply: false,
      appliedRegistration,
      reason: 'You have an active registration for this event.'
    };
  }

  // 2. Check for schedule clash with ANOTHER registered event on the same day and overlapping time
  const activeOtherRegistrations = registrations.filter(r =>
    r.eventId !== event.id &&
    ((studentId && r.studentId === studentId) || (studentEmail && r.studentEmail === studentEmail)) &&
    r.status !== 'CANCELLED' && r.status !== 'REJECTED'
  );

  let detectedConflict: { conflictingEvent: CampusEvent; reason: string } | null = null;
  for (const reg of activeOtherRegistrations) {
    const otherEvent = allEvents.find(e => e.id === reg.eventId);
    if (otherEvent) {
      const collision = checkScheduleCollision(event, otherEvent);
      if (collision.hasCollision) {
        detectedConflict = {
          conflictingEvent: otherEvent,
          reason: collision.reason || `Schedule conflict with "${otherEvent.title}" on ${event.date}`
        };
        break;
      }
    }
  }

  const isConcurrentPermitted = allowConcurrentGlobal || Boolean(event.allowConcurrentRegistration);

  // If there's a conflict and admin has NOT permitted multiple entries, block with TIME_CONFLICT
  if (detectedConflict && !isConcurrentPermitted) {
    return {
      status: 'TIME_CONFLICT',
      label: 'Time Conflict',
      canApply: false,
      conflictingEvent: detectedConflict.conflictingEvent,
      reason: detectedConflict.reason
    };
  }

  // 3. Check if time of registration is gone / expired
  const isClosed = event.status === 'CLOSED' || event.status === 'COMPLETED';
  let isDeadlinePassed = false;
  if (event.registrationDeadline) {
    const deadlineTime = new Date(event.registrationDeadline).getTime();
    if (!isNaN(deadlineTime) && deadlineTime < Date.now()) {
      isDeadlinePassed = true;
    }
  }

  if (isClosed || isDeadlinePassed) {
    return {
      status: 'EXPIRED',
      label: 'Registration Closed',
      canApply: false,
      hasConcurrentOverlap: Boolean(detectedConflict),
      conflictingEvent: detectedConflict?.conflictingEvent,
      reason: isClosed ? 'Registration for this event is closed.' : 'The registration deadline has passed.'
    };
  }

  // 4. Check if all seats are filled (no seats available)
  const isCapacityFull = event.capacity > 0 && event.registeredCount >= event.capacity;
  const isWaitlistLimitReached = event.waitlistLimit > 0 && event.registeredCount >= (event.capacity + event.waitlistLimit);

  if (event.status === 'FULL' || (isCapacityFull && (event.waitlistLimit === 0 || isWaitlistLimitReached))) {
    return {
      status: 'NO_SEATS',
      label: 'No Seats Available',
      canApply: false,
      hasConcurrentOverlap: Boolean(detectedConflict),
      conflictingEvent: detectedConflict?.conflictingEvent,
      reason: 'All seats for this event are completely booked.'
    };
  }

  if (event.status === 'WAITLIST_ONLY' || (isCapacityFull && !isWaitlistLimitReached)) {
    return {
      status: 'WAITLIST',
      label: 'Join Waitlist',
      canApply: true,
      hasConcurrentOverlap: Boolean(detectedConflict),
      conflictingEvent: detectedConflict?.conflictingEvent,
      reason: detectedConflict
        ? `Waitlist open. Overlaps with "${detectedConflict.conflictingEvent.title}" (multiple entries permitted by admin).`
        : 'Event capacity full. You may register for the waitlist.'
    };
  }

  // 5. Eligible and ready to register (including concurrent if allowed by admin)
  return {
    status: 'AVAILABLE',
    label: 'Register Now',
    canApply: true,
    hasConcurrentOverlap: Boolean(detectedConflict),
    conflictingEvent: detectedConflict?.conflictingEvent,
    reason: detectedConflict
      ? `Multiple event entry permitted by admin. Clashes with "${detectedConflict.conflictingEvent.title}".`
      : undefined
  };
}
