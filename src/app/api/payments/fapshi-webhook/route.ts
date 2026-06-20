import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const providedSecret = request.headers.get('x-wh-secret');
    const expectedSecret = process.env.FAPSHI_WEBHOOK_SECRET;

    // Verify webhook secret if it is configured in the environment
    if (expectedSecret && providedSecret !== expectedSecret) {
      console.error('Invalid Fapshi webhook secret');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Fapshi webhook notification received:', body);

    // typical Fapshi webhook payload: { status: 'SUCCESSFUL' | 'FAILED', externalId: '...', transId: '...' }
    const { status, externalId, transId } = body;

    // We only process successful transactions
    if (status !== 'SUCCESSFUL') {
       return NextResponse.json({ success: true, message: 'Ignored non-successful transaction' });
    }

    if (externalId && externalId.startsWith('FA-')) {
      const parts = externalId.split('-');
      if (parts.length >= 3) {
        const userId = parts[1];
        const plan = parts[2];

        // Ensure the user exists before updating
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          console.error(`User ${userId} not found for Fapshi webhook upgrade`);
          return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Update the user's plan
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.subscription.upsert({
          where: { userId: userId },
          update: {
            plan: plan,
            status: 'ACTIVE',
            expiresAt,
            paymentRef: transId,
          },
          create: {
            userId: userId,
            plan: plan,
            status: 'ACTIVE',
            expiresAt,
            paymentRef: transId,
          },
        });
        
        console.log(`Successfully upgraded user ${userId} to ${plan} via Fapshi webhook (TransId: ${transId}).`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Fapshi webhook:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
