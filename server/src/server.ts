import express from 'express';
import cors from 'cors';
import { 
  initialEvents, 
  initialRegistrations, 
  initialPasses, 
  initialLunchPasses, 
  initialUsers, 
  initialScanLogs, 
  initialAuditLogs, 
  initialAnnouncements 
} from './data/seedData.js';
import type { 
  CampusEvent, 
  CampusRegistration, 
  DigitalEventPass, 
  LunchPass, 
  CampusUser, 
  ScanLog, 
  AuditLog, 
  CampusAnnouncement 
} from './types.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-Memory Production State
let events: CampusEvent[] = [...initialEvents];
let registrations: CampusRegistration[] = [...initialRegistrations];
let passes: DigitalEventPass[] = [...initialPasses];
let lunchPasses: LunchPass[] = [...initialLunchPasses];
let users: CampusUser[] = [...initialUsers];
let scanLogs: ScanLog[] = [...initialScanLogs];
let auditLogs: AuditLog[] = [...initialAuditLogs];
let announcements: CampusAnnouncement[] = [...initialAnnouncements];

// Helper to log audit events
const addAudit = (actorName: string, actorRole: string, action: string, resourceType: any, resourceId: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
  const newLog: AuditLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    actorId: 'USR-OP',
    actorName,
    actorRole,
    action,
    resourceType,
    resourceId,
    details,
    severity,
    ipAddress: '127.0.0.1'
  };
  auditLogs.unshift(newLog);
};

// ==========================================
// 0. SYSTEM HEALTH API
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'CampusPass Central API Engine',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    metrics: {
      events: events.length,
      registrations: registrations.length,
      passes: passes.length,
      lunchPasses: lunchPasses.length,
      auditLogs: auditLogs.length,
    }
  });
});

// ==========================================
// 1. EVENTS API
// ==========================================
app.get('/api/events', (req, res) => {
  const { category, search, status } = req.query;
  let list = [...events];
  if (category && category !== 'ALL') {
    list = list.filter(e => e.category === category);
  }
  if (status && status !== 'ALL') {
    list = list.filter(e => e.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.summary.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
});

app.post('/api/events', (req, res) => {
  const body = req.body;
  const newEvent: CampusEvent = {
    id: `EVT-${Date.now().toString().slice(-6)}`,
    slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    registeredCount: 0,
    checkedInCount: 0,
    status: 'OPEN',
    ...body
  };
  events.unshift(newEvent);
  addAudit(body.organizerName || 'Organizer', 'ORGANIZER', 'EVENT_CREATED', 'EVENT', newEvent.id, `Created event: ${newEvent.title}`);
  res.status(201).json({ success: true, data: newEvent });
});

app.put('/api/events/:id', (req, res) => {
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Event not found' });
  events[idx] = { ...events[idx], ...req.body };
  addAudit('Administrator', 'ADMIN', 'EVENT_UPDATED', 'EVENT', events[idx].id, `Updated event: ${events[idx].title}`);
  res.json({ success: true, data: events[idx] });
});

// ==========================================
// 2. REGISTRATIONS & APPLICATIONS API
// ==========================================
app.get('/api/registrations', (req, res) => {
  const { studentId, eventId, status } = req.query;
  let list = [...registrations];
  if (studentId) list = list.filter(r => r.studentId === studentId);
  if (eventId) list = list.filter(r => r.eventId === eventId);
  if (status && status !== 'ALL') list = list.filter(r => r.status === status);
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/registrations', (req, res) => {
  const {
    eventId,
    studentName,
    studentId,
    studentEmail,
    studentPhone,
    department,
    academicYear,
    registrationType,
    teamName,
    teamMembers,
    dietaryPreference
  } = req.body;

  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  // Capacity validation
  if (event.registeredCount >= event.capacity) {
    if (event.registeredCount >= event.capacity + event.waitlistLimit) {
      return res.status(400).json({ success: false, message: 'Event is completely full. No waitlist slots available.' });
    }
  }

  // Duplicate active registration check
  const existing = registrations.find(r => 
    r.eventId === eventId && 
    (r.studentId === studentId || r.studentEmail === studentEmail) &&
    r.status !== 'REJECTED' && r.status !== 'CANCELLED'
  );
  if (existing) {
    return res.status(409).json({ success: false, message: 'You already have an active registration for this event.' });
  }

  const isWaitlist = event.registeredCount >= event.capacity;
  const isAutoApprove = event.approvalMode === 'AUTOMATIC' && !isWaitlist;

  const regId = `CP-REG-2026-${(registrations.length + 1001).toString()}`;
  let passId: string | undefined = undefined;

  const newReg: CampusRegistration = {
    id: regId,
    eventId: event.id,
    eventTitle: event.title,
    eventCategory: event.category,
    eventDate: event.date,
    eventVenue: event.venue,
    registrationType: registrationType || 'INDIVIDUAL',
    studentName,
    studentId,
    studentEmail,
    studentPhone,
    department,
    academicYear,
    teamName: registrationType === 'TEAM' ? teamName : undefined,
    teamMembers: registrationType === 'TEAM' ? teamMembers : undefined,
    status: isWaitlist ? 'WAITLISTED' : isAutoApprove ? 'APPROVED' : 'PENDING',
    passIssued: isAutoApprove,
    attended: false,
    lunchEligible: event.includesLunch,
    dietaryPreference: dietaryPreference || 'VEG',
    submittedAt: new Date().toISOString(),
    reviewedBy: isAutoApprove ? 'AUTO_CONFIRMATION_ENGINE' : undefined,
    reviewedAt: isAutoApprove ? new Date().toISOString() : undefined,
  };

  // If auto-approved, generate the Digital Event Pass & Lunch Pass immediately
  if (isAutoApprove) {
    passId = `CP-PASS-${Date.now().toString().slice(-4)}`;
    newReg.passId = passId;

    const newPass: DigitalEventPass = {
      id: passId,
      registrationId: regId,
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      eventDate: event.date,
      eventTime: event.startTime,
      eventVenue: `${event.venue} • ${event.roomLocation}`,
      studentName,
      studentId,
      studentEmail,
      department,
      academicYear,
      passType: registrationType === 'TEAM' ? 'TEAM_ENTRY' : 'PARTICIPANT',
      status: 'ACTIVE',
      qrToken: `CPTOKEN_${event.id}_${passId}_${studentId}_HMAC_VERIFIED`,
      qrSignature: `HMAC-SHA256-${passId}-${Date.now()}`,
      entryCount: 0,
      issuedAt: new Date().toISOString(),
      expiresAt: `${event.date}T23:59:59Z`,
      hasLunchPass: event.includesLunch
    };
    passes.unshift(newPass);

    if (event.includesLunch) {
      const lunchId = `CP-MEAL-${Date.now().toString().slice(-4)}`;
      const newLunch: LunchPass = {
        id: lunchId,
        passId,
        eventId: event.id,
        eventTitle: event.title,
        studentName,
        studentId,
        studentEmail,
        department,
        mealType: 'BUFFET_LUNCH',
        sessionDate: event.date,
        validFrom: '12:30 PM',
        validUntil: '02:30 PM',
        diningHallCounter: 'Dining Hall Station B (Courtyard Pavilion)',
        dietaryPreference: dietaryPreference || 'VEG',
        status: 'AVAILABLE',
        qrToken: `CPMEAL_${lunchId}_${studentId}_HMAC_VERIFIED`,
        createdAt: new Date().toISOString()
      };
      lunchPasses.unshift(newLunch);
    }
  }

  registrations.unshift(newReg);
  event.registeredCount += 1;

  addAudit(
    studentName, 
    'STUDENT', 
    'REGISTRATION_SUBMITTED', 
    'REGISTRATION', 
    regId, 
    `Registered for ${event.title} (${newReg.registrationType}) - Status: ${newReg.status}`
  );

  res.status(201).json({ 
    success: true, 
    message: isAutoApprove ? 'Registration confirmed! Digital Pass issued.' : 'Application submitted for review.',
    data: newReg 
  });
});

app.post('/api/registrations/:id/approve', (req, res) => {
  const reg = registrations.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
  if (reg.status === 'APPROVED') return res.status(400).json({ success: false, message: 'Registration is already approved' });

  const event = events.find(e => e.id === reg.eventId);
  const reviewer = req.body.reviewerName || 'Event Organizer';

  const passId = `CP-PASS-${Date.now().toString().slice(-4)}`;
  reg.status = 'APPROVED';
  reg.passIssued = true;
  reg.passId = passId;
  reg.reviewedBy = reviewer;
  reg.reviewedAt = new Date().toISOString();

  const newPass: DigitalEventPass = {
    id: passId,
    registrationId: reg.id,
    eventId: reg.eventId,
    eventTitle: reg.eventTitle,
    eventCategory: reg.eventCategory,
    eventDate: reg.eventDate,
    eventTime: event?.startTime || '09:00 AM',
    eventVenue: reg.eventVenue,
    studentName: reg.studentName,
    studentId: reg.studentId,
    studentEmail: reg.studentEmail,
    department: reg.department,
    academicYear: reg.academicYear,
    passType: reg.registrationType === 'TEAM' ? 'TEAM_ENTRY' : 'PARTICIPANT',
    status: 'ACTIVE',
    qrToken: `CPTOKEN_${reg.eventId}_${passId}_${reg.studentId}_HMAC_VERIFIED`,
    qrSignature: `HMAC-SHA256-${passId}-${Date.now()}`,
    entryCount: 0,
    issuedAt: new Date().toISOString(),
    expiresAt: `${reg.eventDate}T23:59:59Z`,
    hasLunchPass: reg.lunchEligible
  };
  passes.unshift(newPass);

  if (reg.lunchEligible) {
    const lunchId = `CP-MEAL-${Date.now().toString().slice(-4)}`;
    const newLunch: LunchPass = {
      id: lunchId,
      passId,
      eventId: reg.eventId,
      eventTitle: reg.eventTitle,
      studentName: reg.studentName,
      studentId: reg.studentId,
      studentEmail: reg.studentEmail,
      department: reg.department,
      mealType: 'BUFFET_LUNCH',
      sessionDate: reg.eventDate,
      validFrom: '12:30 PM',
      validUntil: '02:30 PM',
      diningHallCounter: 'Dining Hall Station B (Courtyard Pavilion)',
      dietaryPreference: reg.dietaryPreference || 'VEG',
      status: 'AVAILABLE',
      qrToken: `CPMEAL_${lunchId}_${reg.studentId}_HMAC_VERIFIED`,
      createdAt: new Date().toISOString()
    };
    lunchPasses.unshift(newLunch);
  }

  addAudit(reviewer, 'ORGANIZER', 'REGISTRATION_APPROVED', 'REGISTRATION', reg.id, `Approved registration for ${reg.studentName}. Issued pass ${passId}.`);
  res.json({ success: true, message: 'Registration approved and Digital Pass issued', data: reg });
});

app.post('/api/registrations/:id/reject', (req, res) => {
  const reg = registrations.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });

  const reason = req.body.reason || 'Prerequisites or document requirements not fulfilled.';
  const reviewer = req.body.reviewerName || 'Event Organizer';

  reg.status = 'REJECTED';
  reg.rejectionReason = reason;
  reg.reviewedBy = reviewer;
  reg.reviewedAt = new Date().toISOString();

  addAudit(reviewer, 'ORGANIZER', 'REGISTRATION_REJECTED', 'REGISTRATION', reg.id, `Rejected application for ${reg.studentName}. Reason: ${reason}`);
  res.json({ success: true, message: 'Registration rejected', data: reg });
});

app.post('/api/registrations/:id/cancel', (req, res) => {
  const reg = registrations.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });

  reg.status = 'CANCELLED';
  if (reg.passId) {
    const pass = passes.find(p => p.id === reg.passId);
    if (pass) pass.status = 'REVOKED';
  }

  addAudit(reg.studentName, 'STUDENT', 'REGISTRATION_CANCELLED', 'REGISTRATION', reg.id, `Student cancelled registration for ${reg.eventTitle}`);
  res.json({ success: true, message: 'Registration cancelled', data: reg });
});

// ==========================================
// 3. DIGITAL PASSES API
// ==========================================
app.get('/api/passes', (req, res) => {
  const { studentId, eventId, status } = req.query;
  let list = [...passes];
  if (studentId) list = list.filter(p => p.studentId === studentId);
  if (eventId) list = list.filter(p => p.eventId === eventId);
  if (status && status !== 'ALL') list = list.filter(p => p.status === status);
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/passes/:id/revoke', (req, res) => {
  const pass = passes.find(p => p.id === req.params.id);
  if (!pass) return res.status(404).json({ success: false, message: 'Pass not found' });

  const reason = req.body.reason || 'Administrative revocation';
  pass.status = 'REVOKED';
  pass.revokedAt = new Date().toISOString();
  pass.revokeReason = reason;

  addAudit('Administrator', 'ADMIN', 'PASS_REVOKED', 'PASS', pass.id, `Revoked pass for ${pass.studentName}. Reason: ${reason}`, 'WARNING');
  res.json({ success: true, message: 'Pass revoked', data: pass });
});

app.post('/api/passes/:id/reissue', (req, res) => {
  const oldPass = passes.find(p => p.id === req.params.id);
  if (!oldPass) return res.status(404).json({ success: false, message: 'Pass not found' });

  oldPass.status = 'REVOKED';
  oldPass.revokeReason = 'Superseded by reissued credential';

  const newPassId = `CP-PASS-${Date.now().toString().slice(-4)}`;
  const newPass: DigitalEventPass = {
    ...oldPass,
    id: newPassId,
    status: 'ACTIVE',
    qrToken: `CPTOKEN_${oldPass.eventId}_${newPassId}_${oldPass.studentId}_REISSUED_HMAC`,
    qrSignature: `HMAC-SHA256-${newPassId}-${Date.now()}`,
    reissuedFromId: oldPass.id,
    issuedAt: new Date().toISOString()
  };
  passes.unshift(newPass);

  addAudit('Administrator', 'ADMIN', 'PASS_REISSUED', 'PASS', newPass.id, `Reissued pass for ${newPass.studentName}. Old pass ${oldPass.id} marked revoked.`);
  res.json({ success: true, message: 'Pass reissued successfully', data: newPass });
});

// ==========================================
// 4. LUNCH PASS DISTRIBUTION API (ATOMIC REDEMPTION)
// ==========================================
app.get('/api/lunch/passes', (req, res) => {
  const { studentId, passId, status } = req.query;
  let list = [...lunchPasses];
  if (studentId) list = list.filter(l => l.studentId === studentId);
  if (passId) list = list.filter(l => l.passId === passId);
  if (status && status !== 'ALL') list = list.filter(l => l.status === status);
  res.json({ success: true, count: list.length, data: list });
});

app.post('/api/lunch/verify', (req, res) => {
  const { qrToken, counterName, operatorName } = req.body;
  if (!qrToken) return res.status(400).json({ success: false, message: 'QR Token required' });

  const lunch = lunchPasses.find(l => l.qrToken === qrToken || l.id === qrToken || l.passId === qrToken);
  if (!lunch) {
    addAudit(operatorName || 'Volunteer', 'VOLUNTEER', 'LUNCH_INVALID_QR', 'LUNCH', qrToken, 'Invalid meal QR token scanned.', 'WARNING');
    return res.status(404).json({ success: false, result: 'INVALID', message: 'No matching meal voucher found for this QR.' });
  }

  // ATOMIC ANTI-DUPLICATE CHECK
  if (lunch.status === 'REDEEMED') {
    addAudit(
      operatorName || 'Volunteer', 
      'VOLUNTEER', 
      'DUPLICATE_MEAL_BLOCKED', 
      'LUNCH', 
      lunch.id, 
      `Duplicate meal redemption blocked for ${lunch.studentName}. Already redeemed at ${lunch.redeemedAt}.`, 
      'WARNING'
    );
    return res.status(409).json({ 
      success: false, 
      result: 'ALREADY_REDEEMED', 
      message: `Meal voucher already claimed at ${new Date(lunch.redeemedAt || '').toLocaleTimeString()} by ${lunch.redeemedByStaff || 'Station Operator'}.`,
      data: lunch 
    });
  }

  if (lunch.status === 'REVOKED') {
    return res.status(403).json({ success: false, result: 'REVOKED', message: 'This meal voucher has been revoked.' });
  }

  // Mark redeemed
  lunch.status = 'REDEEMED';
  lunch.redeemedAt = new Date().toISOString();
  lunch.redeemedCounter = counterName || 'Dining Hall Station B';
  lunch.redeemedByStaff = operatorName || 'Volunteer Operator';

  addAudit(operatorName || 'Volunteer', 'VOLUNTEER', 'MEAL_REDEEMED', 'LUNCH', lunch.id, `Meal redeemed for ${lunch.studentName} (${lunch.dietaryPreference}) at ${lunch.redeemedCounter}.`);
  
  res.json({ 
    success: true, 
    result: 'VALID', 
    message: `Meal voucher verified! Serve ${lunch.dietaryPreference} meal to ${lunch.studentName}.`,
    data: lunch 
  });
});

// ==========================================
// 5. VOLUNTEER ENTRY GATE SCANNER API
// ==========================================
app.post('/api/scanner/verify-entry', (req, res) => {
  const { qrToken, gateName, operatorName, eventId } = req.body;
  if (!qrToken) return res.status(400).json({ success: false, message: 'QR Token required' });

  // Lookup pass
  const pass = passes.find(p => p.qrToken === qrToken || p.id === qrToken);

  if (!pass) {
    const log: ScanLog = {
      id: `SCAN-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      scanType: 'GATE_ENTRY',
      passId: 'UNKNOWN',
      studentName: 'Unknown',
      studentId: 'Unknown',
      eventId: eventId || 'UNKNOWN',
      eventTitle: 'Unknown Event',
      result: 'INVALID',
      gateOrStation: gateName || 'Gate 1',
      operatorName: operatorName || 'Gate Operator',
      notes: 'No matching pass token found'
    };
    scanLogs.unshift(log);
    return res.status(404).json({ success: false, result: 'INVALID', message: 'Invalid QR Code. No authorized pass found.' });
  }

  // Event match validation
  if (eventId && pass.eventId !== eventId) {
    const log: ScanLog = {
      id: `SCAN-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      scanType: 'GATE_ENTRY',
      passId: pass.id,
      studentName: pass.studentName,
      studentId: pass.studentId,
      eventId: pass.eventId,
      eventTitle: pass.eventTitle,
      result: 'WRONG_EVENT',
      gateOrStation: gateName || 'Gate 1',
      operatorName: operatorName || 'Gate Operator',
      notes: `Pass is for ${pass.eventTitle}`
    };
    scanLogs.unshift(log);
    return res.status(400).json({ success: false, result: 'WRONG_EVENT', message: `This pass is issued for "${pass.eventTitle}", not this venue checkpoint.` });
  }

  // Revocation check
  if (pass.status === 'REVOKED') {
    const log: ScanLog = {
      id: `SCAN-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      scanType: 'GATE_ENTRY',
      passId: pass.id,
      studentName: pass.studentName,
      studentId: pass.studentId,
      eventId: pass.eventId,
      eventTitle: pass.eventTitle,
      result: 'REVOKED',
      gateOrStation: gateName || 'Gate 1',
      operatorName: operatorName || 'Gate Operator',
      notes: `Revoked: ${pass.revokeReason}`
    };
    scanLogs.unshift(log);
    return res.status(403).json({ success: false, result: 'REVOKED', message: `Pass has been revoked: ${pass.revokeReason || 'Security hold'}` });
  }

  // Duplicate / Anti-passback check
  if (pass.entryCount > 0) {
    const log: ScanLog = {
      id: `SCAN-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      scanType: 'GATE_ENTRY',
      passId: pass.id,
      studentName: pass.studentName,
      studentId: pass.studentId,
      eventId: pass.eventId,
      eventTitle: pass.eventTitle,
      result: 'ALREADY_CHECKED_IN',
      gateOrStation: gateName || 'Gate 1',
      operatorName: operatorName || 'Gate Operator',
      notes: `Already entered at ${new Date(pass.firstEntryAt || '').toLocaleTimeString()}`
    };
    scanLogs.unshift(log);
    return res.status(409).json({ 
      success: false, 
      result: 'ALREADY_CHECKED_IN', 
      message: `Attendee ${pass.studentName} has already checked in at ${new Date(pass.firstEntryAt || '').toLocaleTimeString()}. Duplicate turnstile scan rejected.`,
      data: pass 
    });
  }

  // Record atomic check-in
  pass.entryCount = 1;
  pass.status = 'USED';
  pass.firstEntryAt = new Date().toISOString();

  // Increment event attendance
  const event = events.find(e => e.id === pass.eventId);
  if (event) event.checkedInCount += 1;

  const log: ScanLog = {
    id: `SCAN-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    scanType: 'GATE_ENTRY',
    passId: pass.id,
    studentName: pass.studentName,
    studentId: pass.studentId,
    eventId: pass.eventId,
    eventTitle: pass.eventTitle,
    result: 'VALID',
    gateOrStation: gateName || 'Gate 1',
    operatorName: operatorName || 'Gate Operator',
    notes: 'Admitted successfully'
  };
  scanLogs.unshift(log);

  addAudit(operatorName || 'Volunteer', 'VOLUNTEER', 'GATE_CHECKIN_SUCCESS', 'ATTENDANCE', pass.id, `Admitted ${pass.studentName} (${pass.studentId}) for ${pass.eventTitle} at ${gateName || 'Gate 1'}.`);

  res.json({ 
    success: true, 
    result: 'VALID', 
    message: `Access Granted! Welcome ${pass.studentName}.`,
    data: pass 
  });
});

app.get('/api/scanner/logs', (req, res) => {
  res.json({ success: true, count: scanLogs.length, data: scanLogs.slice(0, 50) });
});

// ==========================================
// 6. USERS & RBAC DIRECTORY
// ==========================================
app.get('/api/users', (req, res) => {
  const { role } = req.query;
  let list = [...users];
  if (role && role !== 'ALL') list = list.filter(u => u.role === role);
  res.json({ success: true, count: list.length, data: list });
});

app.put('/api/users/:id/role', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const oldRole = user.role;
  user.role = req.body.role;
  addAudit('Administrator', 'ADMIN', 'ROLE_UPDATED', 'USER', user.id, `Changed role for ${user.fullName} from ${oldRole} to ${user.role}.`);
  res.json({ success: true, data: user });
});

app.put('/api/users/:id/status', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.status = req.body.status;
  addAudit('Administrator', 'ADMIN', 'STATUS_UPDATED', 'USER', user.id, `Changed status for ${user.fullName} to ${user.status}.`);
  res.json({ success: true, data: user });
});

app.post('/api/users', (req, res) => {
  const newUser: CampusUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
    ...req.body
  };
  users.unshift(newUser);
  addAudit('Administrator', 'ADMIN', 'USER_CREATED', 'USER', newUser.id, `Created account for ${newUser.fullName} (${newUser.role}).`);
  res.status(201).json({ success: true, data: newUser });
});

// ==========================================
// 7. EXECUTIVE DASHBOARD & AUDIT LOGS
// ==========================================
app.get('/api/admin/overview', (req, res) => {
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalOrganizers = users.filter(u => u.role === 'ORGANIZER').length;
  const totalVolunteers = users.filter(u => u.role === 'VOLUNTEER').length;

  const totalRegistered = registrations.length;
  const pendingRegistrations = registrations.filter(r => r.status === 'PENDING').length;
  const approvedRegistrations = registrations.filter(r => r.status === 'APPROVED').length;
  const waitlistedRegistrations = registrations.filter(r => r.status === 'WAITLISTED').length;

  const totalPasses = passes.length;
  const activePasses = passes.filter(p => p.status === 'ACTIVE').length;
  const admittedPasses = passes.filter(p => p.entryCount > 0).length;

  const totalMeals = lunchPasses.length;
  const redeemedMeals = lunchPasses.filter(l => l.status === 'REDEEMED').length;

  const totalCapacity = events.reduce((acc, e) => acc + e.capacity, 0);

  res.json({
    success: true,
    data: {
      metrics: {
        totalEvents: events.length,
        totalStudents,
        totalOrganizers,
        totalVolunteers,
        totalRegistered,
        pendingRegistrations,
        approvedRegistrations,
        waitlistedRegistrations,
        totalPasses,
        activePasses,
        admittedPasses,
        attendanceRate: totalPasses > 0 ? Math.round((admittedPasses / totalPasses) * 100) : 0,
        totalMeals,
        redeemedMeals,
        mealRedemptionRate: totalMeals > 0 ? Math.round((redeemedMeals / totalMeals) * 100) : 0,
        capacityUtilization: totalCapacity > 0 ? Math.round((approvedRegistrations / totalCapacity) * 100) : 0,
      },
      recentRegistrations: registrations.slice(0, 5),
      recentAuditLogs: auditLogs.slice(0, 5),
      recentScanLogs: scanLogs.slice(0, 5)
    }
  });
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ success: true, count: auditLogs.length, data: auditLogs });
});

// ==========================================
// 8. ANNOUNCEMENTS API
// ==========================================
app.get('/api/announcements', (req, res) => {
  res.json({ success: true, count: announcements.length, data: announcements });
});

app.post('/api/announcements', (req, res) => {
  const newAnn: CampusAnnouncement = {
    id: `ANN-${Date.now().toString().slice(-4)}`,
    publishedAt: new Date().toISOString(),
    ...req.body
  };
  announcements.unshift(newAnn);
  addAudit(newAnn.authorName || 'Admin', 'ADMIN', 'ANNOUNCEMENT_PUBLISHED', 'SYSTEM', newAnn.id, `Published announcement: ${newAnn.title}`);
  res.status(201).json({ success: true, data: newAnn });
});

app.listen(PORT, () => {
  console.log(`🎓 CampusPass Dedicated API Server listening on http://localhost:${PORT}`);
});
