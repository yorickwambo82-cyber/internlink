'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/store';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, plan, setPlan } = useAuthStore();
  
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'manual_required'>('checking');
  const [attempts, setAttempts] = useState(0);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [targetPlan, setTargetPlan] = useState<string>('Premium');

  useEffect(() => {
    // Fapshi returns key transaction information in the query string
    const ref = searchParams.get('externalId') || searchParams.get('payment_ref') || searchParams.get('transaction_id');
    setPaymentRef(ref);

    if (ref) {
      const parts = ref.split('-');
      if (parts.length >= 3) {
        setTargetPlan(parts[2] === 'PRO' ? 'Pro' : 'Scholar');
      }
    }
  }, [searchParams]);

  // Poll subscription status
  useEffect(() => {
    if (!token) return;

    let intervalId: NodeJS.Timeout;

    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/subscriptions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          const currentPlan = data.data.plan;
          
          // If the plan has been upgraded to a paid plan, success!
          if (currentPlan !== 'STARTER') {
            setPlan(currentPlan);
            setStatus('success');
            toast.success('Your subscription has been successfully upgraded!');
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/');
            }, 3000);
            return true;
          }
        }
      } catch (err) {
        console.error('Error verifying subscription status:', err);
      }
      return false;
    };

    // Run initial check
    checkSubscription();

    // Start polling every 2 seconds
    intervalId = setInterval(async () => {
      setAttempts((prev) => {
        const nextAttempt = prev + 1;
        if (nextAttempt >= 6) {
          clearInterval(intervalId);
          setStatus('manual_required');
          return prev;
        }
        return nextAttempt;
      });

      const verified = await checkSubscription();
      if (verified) {
        clearInterval(intervalId);
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [token, setPlan, router, attempts]);

  // Manually trigger webhook local callback for development testing
  const handleManualActivate = async () => {
    if (!paymentRef) {
      toast.error('No payment reference found. Cannot trigger manual callback.');
      return;
    }

    try {
      setStatus('checking');
      const res = await fetch('/api/payments/fapshi-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'SUCCESSFUL',
          externalId: paymentRef,
          transId: `MOCK-TX-${Date.now()}`,
          amount: targetPlan === 'Pro' ? 200 : 100,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Manual subscription activation succeeded!');
        
        // Fetch new subscription plan
        const subRes = await fetch('/api/subscriptions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const subData = await subRes.json();
        if (subData.success && subData.data) {
          setPlan(subData.data.plan);
          setStatus('success');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } else {
        toast.error(data.error || 'Manual activation failed.');
        setStatus('manual_required');
      }
    } catch (err) {
      toast.error('Failed to trigger manual verification.');
      setStatus('manual_required');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050d0a] p-4 text-white">
      <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black text-white">
            {status === 'checking' && 'Verifying Payment'}
            {status === 'success' && 'Payment Confirmed!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'manual_required' && 'Webhook Pending'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {status === 'checking' && `Waiting for payment confirmation for ${targetPlan} plan...`}
            {status === 'success' && `Successfully upgraded to ${targetPlan} plan!`}
            {status === 'failed' && 'Something went wrong with the transaction.'}
            {status === 'manual_required' && 'Local development warning'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          {status === 'checking' && (
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20" />
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin absolute inset-0" />
            </div>
          )}

          {status === 'success' && (
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          {status === 'failed' && (
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          {status === 'manual_required' && (
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          )}

          {paymentRef && (
            <p className="text-xs font-mono bg-zinc-900 px-3 py-1.5 rounded text-zinc-400 mt-2">
              Ref: {paymentRef}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {status === 'success' && (
            <p className="text-xs text-zinc-400 text-center animate-pulse">
              Redirecting you to the dashboard...
            </p>
          )}

          {status === 'manual_required' && (
            <div className="space-y-4 w-full">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200">
                <strong>Why is this happening?</strong> Webhook callbacks cannot reach your local <code>localhost:3000</code> server directly without an internet-accessible tunnel (like <em>ngrok</em>).
              </div>
              <Button onClick={handleManualActivate} className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#050d0a] font-bold">
                Force Activate Subscription (Dev Mode)
              </Button>
            </div>
          )}

          <Button 
            variant="ghost" 
            className="w-full hover:bg-zinc-900 text-zinc-400 hover:text-white"
            onClick={() => router.push('/')}
          >
            Go back to Home <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050d0a] text-white">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
