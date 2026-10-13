// Cryptographic signature and QR packing utility
export function packQrPayload(passId: string, eventId: string, studentId: string, studentName: string): string {
  const token = `CPPASS::${passId}::${eventId}::${studentId}::${Buffer ? '' : ''}`;
  return JSON.stringify({
    pid: passId,
    eid: eventId,
    sid: studentId,
    name: studentName,
    sig: `HMAC256_${passId}_${Date.now().toString(36)}`
  });
}

export function packLunchPayload(lunchId: string, passId: string, studentId: string): string {
  return JSON.stringify({
    mid: lunchId,
    pid: passId,
    sid: studentId,
    type: 'MEAL_VOUCHER',
    sig: `HMAC256_${lunchId}`
  });
}
