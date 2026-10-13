import { jsPDF } from 'jspdf';
import type { DigitalEventPass } from '../types';
import { generateQrDataUrl } from './qrGenerator';

/**
 * Generates an official printable A6 Digital Event Pass PDF
 */
export async function downloadPassPdf(pass: DigitalEventPass): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a6' // 105 x 148 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CAMPUSPASS', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text('Apex Institute of Science & Technology • Official Credential', pageWidth / 2, 18, { align: 'center' });

  // Pass Type Pill
  doc.setFillColor(2, 132, 199); // #0284c7
  doc.roundedRect(pageWidth / 2 - 22, 22, 44, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(pass.passType.replace('_', ' '), pageWidth / 2, 26.5, { align: 'center' });

  // Event Details Box
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const titleLines = doc.splitTextToSize(pass.eventTitle, pageWidth - 20);
  doc.text(titleLines, pageWidth / 2, 38, { align: 'center' });

  let curY = 38 + titleLines.length * 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${pass.eventDate} • ${pass.eventTime}`, pageWidth / 2, curY, { align: 'center' });
  curY += 4;
  doc.text(pass.eventVenue, pageWidth / 2, curY, { align: 'center' });
  curY += 6;

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(10, curY, pageWidth - 10, curY);
  curY += 5;

  // Student Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(pass.studentName, pageWidth / 2, curY, { align: 'center' });
  curY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${pass.studentId} • ${pass.department}`, pageWidth / 2, curY, { align: 'center' });
  curY += 6;

  // QR Code Image
  const qrDataUrl = await generateQrDataUrl(pass.qrToken, { width: 300 });
  const qrSize = 38;
  const qrX = (pageWidth - qrSize) / 2;
  doc.addImage(qrDataUrl, 'PNG', qrX, curY, qrSize, qrSize);
  curY += qrSize + 4;

  // Pass Identifier and Signature
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(pass.id, pageWidth / 2, curY, { align: 'center' });
  curY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Cryptographically Verified Turnstile Gate Credential', pageWidth / 2, curY, { align: 'center' });
  curY += 3;
  doc.text(`Issued: ${new Date(pass.issuedAt).toLocaleDateString()} • Single Attendee Admission`, pageWidth / 2, curY, { align: 'center' });

  // Save PDF
  doc.save(`${pass.id}_${pass.studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
