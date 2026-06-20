import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, otp, newPassword } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid reset request.' }, { status: 400 });
    }

    // Validate OTP
    if (!user.otpCode || user.otpCode !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid reset code.' }, { status: 400 });
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return NextResponse.json({ success: false, error: 'Reset code has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash new password and clear OTP
    const passwordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
