import React, { useState } from 'react';
import type { CampusEvent, EventRound, ScheduleRescheduleInfo } from '../../types';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  CheckCircle2,
  Bell,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface RescheduleEventModalProps {
  event: CampusEvent;
  onClose: () => void;
  onReschedule: (
    eventId: string,
    updates: {
      date: string;
      startTime: string;
      endTime: string;
      scheduleUpdate: ScheduleRescheduleInfo;
      rounds?: EventRound[];
    }
  ) => Promise<void>;
  onBroadcastAnnouncement?: (title: string, message: string) => Promise<void>;
}

export const RescheduleEventModal: React.FC<RescheduleEventModalProps> = ({
  event,
  onClose,
  onReschedule,
  onBroadcastAnnouncement
}) => {
  const [newDate, setNewDate] = useState(event.date || new Date().toISOString().slice(0, 10));
  const [newStartTime, setNewStartTime] = useState(event.startTime || '10:00 AM');
  const [newEndTime, setNewEndTime] = useState(event.endTime || '04:00 PM');
  const [rescheduleReason, setRescheduleReason] = useState(
    event.scheduleUpdate?.reason || ''
  );
  const [broadcastAlert, setBroadcastAlert] = useState(true);
  const [syncRoundsDate, setSyncRoundsDate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Quick Preset Handlers
  const handleShiftHours = (hoursToAdd: number) => {
    // Quick helper to append note
    setRescheduleReason(prev => 
      prev ? prev : `Competition start timing shifted back by ${hoursToAdd} hour(s) due to logistical setup.`
    );
  };

  const handleShiftDay = (days: number) => {
    try {
      const d = new Date(event.date || new Date().toISOString().slice(0, 10));
      d.setDate(d.getDate() + days);
      setNewDate(d.toISOString().slice(0, 10));
      setRescheduleReason(prev =>
        prev ? prev : `Event postponed by ${days} day(s) due to unforeseen campus schedule realignment.`
      );
    } catch {
      // fallback
    }
  };

  const handleResetSchedule = async () => {
    if (!event.scheduleUpdate?.isRescheduled) return;
    if (!window.confirm('Revert schedule back to standard and clear the delay/reschedule notice?')) return;

    setSaving(true);
    try {
      const origDate = event.scheduleUpdate.originalDate || event.date;
      const origStart = event.scheduleUpdate.originalStartTime || event.startTime;
      const origEnd = event.scheduleUpdate.originalEndTime || event.endTime;

      await onReschedule(event.id, {
        date: origDate,
        startTime: origStart,
        endTime: origEnd,
        scheduleUpdate: {
          isRescheduled: false,
          reason: ''
        }
      });
      onClose();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to revert schedule.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleReason.trim()) {
      setErrorNotice('Please provide a reason for the rescheduling / delay.');
      return;
    }

    setSaving(true);
    try {
      // Preserve original dates if first time rescheduling
      const originalDate = event.scheduleUpdate?.originalDate || event.date;
      const originalStartTime = event.scheduleUpdate?.originalStartTime || event.startTime;
      const originalEndTime = event.scheduleUpdate?.originalEndTime || event.endTime;

      const scheduleUpdate: ScheduleRescheduleInfo = {
        isRescheduled: true,
        originalDate,
        originalStartTime,
        originalEndTime,
        rescheduledAt: new Date().toISOString(),
        reason: rescheduleReason.trim(),
        announcementBroadcasted: broadcastAlert,
        broadcastNote: `Schedule delayed/rescheduled to ${newDate} (${newStartTime} - ${newEndTime}). Reason: ${rescheduleReason.trim()}`
      };

      // Cascade new date to rounds if option checked and event has rounds
      let updatedRounds = event.rounds;
      if (syncRoundsDate && event.rounds && event.rounds.length > 0) {
        updatedRounds = event.rounds.map(r => ({
          ...r,
          date: newDate,
          status: 'DELAYED' as const
        }));
      }

      await onReschedule(event.id, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        scheduleUpdate,
        rounds: updatedRounds
      });

      // Also broadcast announcement if enabled
      if (broadcastAlert && onBroadcastAnnouncement) {
        await onBroadcastAnnouncement(
          `SCHEDULE UPDATE: ${event.title}`,
          `Please note that "${event.title}" has been rescheduled to ${newDate} (${newStartTime} - ${newEndTime}). Reason: ${rescheduleReason.trim()}`
        );
      }

      onClose();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cp-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#ca8a04',
                color: '#fef08a',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertTriangle size={11} />
                Schedule Adjustment Desk
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Event ID: {event.id}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Reschedule & Delay Management
            </h2>
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              {event.title}
            </p>
          </div>
          <button
            type="button"
            className="cp-modal-close"
            onClick={onClose}
            style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Current vs New Schedule Banner */}
        <div style={{
          padding: '14px 20px',
          background: '#18181b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#a1a1aa' }}>
            Current Recorded Timing:
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#27272a',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12.5px',
            color: '#e4e4e7',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#86efac" />
              <span>{event.date}</span>
            </div>
            <span style={{ color: '#52525b' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#38bdf8" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            {event.scheduleUpdate?.isRescheduled && (
              <span style={{
                marginLeft: 'auto',
                background: '#451a03',
                color: '#fde047',
                border: '1px solid #78350f',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Currently Marked as Delayed
              </span>
            )}
          </div>

          {/* Quick delay shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#71717a' }}>Quick Shifts:</span>
            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={() => handleShiftHours(1)}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              +1 Hour Delay
            </button>
            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={() => handleShiftHours(2)}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              +2 Hours Delay
            </button>
            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={() => handleShiftDay(1)}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Postpone +1 Day
            </button>
            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={() => handleShiftDay(7)}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Postpone +1 Week
            </button>
          </div>
        </div>

        {/* Error Feedback */}
        {errorNotice && (
          <div style={{
            margin: '10px 20px 0 20px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#450a0a',
            border: '1px solid #7f1d1d',
            color: '#fca5a5',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={14} />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="cp-modal-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* New Schedule Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <div>
                <label className="cp-label">New Event Date</label>
                <input
                  type="date"
                  className="cp-input"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="cp-label">New Start Time</label>
                <input
                  type="text"
                  className="cp-input"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  placeholder="e.g. 02:00 PM"
                  required
                />
              </div>
              <div>
                <label className="cp-label">New End Time</label>
                <input
                  type="text"
                  className="cp-input"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  placeholder="e.g. 06:00 PM"
                  required
                />
              </div>
            </div>

            {/* Delay Reason */}
            <div>
              <label className="cp-label">
                Official Reason for Rescheduling / Delay <span style={{ color: '#f87171' }}>*</span>
              </label>
              <textarea
                className="cp-input"
                rows={3}
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g. Inclement weather on campus; Round 1 evaluation extended by jury panel; Keynote speaker arrival rescheduled..."
                required
              />
              <span style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', display: 'block' }}>
                This reason will be publicly displayed on the event card badge and student registration pass view.
              </span>
            </div>

            {/* Checkboxes */}
            <div style={{
              background: '#1c1c1f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffffff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={broadcastAlert}
                  onChange={(e) => setBroadcastAlert(e.target.checked)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Bell size={13} color="#facc15" />
                  <strong>Broadcast urgent campus announcement to all participants</strong>
                </span>
              </label>

              {event.rounds && event.rounds.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={syncRoundsDate}
                    onChange={(e) => setSyncRoundsDate(e.target.checked)}
                  />
                  <span>
                    Synchronize all {event.rounds.length} competition rounds to the new date and mark their status as Delayed
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="cp-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {event.scheduleUpdate?.isRescheduled && (
                <button
                  type="button"
                  className="cp-btn cp-btn-secondary cp-btn-sm"
                  onClick={handleResetSchedule}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f87171' }}
                >
                  <RotateCcw size={13} />
                  <span>Revert to Standard Schedule</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="cp-btn cp-btn-outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cp-btn cp-btn-primary"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Calendar size={14} />
                <span>{saving ? 'Updating Schedule...' : 'Save Updated Schedule'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
