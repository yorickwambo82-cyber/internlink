import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  let rawBody = '';
  try {
    const providedSecret = request.headers.get('x-wh-secret');
    const expectedSecret = process.env.FAPSHI_WEBHOOK_SECRET;

    // Read raw body first for logging
    rawBody = await request.text();

    await db.auditLog.create({
      data: {
        action: 'WEBHOOK_RECEIVED',
        entity: 'Fapshi',
        details: `Headers: secret=${providedSecret ? 'provided' : 'missing'}. Body: ${rawBody.substring(0, 500)}`,
      }
    });

    if (process.env.NODE_ENV !== 'development' && expectedSecret && providedSecret !== expectedSecret) {
      await db.auditLog.create({
        data: { action: 'WEBHOOK_FAILED', entity: 'Fapshi', details: 'Secret mismatch' }
      });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { status, externalId, transId } = body;

    if (status !== 'SUCCESSFUL') {
       return NextResponse.json({ success: true, message: 'Ignored non-successful transaction' });
    }

    if (externalId && externalId.startsWith('FA-')) {
      const parts = externalId.split('-');
      if (parts.length >= 3) {
        const userId = parts[1];
        const plan = parts[2];

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
          await db.auditLog.create({
            data: { action: 'WEBHOOK_FAILED', entity: 'Fapshi', details: `User ${userId} not found` }
          });
          return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const amount = plan === 'PRO' ? 200 : 100;
        await db.subscription.upsert({
          where: { userId: userId },
          update: { plan: plan, status: 'ACTIVE', expiresAt, paymentRef: transId, amount },
          create: { userId: userId, plan: plan, status: 'ACTIVE', expiresAt, paymentRef: transId, amount },
        });
        
        await db.auditLog.create({
          data: { action: 'WEBHOOK_SUCCESS', entity: 'Fapshi', details: `Upgraded ${userId} to ${plan} (TransId: ${transId})`, userId: userId }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing Fapshi webhook:', error);
    await db.auditLog.create({
      data: { action: 'WEBHOOK_ERROR', entity: 'Fapshi', details: `${error.message || 'Unknown error'} | Body: ${rawBody.substring(0, 200)}` }
    }).catch(() => {});
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
