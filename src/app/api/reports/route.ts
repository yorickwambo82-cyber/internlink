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
    const applicationId = searchParams.get('applicationId') || ''
    const status = searchParams.get('status') || ''

    const where: Prisma.ReportWhereInput = {}

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
      where.application = { studentId: studentProfile.id }
    } else if (authUser.role === 'SUPERVISOR') {
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: authUser.userId },
      })
      if (!supervisorProfile) {
        return NextResponse.json(
          { success: false, error: 'Supervisor profile not found' },
          { status: 404 }
        )
      }
      where.supervisorId = supervisorProfile.id
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
      where.application = { offer: { companyId: companyProfile.id } }
    }
    // ADMIN can see all reports

    if (applicationId) {
      where.applicationId = applicationId
    }

    if (status) {
      where.status = status
    }

    const reports = await db.report.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            status: true,
            student: {
              select: {
                id: true,
                university: true,
                fieldOfStudy: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
            offer: {
              select: {
                id: true,
                title: true,
                company: { select: { id: true, companyName: true } },
              },
            },
          },
        },
        supervisor: {
          select: {
            id: true,
            department: true,
            title: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ weekNumber: 'asc' }, { submittedAt: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      data: reports,
    })
  } catch (error) {
    console.error('List reports error:', error)
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
        { success: false, error: 'Only students can submit reports' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId, weekNumber, activities, challenges, nextPlan, fileUrl, fileName } = body

    if (!applicationId || !weekNumber || !activities) {
      return NextResponse.json(
        { success: false, error: 'Application ID, week number, and activities are required' },
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

    // Verify the application belongs to the student and is in correct status
    const application = await db.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.studentId !== studentProfile.id) {
      return NextResponse.json(
        { success: false, error: 'This application does not belong to you' },
        { status: 403 }
      )
    }

    if (!['ACCEPTED', 'IN_PROGRESS'].includes(application.status)) {
      return NextResponse.json(
        { success: false, error: 'Reports can only be submitted for accepted or in-progress applications' },
        { status: 400 }
      )
    }

    const report = await db.report.create({
      data: {
        applicationId,
        weekNumber: parseInt(String(weekNumber)),
        activities,
        challenges: challenges || null,
        nextPlan: nextPlan || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: report,
    }, { status: 201 })
  } catch (error) {
    console.error('Submit report error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
