import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    const type = searchParams.get('type') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const remoteType = searchParams.get('remoteType') || ''
    const paid = searchParams.get('paid') || ''
    const companyId = searchParams.get('companyId') || ''
    const statusFilter = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Prisma.OfferWhereInput = {}

    // If companyId is specified, show that company's offers (with optional status filter)
    // Otherwise default to ACTIVE only for public listing
    if (companyId) {
      where.companyId = companyId
      if (statusFilter) {
        where.status = statusFilter
      }
    } else if (statusFilter) {
      where.status = statusFilter
    } else {
      where.status = 'ACTIVE'
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { skills: { contains: search } },
      ]
    }

    if (city) {
      where.city = city
    }

    if (type) {
      where.type = type
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (remoteType) {
      where.remoteType = remoteType
    }

    if (paid === 'true') {
      where.stipend = { not: 'Unpaid' }
    } else if (paid === 'false') {
      where.stipend = 'Unpaid'
    }

    const [offers, total] = await Promise.all([
      db.offer.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              city: true,
              verified: true,
              user: { select: { name: true } },
            },
          },
          category: { select: { id: true, name: true, icon: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.offer.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        offers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('List offers error:', error)
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

    if (authUser.role !== 'COMPANY') {
      return NextResponse.json(
        { success: false, error: 'Only companies can create offers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, requirements, skills, type, duration, startDate, stipend,
      location, city, remoteType, slots, deadline, categoryId } = body

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Get company profile
    const companyProfile = await db.companyProfile.findUnique({
      where: { userId: authUser.userId },
    })

    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      )
    }

    const offer = await db.offer.create({
      data: {
        companyId: companyProfile.id,
        categoryId: categoryId || null,
        title,
        description,
        requirements: requirements || null,
        skills: skills ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : null,
        type: type || 'INTERNSHIP',
        duration: duration || null,
        startDate: startDate || null,
        stipend: stipend || null,
        location: location || null,
        city: city || null,
        remoteType: remoteType || 'ON_SITE',
        slots: slots || 1,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            city: true,
            verified: true,
          },
        },
        category: { select: { id: true, name: true, icon: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: offer,
    }, { status: 201 })
  } catch (error) {
    console.error('Create offer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
