import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().min(9, 'Invalid phone number'),
  operator: z.enum(['ORANGE', 'MTN'], { required_error: 'Select an operator' }),
  amount: z.number().positive('Invalid amount'),
  plan: z.enum(['SCHOLAR', 'PRO']),
});

// Generates a fake transaction reference
function generateRef(operator: string): string {
  const prefix = operator === 'ORANGE' ? 'OM' : 'MTN';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
}

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { phone, operator, amount, plan } = parsed.data;

    // Simulate processing delay (2 seconds) — in production, call Orange/MTN API here
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate a 95% success rate
    const success = Math.random() > 0.05;

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Payment failed. Please check your balance and try again.',
      }, { status: 402 });
    }

    const transactionRef = generateRef(operator);

    return NextResponse.json({
      success: true,
      data: {
        transactionRef,
        operator,
        phone,
        amount,
        plan,
        paidAt: new Date().toISOString(),
        message: `${operator === 'ORANGE' ? 'Orange Money' : 'MTN Mobile Money'} payment of ${amount.toLocaleString()} XAF confirmed.`,
      },
    });
  } catch (error) {
    console.error('Payment simulation error:', error);
    return NextResponse.json({ success: false, error: 'Payment service unavailable' }, { status: 500 });
  }
}
