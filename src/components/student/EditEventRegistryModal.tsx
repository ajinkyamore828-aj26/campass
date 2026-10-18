import React, { useState } from 'react';
import type { CampusEvent, EventCategory, EventStatus, RegistrationMode, ApprovalMode, EventRound, RoundType, RoundStatus, ScheduleRescheduleInfo } from '../../types';
import {
  X,
  Search,
  Plus,
  Edit3,
  Star,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Save,
  Trash2,
  SlidersHorizontal,
  Layers,
  ArrowLeft,
  Check,
  AlertTriangle,
  Clock,
  Sparkles,
  RotateCcw,
  Code,
  Trophy,
  Image as ImageIcon,
  FolderOpen,
  Upload,
  Camera,
  CheckCircle2,
  Smartphone,
  Laptop
} from 'lucide-react';

interface EditEventRegistryModalProps {
  events: CampusEvent[];
  onClose: () => void;
  onSetPinnedFeaturedId: (id: string) => void;
  pinnedFeaturedId: string | null;
  onUpdateEvent: (id: string, data: Partial<CampusEvent>) => Promise<{ success: boolean; message?: string; data?: CampusEvent }>;
  onCreateEvent: (data: Partial<CampusEvent>) => Promise<{ success: boolean; message?: string; data?: CampusEvent }>;
  onSuccessNotice: (msg: string) => void;
  initialEditingEvent?: CampusEvent | null;
}

const ROUND_TYPES: { value: RoundType; label: string }[] = [
  { value: 'APTITUDE', label: 'Aptitude & Reasoning' },
  { value: 'TECHNICAL', label: 'Technical MCQ / Core' },
  { value: 'CODING', label: 'Coding / Programming' },
  { value: 'PROBLEM_SOLVING', label: 'Problem Solving' },
  { value: 'PRESENTATION', label: 'Idea Pitch / Presentation' },
  { value: 'INTERVIEW', label: 'Technical / HR Interview' },
  { value: 'HACKATHON', label: 'Hackathon Sprint' },
  { value: 'GROUP_DISCUSSION', label: 'Group Discussion' },
  { value: 'QUIZ', label: 'General / Tech Quiz' },
  { value: 'GENERAL', label: 'General Stage Round' },
];

const QUICK_PRESETS = [
  { label: 'Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Freshers Gala', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
  { label: 'DJ Night', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Auditorium', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Coding Lab', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sports Meet', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
];

export const EditEventRegistryModal: React.FC<EditEventRegistryModalProps> = ({
  events,
  onClose,
  onSetPinnedFeaturedId,
  pinnedFeaturedId,
  onUpdateEvent,
  onCreateEvent,
  onSuccessNotice,
  initialEditingEvent = null,
}) => {
  // Modes: 'REGISTRY_LIST' | 'EDIT_FORM'
  const [viewMode, setViewMode] = useState<'REGISTRY_LIST' | 'EDIT_FORM'>(
    initialEditingEvent ? 'EDIT_FORM' : 'REGISTRY_LIST'
  );

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  // Currently editing event state (null when creating new)
  const [currentEditId, setCurrentEditId] = useState<string | null>(initialEditingEvent?.id || null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formState, setFormState] = useState<Partial<CampusEvent>>(() => {
    if (initialEditingEvent) return { ...initialEditingEvent };
    return {
      title: '',
      summary: '',
      shortDescription: '',
      description: '',
      category: 'TECHNICAL',
      department: 'Computer Science & Engineering',
      venue: 'Main Auditorium',
      roomLocation: 'Block A, 2nd Floor',
      date: new Date().toISOString().slice(0, 10),
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      registrationDeadline: '2026-10-25T23:59:59Z',
      capacity: 100,
      waitlistLimit: 25,
      registrationMode: 'INDIVIDUAL',
      minTeamSize: 1,
      maxTeamSize: 1,
      fee: 0,
      requiresApproval: true,
      requiresPass: true,
      includesLunch: true,
      allowConcurrentRegistration: false,
      status: 'OPEN',
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    };
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [deviceImageNotice, setDeviceImageNotice] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const handleDeviceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setDeviceImageNotice('Please choose an image file (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingImage(true);
    setDeviceImageNotice(null);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          setFormState(prev => ({ ...prev, bannerUrl: optimizedDataUrl }));
          setDeviceImageNotice(`Photo loaded from device (${file.name})`);
        } else {
          setFormState(prev => ({ ...prev, bannerUrl: readerEvent.target?.result as string }));
          setDeviceImageNotice(`Photo loaded: ${file.name}`);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setFormState(prev => ({ ...prev, bannerUrl: readerEvent.target?.result as string }));
        setDeviceImageNotice(`Photo loaded: ${file.name}`);
        setIsProcessingImage(false);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      setDeviceImageNotice('Error reading image from device.');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEdit = (ev: CampusEvent) => {
    setCurrentEditId(ev.id);
    setDeviceImageNotice(null);
    setFormState({ ...ev });
    setViewMode('EDIT_FORM');
  };

  const handleOpenCreate = () => {
    setCurrentEditId(null);
    setDeviceImageNotice(null);
    setFormState({
      title: '',
      summary: '',
      shortDescription: '',
      description: '',
      category: 'HACKATHON',
      department: 'Computer Science & Engineering',
      venue: 'Auditorium Hall 1',
      roomLocation: 'Innovation Block',
      date: '2026-10-28',
      startDate: '2026-10-28',
      endDate: '2026-10-28',
      startTime: '09:30 AM',
      endTime: '05:00 PM',
      registrationDeadline: '2026-10-27T23:59:59Z',
      capacity: 120,
      waitlistLimit: 30,
      registrationMode: 'INDIVIDUAL',
      minTeamSize: 1,
      maxTeamSize: 1,
      fee: 0,
      requiresApproval: true,
      requiresPass: true,
      includesLunch: true,
      status: 'OPEN',
      bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    });
    setViewMode('EDIT_FORM');
  };

  // Round Management Helpers
  const rounds = formState.rounds || [];

  const handleApplyPresetCoding3Rounds = () => {
    const eventDate = formState.date || new Date().toISOString().slice(0, 10);
    setFormState({
      ...formState,
      rounds: [
        {
          id: `RND-${Date.now()}-1`,
          roundNumber: 1,
          name: 'Round 1: Aptitude & Logical Reasoning',
          type: 'APTITUDE',
          date: eventDate,
          startTime: '10:00 AM',
          endTime: '11:15 AM',
          venue: formState.venue || 'Turing Lab A',
          description: 'Quantitative aptitude, logical reasoning, and discrete mathematics screening.',
          status: 'UPCOMING',
          eliminationRound: true,
          qualifyingCriteria: 'Top 50% advance to Technical Round'
        },
        {
          id: `RND-${Date.now()}-2`,
          roundNumber: 2,
          name: 'Round 2: Technical Assessment & Core CS',
          type: 'TECHNICAL',
          date: eventDate,
          startTime: '12:00 PM',
          endTime: '01:15 PM',
          venue: formState.venue || 'Turing Lab B',
          description: 'Data structures, algorithm complexity, OS, and DBMS concurrency assessment.',
          status: 'UPCOMING',
          eliminationRound: true,
          qualifyingCriteria: 'Top 25 finalists advance to Problem Solving'
        },
        {
          id: `RND-${Date.now()}-3`,
          roundNumber: 3,
          name: 'Round 3: Advanced Algorithmic Problem Solving',
          type: 'PROBLEM_SOLVING',
          date: eventDate,
          startTime: '02:30 PM',
          endTime: '05:30 PM',
          venue: formState.venue || 'Tech Arena Sandbox',
          description: 'Live coding contest with 4 algorithmic problems on dynamic programming and graphs.',
          status: 'UPCOMING',
          eliminationRound: false,
          qualifyingCriteria: 'Cumulative leaderboard decides Winners'
        }
      ]
    });
  };

  const handleApplyPresetHackathon2Rounds = () => {
    const eventDate = formState.date || new Date().toISOString().slice(0, 10);
    setFormState({
      ...formState,
      rounds: [
        {
          id: `RND-${Date.now()}-1`,
          roundNumber: 1,
          name: 'Round 1: Problem Pitch & Architecture Review',
          type: 'PRESENTATION',
          date: eventDate,
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          venue: formState.venue || 'Innovation Hall',
          description: 'Pitching problem solution, system architecture, and UX wireframes.',
          status: 'UPCOMING',
          eliminationRound: true,
          qualifyingCriteria: 'Top teams qualify for 24h Build Sprint'
        },
        {
          id: `RND-${Date.now()}-2`,
          roundNumber: 2,
          name: 'Round 2: 24-Hour Prototype Build & Jury Demo',
          type: 'HACKATHON',
          date: eventDate,
          startTime: '02:00 PM',
          endTime: '02:00 PM (Next Day)',
          venue: formState.venue || 'Grand Tech Arena',
          description: 'Hands-on sprint and working demo evaluation before industry jury.',
          status: 'UPCOMING',
          eliminationRound: false,
          qualifyingCriteria: 'Grand Prize & Incubation grants'
        }
      ]
    });
  };

  const handleApplyPresetPlacement3Rounds = () => {
    const eventDate = formState.date || new Date().toISOString().slice(0, 10);
    setFormState({
      ...formState,
      rounds: [
        {
          id: `RND-${Date.now()}-1`,
          roundNumber: 1,
          name: 'Round 1: Placement Quantitative & Verbal Aptitude',
          type: 'APTITUDE',
          date: eventDate,
          startTime: '09:30 AM',
          endTime: '11:00 AM',
          venue: formState.venue || 'Exam Block 301',
          description: 'Aptitude screening simulating top tier corporate tests.',
          status: 'UPCOMING',
          eliminationRound: true,
          qualifyingCriteria: 'Top 65th percentile'
        },
        {
          id: `RND-${Date.now()}-2`,
          roundNumber: 2,
          name: 'Round 2: Technical Live Coding & SQL',
          type: 'CODING',
          date: eventDate,
          startTime: '12:00 PM',
          endTime: '02:00 PM',
          venue: formState.venue || 'Computer Lab 2',
          description: 'Hands-on coding problems and SQL database challenges.',
          status: 'UPCOMING',
          eliminationRound: true,
          qualifyingCriteria: 'Passing 100% test cases'
        },
        {
          id: `RND-${Date.now()}-3`,
          roundNumber: 3,
          name: 'Round 3: Technical & HR Interview',
          type: 'INTERVIEW',
          date: eventDate,
          startTime: '03:00 PM',
          endTime: '06:00 PM',
          venue: formState.venue || 'Placement Boardroom',
          description: 'Individual technical and culture assessment.',
          status: 'UPCOMING',
          eliminationRound: false,
          qualifyingCriteria: 'Final Selection & Offer Letter'
        }
      ]
    });
  };

  const handleSetRoundCountDirectly = (targetCount: number) => {
    if (targetCount < 0) targetCount = 0;
    if (targetCount > 8) targetCount = 8;
    const current = [...rounds];
    const eventDate = formState.date || new Date().toISOString().slice(0, 10);
    if (targetCount > current.length) {
      for (let i = current.length + 1; i <= targetCount; i++) {
        current.push({
          id: `RND-${Date.now()}-${i}`,
          roundNumber: i,
          name: `Round ${i}: Stage ${i}`,
          type: i === 1 ? 'APTITUDE' : i === 2 ? 'TECHNICAL' : 'PROBLEM_SOLVING',
          date: eventDate,
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          venue: formState.venue || 'Main Auditorium',
          description: `Evaluation guidelines for Round ${i}.`,
          status: 'UPCOMING',
          eliminationRound: i < targetCount,
          qualifyingCriteria: `Qualifying threshold for Stage ${i}`
        });
      }
    } else if (targetCount < current.length) {
      current.splice(targetCount);
    }
    setFormState({ ...formState, rounds: current.map((r, idx) => ({ ...r, roundNumber: idx + 1 })) });
  };

  const handleAddRound = () => {
    const nextNum = rounds.length + 1;
    const eventDate = formState.date || new Date().toISOString().slice(0, 10);
    const newRound: EventRound = {
      id: `RND-${Date.now()}-${nextNum}`,
      roundNumber: nextNum,
      name: `Round ${nextNum}: Stage ${nextNum}`,
      type: 'TECHNICAL',
      date: eventDate,
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: formState.venue || 'Auditorium Hall',
      description: `Evaluation guidelines for Round ${nextNum}.`,
      status: 'UPCOMING',
      eliminationRound: false,
      qualifyingCriteria: 'Passing score'
    };
    setFormState({ ...formState, rounds: [...rounds, newRound] });
  };

  const handleRemoveRound = (index: number) => {
    const updated = rounds.filter((_, idx) => idx !== index).map((r, idx) => ({
      ...r,
      roundNumber: idx + 1
    }));
    setFormState({ ...formState, rounds: updated });
  };

  const handleRoundChange = (index: number, field: keyof EventRound, value: any) => {
    const updated = [...rounds];
    updated[index] = { ...updated[index], [field]: value };
    setFormState({ ...formState, rounds: updated });
  };

  // Quick inline status change directly from table
  const handleQuickStatusChange = async (event: CampusEvent, newStatus: EventStatus) => {
    try {
      const res = await onUpdateEvent(event.id, { status: newStatus });
      if (res.success) {
        onSuccessNotice(`Event "${event.title}" status changed to ${newStatus}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title?.trim()) {
      alert('Event title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<CampusEvent> = {
        ...formState,
        title: formState.title.trim(),
        summary: formState.summary?.trim() || formState.title.trim(),
        shortDescription: formState.summary?.trim() || formState.title.trim(),
        capacity: Number(formState.capacity || 100),
        fee: Number(formState.fee || 0),
        registrationFee: Number(formState.fee || 0),
        startDate: formState.date || formState.startDate,
        endDate: formState.date || formState.endDate,
      };

      if (currentEditId) {
        const res = await onUpdateEvent(currentEditId, payload);
        if (res.success) {
          onSuccessNotice(`Event "${formState.title}" updated in registry!`);
          setViewMode('REGISTRY_LIST');
        } else {
          alert(res.message || 'Failed to update event.');
        }
      } else {
        const res = await onCreateEvent(payload);
        if (res.success) {
          onSuccessNotice(`New event "${formState.title}" created in registry!`);
          setViewMode('REGISTRY_LIST');
        } else {
          alert(res.message || 'Failed to create event.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error saving event.');
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (selectedCat !== 'ALL' && ev.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.department.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth: '840px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cp-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Layers size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                Event Registry Manager
              </h3>
              <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Organizer &amp; Admin Registry Control Desk • {events.length} campus events
              </p>
            </div>
          </div>
          <button className="cp-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* View Mode: REGISTRY_LIST */}
        {viewMode === 'REGISTRY_LIST' ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Top Toolbar */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                <div className="cp-search-wrap" style={{ flex: 1 }}>
                  <span className="cp-search-icon"><Search size={14} /></span>
                  <input
                    className="cp-search-input"
                    placeholder="Search registry by title, venue, department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="cp-select"
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="HACKATHON">Hackathons</option>
                  <option value="IDEATHON">Ideathons</option>
                  <option value="CODING_COMPETITION">Coding Contests</option>
                  <option value="APTITUDE">Aptitude Tests</option>
                  <option value="CULTURAL">Cultural Events</option>
                  <option value="FRESHER_PARTY">Fresher Parties</option>
                  <option value="BOOTCAMP">Bootcamps</option>
                  <option value="CAMPUS_DRIVE">Campus Drives</option>
                  <option value="SEMINAR">Seminars</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="SPORTS">Sports</option>
                  <option value="WORKSHOP">Workshops</option>
                </select>
              </div>

              <button
                className="cp-btn cp-btn-primary cp-btn-sm"
                onClick={handleOpenCreate}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add New Event</span>
              </button>
            </div>

            {/* Event List Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>No matching events found</p>
                  <p style={{ fontSize: '12px' }}>Try a different search query or add a new event.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredEvents.map((ev) => {
                    const isPinned = pinnedFeaturedId === ev.id;
                    return (
                      <div
                        key={ev.id}
                        style={{
                          background: '#1c1c1f',
                          border: isPinned ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#38bdf8' }}>
                              {ev.category}
                            </span>
                            {isPinned && (
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: 'rgba(250, 204, 21, 0.2)', color: '#facc15', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Star size={10} fill="#facc15" /> Featured Hero
                              </span>
                            )}
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{ev.department}</span>
                          </div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.3 }} className="truncate">
                            {ev.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '11.5px', color: '#94a3b8', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {ev.date || ev.startDate}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {ev.venue}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={12} /> {ev.registeredCount}/{ev.capacity} seats
                            </span>
                            {ev.rounds && ev.rounds.length > 1 && (
                              <span style={{
                                background: '#14532d',
                                color: '#86efac',
                                border: '1px solid #166534',
                                padding: '1px 7px',
                                borderRadius: '4px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <Trophy size={10} />
                                {ev.rounds.length} Rounds
                              </span>
                            )}
                            {ev.scheduleUpdate?.isRescheduled && (
                              <span style={{
                                background: '#451a03',
                                color: '#fde047',
                                border: '1px solid #78350f',
                                padding: '1px 7px',
                                borderRadius: '4px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <AlertTriangle size={10} />
                                Rescheduled / Delayed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {/* Quick Status Dropdown */}
                          <select
                            className="cp-select"
                            value={ev.status}
                            onChange={(e) => handleQuickStatusChange(ev, e.target.value as EventStatus)}
                            style={{ fontSize: '11px', padding: '4px 8px', height: '30px', width: '120px' }}
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSING_SOON">CLOSING SOON</option>
                            <option value="WAITLIST_ONLY">WAITLIST ONLY</option>
                            <option value="FULL">FULL</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>

                          {/* Pin as Featured */}
                          <button
                            type="button"
                            className="cp-btn cp-btn-outline cp-btn-sm"
                            title={isPinned ? 'Currently featured' : 'Pin as Featured Event'}
                            onClick={() => {
                              onSetPinnedFeaturedId(ev.id);
                              onSuccessNotice(`"${ev.title}" is now pinned as Featured Event!`);
                            }}
                            style={{
                              padding: '5px 9px',
                              height: '30px',
                              background: isPinned ? 'rgba(250, 204, 21, 0.2)' : undefined,
                              borderColor: isPinned ? '#facc15' : undefined,
                              color: isPinned ? '#facc15' : '#e4e4e7'
                            }}
                          >
                            <Star size={13} fill={isPinned ? '#facc15' : 'none'} />
                          </button>

                          {/* Full Edit Button */}
                          <button
                            type="button"
                            className="cp-btn cp-btn-primary cp-btn-sm"
                            onClick={() => handleOpenEdit(ev)}
                            style={{ padding: '5px 12px', height: '30px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="cp-modal-footer">
              <button type="button" className="cp-btn cp-btn-outline" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          /* View Mode: EDIT_FORM (Create or Edit Event) */
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Form Subheader with Back Button */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="cp-btn cp-btn-outline cp-btn-sm"
                onClick={() => setViewMode('REGISTRY_LIST')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={13} />
                <span>Back to Registry List</span>
              </button>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>
                {currentEditId ? 'Editing Event in Registry' : 'Registering New Campus Event'}
              </span>
            </div>

            <div className="cp-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="cp-label">Event Title</label>
                <input
                  type="text"
                  className="cp-input"
                  value={formState.title || ''}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Apex National Hackathon 2026"
                  required
                />
              </div>

              <div>
                <label className="cp-label">Short Summary (Displayed on Discovery Cards)</label>
                <input
                  type="text"
                  className="cp-input"
                  value={formState.summary || formState.shortDescription || ''}
                  onChange={(e) => setFormState({ ...formState, summary: e.target.value, shortDescription: e.target.value })}
                  placeholder="Concise overview of the event..."
                />
              </div>

              <div className="cp-form-grid-3">
                <div>
                  <label className="cp-label">Category</label>
                  <select
                    className="cp-select"
                    value={formState.category || 'TECHNICAL'}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value as EventCategory })}
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
                  <label className="cp-label">Status</label>
                  <select
                    className="cp-select"
                    value={formState.status || 'OPEN'}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as EventStatus })}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSING_SOON">CLOSING SOON</option>
                    <option value="WAITLIST_ONLY">WAITLIST ONLY</option>
                    <option value="FULL">FULL</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="cp-label">Department</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={formState.department || ''}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>
              </div>

              <div className="cp-form-grid-2">
                <div>
                  <label className="cp-label">Date</label>
                  <input
                    type="date"
                    className="cp-input"
                    value={formState.date || formState.startDate || ''}
                    onChange={(e) => setFormState({ ...formState, date: e.target.value, startDate: e.target.value, endDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="cp-label">Venue / Hall</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={formState.venue || ''}
                    onChange={(e) => setFormState({ ...formState, venue: e.target.value })}
                    placeholder="e.g. Auditorium Hall 1"
                  />
                </div>
              </div>

              <div className="cp-form-grid-4">
                <div>
                  <label className="cp-label">Start Time</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={formState.startTime || ''}
                    onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                    placeholder="10:00 AM"
                  />
                </div>
                <div>
                  <label className="cp-label">End Time</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={formState.endTime || ''}
                    onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                    placeholder="04:00 PM"
                  />
                </div>
                <div>
                  <label className="cp-label">Capacity</label>
                  <input
                    type="number"
                    className="cp-input"
                    value={formState.capacity || 100}
                    onChange={(e) => setFormState({ ...formState, capacity: Number(e.target.value) })}
                    min={1}
                  />
                </div>
                <div>
                  <label className="cp-label">Fee (₹)</label>
                  <input
                    type="number"
                    className="cp-input"
                    value={formState.fee ?? formState.registrationFee ?? 0}
                    onChange={(e) => setFormState({ ...formState, fee: Number(e.target.value), registrationFee: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              <div className="cp-form-grid-2">
                <div>
                  <label className="cp-label">Registration Mode</label>
                  <select
                    className="cp-select"
                    value={formState.registrationMode || 'INDIVIDUAL'}
                    onChange={(e) => setFormState({ ...formState, registrationMode: e.target.value as RegistrationMode, participationType: e.target.value as RegistrationMode })}
                  >
                    <option value="INDIVIDUAL">Individual Participation</option>
                    <option value="TEAM">Team Participation Only</option>
                    <option value="BOTH">Both Individual &amp; Team</option>
                  </select>
                </div>
                <div>
                  <label className="cp-label">Approval Mode</label>
                  <select
                    className="cp-select"
                    value={formState.approvalMode || 'AUTOMATIC'}
                    onChange={(e) => setFormState({ ...formState, approvalMode: e.target.value as ApprovalMode })}
                  >
                    <option value="AUTOMATIC">Automatic Approval</option>
                    <option value="MANUAL_REVIEW">Manual Review Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="cp-label">Full Description</label>
                <textarea
                  className="cp-input"
                  rows={3}
                  value={formState.description || ''}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Complete event rules, eligibility criteria, schedule..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 flex-wrap" style={{ padding: '10px 14px', background: '#1c1c1f', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formState.requiresPass ?? true}
                    onChange={(e) => setFormState({ ...formState, requiresPass: e.target.checked })}
                  />
                  <span>Issue Official Digital Gate Pass</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formState.includesLunch ?? true}
                    onChange={(e) => setFormState({ ...formState, includesLunch: e.target.checked, lunchProvided: e.target.checked })}
                  />
                  <span>Include Meal / Lunch Voucher</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formState.allowConcurrentRegistration ?? false}
                    onChange={(e) => setFormState({ ...formState, allowConcurrentRegistration: e.target.checked })}
                  />
                  <span>Allow Multiple / Concurrent Entries at Same Time</span>
                </label>
              </div>

              {/* ── Event Card Image & Cover Section ── */}
              <div style={{
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#0369a1', color: '#bae6fd', padding: '5px', borderRadius: '6px' }}>
                      <ImageIcon size={14} />
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '13px', display: 'block' }}>
                        Event Card Banner Image
                      </strong>
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        Visual cover image displayed on student discovery cards &amp; passes
                      </span>
                    </div>
                  </div>

                  {/* Device Image Locator Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: '1px solid #38bdf8',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                      title="Choose photo from your Desktop, iPhone, or Android"
                    >
                      <FolderOpen size={13} />
                      <span>Locate Image on Device</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDeviceImageSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'start', flexWrap: 'wrap' }}>
                  {/* Clickable Live Thumbnail Preview */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to browse image from device (desktop or mobile)"
                    style={{
                      position: 'relative',
                      width: '104px',
                      height: '70px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: '#09090b',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={formState.bannerUrl || QUICK_PRESETS[0].url}
                      alt="Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = QUICK_PRESETS[0].url;
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.55)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        opacity: 0,
                        transition: 'opacity 0.15s ease',
                        color: '#ffffff',
                        fontSize: '9.5px',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <Camera size={14} />
                      <span>Browse File</span>
                    </div>
                  </div>

                  {/* Input & Quick Options */}
                  <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="cp-label" style={{ margin: 0, fontSize: '11px' }}>Image URL / Device Photo</label>
                        {deviceImageNotice && (
                          <span style={{ fontSize: '10.5px', color: '#86efac', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} /> {deviceImageNotice}
                          </span>
                        )}
                        {isProcessingImage && (
                          <span style={{ fontSize: '10.5px', color: '#38bdf8', fontWeight: 600 }}>
                            Optimizing device photo...
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        className="cp-input"
                        value={formState.bannerUrl?.startsWith('data:') ? 'Local Device Photo Loaded (Optimized Image Data)' : (formState.bannerUrl || '')}
                        onChange={(e) => {
                          setFormState({ ...formState, bannerUrl: e.target.value });
                          setDeviceImageNotice(null);
                        }}
                        placeholder="Paste web URL or click 'Locate Image on Device'..."
                        style={{ fontSize: '11.5px' }}
                      />
                    </div>

                    {/* Presets and Device Quick Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Presets:</span>
                      {QUICK_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setFormState({ ...formState, bannerUrl: preset.url });
                            setDeviceImageNotice(null);
                          }}
                          style={{
                            padding: '2px 8px',
                            background: formState.bannerUrl === preset.url ? '#0284c7' : 'rgba(255,255,255,0.06)',
                            border: formState.bannerUrl === preset.url ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            color: formState.bannerUrl === preset.url ? '#ffffff' : '#cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ fontSize: '10.5px', color: '#71717a', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Laptop size={11} /> Desktop files
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Smartphone size={11} /> Mobile gallery &amp; camera
                      </span>
                      <span>•</span>
                      <span>Automatic high-DPI canvas compression</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Multi-Round Competition Configuration ── */}
              <div style={{
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#166534', color: '#86efac', padding: '5px', borderRadius: '6px' }}>
                      <Trophy size={14} />
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '13px', display: 'block' }}>
                        Multi-Round Competition Architecture
                      </strong>
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        Configure 2 or more screening/coding/interview stages for this competition
                      </span>
                    </div>
                  </div>

                  <span style={{
                    background: rounds.length > 1 ? '#14532d' : '#27272a',
                    color: rounds.length > 1 ? '#86efac' : '#a1a1aa',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {rounds.length} {rounds.length === 1 ? 'Round Configured' : 'Rounds Configured'}
                  </span>
                </div>

                {/* Presets and Count buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} color="#facc15" /> Quick Presets:
                  </span>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary cp-btn-sm"
                    onClick={handleApplyPresetCoding3Rounds}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    3-Round Coding (Apti → Tech → Problem Solving)
                  </button>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary cp-btn-sm"
                    onClick={handleApplyPresetHackathon2Rounds}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    2-Round Hackathon
                  </button>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary cp-btn-sm"
                    onClick={handleApplyPresetPlacement3Rounds}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    3-Round Placement
                  </button>
                </div>

                {/* Round Count Selector */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11.5px', color: '#e4e4e7' }}>Choose Rounds:</span>
                    <div style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {[0, 1, 2, 3, 4].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => handleSetRoundCountDirectly(cnt)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: rounds.length === cnt ? 700 : 500,
                            background: rounds.length === cnt ? '#ffffff' : '#27272a',
                            color: rounds.length === cnt ? '#09090b' : '#a1a1aa',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {cnt === 0 ? 'Single Stage' : `${cnt} ${cnt === 1 ? 'Round' : 'Rounds'}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary cp-btn-sm"
                    onClick={handleAddRound}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 8px' }}
                  >
                    <Plus size={11} />
                    <span>Add Round</span>
                  </button>
                </div>

                {/* List of configured rounds */}
                {rounds.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                    {rounds.map((rnd, rIdx) => (
                      <div
                        key={rnd.id || rIdx}
                        style={{
                          background: '#202024',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ background: '#27272a', color: '#86efac', fontWeight: 800, fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                              Round {rnd.roundNumber}
                            </span>
                            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                              {rnd.type}
                            </span>
                            {rnd.eliminationRound && (
                              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px' }}>
                                Knockout
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRound(rIdx)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                            title="Remove Round"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          <div>
                            <label className="cp-label" style={{ fontSize: '10.5px' }}>Round Name</label>
                            <input
                              type="text"
                              className="cp-input"
                              style={{ height: '32px', fontSize: '12px' }}
                              value={rnd.name}
                              onChange={(e) => handleRoundChange(rIdx, 'name', e.target.value)}
                              placeholder="e.g. Round 1: Aptitude & Logic"
                            />
                          </div>
                          <div>
                            <label className="cp-label" style={{ fontSize: '10.5px' }}>Format / Type</label>
                            <select
                              className="cp-select"
                              style={{ height: '32px', fontSize: '12px' }}
                              value={rnd.type}
                              onChange={(e) => handleRoundChange(rIdx, 'type', e.target.value as RoundType)}
                            >
                              {ROUND_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                          <div>
                            <label className="cp-label" style={{ fontSize: '10.5px' }}>Timings</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input
                                type="text"
                                className="cp-input"
                                style={{ height: '30px', fontSize: '11px' }}
                                value={rnd.startTime}
                                onChange={(e) => handleRoundChange(rIdx, 'startTime', e.target.value)}
                                placeholder="10:00 AM"
                              />
                              <input
                                type="text"
                                className="cp-input"
                                style={{ height: '30px', fontSize: '11px' }}
                                value={rnd.endTime}
                                onChange={(e) => handleRoundChange(rIdx, 'endTime', e.target.value)}
                                placeholder="12:00 PM"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="cp-label" style={{ fontSize: '10.5px' }}>Venue / Lab</label>
                            <input
                              type="text"
                              className="cp-input"
                              style={{ height: '30px', fontSize: '11px' }}
                              value={rnd.venue}
                              onChange={(e) => handleRoundChange(rIdx, 'venue', e.target.value)}
                              placeholder="e.g. Lab 4B"
                            />
                          </div>
                          <div>
                            <label className="cp-label" style={{ fontSize: '10.5px' }}>Qualifying Criteria</label>
                            <input
                              type="text"
                              className="cp-input"
                              style={{ height: '30px', fontSize: '11px' }}
                              value={rnd.qualifyingCriteria || ''}
                              onChange={(e) => handleRoundChange(rIdx, 'qualifyingCriteria', e.target.value)}
                              placeholder="e.g. Top 40% advance"
                            />
                          </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#ffffff', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={rnd.eliminationRound ?? false}
                            onChange={(e) => handleRoundChange(rIdx, 'eliminationRound', e.target.checked)}
                          />
                          <span>Elimination / Knockout Round</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Schedule Status & Delay Adjustments ── */}
              <div style={{
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#78350f', color: '#fde047', padding: '5px', borderRadius: '6px' }}>
                      <AlertTriangle size={14} />
                    </div>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '13px', display: 'block' }}>
                        Schedule Reschedule & Delay Status
                      </strong>
                      <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        Indicate if the event or competition has delayed time or shifted dates
                      </span>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fde047', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formState.scheduleUpdate?.isRescheduled ?? false}
                      onChange={(e) => {
                        const isRescheduled = e.target.checked;
                        setFormState({
                          ...formState,
                          scheduleUpdate: {
                            isRescheduled,
                            originalDate: isRescheduled ? (formState.scheduleUpdate?.originalDate || formState.date) : undefined,
                            originalStartTime: isRescheduled ? (formState.scheduleUpdate?.originalStartTime || formState.startTime) : undefined,
                            originalEndTime: isRescheduled ? (formState.scheduleUpdate?.originalEndTime || formState.endTime) : undefined,
                            rescheduledAt: isRescheduled ? new Date().toISOString() : undefined,
                            reason: isRescheduled ? (formState.scheduleUpdate?.reason || '') : '',
                            announcementBroadcasted: formState.scheduleUpdate?.announcementBroadcasted ?? false
                          }
                        });
                      }}
                    />
                    <span>Mark Event as Delayed / Rescheduled</span>
                  </label>
                </div>

                {formState.scheduleUpdate?.isRescheduled && (
                  <div style={{
                    background: '#27272a',
                    border: '1px solid #78350f',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div>
                      <label className="cp-label" style={{ color: '#fde047' }}>
                        Reason for Delay / Rescheduling (Displayed to Attendees)
                      </label>
                      <input
                        type="text"
                        className="cp-input"
                        value={formState.scheduleUpdate.reason || ''}
                        onChange={(e) => setFormState({
                          ...formState,
                          scheduleUpdate: {
                            ...formState.scheduleUpdate!,
                            reason: e.target.value
                          }
                        })}
                        placeholder="e.g. Inclement weather on campus; Round 1 evaluation extended; Server maintenance..."
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', color: '#d4d4d8' }}>
                      <span>
                        Original Date: <strong style={{ color: '#ffffff' }}>{formState.scheduleUpdate.originalDate || formState.date}</strong>
                      </span>
                      <span>
                        Original Timing: <strong style={{ color: '#ffffff' }}>{formState.scheduleUpdate.originalStartTime || formState.startTime} - {formState.scheduleUpdate.originalEndTime || formState.endTime}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer */}
            <div className="cp-modal-footer">
              <button
                type="button"
                className="cp-btn cp-btn-outline"
                onClick={() => setViewMode('REGISTRY_LIST')}
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
                <span>{saving ? 'Saving...' : currentEditId ? 'Update Event in Registry' : 'Save New Event'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
