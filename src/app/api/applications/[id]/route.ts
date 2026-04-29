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

    const application = await db.application.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            university: true,
            fieldOfStudy: true,
            year: true,
            skills: true,
            cvUrl: true,
            portfolioUrl: true,
            bio: true,
            location: true,
            user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
          },
        },
        offer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                city: true,
                location: true,
                industry: true,
                website: true,
                description: true,
                verified: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
            category: { select: { id: true, name: true } },
          },
        },
        reports: {
          orderBy: { weekNumber: 'asc' },
        },
        certificate: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('Get application error:', error)
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

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const application = await db.application.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, user: { select: { id: true, name: true } } },
        },
        offer: {
          select: { id: true, title: true, companyId: true, company: { select: { userId: true } } },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = { status }

    if (status === 'ACCEPTED') {
      // Only company can accept
      if (authUser.role !== 'COMPANY' && authUser.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Only companies can accept applications' },
          { status: 403 }
        )
      }
      updateData.acceptedAt = new Date().toISOString()

      // Notify student
      await db.notification.create({
        data: {
          userId: application.student.user.id,
          title: 'Application Accepted',
          message: `Your application for "${application.offer.title}" has been accepted!`,
          type: 'SUCCESS',
          link: `/applications/${application.id}`,
        },
      })
    } else if (status === 'REJECTED') {
      // Only company can reject
      if (authUser.role !== 'COMPANY' && authUser.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Only companies can reject applications' },
          { status: 403 }
        )
      }

      // Notify student
      await db.notification.create({
        data: {
          userId: application.student.user.id,
          title: 'Application Rejected',
          message: `Your application for "${application.offer.title}" has been rejected.`,
          type: 'WARNING',
          link: `/applications/${application.id}`,
        },
      })
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date().toISOString()

      // Generate certificate
      const existingCert = await db.certificate.findUnique({
        where: { applicationId: application.id },
      })

      if (!existingCert) {
        const certCount = await db.certificate.count()
        const certificateNumber = `IL-${new Date().getFullYear()}-${String(certCount + 1).padStart(5, '0')}`

        await db.certificate.create({
          data: {
            applicationId: application.id,
            certificateNumber,
          },
        })
      }

      // Notify student
      await db.notification.create({
        data: {
          userId: application.student.user.id,
          title: 'Internship Completed',
          message: `Your internship "${application.offer.title}" has been marked as completed. A certificate has been generated!`,
          type: 'SUCCESS',
          link: `/applications/${application.id}`,
        },
      })
    } else if (status === 'CANCELLED') {
      // Student or company can cancel
      await db.notification.create({
        data: {
          userId: application.offer.company.userId,
          title: 'Application Cancelled',
          message: `An application for "${application.offer.title}" has been cancelled.`,
          type: 'WARNING',
          link: `/applications/${application.id}`,
        },
      })
    }

    const updatedApplication = await db.application.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: { user: { select: { name: true, email: true } } },
        },
        offer: {
          select: { title: true, company: { select: { companyName: true } } },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication,
    })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
