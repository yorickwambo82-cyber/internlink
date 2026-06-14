import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const auth = getUserFromRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password } = await req.json();

    if (!email && !password) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (email) {
      // Check if email is already taken by another user
      const existing = await db.user.findFirst({
        where: { email, id: { not: auth.userId } },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 });
      }
      dataToUpdate.email = email;
    }

    if (password) {
      const bcrypt = require('bcryptjs');
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id: auth.userId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: { id: updatedUser.id, email: updatedUser.email } });
  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
