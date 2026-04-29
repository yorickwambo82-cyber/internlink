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

    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      include: {
        studentProfile: true,
        companyProfile: true,
        supervisorProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('Get profile error:', error)
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
    const { name, phone, avatar, university, fieldOfStudy, year, cvUrl, skills, portfolioUrl, bio, location,
      companyName, registrationNum, industry, description, website, city: companyCity, logoUrl,
      department, title } = body

    // Update base user info
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar

    await db.user.update({
      where: { id: authUser.userId },
      data: updateData,
    })

    // Update role-specific profile
    if (authUser.role === 'STUDENT') {
      const studentData: Record<string, unknown> = {}
      if (university !== undefined) studentData.university = university
      if (fieldOfStudy !== undefined) studentData.fieldOfStudy = fieldOfStudy
      if (year !== undefined) studentData.year = year
      if (cvUrl !== undefined) studentData.cvUrl = cvUrl
      if (skills !== undefined) studentData.skills = typeof skills === 'string' ? skills : JSON.stringify(skills)
      if (portfolioUrl !== undefined) studentData.portfolioUrl = portfolioUrl
      if (bio !== undefined) studentData.bio = bio
      if (location !== undefined) studentData.location = location

      if (Object.keys(studentData).length > 0) {
        await db.studentProfile.update({
          where: { userId: authUser.userId },
          data: studentData,
        })
      }
    } else if (authUser.role === 'COMPANY') {
      const companyData: Record<string, unknown> = {}
      if (companyName !== undefined) companyData.companyName = companyName
      if (registrationNum !== undefined) companyData.registrationNum = registrationNum
      if (industry !== undefined) companyData.industry = industry
      if (description !== undefined) companyData.description = description
      if (website !== undefined) companyData.website = website
      if (companyCity !== undefined) companyData.city = companyCity
      if (logoUrl !== undefined) companyData.logoUrl = logoUrl

      if (Object.keys(companyData).length > 0) {
        await db.companyProfile.update({
          where: { userId: authUser.userId },
          data: companyData,
        })
      }
    } else if (authUser.role === 'SUPERVISOR') {
      const supervisorData: Record<string, unknown> = {}
      if (department !== undefined) supervisorData.department = department
      if (title !== undefined) supervisorData.title = title

      if (Object.keys(supervisorData).length > 0) {
        await db.supervisorProfile.update({
          where: { userId: authUser.userId },
          data: supervisorData,
        })
      }
    }

    // Return updated user
    const updatedUser = await db.user.findUnique({
      where: { id: authUser.userId },
      include: {
        studentProfile: true,
        companyProfile: true,
        supervisorProfile: true,
      },
    })

    const { passwordHash: _, ...userWithoutPassword } = updatedUser!

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
