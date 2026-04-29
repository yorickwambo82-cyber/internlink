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
      where.status = status
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
            user: { select: { id: true, name: true, email: true, avatar: true } },
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
    const { offerId, coverLetter } = body

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: 'Offer ID is required' },
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

    // Create application
    const application = await db.application.create({
      data: {
        studentId: studentProfile.id,
        offerId,
        coverLetter: coverLetter || null,
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
