import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  amount: z.number().positive('Invalid amount'),
  plan: z.enum(['SCHOLAR', 'PRO']),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token) as { userId: string } | null;
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { amount, plan, phone } = parsed.data;
    const userId = payload.userId;

    const apiUser = process.env.FAPSHI_API_USER;
    const apiKey = process.env.FAPSHI_API_KEY;

    if (!apiUser || !apiKey) {
      console.error('FAPSHI_API_USER or FAPSHI_API_KEY is missing from environment');
      return NextResponse.json({ success: false, error: 'Payment service configuration error' }, { status: 500 });
    }

    // externalId containing metadata for webhook processing: FA-[userId]-[plan]-[timestamp]
    const externalId = `FA-${userId}-${plan}-${Date.now()}`;

    // Get request host for redirect URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;
    const redirectUrl = `${origin}/payment-status`;

    // As requested, placeholder email since we only really have phone from the user
    const email = `user${userId}@internlink.com`;

    // Call Fapshi Live API
    const fapshiRes = await fetch('https://live.fapshi.com/initiate-pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiuser': apiUser,
        'apikey': apiKey,
      },
      body: JSON.stringify({
        amount,
        email,
        userId,
        redirectUrl,
        externalId,
        message: `Payment for ${plan} plan on Internlink`
      }),
    });

    if (!fapshiRes.ok) {
      const errorText = await fapshiRes.text();
      console.error('Fapshi API error response:', errorText);
      return NextResponse.json({ success: false, error: 'Failed to communicate with Fapshi' }, { status: 502 });
    }

    const fapshiData = await fapshiRes.json();
    
    // According to standard Fapshi response, link to redirect is provided
    if (!fapshiData.link) {
      return NextResponse.json({ success: false, error: fapshiData.message || 'Payment initiation failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      paymentUrl: fapshiData.link,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
