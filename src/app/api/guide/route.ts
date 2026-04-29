import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  try {
    const guides = await db.reportGuide.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: guides,
    })
  } catch (error) {
    console.error('List guide sections error:', error)
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

    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only admins can manage guide sections' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, title, content, templateFileUrl, order, active } = body

    if (id) {
      // Update existing
      const updateData: Record<string, unknown> = {}
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content
      if (templateFileUrl !== undefined) updateData.templateFileUrl = templateFileUrl
      if (order !== undefined) updateData.order = order
      if (active !== undefined) updateData.active = active

      const guide = await db.reportGuide.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        data: guide,
      })
    }

    // Create new
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const guide = await db.reportGuide.create({
      data: {
        title,
        content,
        templateFileUrl: templateFileUrl || null,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json({
      success: true,
      data: guide,
    }, { status: 201 })
  } catch (error) {
    console.error('Create/update guide error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
