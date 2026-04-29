import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const companies = await db.companyProfile.findMany({
      where: { verified: true },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        _count: { select: { offers: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: companies,
    })
  } catch (error) {
    console.error('List companies error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
