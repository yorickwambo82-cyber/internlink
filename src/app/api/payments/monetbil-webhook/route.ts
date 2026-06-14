import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function handleNotification(params: Record<string, any>) {
  const { status, payment_ref, transaction_id, operator } = params;

  console.log('Monetbil webhook notification received:', params);

  if (status !== 'success') {
    console.log(`Payment status is not successful: ${status}`);
    return NextResponse.json({ success: true, message: `Notification processed (status: ${status})` });
  }

  if (!payment_ref) {
    return NextResponse.json({ success: false, error: 'Missing payment_ref' }, { status: 400 });
  }

  // Parse payment_ref: MB-[userId]-[plan]-[timestamp]
  const parts = payment_ref.split('-');
  if (parts[0] !== 'MB' || parts.length < 4) {
    console.error('Invalid payment_ref format:', payment_ref);
    return NextResponse.json({ success: false, error: 'Invalid payment_ref format' }, { status: 400 });
  }

  const userId = parts[1];
  const plan = parts[2];

  if (!['SCHOLAR', 'PRO'].includes(plan)) {
    console.error('Invalid plan in payment_ref:', plan);
    return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
  }

  try {
    // 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Upsert subscription
    await db.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: 'ACTIVE',
        expiresAt,
        paymentRef: transaction_id || payment_ref,
        operator: operator || 'MONETBIL',
      },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        expiresAt,
        paymentRef: transaction_id || payment_ref,
        operator: operator || 'MONETBIL',
      },
    });

    console.log(`Subscription upgraded successfully for user ${userId} to ${plan}`);
    return NextResponse.json({ success: true, message: 'Subscription activated' });
  } catch (error) {
    console.error('Webhook processing subscription error:', error);
    return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Content-Type might be application/json or application/x-www-form-urlencoded
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => null);
      if (body) {
        return await handleNotification(body);
      }
    } else {
      // Handle x-www-form-urlencoded
      const formData = await request.formData().catch(() => null);
      if (formData) {
        const params: Record<string, any> = {};
        formData.forEach((value, key) => {
          params[key] = value;
        });
        return await handleNotification(params);
      }
    }
  } catch (err) {
    console.error('Error parsing POST body:', err);
  }

  // Fallback to URL search parameters for POST request
  const url = new URL(request.url);
  const params: Record<string, any> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return await handleNotification(params);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params: Record<string, any> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return await handleNotification(params);
}
