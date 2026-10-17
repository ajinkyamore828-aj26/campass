import React, { useState, useEffect } from 'react';
import type { CampusEvent, EventCategory, EventStatus } from '../../types';
import {
  X,
  Star,
  Save,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Tag,
  SlidersHorizontal,
  FileText,
  ShieldCheck
} from 'lucide-react';

interface EditFeaturedEventModalProps {
  events: CampusEvent[];
  featuredEvent: CampusEvent;
  onClose: () => void;
  onSetPinnedFeaturedId: (id: string) => void;
  onUpdateEvent: (id: string, data: Partial<CampusEvent>) => Promise<{ success: boolean; message?: string; data?: CampusEvent }>;
  onSuccessNotice: (msg: string) => void;
}

export const EditFeaturedEventModal: React.FC<EditFeaturedEventModalProps> = ({
  events,
  featuredEvent,
  onClose,
  onSetPinnedFeaturedId,
  onUpdateEvent,
  onSuccessNotice,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(featuredEvent.id);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState(featuredEvent.title);
  const [summary, setSummary] = useState(featuredEvent.summary || featuredEvent.shortDescription || '');
  const [description, setDescription] = useState(featuredEvent.description || '');
  const [category, setCategory] = useState<EventCategory>(featuredEvent.category);
  const [status, setStatus] = useState<EventStatus>(featuredEvent.status);
  const [date, setDate] = useState(featuredEvent.date || featuredEvent.startDate || '');
  const [venue, setVenue] = useState(featuredEvent.venue || '');
  const [roomLocation, setRoomLocation] = useState(featuredEvent.roomLocation || '');
  const [capacity, setCapacity] = useState(featuredEvent.capacity || 100);
  const [fee, setFee] = useState(featuredEvent.fee ?? featuredEvent.registrationFee ?? 0);
  const [startTime, setStartTime] = useState(featuredEvent.startTime || '10:00 AM');
  const [endTime, setEndTime] = useState(featuredEvent.endTime || '04:00 PM');

  // When selected event changes from dropdown, sync form
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    const ev = events.find(e => e.id === id);
    if (ev) {
      setTitle(ev.title);
      setSummary(ev.summary || ev.shortDescription || '');
      setDescription(ev.description || '');
      setCategory(ev.category);
      setStatus(ev.status);
      setDate(ev.date || ev.startDate || '');
      setVenue(ev.venue || '');
      setRoomLocation(ev.roomLocation || '');
      setCapacity(ev.capacity || 100);
      setFee(ev.fee ?? ev.registrationFee ?? 0);
      setStartTime(ev.startTime || '10:00 AM');
      setEndTime(ev.endTime || '04:00 PM');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Event title cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const res = await onUpdateEvent(selectedEventId, {
        title: title.trim(),
        summary: summary.trim(),
        shortDescription: summary.trim(),
        description: description.trim(),
        category,
        status,
        date,
        startDate: date,
        endDate: date,
        venue: venue.trim(),
        roomLocation: roomLocation.trim(),
        capacity: Number(capacity),
        fee: Number(fee),
        registrationFee: Number(fee),
        startTime,
        endTime,
      });

      if (res.success) {
        onSetPinnedFeaturedId(selectedEventId);
        onSuccessNotice(`Featured Event "${title}" updated and pinned to Hero showcase!`);
        onClose();
      } else {
        alert(res.message || 'Failed to update featured event.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating featured event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth: '640px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="cp-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15' }}>
              <Star size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                Edit Featured Event
              </h3>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Select hero showcase event &amp; customize banner text
              </p>
            </div>
          </div>
          <button className="cp-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="cp-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Step 1: Choose which event is featured */}
            <div style={{ background: '#1c1c1f', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="cp-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#facc15' }}>
                <Star size={13} />
                <span>Select Event to Feature on Hero Banner</span>
              </label>
              <select
                className="cp-select"
                value={selectedEventId}
                onChange={(e) => handleSelectEvent(e.target.value)}
                style={{ width: '100%' }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    [{ev.category}] {ev.title} — {ev.venue} ({ev.status})
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                Selecting an event pre-fills its attributes below and pins it as the featured hero showcase on Event Discovery.
              </p>
            </div>

            {/* Step 2: Edit promotional headline & copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="cp-label">Featured Event Title</label>
                <input
                  type="text"
                  className="cp-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apex National Hackathon 2026"
                  required
                />
              </div>

              <div>
                <label className="cp-label">Hero Headline Summary (Displayed on Live Banner)</label>
                <textarea
                  className="cp-input"
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Catchy 1-2 sentence description shown prominently on the Hero card..."
                />
              </div>

              <div className="cp-form-grid-2">
                <div>
                  <label className="cp-label">Category</label>
                  <select
                    className="cp-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                  >
                    <option value="HACKATHON">HACKATHON</option>
                    <option value="IDEATHON">IDEATHON</option>
                    <option value="CODING_COMPETITION">CODING COMPETITION</option>
                    <option value="APTITUDE">APTITUDE</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="FRESHER_PARTY">FRESHER PARTY</option>
                    <option value="CAMPUS_DRIVE">CAMPUS DRIVE</option>
                    <option value="BOOTCAMP">BOOTCAMP</option>
                    <option value="SEMINAR">SEMINAR</option>
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                  </select>
                </div>

                <div>
                  <label className="cp-label">Event Status</label>
                  <select
                    className="cp-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSING_SOON">CLOSING SOON</option>
                    <option value="WAITLIST_ONLY">WAITLIST ONLY</option>
                    <option value="FULL">FULL</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div className="cp-form-grid-2">
                <div>
                  <label className="cp-label">Event Date</label>
                  <input
                    type="date"
                    className="cp-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="cp-label">Venue / Hall</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Main Auditorium"
                  />
                </div>
              </div>

              <div className="cp-form-grid-3">
                <div>
                  <label className="cp-label">Start Time</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                  />
                </div>

                <div>
                  <label className="cp-label">End Time</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="04:00 PM"
                  />
                </div>

                <div>
                  <label className="cp-label">Seat Capacity</label>
                  <input
                    type="number"
                    className="cp-input"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="cp-label">Detailed Event Description</label>
                <textarea
                  className="cp-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full event briefing, timeline, judging criteria..."
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="cp-modal-footer">
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
              <Save size={14} />
              <span>{saving ? 'Updating...' : 'Save & Update Featured Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
