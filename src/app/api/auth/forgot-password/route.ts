import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

// Generates a 6-digit numeric OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If that email exists, a reset code has been sent.',
        // In dev mode, we expose this so you can see what would be emailed
        __dev_note: 'No user found with that email.',
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
      },
    });

    // In production: send OTP via email (Resend / Nodemailer)
    // For now, we return it in the response for simulation purposes
    console.log(`[PASSWORD RESET] OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'Reset code sent successfully.',
      // SIMULATION ONLY — remove in production
      __dev_otp: otp,
      __dev_expires: expiresAt,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
