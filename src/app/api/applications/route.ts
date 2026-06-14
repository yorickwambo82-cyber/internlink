import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('offerId') || ''
    const status = searchParams.get('status') || ''

    const where: Prisma.ApplicationWhereInput = {}

    if (authUser.role === 'STUDENT') {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: authUser.userId },
      })
      if (!studentProfile) {
        return NextResponse.json(
          { success: false, error: 'Student profile not found' },
          { status: 404 }
        )
      }
      where.studentId = studentProfile.id
    } else if (authUser.role === 'COMPANY') {
      const companyProfile = await db.companyProfile.findUnique({
        where: { userId: authUser.userId },
      })
      if (!companyProfile) {
        return NextResponse.json(
          { success: false, error: 'Company profile not found' },
          { status: 404 }
        )
      }
      where.offer = { companyId: companyProfile.id }
    }

    if (offerId) {
      where.offerId = offerId
    }

    if (status) {
      if (status.includes(',')) {
        where.status = { in: status.split(',') }
      } else {
        where.status = status
      }
    }

    const applications = await db.application.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            university: true,
            fieldOfStudy: true,
            year: true,
            skills: true,
            location: true,
            user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
            reviews: { select: { rating: true } },
            applications: { select: { status: true } },
          },
        },
        offer: {
          select: {
            id: true,
            title: true,
            type: true,
            city: true,
            remoteType: true,
            stipend: true,
            company: {
              select: { id: true, companyName: true, logoUrl: true },
            },
          },
        },
        reports: { select: { id: true, weekNumber: true, status: true } },
        certificate: { select: { id: true, certificateNumber: true } },
      },
      orderBy: { appliedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: applications,
    })
  } catch (error) {
    console.error('List applications error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (authUser.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Only students can apply for offers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { offerId, coverLetter, cvUrl, schoolAttestationUrl, motivationLetterUrl, transcriptUrl, expectedStartDate, selectedDuration } = body

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: 'Offer ID is required' },
        { status: 400 }
      )
    }

    // Require all documents
    if (!cvUrl || !schoolAttestationUrl || !motivationLetterUrl || !transcriptUrl) {
      return NextResponse.json(
        { success: false, error: 'All required documents (CV, School Attestation, Motivation Letter, Transcript) must be uploaded.' },
        { status: 400 }
      )
    }

    if (!expectedStartDate || !selectedDuration) {
      return NextResponse.json(
        { success: false, error: 'Proposed Start Date and Duration are required.' },
        { status: 400 }
      )
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: authUser.userId },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // ── PLAN LIMIT CHECK ────────────────────────────────────
    const PLAN_LIMITS: Record<string, number> = { STARTER: 3, SCHOLAR: 15, PRO: Infinity };
    let sub = await db.subscription.findUnique({ where: { userId: authUser.userId } });
    if (!sub) {
      sub = await db.subscription.create({ data: { userId: authUser.userId, plan: 'STARTER', status: 'ACTIVE' } });
    }
    const plan = (sub.expiresAt && new Date() > sub.expiresAt && sub.plan !== 'STARTER') ? 'STARTER' : sub.plan;
    const limit = PLAN_LIMITS[plan] ?? 3;
    const totalApplied = await db.application.count({ where: { studentId: studentProfile.id } });
    if (totalApplied >= limit) {
      return NextResponse.json(
        { success: false, error: 'PLAN_LIMIT_REACHED', plan },
        { status: 403 }
      )
    }
    // ────────────────────────────────────────────────────────

    // Check if already applied
    const existingApplication = await db.application.findUnique({
      where: {
        studentId_offerId: {
          studentId: studentProfile.id,
          offerId,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this offer' },
        { status: 409 }
      )
    }

    // Check offer exists and is active
    const offer = await db.offer.findUnique({
      where: { id: offerId },
      include: { company: true },
    })

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    if (offer.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'This offer is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Validate chosen duration
    const dur = parseInt(selectedDuration);
    if (dur < offer.minDuration || dur > offer.maxDuration) {
      return NextResponse.json(
        { success: false, error: `Duration must be between ${offer.minDuration} and ${offer.maxDuration} months.` },
        { status: 400 }
      )
    }

    // Check deadline
    if (offer.deadline && new Date() > new Date(offer.deadline)) {
      return NextResponse.json(
        { success: false, error: 'Application deadline has passed' },
        { status: 400 }
      )
    }

    // Check slots
    const applicationCount = await db.application.count({
      where: { offerId, status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
    })

    if (applicationCount >= offer.slots) {
      return NextResponse.json(
        { success: false, error: 'No available slots for this offer' },
        { status: 400 }
      )
    }

    // Create application with documents
    const application = await db.application.create({
      data: {
        studentId: studentProfile.id,
        offerId,
        coverLetter: coverLetter || null,
        cvUrl,
        schoolAttestationUrl,
        motivationLetterUrl,
        transcriptUrl,
        expectedStartDate: new Date(expectedStartDate),
        selectedDuration: dur,
      },
      include: {
        student: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },
        offer: {
          select: { title: true },
        },
      },
    })

    // Create notification for company
    await db.notification.create({
      data: {
        userId: offer.company.userId,
        title: 'New Application',
        message: `${application.student.user.name} has applied for "${offer.title}"`,
        type: 'INFO',
        link: `/applications/${application.id}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: application,
    }, { status: 201 })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
