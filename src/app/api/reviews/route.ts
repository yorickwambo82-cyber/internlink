import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || ''

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const reviews = await db.review.findMany({
      where: { companyId },
      include: {
        student: {
          select: {
            id: true,
            university: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: reviews,
    })
  } catch (error) {
    console.error('List reviews error:', error)
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

    const body = await request.json()
    const { rating, comment, applicationId, didNotShow } = body

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (authUser.role === 'COMPANY') {
      const { studentId } = body
      if (!studentId || !rating) {
        return NextResponse.json(
          { success: false, error: 'Student ID and rating are required' },
          { status: 400 }
        )
      }

      const companyProfile = await db.companyProfile.findUnique({
        where: { userId: authUser.userId },
      })

      if (!companyProfile) {
        return NextResponse.json({ success: false, error: 'Company profile not found' }, { status: 404 })
      }

      // Create review by company
      const review = await db.review.create({
        data: {
          studentId,
          companyId: companyProfile.id,
          authorType: 'COMPANY',
          rating: parseInt(String(rating)),
          comment: comment || null,
        },
      })

      // If tied to an application update status
      if (applicationId) {
        if (didNotShow) {
          await db.application.update({
            where: { id: applicationId },
            data: { status: 'DID_NOT_SHOW' },
          })
        } else {
          await db.application.update({
            where: { id: applicationId },
            data: { status: 'COMPLETED', completedAt: new Date() },
          })
        }
      }

      return NextResponse.json({ success: true, data: review }, { status: 201 })
    }

    if (authUser.role === 'STUDENT') {
      const { companyId } = body
      if (!companyId || !rating) {
        return NextResponse.json(
          { success: false, error: 'Company ID and rating are required' },
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

      // Verify student has a completed application with this company
      const completedApplication = await db.application.findFirst({
        where: {
          studentId: studentProfile.id,
          status: 'COMPLETED',
          offer: { companyId },
        },
      })

      if (!completedApplication) {
        return NextResponse.json(
          { success: false, error: 'You can only review companies where you completed an internship' },
          { status: 403 }
        )
      }

      const review = await db.review.create({
        data: {
          studentId: studentProfile.id,
          companyId,
          authorType: 'STUDENT',
          rating: parseInt(String(rating)),
          comment: comment || null,
        },
        include: {
          student: {
            select: {
              user: { select: { name: true, avatar: true } },
              university: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: review }, { status: 201 })
    }

    return NextResponse.json(
      { success: false, error: 'Only students and companies can submit reviews' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Submit review error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
