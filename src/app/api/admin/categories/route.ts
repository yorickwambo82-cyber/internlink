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

    const categories = await db.category.findMany({
      include: {
        _count: { select: { offers: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('List admin categories error:', error)
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
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, icon, active } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check uniqueness
    const existing = await db.category.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
        active: active !== undefined ? active : true,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: authUser.userId,
        action: 'CREATE_CATEGORY',
        entity: 'Category',
        entityId: category.id,
        details: `Created category: ${name}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: category,
    }, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required (query param)' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, icon, active } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (icon !== undefined) updateData.icon = icon
    if (active !== undefined) updateData.active = active

    const category = await db.category.update({
      where: { id },
      data: updateData,
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: authUser.userId,
        action: 'UPDATE_CATEGORY',
        entity: 'Category',
        entityId: id,
        details: `Updated category: ${name || category.name}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required (query param)' },
        { status: 400 }
      )
    }

    const category = await db.category.delete({
      where: { id },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: authUser.userId,
        action: 'DELETE_CATEGORY',
        entity: 'Category',
        entityId: id,
        details: `Deleted category: ${category.name}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Category deleted successfully' },
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
