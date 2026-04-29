import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const report = await db.report.findUnique({
      where: { id },
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
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['SUPERVISOR', 'COMPANY', 'ADMIN'].includes(authUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Only supervisors, companies, or admins can validate reports' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, supervisorComment } = body

    if (!status || !['VALIDATED', 'REVISION_NEEDED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be VALIDATED or REVISION_NEEDED' },
        { status: 400 }
      )
    }

    const report = await db.report.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    // Get supervisor ID if applicable
    let supervisorId = report.supervisorId
    if (authUser.role === 'SUPERVISOR') {
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: authUser.userId },
      })
      if (supervisorProfile) {
        supervisorId = supervisorProfile.id
      }
    }

    const updateData: Record<string, unknown> = {
      status,
      validatedAt: new Date().toISOString(),
      supervisorId,
    }

    if (supervisorComment !== undefined) {
      updateData.supervisorComment = supervisorComment
    }

    const updatedReport = await db.report.update({
      where: { id },
      data: updateData,
    })

    // Notify student
    const application = await db.application.findUnique({
      where: { id: report.applicationId },
      include: {
        student: { select: { user: { select: { id: true } } } },
        offer: { select: { title: true } },
      },
    })

    if (application) {
      await db.notification.create({
        data: {
          userId: application.student.user.id,
          title: status === 'VALIDATED' ? 'Report Validated' : 'Report Needs Revision',
          message: status === 'VALIDATED'
            ? `Your week ${report.weekNumber} report for "${application.offer.title}" has been validated.`
            : `Your week ${report.weekNumber} report for "${application.offer.title}" needs revision.`,
          type: status === 'VALIDATED' ? 'SUCCESS' : 'WARNING',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedReport,
    })
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
