import React, { useState } from 'react';
import type { CampusEvent, DietaryPreference, TeamMember } from '../../types';
import { useCampusPass } from '../../context/CampusPassContext';
import {
  X,
  Users,
  User,
  Utensils,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  FileCheck,
  ArrowRight,
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
        style={{ maxWidth: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cp-modal-header">
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Official Application Desk
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }}>
              Register for {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="cp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Quick Event Summary */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} style={{ color: '#166534' }} />
                <span>{event.startDate || event.date} • {event.startTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: '#166534' }} />
                <span className="truncate">{event.venue}</span>
              </div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>
                {(event.fee ?? event.registrationFee ?? 0) === 0 ? 'FREE ENTRY' : `₹${event.fee ?? event.registrationFee}`}
              </div>
            </div>

            {/* Pass Policy Disclosure */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: event.requiresPass !== false ? '#f0fdf4' : '#f8fafc',
              border: event.requiresPass !== false ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
              fontSize: '12px',
              color: event.requiresPass !== false ? '#166534' : '#475569'
            }}>
              {event.requiresPass !== false ? (
                <>
                  <Mail size={15} style={{ color: '#166534', flexShrink: 0 }} />
                  <div>
                    <strong>Pass Policy:</strong> Official Digital Entry Pass with verification barcode will be emailed directly to your registered address: <strong>{currentUser.email}</strong> upon confirmation.
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle size={15} style={{ color: '#475569', flexShrink: 0 }} />
                  <div>
                    <strong>Pass Policy:</strong> Open Attendance (No gate pass required). Online registration reserves your seat instantly; simply present your standard student ID.
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
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12.5px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Mode Selector if Event Allows BOTH */}
            {(event.participationType === 'BOTH' || event.registrationMode === 'BOTH') && (
              <div>
                <label className="cp-label">Select Registration Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setParticipationType('INDIVIDUAL')}
                    className={`cp-btn ${participationType === 'INDIVIDUAL' ? 'cp-btn-primary' : 'cp-btn-outline'}`}
                    style={{ justifyContent: 'center' }}
                  >
                    <User size={14} />
                    Individual Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipationType('TEAM')}
                    className={`cp-btn ${participationType === 'TEAM' ? 'cp-btn-primary' : 'cp-btn-outline'}`}
                    style={{ justifyContent: 'center' }}
                  >
                    <Users size={14} />
                    Team Entry ({event.minTeamSize}–{event.maxTeamSize} pax)
                  </button>
                </div>
              </div>
            )}

            {/* Applicant Profile Information */}
            <div>
              <label className="cp-label">Primary Applicant Profile</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Full Name</span>
                  <strong style={{ color: '#0f172a' }}>{currentUser.fullName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Student Roll No</span>
                  <strong style={{ color: '#0f172a' }}>{currentUser.studentId}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>College Email</span>
                  <span style={{ color: '#0f172a' }}>{currentUser.email}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Department</span>
                  <span style={{ color: '#0f172a' }}>{currentUser.department}</span>
                </div>
              </div>
            </div>

            {/* Team Registration Section */}
            {participationType === 'TEAM' && (
              <div style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                    <Users size={15} style={{ color: '#166534' }} />
                    <span>Team Roster Builder</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Required: {event.minTeamSize} to {event.maxTeamSize} members
                  </span>
                </div>

                <div className="cp-form-group">
                  <label className="cp-label">Team Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex CyberKnights, Neural Forge"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="cp-input"
                    required
                  />
                </div>

                <div>
                  <label className="cp-label">Team Members ({teamMembers.length} / {event.maxTeamSize})</label>
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
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px'
                        }}
                      >
                        <div>
                          <strong>{member.name}</strong> ({member.studentId})
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{member.department}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: member.role === 'LEADER' ? '#dcfce7' : '#f1f5f9',
                            color: member.role === 'LEADER' ? '#166534' : '#475569'
                          }}>
                            {member.role}
                          </span>
                          {member.role !== 'LEADER' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.studentId)}
                              style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: '2px' }}
                              title="Remove Member"
                            >
                              <Trash2 size={13} />
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
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px dashed #cbd5e1',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Add Teammate</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Student Full Name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="cp-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      />
                      <input
                        type="text"
                        placeholder="Roll No (e.g. STU-055)"
                        value={newMemberStudentId}
                        onChange={(e) => setNewMemberStudentId(e.target.value)}
                        className="cp-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="email"
                        placeholder="College Email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="cp-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        value={newMemberDepartment}
                        onChange={(e) => setNewMemberDepartment(e.target.value)}
                        className="cp-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="cp-btn cp-btn-outline cp-btn-sm"
                      style={{ alignSelf: 'flex-start', marginTop: '2px' }}
                    >
                      <Plus size={12} />
                      Add Member
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Complimentary Lunch Option (If Event has lunch) */}
            {(event.lunchProvided || event.includesLunch) && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #bbf7d0',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#166534' }}>
                  <Utensils size={14} />
                  <span>Complimentary College Meal Voucher</span>
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
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
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: dietaryPreference === pref ? 700 : 500,
                        color: dietaryPreference === pref ? '#0f172a' : '#64748b'
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
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <input
                type="checkbox"
                id="agree-rules"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <label htmlFor="agree-rules" style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45, cursor: 'pointer' }}>
                I agree to abide by the event regulations, venue safety protocols, and institutional student code of conduct. I confirm all details provided are accurate and understand passes are non-transferable.
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="cp-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cp-btn cp-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cp-btn cp-btn-primary"
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
