import React, { useState } from 'react';
import type { CampusEvent, EventRound, RoundType, RoundStatus } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Save,
  Trophy,
  Code,
  FileText,
  Users
} from 'lucide-react';

interface ManageEventRoundsModalProps {
  event: CampusEvent;
  onClose: () => void;
  onSaveRounds: (eventId: string, rounds: EventRound[]) => Promise<void>;
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

const ROUND_STATUSES: { value: RoundStatus; label: string }[] = [
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ONGOING', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DELAYED', label: 'Delayed / Rescheduled' },
];

export const ManageEventRoundsModal: React.FC<ManageEventRoundsModalProps> = ({
  event,
  onClose,
  onSaveRounds
}) => {
  const [rounds, setRounds] = useState<EventRound[]>(() => {
    if (event.rounds && event.rounds.length > 0) {
      return [...event.rounds];
    }
    // Default 1 initial round
    return [
      {
        id: `RND-${Date.now()}-1`,
        roundNumber: 1,
        name: `${event.title} - Main Round`,
        type: event.category === 'CODING_COMPETITION' ? 'CODING' : event.category === 'HACKATHON' ? 'HACKATHON' : 'GENERAL',
        date: event.date || new Date().toISOString().slice(0, 10),
        startTime: event.startTime || '10:00 AM',
        endTime: event.endTime || '01:00 PM',
        venue: event.venue || 'Campus Auditorium',
        description: 'Primary evaluation stage for all registered participants.',
        status: 'UPCOMING',
        eliminationRound: false,
        qualifyingCriteria: 'Open to all registered attendees'
      }
    ];
  });

  const [saving, setSaving] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Preset Handlers
  const applyPresetCoding3Rounds = () => {
    const eventDate = event.date || new Date().toISOString().slice(0, 10);
    setRounds([
      {
        id: `RND-${Date.now()}-1`,
        roundNumber: 1,
        name: 'Round 1: Aptitude & Logical Reasoning',
        type: 'APTITUDE',
        date: eventDate,
        startTime: '10:00 AM',
        endTime: '11:15 AM',
        venue: 'Turing Computer Lab A',
        description: 'Timed assessment covering quantitative analysis, logical deduction, discrete math, and algorithm trace problems.',
        status: 'UPCOMING',
        eliminationRound: true,
        qualifyingCriteria: 'Top 50% scorers advance to Technical Round'
      },
      {
        id: `RND-${Date.now()}-2`,
        roundNumber: 2,
        name: 'Round 2: Technical MCQ & Core Computer Science',
        type: 'TECHNICAL',
        date: eventDate,
        startTime: '12:00 PM',
        endTime: '01:15 PM',
        venue: 'Turing Computer Lab B',
        description: 'In-depth assessment of Data Structures, Operating Systems, DBMS concurrency, and Object-Oriented design.',
        status: 'UPCOMING',
        eliminationRound: true,
        qualifyingCriteria: 'Top 20 finalists advance to the Problem Solving Finale'
      },
      {
        id: `RND-${Date.now()}-3`,
        roundNumber: 3,
        name: 'Round 3: Advanced Algorithmic Problem Solving',
        type: 'PROBLEM_SOLVING',
        date: eventDate,
        startTime: '02:30 PM',
        endTime: '05:30 PM',
        venue: 'Main Computing Center Sandboxes',
        description: 'Live competitive coding challenge on dynamic programming, graph algorithms, and system optimization.',
        status: 'UPCOMING',
        eliminationRound: false,
        qualifyingCriteria: 'Top 3 cumulative performers declared Podium Winners'
      }
    ]);
  };

  const applyPresetHackathon2Rounds = () => {
    const eventDate = event.date || new Date().toISOString().slice(0, 10);
    setRounds([
      {
        id: `RND-${Date.now()}-1`,
        roundNumber: 1,
        name: 'Round 1: Problem Statement Pitch & Architecture Review',
        type: 'PRESENTATION',
        date: eventDate,
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        venue: 'Innovation Hub Seminar Hall',
        description: 'Teams pitch their problem statement, system architecture, tech stack, and user empathy map to faculty mentors.',
        status: 'UPCOMING',
        eliminationRound: true,
        qualifyingCriteria: 'Shortlisted teams qualify for the 24-Hour Prototype Sprint'
      },
      {
        id: `RND-${Date.now()}-2`,
        roundNumber: 2,
        name: 'Round 2: 24-Hour Prototype Build & Jury Demo',
        type: 'HACKATHON',
        date: eventDate,
        startTime: '02:00 PM',
        endTime: '02:00 PM (Next Day)',
        venue: 'Grand Tech Arena Halls 1 & 2',
        description: 'Non-stop design, development, and deployment sprint followed by live working prototype demos before industry judges.',
        status: 'UPCOMING',
        eliminationRound: false,
        qualifyingCriteria: 'Top 3 projects awarded cash prizes and incubation grants'
      }
    ]);
  };

  const applyPresetPlacement3Rounds = () => {
    const eventDate = event.date || new Date().toISOString().slice(0, 10);
    setRounds([
      {
        id: `RND-${Date.now()}-1`,
        roundNumber: 1,
        name: 'Round 1: Quantitative Aptitude & Verbal Ability',
        type: 'APTITUDE',
        date: eventDate,
        startTime: '09:30 AM',
        endTime: '11:00 AM',
        venue: 'Examination Block 301-305',
        description: 'Standardized tier-1 placement screening test measuring speed, mathematical problem solving, and verbal clarity.',
        status: 'UPCOMING',
        eliminationRound: true,
        qualifyingCriteria: 'Minimum 65th percentile required to qualify'
      },
      {
        id: `RND-${Date.now()}-2`,
        roundNumber: 2,
        name: 'Round 2: Technical Assessment & Live Coding',
        type: 'CODING',
        date: eventDate,
        startTime: '12:00 PM',
        endTime: '02:00 PM',
        venue: 'High-Density Computing Labs',
        description: 'Coding implementation of 2 algorithmic questions plus SQL query writing and CS core fundamentals.',
        status: 'UPCOMING',
        eliminationRound: true,
        qualifyingCriteria: 'Both problems must pass 100% of hidden test suites'
      },
      {
        id: `RND-${Date.now()}-3`,
        roundNumber: 3,
        name: 'Round 3: Technical & Behavioral HR Panel Interview',
        type: 'INTERVIEW',
        date: eventDate,
        startTime: '03:00 PM',
        endTime: '06:00 PM',
        venue: 'Corporate Placement Boardrooms',
        description: 'One-on-one deep dive into resume projects, problem solving mindset, domain knowledge, and culture fit.',
        status: 'UPCOMING',
        eliminationRound: false,
        qualifyingCriteria: 'Final employment offer letter issuance'
      }
    ]);
  };

  const setRoundCountDirectly = (targetCount: number) => {
    if (targetCount < 1) targetCount = 1;
    if (targetCount > 8) targetCount = 8;
    const current = [...rounds];
    if (targetCount > current.length) {
      // Add rounds
      const eventDate = event.date || new Date().toISOString().slice(0, 10);
      for (let i = current.length + 1; i <= targetCount; i++) {
        current.push({
          id: `RND-${Date.now()}-${i}`,
          roundNumber: i,
          name: `Round ${i}: Stage ${i} Evaluation`,
          type: i === 1 ? 'APTITUDE' : i === 2 ? 'TECHNICAL' : 'PROBLEM_SOLVING',
          date: eventDate,
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          venue: event.venue || 'Campus Auditorium',
          description: `Detailed evaluation criteria for Round ${i}.`,
          status: 'UPCOMING',
          eliminationRound: i < targetCount,
          qualifyingCriteria: `Qualifying criteria for Stage ${i}`
        });
      }
    } else if (targetCount < current.length) {
      // Trim rounds
      current.splice(targetCount);
    }
    setRounds(current.map((r, idx) => ({ ...r, roundNumber: idx + 1 })));
  };

  const handleAddRound = () => {
    const nextNum = rounds.length + 1;
    const eventDate = event.date || new Date().toISOString().slice(0, 10);
    const newRound: EventRound = {
      id: `RND-${Date.now()}-${nextNum}`,
      roundNumber: nextNum,
      name: `Round ${nextNum}: New Stage`,
      type: 'TECHNICAL',
      date: eventDate,
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      venue: event.venue || 'Campus Auditorium',
      description: `Evaluation guidelines for Round ${nextNum}.`,
      status: 'UPCOMING',
      eliminationRound: false,
      qualifyingCriteria: 'Qualifying threshold'
    };
    setRounds([...rounds, newRound]);
  };

  const handleRemoveRound = (index: number) => {
    if (rounds.length <= 1) {
      setErrorNotice('An event must have at least 1 round.');
      setTimeout(() => setErrorNotice(null), 3000);
      return;
    }
    const updated = rounds.filter((_, idx) => idx !== index).map((r, idx) => ({
      ...r,
      roundNumber: idx + 1
    }));
    setRounds(updated);
  };

  const handleMoveRound = (index: number, direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'UP' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rounds.length) return;
    const updated = [...rounds];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setRounds(updated.map((r, idx) => ({ ...r, roundNumber: idx + 1 })));
  };

  const handleRoundChange = (index: number, field: keyof EventRound, value: any) => {
    const updated = [...rounds];
    updated[index] = { ...updated[index], [field]: value };
    setRounds(updated);
  };

  const handleSave = async () => {
    if (rounds.length === 0) {
      setErrorNotice('Please configure at least 1 round.');
      return;
    }

    // Validate that each round has a name and venue
    for (let i = 0; i < rounds.length; i++) {
      if (!rounds[i].name.trim()) {
        setErrorNotice(`Round ${i + 1} must have a name.`);
        return;
      }
    }

    setSaving(true);
    try {
      await onSaveRounds(event.id, rounds);
      onClose();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to save event rounds.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth: '820px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cp-modal-header" style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#166534',
                color: '#86efac',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                {event.category}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Event ID: {event.id}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Configure Multi-Round Competition Architecture
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

        {/* Quick Presets & Round Count Toolbar */}
        <div style={{
          padding: '12px 22px',
          background: '#18181b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} color="#facc15" />
              Presets:
            </span>
            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={applyPresetCoding3Rounds}
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '6px' }}
            >
              <Code size={12} />
              <span>3-Round Coding Contest (Apti → Tech → Problem Solving)</span>
            </button>
            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={applyPresetHackathon2Rounds}
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '6px' }}
            >
              <Trophy size={12} />
              <span>2-Round Hackathon (Pitch → 24h Build)</span>
            </button>
            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={applyPresetPlacement3Rounds}
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '6px' }}
            >
              <Users size={12} />
              <span>3-Round Placement Drive</span>
            </button>
          </div>

          {/* Quick Round Count Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e4e4e7' }}>
                Total Rounds:
              </span>
              <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
                {[1, 2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setRoundCountDirectly(cnt)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: rounds.length === cnt ? 700 : 500,
                      background: rounds.length === cnt ? '#ffffff' : '#27272a',
                      color: rounds.length === cnt ? '#09090b' : '#a1a1aa',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cnt} {cnt === 1 ? 'Round' : 'Rounds'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="cp-btn cp-btn-secondary cp-btn-sm"
              onClick={handleAddRound}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
            >
              <Plus size={13} />
              <span>Add Custom Round</span>
            </button>
          </div>
        </div>

        {/* Error Feedback */}
        {errorNotice && (
          <div style={{
            margin: '10px 22px 0 22px',
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
            <AlertCircle size={14} />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Modal Scrollable Body: List of Round Cards */}
        <div className="cp-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {rounds.map((round, idx) => (
            <div
              key={round.id || idx}
              style={{
                background: '#18181b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Round Header Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#27272a',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    color: '#86efac',
                    fontWeight: 800,
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '8px'
                  }}>
                    Round {round.roundNumber}
                  </span>
                  <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                    Stage {idx + 1} of {rounds.length}
                  </span>
                  {round.eliminationRound && (
                    <span style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Knockout / Elimination
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleMoveRound(idx, 'UP')}
                    disabled={idx === 0}
                    title="Move Round Earlier"
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: idx === 0 ? '#52525b' : '#a1a1aa',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveRound(idx, 'DOWN')}
                    disabled={idx === rounds.length - 1}
                    title="Move Round Later"
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: idx === rounds.length - 1 ? '#52525b' : '#a1a1aa',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      cursor: idx === rounds.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRound(idx)}
                    title="Remove Round"
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Round Name & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                <div>
                  <label className="cp-label">Round Title / Stage Name</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={round.name}
                    onChange={(e) => handleRoundChange(idx, 'name', e.target.value)}
                    placeholder="e.g. Round 1: Aptitude & Reasoning"
                    required
                  />
                </div>
                <div>
                  <label className="cp-label">Round Format / Type</label>
                  <select
                    className="cp-select"
                    value={round.type}
                    onChange={(e) => handleRoundChange(idx, 'type', e.target.value as RoundType)}
                  >
                    {ROUND_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Timings & Venue */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                <div>
                  <label className="cp-label">Round Date</label>
                  <input
                    type="date"
                    className="cp-input"
                    value={round.date}
                    onChange={(e) => handleRoundChange(idx, 'date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="cp-label">Start Time</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={round.startTime}
                    onChange={(e) => handleRoundChange(idx, 'startTime', e.target.value)}
                    placeholder="10:00 AM"
                  />
                </div>
                <div>
                  <label className="cp-label">End Time</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={round.endTime}
                    onChange={(e) => handleRoundChange(idx, 'endTime', e.target.value)}
                    placeholder="01:00 PM"
                  />
                </div>
                <div>
                  <label className="cp-label">Venue / Room / Lab</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={round.venue}
                    onChange={(e) => handleRoundChange(idx, 'venue', e.target.value)}
                    placeholder="e.g. Lab 4B / Audi 1"
                  />
                </div>
              </div>

              {/* Status & Knockout Policy */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div>
                  <label className="cp-label">Stage Status</label>
                  <select
                    className="cp-select"
                    value={round.status}
                    onChange={(e) => handleRoundChange(idx, 'status', e.target.value as RoundStatus)}
                  >
                    {ROUND_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="cp-label">Qualifying / Passing Criteria</label>
                  <input
                    type="text"
                    className="cp-input"
                    value={round.qualifyingCriteria || ''}
                    onChange={(e) => handleRoundChange(idx, 'qualifyingCriteria', e.target.value)}
                    placeholder="e.g. Top 30% advance or score >= 75%"
                  />
                </div>
              </div>

              {/* Description & Elimination Checkbox */}
              <div>
                <label className="cp-label">Round Description & Instructions</label>
                <input
                  type="text"
                  className="cp-input"
                  value={round.description || ''}
                  onChange={(e) => handleRoundChange(idx, 'description', e.target.value)}
                  placeholder="Details on what participants will do in this round..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={round.eliminationRound ?? false}
                    onChange={(e) => handleRoundChange(idx, 'eliminationRound', e.target.checked)}
                  />
                  <span>Mark as Elimination / Knockout Stage (Participants who do not qualify are filtered out)</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="cp-modal-footer" style={{ padding: '14px 22px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            className="cp-btn cp-btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={14} />
            <span>{saving ? 'Saving Rounds...' : `Save ${rounds.length} Competition Rounds`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
