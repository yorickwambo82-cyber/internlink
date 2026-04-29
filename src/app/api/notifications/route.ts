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

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: Record<string, unknown> = {
      userId: authUser.userId,
    }

    if (unreadOnly) {
      where.read = false
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: notifications,
    })
  } catch (error) {
    console.error('List notifications error:', error)
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

    const body = await request.json()
    const { ids, markAll } = body

    if (markAll) {
      await db.notification.updateMany({
        where: {
          userId: authUser.userId,
          read: false,
        },
        data: { read: true },
      })

      return NextResponse.json({
        success: true,
        data: { message: 'All notifications marked as read' },
      })
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      await db.notification.updateMany({
        where: {
          id: { in: ids },
          userId: authUser.userId,
        },
        data: { read: true },
      })

      return NextResponse.json({
        success: true,
        data: { message: `${ids.length} notifications marked as read` },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Provide ids array or markAll: true' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Mark notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
