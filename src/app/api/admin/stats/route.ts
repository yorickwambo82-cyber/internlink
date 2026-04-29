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

    const [
      totalStudents,
      totalCompanies,
      totalOffers,
      totalApplications,
      activeOffers,
      pendingCompanies,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      completedApplications,
      inProgressApplications,
      cancelledApplications,
      recentSignups,
    ] = await Promise.all([
      db.user.count({ where: { role: 'STUDENT' } }),
      db.user.count({ where: { role: 'COMPANY' } }),
      db.offer.count(),
      db.application.count(),
      db.offer.count({ where: { status: 'ACTIVE' } }),
      db.companyProfile.count({ where: { verified: false } }),
      db.application.count({ where: { status: 'PENDING' } }),
      db.application.count({ where: { status: 'ACCEPTED' } }),
      db.application.count({ where: { status: 'REJECTED' } }),
      db.application.count({ where: { status: 'COMPLETED' } }),
      db.application.count({ where: { status: 'IN_PROGRESS' } }),
      db.application.count({ where: { status: 'CANCELLED' } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: {
          totalStudents,
          totalCompanies,
          recentSignups,
        },
        offers: {
          total: totalOffers,
          active: activeOffers,
        },
        companies: {
          pending: pendingCompanies,
        },
        applications: {
          total: totalApplications,
          byStatus: {
            PENDING: pendingApplications,
            ACCEPTED: acceptedApplications,
            REJECTED: rejectedApplications,
            COMPLETED: completedApplications,
            IN_PROGRESS: inProgressApplications,
            CANCELLED: cancelledApplications,
          },
        },
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
