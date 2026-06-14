import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const PLAN_LIMITS = {
  STARTER: { applications: 3, offers: 2 },
  SCHOLAR: { applications: 15, offers: 10 },
  PRO: { applications: Infinity, offers: Infinity },
};

export const PLAN_PRICES = {
  SCHOLAR: 2500,
  PRO: 7500,
};

function getAuth(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/subscriptions — get current user's plan
export async function GET(request: Request) {
  const payload = getAuth(request);
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    let sub = await db.subscription.findUnique({ where: { userId: payload.userId } });

    // Auto-create STARTER subscription if missing
    if (!sub) {
      sub = await db.subscription.create({
        data: { userId: payload.userId, plan: 'STARTER', status: 'ACTIVE' },
      });
    }

    // Check if expired
    if (sub.expiresAt && new Date() > sub.expiresAt && sub.plan !== 'STARTER') {
      sub = await db.subscription.update({
        where: { userId: payload.userId },
        data: { plan: 'STARTER', status: 'EXPIRED' },
      });
    }

    return NextResponse.json({ success: true, data: sub });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/subscriptions — upgrade plan (called after successful payment)
export async function POST(request: Request) {
  const payload = getAuth(request);
  if (!payload) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { plan, paymentRef, operator } = body;

    if (!['SCHOLAR', 'PRO'].includes(plan)) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    if (!paymentRef) {
      return NextResponse.json({ success: false, error: 'Payment reference required' }, { status: 400 });
    }

    // 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const sub = await db.subscription.upsert({
      where: { userId: payload.userId },
      update: { plan, status: 'ACTIVE', expiresAt, paymentRef, operator },
      create: { userId: payload.userId, plan, status: 'ACTIVE', expiresAt, paymentRef, operator },
    });

    return NextResponse.json({ success: true, data: sub });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
