import React, { useState } from 'react';
import type { CampusEvent, DietaryPreference, TeamMember } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import { getEventStudentActionState } from '../../lib/scheduleCollision';
import {
  X,
  Users,
  User,
  Utensils,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  FileCheck,
  Mail,
  School,
  GraduationCap,
  BookOpen,
  Phone,
  Hash,
  AlertTriangle,
  Layers
} from 'lucide-react';

interface EventRegistrationModalProps {
  event: CampusEvent;
  onClose: () => void;
  onSuccess: (regId: string) => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI-DS)',
  'Electronics & Telecommunication (E&TC)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Electrical Engineering (EE)',
  'Master of Computer Applications (MCA)',
  'MBA / Management Studies',
  'Applied Sciences & Humanities',
  'Other / Interdisciplinary'
];

const ACADEMIC_YEARS = [
  'First Year (FY)',
  'Second Year (SY)',
  'Third Year (TY)',
  'Final Year (Fourth Year / B.Tech / BE)',
  'Postgraduate (PG / M.Tech / MBA / MCA)'
];

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  event,
  onClose,
  onSuccess
}) => {
  const { currentUser, registrations, events, submitRegistration, allowConcurrentRegistrations, theme } = useCampusPass();
  const isDark = theme === 'dark';

  // Registration type choice (if event allows BOTH)
  const [participationType, setParticipationType] = useState<'INDIVIDUAL' | 'TEAM'>(
    event.participationType === 'TEAM' ? 'TEAM' : 'INDIVIDUAL'
  );

  // Primary Applicant Interactive Form States
  const [studentName, setStudentName] = useState(currentUser.fullName || '');
  const [studentId, setStudentId] = useState(currentUser.studentId || '');
  const [collegeName, setCollegeName] = useState('Apex Institute of Technology');
  const [department, setDepartment] = useState(currentUser.department || DEPARTMENTS[0]);
  const [academicYear, setAcademicYear] = useState('Third Year (TY)');
  const [studentEmail, setStudentEmail] = useState(currentUser.email || '');
  const [studentPhone, setStudentPhone] = useState(currentUser.phone || '+91 98234 11220');

  // Meal & Team states
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('VEG');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      studentId: currentUser.studentId || 'STU-LEADER',
      name: currentUser.fullName || 'Team Leader',
      email: currentUser.email || '',
      collegeName: 'Apex Institute of Technology',
      department: currentUser.department || DEPARTMENTS[0],
      academicYear: 'Third Year (TY)',
      role: 'LEADER'
    }
  ]);

  // New member draft inputs
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberStudentId, setNewMemberStudentId] = useState('');
  const [newMemberCollege, setNewMemberCollege] = useState('Apex Institute of Technology');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberDepartment, setNewMemberDepartment] = useState(DEPARTMENTS[0]);
  const [newMemberYear, setNewMemberYear] = useState(ACADEMIC_YEARS[2]);

  // Guidelines confirmation
  const [agreedToRules, setAgreedToRules] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live action & collision state based on active student input
  const liveActionState = getEventStudentActionState(
    event,
    studentId.trim() || currentUser?.studentId,
    studentEmail.trim() || currentUser?.email,
    registrations,
    events,
    allowConcurrentRegistrations
  );

  // Member addition
  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberStudentId.trim() || !newMemberEmail.trim()) {
      setErrorMessage('Please fill in Member Name, Student ID, and Email.');
      return;
    }

    if (teamMembers.length >= event.maxTeamSize) {
      setErrorMessage(`Maximum team size for this event is ${event.maxTeamSize} members.`);
      return;
    }

    // Check duplicate student ID
    if (teamMembers.some(m => m.studentId.toLowerCase() === newMemberStudentId.trim().toLowerCase())) {
      setErrorMessage('A team member with this Student ID is already added.');
      return;
    }

    setTeamMembers([
      ...teamMembers,
      {
        studentId: newMemberStudentId.trim(),
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        collegeName: newMemberCollege.trim(),
        department: newMemberDepartment,
        academicYear: newMemberYear,
        role: 'MEMBER'
      }
    ]);

    // Reset draft fields
    setNewMemberName('');
    setNewMemberStudentId('');
    setNewMemberEmail('');
    setErrorMessage(null);
  };

  const handleRemoveMember = (memberStudentId: string) => {
    if (memberStudentId === studentId || memberStudentId === currentUser.studentId) {
      setErrorMessage('You cannot remove the primary team leader.');
      return;
    }
    setTeamMembers(teamMembers.filter(m => m.studentId !== memberStudentId));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!studentName.trim()) {
      setErrorMessage('Please fill in your Full Name.');
      return;
    }
    if (!studentId.trim()) {
      setErrorMessage('Please fill in your Student Roll No / PRN.');
      return;
    }
    if (!collegeName.trim()) {
      setErrorMessage('Please provide your College / Institute Name.');
      return;
    }
    if (!studentEmail.trim()) {
      setErrorMessage('Please provide your Email Address for pass delivery.');
      return;
    }
    if (!studentPhone.trim()) {
      setErrorMessage('Please provide your Contact Phone Number.');
      return;
    }
    if (!agreedToRules) {
      setErrorMessage('You must acknowledge and accept the event rules and college code of conduct.');
      return;
    }

    // Check action state & schedule collision
    const actionState = getEventStudentActionState(event, studentId.trim(), studentEmail.trim(), registrations, events, allowConcurrentRegistrations);
    if (!actionState.canApply) {
      setErrorMessage(actionState.reason || 'You are ineligible to register for this event due to a scheduling constraint.');
      return;
    }

    if (participationType === 'TEAM') {
      if (!teamName.trim()) {
        setErrorMessage('Please provide a unique Team Name.');
        return;
      }
      if (teamMembers.length < event.minTeamSize) {
        setErrorMessage(`This event requires a minimum of ${event.minTeamSize} team members. You currently have ${teamMembers.length}.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Update team leader info if team mode
      const updatedMembers = participationType === 'TEAM'
        ? teamMembers.map(m => m.role === 'LEADER' ? {
            ...m,
            name: studentName.trim(),
            studentId: studentId.trim(),
            email: studentEmail.trim(),
            collegeName: collegeName.trim(),
            department,
            academicYear
          } : m)
        : undefined;

      const payload = {
        eventId: event.id,
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        studentPhone: studentPhone.trim(),
        phone: studentPhone.trim(),
        collegeName: collegeName.trim(),
        department,
        academicYear,
        participationType,
        teamName: participationType === 'TEAM' ? teamName.trim() : undefined,
        teamMembers: updatedMembers,
        dietaryPreference: event.lunchProvided || event.includesLunch ? dietaryPreference : undefined,
      };

      const result = await submitRegistration(payload);

      if (result.success && result.data) {
        onSuccess(result.data.id);
      } else {
        setErrorMessage(result.message || 'Registration failed. Please check requirements.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '10px',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
    background: isDark ? '#141416' : '#ffffff',
    fontSize: '12.5px',
    color: isDark ? '#ffffff' : '#0f172a',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: isDark ? '#d4d4d8' : '#334155',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className={`cp-modal ${!isDark ? 'cp-modal-white' : ''}`}
        style={{
          maxWidth: '640px',
          background: isDark ? '#141416' : '#ffffff',
          color: isDark ? '#ffffff' : '#09090b',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e4e4e7',
          boxShadow: isDark ? '0 30px 80px -15px rgba(0, 0, 0, 0.9)' : '0 25px 60px -15px rgba(0, 0, 0, 0.22)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header */}
        <div className="cp-modal-header" style={{
          background: isDark ? '#141416' : '#ffffff',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e4e4e7'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#86efac' : '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Official Application Desk
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: isDark ? '#ffffff' : '#09090b', lineHeight: 1.25 }}>
              Register for {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f4f4f5',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e4e4e7',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: isDark ? '#d4d4d8' : '#71717a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.12s'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Flex Form Container: Body scrolls while Footer is securely pinned! */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* Scrollable Form Body */}
          <div className="cp-modal-body" style={{
            background: isDark ? '#141416' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Quick Event Summary */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#1c1c1f' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              fontSize: '12px',
              color: isDark ? '#d4d4d8' : '#334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} style={{ color: isDark ? '#86efac' : '#166534' }} />
                <span>{event.startDate || event.date} • {event.startTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: isDark ? '#38bdf8' : '#0284c7' }} />
                <span className="truncate">{event.venue}</span>
              </div>
              <div style={{ fontWeight: 800, color: isDark ? '#86efac' : '#166534' }}>
                {(event.fee ?? event.registrationFee ?? 0) === 0 ? 'FREE ENTRY' : `₹${event.fee ?? event.registrationFee}`}
              </div>
            </div>

            {/* Pass Policy Disclosure */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: event.requiresPass !== false 
                ? (isDark ? 'rgba(22, 101, 52, 0.2)' : '#f0fdf4') 
                : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'),
              border: event.requiresPass !== false 
                ? (isDark ? '1px solid rgba(134, 239, 172, 0.3)' : '1px solid #bbf7d0') 
                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0'),
              fontSize: '11.5px',
              color: event.requiresPass !== false ? (isDark ? '#86efac' : '#166534') : (isDark ? '#d4d4d8' : '#475569')
            }}>
              {event.requiresPass !== false ? (
                <>
                  <Mail size={15} style={{ color: isDark ? '#86efac' : '#166534', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Pass Delivery Policy:</strong> Official Digital Entry Pass with security barcode will be emailed directly to: <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{studentEmail || 'your entered email'}</strong> upon confirmation.
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle size={15} style={{ color: isDark ? '#a1a1aa' : '#64748b', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Pass Policy:</strong> Open Attendance (No gate pass required). Online registration reserves your seat instantly; simply present your standard student ID.
                  </div>
                </>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '12px'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Collision or Multiple Entry Alert */}
            {liveActionState.status === 'TIME_CONFLICT' && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '12px',
                lineHeight: 1.45
              }}>
                <AlertTriangle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#f87171' }}>Schedule Collision Detected:</strong> You are already registered for <strong>{liveActionState.conflictingEvent?.title}</strong> on <strong>{event.date}</strong> ({liveActionState.conflictingEvent?.startTime} – {liveActionState.conflictingEvent?.endTime}). Simultaneous attendance is currently restricted by campus policy.
                </div>
              </div>
            )}

            {liveActionState.hasConcurrentOverlap && (liveActionState.status === 'AVAILABLE' || liveActionState.status === 'WAITLIST') && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.35)',
                color: '#bae6fd',
                fontSize: '12px',
                lineHeight: 1.45
              }}>
                <Layers size={15} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#38bdf8' }}>Multiple Entries Permitted:</strong> This event schedule overlaps with <strong>{liveActionState.conflictingEvent?.title}</strong> on <strong>{event.date}</strong> ({liveActionState.conflictingEvent?.startTime} – {liveActionState.conflictingEvent?.endTime}), but multiple entries are enabled by admin policy.
                </div>
              </div>
            )}

            {/* Mode Selector if Event Allows BOTH */}
            {(event.participationType === 'BOTH' || event.registrationMode === 'BOTH') && (
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: isDark ? '#e4e4e7' : '#334155', marginBottom: '5px', display: 'block' }}>
                  Select Registration Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setParticipationType('INDIVIDUAL')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: participationType === 'INDIVIDUAL' ? '#166534' : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f4f4f5'),
                      color: participationType === 'INDIVIDUAL' ? '#ffffff' : (isDark ? '#e4e4e7' : '#334155'),
                      border: participationType === 'INDIVIDUAL' ? '1px solid #166534' : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e4e4e7')
                    }}
                  >
                    <User size={13} />
                    Individual Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipationType('TEAM')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: participationType === 'TEAM' ? '#166534' : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#f4f4f5'),
                      color: participationType === 'TEAM' ? '#ffffff' : (isDark ? '#e4e4e7' : '#334155'),
                      border: participationType === 'TEAM' ? '1px solid #166534' : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e4e4e7')
                    }}
                  >
                    <Users size={13} />
                    Team Entry ({event.minTeamSize}–{event.maxTeamSize} pax)
                  </button>
                </div>
              </div>
            )}

            {/* Student Applicant Information (Interactive Form Fields) */}
            <div style={{
              background: isDark ? '#1c1c1f' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={15} style={{ color: isDark ? '#86efac' : '#166534' }} />
                  Student Credentials & Institutional Details
                </span>
                <span style={{ fontSize: '10.5px', color: isDark ? '#a1a1aa' : '#64748b' }}>All fields required</span>
              </div>

              {/* Row 1: Full Name & Roll No */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>
                    <User size={12} style={{ color: isDark ? '#86efac' : '#166534' }} />
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ajinkya More"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <Hash size={12} style={{ color: isDark ? '#86efac' : '#166534' }} />
                    Student Roll No / PRN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-2023-CS-041"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 2: College / Institute Name */}
              <div>
                <label style={labelStyle}>
                  <School size={12} style={{ color: isDark ? '#86efac' : '#166534' }} />
                  College / Institute / University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Institute of Technology, PICT, COEP, VIT Pune"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Row 3: Department & Year of Study */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>
                    <BookOpen size={12} style={{ color: isDark ? '#86efac' : '#166534' }} />
                    Department / Branch *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} style={{ background: isDark ? '#1c1c1f' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <GraduationCap size={12} style={{ color: isDark ? '#86efac' : '#166534' }} />
                    Year of Study (Academic Year) *
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr} style={{ background: isDark ? '#1c1c1f' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Email Address & Phone Number */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>
                    <Mail size={12} style={{ color: isDark ? '#86efac' : '#166534' }} />
                    College / Personal Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ajinkya.more@apex.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '10px', color: isDark ? '#a1a1aa' : '#64748b', marginTop: '2px', display: 'block' }}>
                    Digital QR entry pass will be emailed to this address
                  </span>
                </div>

                <div>
                  <label style={labelStyle}>
                    <Phone size={12} style={{ color: isDark ? '#86efac' : '#166534' }} />
                    Contact / WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98234 11220"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '10px', color: isDark ? '#a1a1aa' : '#64748b', marginTop: '2px', display: 'block' }}>
                    Used for instant SMS / gate emergency notifications
                  </span>
                </div>
              </div>
            </div>

            {/* Team Registration Section */}
            {participationType === 'TEAM' && (
              <div style={{
                padding: '14px',
                borderRadius: '14px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                backgroundColor: isDark ? '#1c1c1f' : '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12.5px', color: isDark ? '#ffffff' : '#0f172a' }}>
                    <Users size={14} style={{ color: isDark ? '#86efac' : '#166534' }} />
                    <span>Team Roster Builder</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                    Required: {event.minTeamSize} to {event.maxTeamSize} members
                  </span>
                </div>

                <div>
                  <label style={labelStyle}>
                    Team Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex CyberKnights, Neural Forge"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#d4d4d8' : '#334155', marginBottom: '6px', display: 'block' }}>
                    Team Members ({teamMembers.length} / {event.maxTeamSize})
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {teamMembers.map((member) => (
                      <div
                        key={member.studentId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: isDark ? '#141416' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                          fontSize: '11.5px'
                        }}
                      >
                        <div>
                          <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{member.role === 'LEADER' ? (studentName || member.name) : member.name}</strong>{' '}
                          <span style={{ color: isDark ? '#a1a1aa' : '#64748b' }}>({member.role === 'LEADER' ? (studentId || member.studentId) : member.studentId})</span>
                          <div style={{ fontSize: '10.5px', color: isDark ? '#a1a1aa' : '#64748b' }}>
                            {member.role === 'LEADER' ? collegeName : (member.collegeName || collegeName)} • {member.role === 'LEADER' ? department : member.department} • {member.role === 'LEADER' ? academicYear : (member.academicYear || 'Third Year')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: member.role === 'LEADER' 
                              ? (isDark ? 'rgba(22, 101, 52, 0.3)' : '#dcfce7') 
                              : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'),
                            color: member.role === 'LEADER' ? (isDark ? '#86efac' : '#166534') : (isDark ? '#d4d4d8' : '#475569')
                          }}>
                            {member.role}
                          </span>
                          {member.role !== 'LEADER' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.studentId)}
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                              title="Remove Member"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Member Input Group */}
                {teamMembers.length < event.maxTeamSize && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isDark ? '1px dashed rgba(255, 255, 255, 0.18)' : '1px dashed #cbd5e1',
                    backgroundColor: isDark ? '#141416' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#86efac' : '#166534' }}>+ Add Teammate Details</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Teammate Full Name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Roll No / PRN (e.g. STU-055)"
                        value={newMemberStudentId}
                        onChange={(e) => setNewMemberStudentId(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Teammate College / Institute Name"
                        value={newMemberCollege}
                        onChange={(e) => setNewMemberCollege(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '6px' }}>
                      <select
                        value={newMemberDepartment}
                        onChange={(e) => setNewMemberDepartment(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept} style={{ background: isDark ? '#1c1c1f' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newMemberYear}
                        onChange={(e) => setNewMemberYear(e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                      >
                        {ACADEMIC_YEARS.map((yr) => (
                          <option key={yr} value={yr} style={{ background: isDark ? '#1c1c1f' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Teammate Email Address"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                        color: isDark ? '#ffffff' : '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={11} />
                      Add Teammate to Roster
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Complimentary Lunch Option (If Event has lunch) */}
            {(event.lunchProvided || event.includesLunch) && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(134, 239, 172, 0.25)' : '1px solid #bbf7d0',
                backgroundColor: isDark ? 'rgba(22, 101, 52, 0.15)' : '#f0fdf4',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: isDark ? '#86efac' : '#166534' }}>
                  <Utensils size={13} />
                  <span>Complimentary College Meal Voucher</span>
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: isDark ? '#a1a1aa' : '#475569' }}>
                  This event includes an institutional lunch coupon at the College Dining Hall. Select dietary category:
                </p>
                <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
                  {(['VEG', 'NON_VEG', 'JAIN'] as DietaryPreference[]).map((pref) => (
                    <label
                      key={pref}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        fontWeight: dietaryPreference === pref ? 700 : 500,
                        color: dietaryPreference === pref ? (isDark ? '#86efac' : '#166534') : (isDark ? '#d4d4d8' : '#334155')
                      }}
                    >
                      <input
                        type="radio"
                        name="dietary"
                        value={pref}
                        checked={dietaryPreference === pref}
                        onChange={() => setDietaryPreference(pref)}
                      />
                      <span>{pref === 'VEG' ? 'Vegetarian' : pref === 'NON_VEG' ? 'Non-Veg' : 'Jain Diet'}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Agreement Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#1c1c1f' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0'
            }}>
              <input
                type="checkbox"
                id="agree-rules"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <label htmlFor="agree-rules" style={{ fontSize: '11.5px', color: isDark ? '#a1a1aa' : '#475569', lineHeight: 1.45, cursor: 'pointer' }}>
                I agree to abide by the event regulations, venue safety protocols, and institutional student code of conduct. I confirm all details provided are accurate and understand passes are non-transferable.
              </label>
            </div>
          </div>

          {/* Pinned Action Footer (ALWAYS 100% visible inside the card!) */}
          <div className="cp-modal-footer" style={{
            background: isDark ? '#141416' : '#ffffff',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e4e4e7'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f4f4f5',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #e4e4e7',
                color: isDark ? '#e4e4e7' : '#09090b',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !liveActionState.canApply}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                background: !liveActionState.canApply ? (isDark ? '#27272a' : '#e2e8f0') : '#166534',
                color: !liveActionState.canApply ? (isDark ? '#a1a1aa' : '#94a3b8') : '#ffffff',
                border: !liveActionState.canApply ? (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1') : '1px solid #166534',
                cursor: !liveActionState.canApply ? 'not-allowed' : 'pointer',
                boxShadow: !liveActionState.canApply ? 'none' : '0 4px 14px rgba(22, 101, 52, 0.4)'
              }}
            >
              {submitting ? (
                <>Processing...</>
              ) : !liveActionState.canApply ? (
                <>
                  <AlertTriangle size={14} color="#f87171" />
                  {liveActionState.status === 'TIME_CONFLICT' ? 'Time Conflict' : 'Registration Unavailable'}
                </>
              ) : (
                <>
                  <FileCheck size={14} />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
