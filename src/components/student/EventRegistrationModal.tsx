import React, { useState } from 'react';
import type { CampusEvent, DietaryPreference, TeamMember } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
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
  Mail
} from 'lucide-react';

interface EventRegistrationModalProps {
  event: CampusEvent;
  onClose: () => void;
  onSuccess: (regId: string) => void;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  event,
  onClose,
  onSuccess
}) => {
  const { currentUser, submitRegistration } = useCampusPass();

  // Registration type choice (if event allows BOTH)
  const [participationType, setParticipationType] = useState<'INDIVIDUAL' | 'TEAM'>(
    event.participationType === 'TEAM' ? 'TEAM' : 'INDIVIDUAL'
  );

  // Form states
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('VEG');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      studentId: currentUser.studentId || 'STU-APPLICANT',
      name: currentUser.fullName,
      email: currentUser.email,
      department: currentUser.department,
      role: 'LEADER'
    }
  ]);

  // New member draft inputs
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberStudentId, setNewMemberStudentId] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberDepartment, setNewMemberDepartment] = useState(currentUser.department);

  // Guidelines confirmation
  const [agreedToRules, setAgreedToRules] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        department: newMemberDepartment,
        role: 'MEMBER'
      }
    ]);

    // Reset draft fields
    setNewMemberName('');
    setNewMemberStudentId('');
    setNewMemberEmail('');
    setErrorMessage(null);
  };

  const handleRemoveMember = (studentId: string) => {
    if (studentId === currentUser.studentId) {
      setErrorMessage('You cannot remove the team leader.');
      return;
    }
    setTeamMembers(teamMembers.filter(m => m.studentId !== studentId));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedToRules) {
      setErrorMessage('You must acknowledge and accept the event rules and college code of conduct.');
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
      const payload = {
        eventId: event.id,
        studentId: currentUser.studentId,
        studentName: currentUser.fullName,
        studentEmail: currentUser.email,
        department: currentUser.department,
        academicYear: currentUser.academicYear,
        phone: currentUser.phone,
        participationType,
        teamName: participationType === 'TEAM' ? teamName.trim() : undefined,
        teamMembers: participationType === 'TEAM' ? teamMembers : undefined,
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

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        style={{ maxWidth: '620px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header */}
        <div className="cp-modal-header">
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Official Application Desk
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff', lineHeight: 1.25 }}>
              Register for {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: '#d4d4d8',
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
              backgroundColor: '#1c1c1f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              color: '#d4d4d8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} style={{ color: '#86efac' }} />
                <span>{event.startDate || event.date} • {event.startTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: '#38bdf8' }} />
                <span className="truncate">{event.venue}</span>
              </div>
              <div style={{ fontWeight: 800, color: '#86efac' }}>
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
              backgroundColor: event.requiresPass !== false ? 'rgba(22, 101, 52, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: event.requiresPass !== false ? '1px solid rgba(134, 239, 172, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '11.5px',
              color: event.requiresPass !== false ? '#86efac' : '#d4d4d8'
            }}>
              {event.requiresPass !== false ? (
                <>
                  <Mail size={15} style={{ color: '#86efac', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Pass Delivery Policy:</strong> Official Digital Entry Pass with security barcode will be emailed directly to your registered address: <strong style={{ color: '#ffffff' }}>{currentUser.email}</strong> upon confirmation.
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle size={15} style={{ color: '#a1a1aa', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Pass Policy:</strong> Open Attendance (No gate pass required). Online registration reserves your seat instantly; simply present your standard student ID.
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

            {/* Mode Selector if Event Allows BOTH */}
            {(event.participationType === 'BOTH' || event.registrationMode === 'BOTH') && (
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '5px', display: 'block' }}>
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
                      background: participationType === 'INDIVIDUAL' ? '#166534' : 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      border: participationType === 'INDIVIDUAL' ? '1px solid #166534' : '1px solid rgba(255, 255, 255, 0.1)'
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
                      background: participationType === 'TEAM' ? '#166534' : 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      border: participationType === 'TEAM' ? '1px solid #166534' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Users size={13} />
                    Team Entry ({event.minTeamSize}–{event.maxTeamSize} pax)
                  </button>
                </div>
              </div>
            )}

            {/* Applicant Profile Information */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '5px', display: 'block' }}>
                Primary Applicant Profile
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: '#1c1c1f',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '11.5px'
              }}>
                <div>
                  <span style={{ color: '#a1a1aa', display: 'block', fontSize: '10.5px' }}>Full Name</span>
                  <strong style={{ color: '#ffffff' }}>{currentUser.fullName}</strong>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa', display: 'block', fontSize: '10.5px' }}>Student Roll No</span>
                  <strong style={{ color: '#ffffff' }}>{currentUser.studentId}</strong>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa', display: 'block', fontSize: '10.5px' }}>College Email</span>
                  <span style={{ color: '#d4d4d8' }}>{currentUser.email}</span>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa', display: 'block', fontSize: '10.5px' }}>Department</span>
                  <span style={{ color: '#d4d4d8' }}>{currentUser.department}</span>
                </div>
              </div>
            </div>

            {/* Team Registration Section */}
            {participationType === 'TEAM' && (
              <div style={{
                padding: '12px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#1c1c1f',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12.5px', color: '#ffffff' }}>
                    <Users size={14} style={{ color: '#86efac' }} />
                    <span>Team Roster Builder</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#a1a1aa' }}>
                    Required: {event.minTeamSize} to {event.maxTeamSize} members
                  </span>
                </div>

                <div className="cp-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '4px', display: 'block' }}>
                    Team Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex CyberKnights, Neural Forge"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: '#141416',
                      fontSize: '12.5px',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#e4e4e7', marginBottom: '4px', display: 'block' }}>
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
                          padding: '7px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#141416',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '11.5px'
                        }}
                      >
                        <div>
                          <strong style={{ color: '#ffffff' }}>{member.name}</strong> <span style={{ color: '#a1a1aa' }}>({member.studentId})</span>
                          <div style={{ fontSize: '10.5px', color: '#a1a1aa' }}>{member.department}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '2px 5px',
                            borderRadius: '4px',
                            backgroundColor: member.role === 'LEADER' ? 'rgba(22, 101, 52, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                            color: member.role === 'LEADER' ? '#86efac' : '#d4d4d8'
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
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px dashed rgba(255, 255, 255, 0.18)',
                    backgroundColor: '#141416',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#a1a1aa' }}>Add Teammate</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Student Full Name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: '#1c1c1f',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          outline: 'none'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Roll No (e.g. STU-055)"
                        value={newMemberStudentId}
                        onChange={(e) => setNewMemberStudentId(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: '#1c1c1f',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="email"
                        placeholder="College Email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: '#1c1c1f',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          outline: 'none'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        value={newMemberDepartment}
                        onChange={(e) => setNewMemberDepartment(e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: '#1c1c1f',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          outline: 'none'
                        }}
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
                        padding: '5px 10px',
                        borderRadius: '7px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={11} />
                      Add Member
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
                border: '1px solid rgba(134, 239, 172, 0.25)',
                backgroundColor: 'rgba(22, 101, 52, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#86efac' }}>
                  <Utensils size={13} />
                  <span>Complimentary College Meal Voucher</span>
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#a1a1aa' }}>
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
                        color: dietaryPreference === pref ? '#86efac' : '#d4d4d8'
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
              backgroundColor: '#1c1c1f',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <input
                type="checkbox"
                id="agree-rules"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <label htmlFor="agree-rules" style={{ fontSize: '11.5px', color: '#a1a1aa', lineHeight: 1.45, cursor: 'pointer' }}>
                I agree to abide by the event regulations, venue safety protocols, and institutional student code of conduct. I confirm all details provided are accurate and understand passes are non-transferable.
              </label>
            </div>
          </div>

          {/* Pinned Action Footer (ALWAYS 100% visible inside the card!) */}
          <div className="cp-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e4e4e7',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
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
                boxShadow: '0 4px 14px rgba(22, 101, 52, 0.4)'
              }}
            >
              {submitting ? (
                <>Processing...</>
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
