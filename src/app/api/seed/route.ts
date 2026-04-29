import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    const results: string[] = []

    // ─── Create Admin User ────────────────────────────────────
    const adminHash = await hashPassword('admin123')
    const admin = await db.user.upsert({
      where: { email: 'admin@internlink.cm' },
      update: {},
      create: {
        email: 'admin@internlink.cm',
        passwordHash: adminHash,
        name: 'Admin User',
        role: 'ADMIN',
        verified: true,
        active: true,
      },
    })
    results.push(`Admin: ${admin.email} (${admin.id})`)

    // ─── Create Test Student ──────────────────────────────────
    const studentHash = await hashPassword('student123')
    const student = await db.user.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        email: 'student@test.com',
        passwordHash: studentHash,
        name: 'Jean Kamga',
        phone: '+237 6 12 34 56 78',
        role: 'STUDENT',
        verified: true,
        active: true,
        studentProfile: {
          create: {
            university: 'University of Yaoundé I',
            fieldOfStudy: 'Computer Science',
            year: '3rd Year',
            skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Python', 'SQL']),
            bio: 'Passionate computer science student looking for internship opportunities in web development.',
            location: 'Yaoundé',
          },
        },
      },
      include: { studentProfile: true },
    })
    results.push(`Student: ${student.email} (${student.id})`)

    // ─── Create Test Company ──────────────────────────────────
    const companyHash = await hashPassword('company123')
    const company = await db.user.upsert({
      where: { email: 'company@test.com' },
      update: {},
      create: {
        email: 'company@test.com',
        passwordHash: companyHash,
        name: 'TechCorp Solutions',
        phone: '+237 2 33 44 55 66',
        role: 'COMPANY',
        verified: true,
        active: true,
        companyProfile: {
          create: {
            companyName: 'TechCorp Solutions',
            registrationNum: 'RC-YDE-2023-0042',
            industry: 'Information Technology',
            description: 'Leading IT solutions provider in Cameroon specializing in web development, mobile apps, and cloud services.',
            website: 'https://techcorp.cm',
            location: 'Bastos, Yaoundé',
            city: 'Yaoundé',
            verified: true,
          },
        },
      },
      include: { companyProfile: true },
    })
    results.push(`Company: ${company.email} (${company.id})`)

    // ─── Create Test Supervisor ───────────────────────────────
    const supervisorHash = await hashPassword('super123')
    const companyProfile = await db.companyProfile.findFirst({
      where: { companyName: 'TechCorp Solutions' },
    })

    const supervisor = await db.user.upsert({
      where: { email: 'supervisor@test.com' },
      update: {},
      create: {
        email: 'supervisor@test.com',
        passwordHash: supervisorHash,
        name: 'Marie Fotso',
        phone: '+237 6 77 88 99 00',
        role: 'SUPERVISOR',
        verified: true,
        active: true,
        supervisorProfile: companyProfile ? {
          create: {
            companyId: companyProfile.id,
            department: 'Engineering',
            title: 'Senior Developer',
          },
        } : undefined,
      },
    })
    results.push(`Supervisor: ${supervisor.email} (${supervisor.id})`)

    // ─── Create Sample Categories ─────────────────────────────
    const categoryNames = [
      { name: 'Information Technology', description: 'Software development, IT infrastructure, and digital services', icon: '💻' },
      { name: 'Business & Finance', description: 'Accounting, management, banking, and financial services', icon: '📊' },
      { name: 'Engineering', description: 'Civil, mechanical, electrical, and industrial engineering', icon: '⚙️' },
      { name: 'Healthcare', description: 'Medical, nursing, pharmacy, and public health', icon: '🏥' },
      { name: 'Education', description: 'Teaching, research, and educational administration', icon: '📚' },
      { name: 'Agriculture', description: 'Agronomy, livestock, and agribusiness', icon: '🌾' },
    ]

    const categories = []
    for (const cat of categoryNames) {
      const category = await db.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      })
      categories.push(category)
    }
    results.push(`Categories: ${categories.length} created/found`)

    // ─── Create Sample Offers ─────────────────────────────────
    if (companyProfile) {
      const itCategory = categories.find(c => c.name === 'Information Technology')
      const businessCategory = categories.find(c => c.name === 'Business & Finance')
      const engineeringCategory = categories.find(c => c.name === 'Engineering')

      const sampleOffers = [
        {
          companyId: companyProfile.id,
          categoryId: itCategory?.id || null,
          title: 'Full-Stack Web Development Intern',
          description: 'Join our dynamic team and work on real-world projects using React, Node.js, and PostgreSQL. You will participate in code reviews, sprint planning, and feature development.',
          requirements: 'Knowledge of JavaScript, HTML/CSS. Familiarity with React or Node.js is a plus.',
          skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git']),
          type: 'INTERNSHIP',
          duration: '6 months',
          startDate: '2024-09-01',
          stipend: '80,000 XAF/month',
          location: 'Bastos, Yaoundé',
          city: 'Yaoundé',
          remoteType: 'HYBRID',
          slots: 3,
          deadline: new Date('2024-08-15'),
          status: 'ACTIVE',
        },
        {
          companyId: companyProfile.id,
          categoryId: itCategory?.id || null,
          title: 'Mobile App Development Apprentice',
          description: 'Learn mobile app development with React Native. Work alongside experienced developers on cross-platform applications for our clients.',
          requirements: 'Basic programming knowledge. Interest in mobile development.',
          skills: JSON.stringify(['React Native', 'TypeScript', 'Mobile UI/UX', 'REST APIs']),
          type: 'APPRENTICESHIP',
          duration: '12 months',
          startDate: 'Flexible',
          stipend: '60,000 XAF/month',
          location: 'Bonapriso, Douala',
          city: 'Douala',
          remoteType: 'ON_SITE',
          slots: 2,
          deadline: new Date('2024-07-30'),
          status: 'ACTIVE',
        },
        {
          companyId: companyProfile.id,
          categoryId: businessCategory?.id || null,
          title: 'Business Analysis Intern',
          description: 'Support our business analysis team in gathering requirements, creating documentation, and facilitating communication between stakeholders and development teams.',
          requirements: 'Strong analytical skills. Knowledge of business process modeling.',
          skills: JSON.stringify(['Business Analysis', 'Documentation', 'UML', 'Agile']),
          type: 'INTERNSHIP',
          duration: '3 months',
          startDate: '2024-10-01',
          stipend: 'Unpaid',
          location: 'Bastos, Yaoundé',
          city: 'Yaoundé',
          remoteType: 'ON_SITE',
          slots: 1,
          deadline: new Date('2024-09-15'),
          status: 'ACTIVE',
        },
        {
          companyId: companyProfile.id,
          categoryId: engineeringCategory?.id || null,
          title: 'DevOps Engineering Intern',
          description: 'Learn CI/CD pipelines, containerization with Docker, and cloud infrastructure management. Hands-on experience with AWS and Kubernetes.',
          requirements: 'Linux basics. Interest in cloud technologies and automation.',
          skills: JSON.stringify(['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux']),
          type: 'INTERNSHIP',
          duration: '6 months',
          startDate: 'Flexible',
          stipend: '100,000 XAF/month',
          location: 'Remote',
          city: 'Remote',
          remoteType: 'REMOTE',
          slots: 2,
          deadline: new Date('2024-12-01'),
          status: 'ACTIVE',
        },
      ]

      for (const offerData of sampleOffers) {
        const existing = await db.offer.findFirst({
          where: { title: offerData.title, companyId: offerData.companyId },
        })
        if (!existing) {
          await db.offer.create({ data: offerData })
        }
      }
      results.push('Sample offers created/found')
    }

    // ─── Create Report Guide Sections ─────────────────────────
    const guideSections = [
      {
        title: 'General Guidelines',
        content: 'Your weekly report should be concise but comprehensive. Focus on what you accomplished, challenges faced, and plans for the next period. Use professional language and be specific about your contributions.',
        order: 1,
      },
      {
        title: 'Activities Section',
        content: 'List all tasks and activities you completed during the reporting period. Include specific details about your contributions, technologies used, and outcomes achieved. Mention any meetings, workshops, or training sessions attended.',
        order: 2,
      },
      {
        title: 'Challenges Section',
        content: 'Describe any difficulties or obstacles you encountered and how you addressed them. This helps supervisors understand your problem-solving abilities and areas where you might need additional support or guidance.',
        order: 3,
      },
      {
        title: 'Next Steps Section',
        content: 'Outline your planned activities and goals for the next reporting period. This helps supervisors provide relevant guidance and ensures continuity in your work progression.',
        order: 4,
      },
    ]

    for (const section of guideSections) {
      const existing = await db.reportGuide.findFirst({
        where: { title: section.title },
      })
      if (!existing) {
        await db.reportGuide.create({ data: section })
      }
    }
    results.push('Report guide sections created/found')

    return NextResponse.json({
      success: true,
      data: {
        message: 'Database seeded successfully',
        results,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
