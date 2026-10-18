// Server-side type definitions for CampusPass
export type UserRole = 'STUDENT' | 'ORGANIZER' | 'VOLUNTEER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface CampusUser {
  id: string;
  fullName: string;
  email: string;
  studentId?: string;
  department: string;
  academicYear?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  assignedEvents?: string[];
  assignedGates?: string[];
  assignedCounters?: string[];
  createdAt: string;
}

export type EventCategory = 
  | 'HACKATHON'
  | 'IDEATHON'
  | 'CODING_COMPETITION'
  | 'APTITUDE'
  | 'CULTURAL'
  | 'FRESHER_PARTY'
  | 'BOOTCAMP'
  | 'CAMPUS_DRIVE'
  | 'SEMINAR'
  | 'TECHNICAL'
  | 'SPORTS'
  | 'WORKSHOP'
  | 'LITERARY'
  | 'MANAGEMENT'
  | 'GENERAL';

export type EventStatus = 
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'WAITLIST_ONLY'
  | 'FULL'
  | 'CLOSED'
  | 'COMPLETED';

export type RegistrationMode = 'INDIVIDUAL' | 'TEAM' | 'BOTH';
export type ApprovalMode = 'AUTOMATIC' | 'MANUAL_REVIEW';

export type RoundType = 
  | 'APTITUDE' 
  | 'TECHNICAL' 
  | 'CODING' 
  | 'PROBLEM_SOLVING' 
  | 'PRESENTATION' 
  | 'INTERVIEW' 
  | 'HACKATHON' 
  | 'GROUP_DISCUSSION' 
  | 'QUIZ' 
  | 'GENERAL';

export type RoundStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'DELAYED';

export interface EventRound {
  id: string;
  roundNumber: number;
  name: string;
  type: RoundType;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  description?: string;
  status: RoundStatus;
  eliminationRound?: boolean;
  qualifyingCriteria?: string;
}

export interface ScheduleRescheduleInfo {
  isRescheduled: boolean;
  originalDate?: string;
  originalStartTime?: string;
  originalEndTime?: string;
  rescheduledAt?: string;
  reason?: string;
  announcementBroadcasted?: boolean;
  broadcastNote?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: EventCategory;
  bannerUrl: string;
  date: string;
  startDate?: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  venue: string;
  roomLocation: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  department: string;
  capacity: number;
  waitlistLimit: number;
  registeredCount: number;
  checkedInCount: number;
  registrationDeadline: string;
  fee: number;
  registrationMode: RegistrationMode;
  minTeamSize: number;
  maxTeamSize: number;
  approvalMode: ApprovalMode;
  requiresPass?: boolean; // Admin-controlled: true if official pass is issued via email, false if open registration
  includesLunch: boolean;
  rules: string[];
  eligibilityCriteria: string;
  faqs: { q: string; a: string }[];
  contactEmail: string;
  contactPhone: string;
  status: EventStatus;
  rounds?: EventRound[];
  scheduleUpdate?: ScheduleRescheduleInfo;
  allowConcurrentRegistration?: boolean;
}

export type RegistrationType = 'INDIVIDUAL' | 'TEAM';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';

export interface TeamMemberInfo {
  name: string;
  studentId: string;
  email: string;
  department: string;
  academicYear: string;
  role: 'LEADER' | 'MEMBER';
}

export interface CampusRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventCategory: EventCategory;
  eventDate: string;
  eventVenue: string;
  registrationType: RegistrationType;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string;
  collegeName?: string;
  department: string;
  academicYear: string;
  teamName?: string;
  teamMembers?: TeamMemberInfo[];
  status: ApplicationStatus;
  requiresPass?: boolean;
  passIssued: boolean;
  passId?: string;
  passSentToEmail?: boolean;
  passEmailAddress?: string;
  passSentAt?: string;
  attended: boolean;
  lunchEligible: boolean;
  dietaryPreference?: 'VEG' | 'NON_VEG';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type PassType = 'GENERAL_ENTRY' | 'PARTICIPANT' | 'VIP' | 'WORKSHOP' | 'TEAM_ENTRY';
export type PassStatus = 'ACTIVE' | 'USED' | 'REVOKED' | 'EXPIRED';

export interface DigitalEventPass {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle: string;
  eventCategory: EventCategory;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  department: string;
  academicYear: string;
  passType: PassType;
  status: PassStatus;
  qrToken: string;
  qrSignature: string;
  entryCount: number;
  firstEntryAt?: string;
  revokedAt?: string;
  revokeReason?: string;
  reissuedFromId?: string;
  issuedAt: string;
  expiresAt: string;
  hasLunchPass?: boolean;
}

export type MealType = 'BUFFET_LUNCH' | 'BREAKFAST' | 'DINNER' | 'REFRESHMENTS';
export type DietaryPreference = 'VEG' | 'NON_VEG' | 'STANDARD';
export type LunchPassStatus = 'AVAILABLE' | 'REDEEMED' | 'REVOKED' | 'EXPIRED';

export interface LunchPass {
  id: string;
  passId: string;
  eventId: string;
  eventTitle: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  department: string;
  mealType: MealType;
  sessionDate: string;
  validFrom: string;
  validUntil: string;
  diningHallCounter: string;
  dietaryPreference: DietaryPreference;
  status: LunchPassStatus;
  qrToken: string;
  redeemedAt?: string;
  redeemedCounter?: string;
  redeemedByStaff?: string;
  createdAt: string;
}

export type ScanType = 'GATE_ENTRY' | 'LUNCH_DISTRIBUTION';
export type ScanResult = 
  | 'VALID' 
  | 'ALREADY_CHECKED_IN' 
  | 'ALREADY_REDEEMED' 
  | 'REVOKED' 
  | 'INVALID' 
  | 'WRONG_EVENT' 
  | 'EXPIRED';

export interface ScanLog {
  id: string;
  timestamp: string;
  scanType: ScanType;
  passId: string;
  studentName: string;
  studentId: string;
  eventId: string;
  eventTitle: string;
  result: ScanResult;
  gateOrStation: string;
  operatorName: string;
  notes?: string;
}

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AuditResourceType = 'EVENT' | 'REGISTRATION' | 'PASS' | 'USER' | 'LUNCH' | 'ATTENDANCE' | 'SYSTEM';

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: AuditResourceType;
  resourceId: string;
  details: string;
  severity: AuditSeverity;
  ipAddress?: string;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'GENERAL' | 'DEADLINE' | 'VENUE' | 'SCHEDULE_CHANGE' | 'URGENT';
  scope: 'ALL' | 'EVENT';
  eventId?: string;
  eventTitle?: string;
  authorName: string;
  publishedAt: string;
  channels: ('IN_APP' | 'EMAIL')[];
}
