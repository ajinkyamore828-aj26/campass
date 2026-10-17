// ============================================================
// CampusPass — Official Type System
// College Event Registration & Digital Pass Management System
// ============================================================

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
export type ParticipationType = RegistrationMode;
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
  shortDescription?: string;
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
  registrationFee?: number;
  registrationMode: RegistrationMode;
  participationType?: RegistrationMode;
  minTeamSize: number;
  maxTeamSize: number;
  approvalMode: ApprovalMode;
  requiresApproval?: boolean;
  requiresPass?: boolean; // Admin-controlled: true if official pass is issued via email, false if open registration
  includesLunch: boolean;
  lunchProvided?: boolean;
  rules: string[];
  eligibilityCriteria: string;
  faqs: { q?: string; a?: string; question?: string; answer?: string }[];
  contactEmail: string;
  contactPhone: string;
  status: EventStatus;
  tags?: string[];
  rounds?: EventRound[];
  scheduleUpdate?: ScheduleRescheduleInfo;
}

export type RegistrationType = 'INDIVIDUAL' | 'TEAM';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';

export interface TeamMemberInfo {
  name: string;
  studentId: string;
  email: string;
  collegeName?: string;
  department: string;
  academicYear?: string;
  role: 'LEADER' | 'MEMBER';
}

export type TeamMember = TeamMemberInfo;

export interface CampusRegistration {
  id: string; // e.g. "CP-REG-2026-9041"
  referenceNumber?: string;
  eventId: string;
  eventTitle: string;
  eventCategory: EventCategory;
  eventDate: string;
  eventVenue: string;
  registrationType: RegistrationType;
  participationType?: RegistrationType;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string;
  phone?: string;
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
  dietaryPreference?: 'VEG' | 'NON_VEG' | 'JAIN' | 'STANDARD';
  submittedAt: string;
  createdAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type PassType = 'GENERAL_ENTRY' | 'PARTICIPANT' | 'VIP' | 'WORKSHOP' | 'TEAM_ENTRY';
export type PassStatus = 'ACTIVE' | 'USED' | 'REVOKED' | 'EXPIRED';

export interface DigitalEventPass {
  id: string; // e.g. "CP-PASS-4412"
  registrationId: string;
  eventId: string;
  eventTitle: string;
  eventCategory: EventCategory;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  venue?: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  department: string;
  academicYear: string;
  passType: PassType;
  status: PassStatus;
  qrToken: string; // HMAC token
  qrSignature: string;
  entryCount: number;
  firstEntryAt?: string;
  checkInTime?: string;
  checkInGate?: string;
  revokedAt?: string;
  revokeReason?: string;
  revocationReason?: string;
  reissuedFromId?: string;
  issuedAt: string;
  expiresAt: string;
  hasLunchPass?: boolean;
}

export type MealType = 'BUFFET_LUNCH' | 'BREAKFAST' | 'DINNER' | 'REFRESHMENTS';
export type DietaryPreference = 'VEG' | 'NON_VEG' | 'JAIN' | 'STANDARD';
export type LunchPassStatus = 'AVAILABLE' | 'ACTIVE' | 'REDEEMED' | 'REVOKED' | 'EXPIRED';

export interface LunchPass {
  id: string; // e.g. "CP-MEAL-7812"
  passId: string;
  eventId: string;
  eventTitle: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  department: string;
  mealType: MealType;
  sessionDate: string;
  mealDate?: string;
  validFrom: string;
  validUntil: string;
  diningHallCounter: string;
  diningLocation?: string;
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
  | 'ALREADY_USED'
  | 'ALREADY_REDEEMED' 
  | 'REVOKED' 
  | 'INVALID' 
  | 'INVALID_TOKEN'
  | 'WRONG_EVENT' 
  | 'EXPIRED';

export interface ScanLog {
  id: string;
  timestamp: string;
  scannedAt?: string;
  scanType: ScanType;
  passId: string;
  studentName: string;
  studentId: string;
  eventId: string;
  eventTitle: string;
  result: ScanResult;
  gateOrStation: string;
  gate?: string;
  operatorName: string;
  scannedBy?: string;
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
  message?: string;
  priority: 'GENERAL' | 'DEADLINE' | 'VENUE' | 'SCHEDULE_CHANGE' | 'URGENT' | 'NORMAL';
  scope: 'ALL' | 'EVENT';
  eventId?: string;
  eventTitle?: string;
  authorName: string;
  createdBy?: string;
  publishedAt: string;
  createdAt?: string;
  channels?: ('IN_APP' | 'EMAIL')[];
}

export interface InstitutionProfile {
  collegeName: string;
  collegeCode: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  address: string;
  departments: string[];
  eventCategories: string[];
}

export type ActivePortal = 'STUDENT' | 'ORGANIZER' | 'VOLUNTEER' | 'ADMIN';

export interface HeroContentConfig {
  headline: string;
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
}

export interface BentoCardConfig {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  linkLabel: string;
  targetCategory: string;
  bg: string;
  border: string;
}
