import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Search term is required' },
        { status: 400 }
      )
    }

    const results: Record<string, unknown[]> = {}

    if (type === 'offers' || type === 'all') {
      results.offers = await db.offer.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { skills: { contains: q } },
            { city: { contains: q } },
          ],
        },
        include: {
          company: {
            select: { id: true, companyName: true, logoUrl: true, city: true, verified: true },
          },
          category: { select: { id: true, name: true, icon: true } },
          _count: { select: { applications: true } },
        },
        take: 20,
      })
    }

    if (type === 'companies' || type === 'all') {
      results.companies = await db.companyProfile.findMany({
        where: {
          verified: true,
          OR: [
            { companyName: { contains: q } },
            { industry: { contains: q } },
            { city: { contains: q } },
            { description: { contains: q } },
          ],
        },
        include: {
          user: { select: { name: true, avatar: true } },
          _count: { select: { offers: true, reviews: true } },
        },
        take: 20,
      })
    }

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export for POST if admin wants to create search indices etc - not needed for basic
