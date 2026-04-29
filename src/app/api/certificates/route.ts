import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let certificates

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
      certificates = await db.certificate.findMany({
        where: {
          application: { studentId: studentProfile.id },
        },
        include: {
          application: {
            select: {
              id: true,
              offer: {
                select: {
                  title: true,
                  type: true,
                  company: { select: { companyName: true, logoUrl: true } },
                },
              },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      })
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
      certificates = await db.certificate.findMany({
        where: {
          application: { offer: { companyId: companyProfile.id } },
        },
        include: {
          application: {
            select: {
              id: true,
              student: {
                select: {
                  user: { select: { name: true } },
                  university: true,
                  fieldOfStudy: true,
                },
              },
              offer: {
                select: {
                  title: true,
                  type: true,
                  company: { select: { companyName: true } },
                },
              },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      })
    } else {
      // ADMIN can see all
      certificates = await db.certificate.findMany({
        include: {
          application: {
            select: {
              id: true,
              student: {
                select: { user: { select: { name: true } }, university: true, fieldOfStudy: true },
              },
              offer: {
                select: { title: true, type: true, company: { select: { companyName: true } } },
              },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      })
    }

    return NextResponse.json({
      success: true,
      data: certificates,
    })
  } catch (error) {
    console.error('List certificates error:', error)
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

    if (authUser.role !== 'COMPANY' && authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only companies can generate certificates' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId } = body

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    const existingCert = await db.certificate.findUnique({
      where: { applicationId },
    })

    if (existingCert) {
      return NextResponse.json(
        { success: false, error: 'Certificate already exists for this application', data: existingCert },
        { status: 409 }
      )
    }

    // Verify application is completed
    const application = await db.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Certificate can only be generated for completed applications' },
        { status: 400 }
      )
    }

    // Generate certificate number
    const certCount = await db.certificate.count()
    const certificateNumber = `IL-${new Date().getFullYear()}-${String(certCount + 1).padStart(5, '0')}`

    const certificate = await db.certificate.create({
      data: {
        applicationId,
        certificateNumber,
      },
    })

    return NextResponse.json({
      success: true,
      data: certificate,
    }, { status: 201 })
  } catch (error) {
    console.error('Generate certificate error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
