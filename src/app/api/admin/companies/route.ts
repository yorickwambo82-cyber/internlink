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

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}
    if (status === 'verified') {
      where.verified = true
    } else if (status === 'pending') {
      where.verified = false
    }

    const companies = await db.companyProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, active: true, verified: true, createdAt: true } },
        _count: { select: { offers: true, reviews: true, supervisors: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: companies,
    })
  } catch (error) {
    console.error('List admin companies error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, verified } = body

    if (!userId || verified === undefined) {
      return NextResponse.json(
        { success: false, error: 'User ID and verified status are required' },
        { status: 400 }
      )
    }

    // Update company profile verification
    const companyProfile = await db.companyProfile.update({
      where: { userId },
      data: { verified },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Also update user verification status
    await db.user.update({
      where: { id: userId },
      data: { verified },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: authUser.userId,
        action: verified ? 'APPROVE_COMPANY' : 'REJECT_COMPANY',
        entity: 'CompanyProfile',
        entityId: companyProfile.id,
        details: `Company ${companyProfile.companyName} ${verified ? 'approved' : 'rejected'}`,
      },
    })

    // Notify company
    await db.notification.create({
      data: {
        userId,
        title: verified ? 'Company Verified' : 'Company Rejected',
        message: verified
          ? `Your company "${companyProfile.companyName}" has been verified! You can now create offers.`
          : `Your company "${companyProfile.companyName}" verification was rejected. Please contact support.`,
        type: verified ? 'SUCCESS' : 'ERROR',
      },
    })

    return NextResponse.json({
      success: true,
      data: companyProfile,
    })
  } catch (error) {
    console.error('Approve/reject company error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
