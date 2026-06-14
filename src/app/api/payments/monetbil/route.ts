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

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amount, plan, phone } = parsed.data;
    const userId = payload.userId;

    const serviceKey = process.env.MONETBIL_SERVICE_KEY;
    if (!serviceKey) {
      console.error('MONETBIL_SERVICE_KEY is missing from environment');
      return NextResponse.json({ success: false, error: 'Payment service configuration error' }, { status: 500 });
    }

    // Generate a payment reference containing metadata: MB-[userId]-[plan]-[timestamp]
    const paymentRef = `MB-${userId}-${plan}-${Date.now()}`;

    // Get request host for redirect and notify URLs
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    // Construct return and webhook notification URLs
    const returnUrl = `${origin}/payment-status`;
    const notifyUrl = `${origin}/api/payments/monetbil-webhook`;

    // Call Monetbil Widget API v2.1
    const monetbilRes = await fetch(`https://api.monetbil.com/widget/v2.1/${serviceKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'XAF',
        locale: 'en',
        phone: phone || undefined,
        phone_lock: phone ? true : false,
        payment_ref: paymentRef,
        return_url: returnUrl,
        notify_url: notifyUrl,
      }),
    });

    if (!monetbilRes.ok) {
      const errorText = await monetbilRes.text();
      console.error('Monetbil API error response:', errorText);
      return NextResponse.json({ success: false, error: 'Failed to communicate with Monetbil' }, { status: 502 });
    }

    const monetbilData = await monetbilRes.json();
    if (!monetbilData.success || !monetbilData.payment_url) {
      return NextResponse.json({ success: false, error: monetbilData.message || 'Payment initiation failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      paymentUrl: monetbilData.payment_url,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
