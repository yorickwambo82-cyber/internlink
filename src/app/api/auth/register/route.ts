import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone, role, companyName } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const validRoles = ['STUDENT', 'COMPANY']
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role must be STUDENT or COMPANY' },
        { status: 400 }
      )
    }

    if (role === 'COMPANY' && !companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required for company registration' },
        { status: 400 }
      )
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user with profile
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || null,
        role,
        studentProfile: role === 'STUDENT' ? { create: {} } : undefined,
        companyProfile: role === 'COMPANY'
          ? { create: { companyName } }
          : undefined,
      },
      include: {
        studentProfile: true,
        companyProfile: true,
        supervisorProfile: true,
      },
    })

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role })

    // Remove passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, token },
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
