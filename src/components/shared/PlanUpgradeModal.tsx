'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Zap, Star, CheckCircle2, XCircle, Loader2, Phone,
  Smartphone, Wifi, Battery, Signal, Delete, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Payment Integration ───────────────────────────────

const PLANS = [
  {
    key: 'STARTER', name: 'Starter', price: 0, icon: Star,
    color: 'border-slate-200 dark:border-slate-700',
    headerColor: 'bg-slate-50 dark:bg-slate-800',
    iconColor: 'text-slate-500', badge: null,
    features: ['3 applications (students)', '2 offers posted (companies)', 'Document uploads', 'Certificate generation', 'Community support'],
    disabled: ['Analytics', 'Priority listing', 'Email support'],
  },
  {
    key: 'SCHOLAR', name: 'Scholar', price: 100, icon: Zap,
    color: 'border-blue-300 dark:border-blue-600',
    headerColor: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600', badge: 'Popular',
    features: ['15 applications (students)', '10 offers posted (companies)', 'Document uploads', 'Certificate generation', 'Basic analytics', 'Email support'],
    disabled: ['Priority listing', 'Full analytics'],
  },
  {
    key: 'PRO', name: 'Pro', price: 200, icon: Crown,
    color: 'border-amber-300 dark:border-amber-600',
    headerColor: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600', badge: 'Best Value',
    features: ['Unlimited applications', 'Unlimited offers', 'Document uploads', 'Certificate generation', 'Full analytics', 'Priority listing', 'Priority support'],
    disabled: [],
  },
];

interface PlanUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (plan: string) => void;
  currentPlan?: string;
  reason?: string;
  returnPath?: string;
}

type Step = 'plans' | 'payment' | 'ussd' | 'pin' | 'processing' | 'success';
type SimPhase = 'prompt' | 'entering-pin' | 'confirming' | 'approved' | 'failed';

// ─── Interactive Phone Simulator ─────────────────────────────
function PhoneSimulator({
  operator, phone, amount, plan,
  onSuccess, onFail,
}: {
  operator: 'ORANGE' | 'MTN';
  phone: string;
  amount: number;
  plan: string;
  onSuccess: (ref: string) => void;
  onFail: () => void;
}) {
  const [phase, setPhase] = useState<SimPhase>('prompt');
  const [pin, setPin] = useState('');
  const [time, setTime] = useState('');
  const pinRef = useRef<HTMLInputElement>(null);

  const isMTN = operator === 'MTN';
  const bgColor = isMTN ? 'from-yellow-400 to-yellow-500' : 'from-orange-400 to-orange-500';
  const headerColor = isMTN ? 'bg-yellow-400' : 'bg-orange-500';
  const accentColor = isMTN ? 'text-yellow-600' : 'text-orange-500';
  const btnColor = isMTN ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-orange-500 hover:bg-orange-400 text-white';
  const operatorName = isMTN ? 'MTN Mobile Money' : 'Orange Money';
  const dialCode = isMTN ? '*126#' : '#150#';

  useEffect(() => {
    const now = new Date();
    setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handlePinKey = (key: string) => {
    if (phase !== 'entering-pin') return;
    if (key === 'DEL') { setPin(p => p.slice(0, -1)); return; }
    if (pin.length < 5) setPin(p => p + key);
  };

  const handleConfirm = async () => {
    if (pin.length < 4) { toast.error('PIN must be at least 4 digits'); return; }
    setPhase('confirming');

    // Simulate network delay 2-3s
    await new Promise(r => setTimeout(r, 2500));

    // 95% success rate sim
    if (Math.random() > 0.05) {
      setPhase('approved');
      const ref = `${isMTN ? 'MTN' : 'OM'}-${Date.now()}-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
      setTimeout(() => onSuccess(ref), 1500);
    } else {
      setPhase('failed');
      setTimeout(() => onFail(), 2000);
    }
  };

  return (
    <div className="flex justify-center">
      {/* Phone Shell */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-64 rounded-[2.5rem] border-[6px] border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden"
        style={{ aspectRatio: '9/18' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-10" />

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 text-white text-[10px]">
          <span className="font-semibold">{time}</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3 h-3" />
          </div>
        </div>

        {/* Header bar */}
        <div className={cn('flex items-center justify-between px-3 py-2', headerColor)}>
          <span className="text-white text-xs font-bold">{operatorName}</span>
          <span className="text-white/70 text-[10px]">{dialCode}</span>
        </div>

        {/* Screen content */}
        <div className="flex-1 bg-white text-gray-900 px-3 py-3 min-h-[260px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* PROMPT phase */}
            {phase === 'prompt' && (
              <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 h-full">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Request</p>
                <div className={cn('text-[11px] font-semibold p-2 rounded-lg', isMTN ? 'bg-yellow-50 border border-yellow-200' : 'bg-orange-50 border border-orange-200')}>
                  <p className="text-gray-700">You are about to pay:</p>
                  <p className={cn('text-lg font-black mt-1', accentColor)}>{amount.toLocaleString()} XAF</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">To: <strong>InternLink</strong></p>
                  <p className="text-gray-500 text-[10px]">For: <strong>{plan} Subscription</strong></p>
                  <p className="text-gray-500 text-[10px]">From: <strong>{phone}</strong></p>
                </div>
                <p className="text-[10px] text-gray-500 text-center">Enter your PIN to confirm this transaction</p>
                <button
                  onClick={() => setPhase('entering-pin')}
                  className={cn('w-full py-2 rounded-xl text-xs font-bold mt-auto', btnColor)}
                >
                  Proceed
                </button>
                <button
                  onClick={onFail}
                  className="w-full py-1.5 rounded-xl text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {/* PIN entry phase */}
            {phase === 'entering-pin' && (
              <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3 h-full">
                <p className="text-[11px] font-bold text-gray-700 text-center">Enter your {operatorName} PIN</p>
                {/* PIN dots */}
                <div className="flex justify-center gap-3 my-2">
                  {[0, 1, 2, 3, 4].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: pin.length > i ? 1.2 : 1 }}
                      className={cn(
                        'w-4 h-4 rounded-full border-2 transition-colors',
                        pin.length > i
                          ? isMTN ? 'bg-yellow-400 border-yellow-400' : 'bg-orange-500 border-orange-500'
                          : 'border-gray-300 bg-transparent'
                      )}
                    />
                  ))}
                </div>
                {/* Keypad */}
                <div className="grid grid-cols-3 gap-1.5 mt-auto">
                  {['1','2','3','4','5','6','7','8','9','*','0','DEL'].map(k => (
                    <button
                      key={k}
                      onClick={() => handlePinKey(k)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-bold transition-all active:scale-95',
                        k === 'DEL'
                          ? 'bg-red-50 text-red-500 border border-red-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      )}
                    >
                      {k === 'DEL' ? '⌫' : k}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={pin.length < 4}
                  className={cn(
                    'w-full py-2 rounded-xl text-xs font-bold transition-all',
                    pin.length >= 4
                      ? btnColor
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  Confirm Payment
                </button>
              </motion.div>
            )}

            {/* Confirming phase */}
            {phase === 'confirming' && (
              <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-3 h-full">
                <Loader2 className={cn('w-10 h-10 animate-spin', accentColor)} />
                <p className="text-[11px] font-semibold text-gray-600 text-center">Processing transaction...</p>
                <p className="text-[10px] text-gray-400 text-center">Please wait, contacting {operatorName} servers</p>
              </motion.div>
            )}

            {/* Approved phase */}
            {phase === 'approved' && (
              <motion.div key="approved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-3 h-full text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <p className="text-[12px] font-black text-emerald-700">Payment Successful!</p>
                <p className="text-[10px] text-gray-500">{amount.toLocaleString()} XAF debited<br/>from {phone}</p>
              </motion.div>
            )}

            {/* Failed phase */}
            {phase === 'failed' && (
              <motion.div key="failed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-3 h-full text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-[12px] font-black text-red-600">Transaction Failed</p>
                <p className="text-[10px] text-gray-500">Check your balance<br/>or try again later</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Home bar */}
        <div className="flex justify-center py-2 bg-white border-t border-gray-100">
          <div className="w-16 h-1 bg-gray-300 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────
export default function PlanUpgradeModal({
  open, onClose, onSuccess, currentPlan = 'STARTER', reason, returnPath,
}: PlanUpgradeModalProps) {
  const { token } = useAuthStore();
  const [step, setStep] = useState<Step>('plans');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [operator, setOperator] = useState<'ORANGE' | 'MTN' | ''>('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{ transactionRef: string; plan: string } | null>(null);

  const selectedPlanData = PLANS.find(p => p.key === selectedPlan);

  const handleSelectPlan = (planKey: string) => {
    if (planKey === 'STARTER') return;
    setSelectedPlan(planKey);
    setStep('payment');
  };

  // Called when user clicks Pay button
  const handlePay = async () => {
    if (!operator) { toast.error('Please select a payment method'); return; }
    if (!phone.trim()) { toast.error('Please enter your mobile money number'); return; }

    setStep('processing');
    setProcessing(true);
    try {
      const payRes = await fetch('/api/payments/fapshi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: phone.trim(), amount: selectedPlanData!.price, plan: selectedPlan, returnPath }),
      });
      const payData = await payRes.json();
      if (!payData.success || !payData.paymentUrl) {
        toast.error(payData.error || 'Failed to initiate payment');
        setStep('payment');
        return;
      }
      toast.success('Redirecting to secure payment page...');
      window.location.href = payData.paymentUrl;
    } catch {
      toast.error('Something went wrong. Please try again.');
      setStep('payment');
    } finally {
      setProcessing(false);
    }
  };

  // Called by simulator on success
  const handleSimSuccess = async (transactionRef: string) => {
    setStep('processing');
    try {
      const subRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: selectedPlan, paymentRef: transactionRef, operator }),
      });
      const subData = await subRes.json();
      if (!subData.success) {
        toast.error('Subscription activation failed. Contact support.');
        setStep('payment');
        return;
      }
      setSuccessData({ transactionRef, plan: selectedPlan });
      setStep('success');
      onSuccess?.(selectedPlan);
    } catch {
      toast.error('Something went wrong activating your plan.');
      setStep('payment');
    }
  };

  const handleSimFail = () => {
    toast.error('Payment was cancelled or failed. Please try again.');
    setStep('payment');
  };

  const handleClose = () => {
    setStep('plans');
    setSelectedPlan('');
    setOperator('');
    setPhone('');
    setSuccessData(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            {step === 'plans' && 'Upgrade Your Plan'}
            {step === 'payment' && `Pay for ${selectedPlanData?.name} Plan`}
            {step === 'ussd' && `${operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'} — Confirm Payment`}
            {step === 'processing' && 'Activating Subscription...'}
            {step === 'success' && 'Payment Successful!'}
          </DialogTitle>
          {reason && step === 'plans' && (
            <p className="text-sm text-muted-foreground mt-1">{reason}</p>
          )}

        </DialogHeader>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── PLANS ── */}
            {step === 'plans' && (
              <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map(plan => {
                  const Icon = plan.icon;
                  const isCurrent = plan.key === currentPlan;
                  return (
                    <motion.div key={plan.key} whileHover={!isCurrent ? { scale: 1.02 } : {}} className={cn('rounded-xl border-2 overflow-hidden flex flex-col transition-all', plan.color, isCurrent && 'opacity-60')}>
                      <div className={cn('px-4 py-3 flex items-center justify-between', plan.headerColor)}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn('w-5 h-5', plan.iconColor)} />
                          <span className="font-bold">{plan.name}</span>
                        </div>
                        {plan.badge && (
                          <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{plan.badge}</span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-4">
                        <div>
                          {plan.price === 0 ? (
                            <span className="text-2xl font-bold">Free</span>
                          ) : (
                            <span className="text-2xl font-bold">{plan.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">XAF/mo</span></span>
                          )}
                        </div>
                        <ul className="space-y-1.5 flex-1">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-1.5 text-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}
                            </li>
                          ))}
                          {plan.disabled.map(f => (
                            <li key={f} className="flex items-start gap-1.5 text-sm text-muted-foreground/60">
                              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{f}
                            </li>
                          ))}
                        </ul>
                        <Button size="sm" variant={plan.key === 'PRO' ? 'default' : 'outline'} className="w-full" disabled={isCurrent || plan.key === 'STARTER'} onClick={() => handleSelectPlan(plan.key)}>
                          {isCurrent ? 'Current Plan' : plan.key === 'STARTER' ? 'Free' : `Upgrade to ${plan.name}`}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ── PAYMENT ── */}
            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="max-w-sm mx-auto space-y-6">
                <div className="text-center p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">Amount to pay</p>
                  <p className="text-3xl font-bold mt-1">{selectedPlanData?.price.toLocaleString()} <span className="text-lg font-normal">XAF</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Valid for 30 days</p>
                </div>

                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['ORANGE', 'MTN'] as const).map(op => (
                      <button key={op} onClick={() => setOperator(op)} className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        operator === op
                          ? op === 'ORANGE' ? 'border-orange-400 bg-orange-50 dark:bg-orange-950' : 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950'
                          : 'border-border hover:border-muted-foreground'
                      )}>
                        <Smartphone className={cn('w-6 h-6', op === 'ORANGE' ? 'text-orange-500' : 'text-yellow-500')} />
                        <span className="text-sm font-semibold">{op === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="momo-phone">Mobile Money Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="momo-phone" placeholder="+237 655022702" className="pl-9" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground">You will receive a payment confirmation prompt on your phone.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('plans')}>Back</Button>
                  <Button className="flex-1" onClick={handlePay} disabled={!operator || !phone.trim()}>
                    Pay {selectedPlanData?.price.toLocaleString()} XAF
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── USSD PHONE SIMULATOR ── */}
            {step === 'ussd' && operator && (
              <motion.div key="ussd" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  A payment prompt has been sent to <strong>{phone}</strong>.<br/>
                  Interact with the screen below to confirm.
                </p>
                <PhoneSimulator
                  operator={operator}
                  phone={phone}
                  amount={selectedPlanData!.price}
                  plan={selectedPlanData!.name}
                  onSuccess={handleSimSuccess}
                  onFail={handleSimFail}
                />
                <div className="text-center">
                  <button onClick={() => setStep('payment')} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                    Cancel and go back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── PROCESSING ── */}
            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20" />
                  <Loader2 className="w-20 h-20 text-primary animate-spin absolute inset-0" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-lg">Activating your subscription...</p>
                  <p className="text-sm text-muted-foreground">Please wait. Do not close this window.</p>
                </div>
              </motion.div>
            )}

            {/* ── SUCCESS ── */}
            {step === 'success' && successData && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 gap-6 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Payment Confirmed!</h3>
                  <p className="text-muted-foreground">Your plan has been upgraded to <strong>{successData.plan}</strong>.</p>
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-lg inline-block">
                    Ref: {successData.transactionRef}
                  </p>
                </div>
                <Button onClick={handleClose} className="mt-2">
                  Done — Start Using {successData.plan}
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
