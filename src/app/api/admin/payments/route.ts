import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        amount: { gt: 0 } // only fetch paid subscriptions
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
