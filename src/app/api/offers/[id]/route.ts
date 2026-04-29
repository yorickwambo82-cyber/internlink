import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const offer = await db.offer.findUnique({
      where: { id },
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
            user: { select: { name: true } },
          },
        },
        category: { select: { id: true, name: true, icon: true } },
        _count: { select: { applications: true } },
      },
    })

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Increment views
    await db.offer.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: { ...offer, views: offer.views + 1 },
    })
  } catch (error) {
    console.error('Get offer error:', error)
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

    if (authUser.role !== 'COMPANY') {
      return NextResponse.json(
        { success: false, error: 'Only companies can update offers' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verify ownership
    const offer = await db.offer.findUnique({
      where: { id },
      include: { company: true },
    })

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    const companyProfile = await db.companyProfile.findUnique({
      where: { userId: authUser.userId },
    })

    if (!companyProfile || offer.companyId !== companyProfile.id) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own offers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, requirements, skills, type, duration, startDate, stipend,
      location, city, remoteType, slots, deadline, categoryId, status } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (requirements !== undefined) updateData.requirements = requirements
    if (skills !== undefined) updateData.skills = typeof skills === 'string' ? skills : JSON.stringify(skills)
    if (type !== undefined) updateData.type = type
    if (duration !== undefined) updateData.duration = duration
    if (startDate !== undefined) updateData.startDate = startDate
    if (stipend !== undefined) updateData.stipend = stipend
    if (location !== undefined) updateData.location = location
    if (city !== undefined) updateData.city = city
    if (remoteType !== undefined) updateData.remoteType = remoteType
    if (slots !== undefined) updateData.slots = slots
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (status !== undefined) updateData.status = status

    const updatedOffer = await db.offer.update({
      where: { id },
      data: updateData,
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
      data: updatedOffer,
    })
  } catch (error) {
    console.error('Update offer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (authUser.role !== 'COMPANY') {
      return NextResponse.json(
        { success: false, error: 'Only companies can close offers' },
        { status: 403 }
      )
    }

    const { id } = await params

    const offer = await db.offer.findUnique({
      where: { id },
      include: { company: true },
    })

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    const companyProfile = await db.companyProfile.findUnique({
      where: { userId: authUser.userId },
    })

    if (!companyProfile || offer.companyId !== companyProfile.id) {
      return NextResponse.json(
        { success: false, error: 'You can only close your own offers' },
        { status: 403 }
      )
    }

    const updatedOffer = await db.offer.update({
      where: { id },
      data: { status: 'CLOSED' },
    })

    return NextResponse.json({
      success: true,
      data: updatedOffer,
    })
  } catch (error) {
    console.error('Close offer error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
