import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(['STUDENT', 'COMPANY'], { required_error: 'Role must be STUDENT or COMPANY' }),
  companyName: z.string().optional(),
  university: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  year: z.string().optional(),
}).refine(data => {
  if (data.role === 'COMPANY' && (!data.companyName || data.companyName.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Company name is required for company registration",
  path: ["companyName"]
});

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Zod Validation
    const parseResult = registerSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors[0].message },
        { status: 400 }
      )
    }
    const { email, password, name, phone, role, companyName, university, fieldOfStudy, year } = parseResult.data

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
        studentProfile: role === 'STUDENT' ? { 
          create: {
            university: university || null,
            fieldOfStudy: fieldOfStudy || null,
            year: year || null,
          } 
        } : undefined,
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
