import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/certificates/generate - Generate a certificate PDF for a completed application
export async function POST(request: Request) {
  try {
    const { applicationId, companyName, studentName, startDate, endDate, title } = await request.json();

    if (!applicationId || !companyName || !studentName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existing = await db.certificate.findUnique({
      where: { applicationId },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Certificate already exists',
      });
    }

    // Generate certificate number
    const certNumber = `IL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    // Create certificate record
    const certificate = await db.certificate.create({
      data: {
        applicationId,
        certificateNumber: certNumber,
        pdfUrl: `/certificates/${certNumber}.pdf`,
      },
    });

    // Certificate data for client-side PDF generation
    const certificateData = {
      ...certificate,
      studentName,
      companyName,
      title: title || 'Internship',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date().toISOString(),
      issuedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: certificateData,
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
