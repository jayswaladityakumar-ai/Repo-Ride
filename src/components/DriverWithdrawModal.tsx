import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  X, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  Building2,
  Smartphone,
  AlertCircle
} from 'lucide-react';

interface DriverWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverWithdrawModal: React.FC<DriverWithdrawModalProps> = ({
  isOpen,
  onClose
}) => {
  const { balance, withdrawEarnings } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [payoutType, setPayoutType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ amount: number; reference: string; target: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessData(null);
      setAmount(balance > 0 ? Math.min(balance, 100).toString() : '0');
    }
  }, [isOpen, balance]);

  if (!isOpen) return null;

  const numAmount = parseInt(amount, 10) || 0;

  const handleQuickAmount = (val: number) => {
    setErrorMsg(null);
    setAmount(Math.min(balance, val).toString());
  };

  const handleWithdrawAll = () => {
    setErrorMsg(null);
    setAmount(balance.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount > balance) {
      setErrorMsg(`Cannot withdraw more than your current received earnings of ₹${balance}.`);
      return;
    }

    if (payoutType === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm).');
        return;
      }
    } else {
      if (!bankAccount || bankAccount.length < 8) {
        setErrorMsg('Please enter a valid bank account number.');
        return;
      }
      if (!ifsc || ifsc.length < 5) {
        setErrorMsg('Please enter a valid IFSC code (e.g. HDFC0001234).');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const payoutAccount = payoutType === 'upi' ? upiId.trim() : `${accountHolder || 'Driver'} (A/C ...${bankAccount.slice(-4)})`;
      const payoutMethod = payoutType === 'upi' ? 'UPI Instant Payout' : 'IMPS Bank Transfer';

      const res = await withdrawEarnings(numAmount, payoutMethod, payoutAccount);
      if (res.success) {
        setSuccessData({
          amount: numAmount,
          reference: `WTH-${Date.now().toString().slice(-6)}`,
          target: payoutAccount
        });
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white text-black rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-widest text-neutral-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Driver Payout Portal</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">Withdraw Earnings</h3>
          <p className="text-neutral-400 text-xs mt-1">
            Drivers can only withdraw amounts received from passenger rides. Adding money is disabled.
          </p>

          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-baseline justify-between">
            <span className="text-xs text-neutral-400">Available to Withdraw:</span>
            <span className="text-2xl font-mono font-black text-white">₹{balance}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {successData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-black text-black">Payout Processed!</h4>
                <p className="text-xs text-neutral-600 mt-1">
                  ₹{successData.amount} has been successfully sent to <strong className="text-black">{successData.target}</strong>
                </p>
                <div className="mt-3 inline-block bg-neutral-100 border border-neutral-300 px-3 py-1 rounded-full text-xs font-mono font-bold text-neutral-800">
                  Ref: {successData.reference}
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-center gap-2 text-xs text-black font-semibold">
                  <AlertCircle className="w-4 h-4 text-black shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Amount Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Withdrawal Amount (₹)
                  </label>
                  {balance > 0 && (
                    <button
                      type="button"
                      onClick={handleWithdrawAll}
                      className="text-xs font-bold text-black hover:underline cursor-pointer"
                    >
                      Withdraw All (₹{balance})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-neutral-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={balance}
                    value={amount}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setAmount(e.target.value);
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-9 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-lg font-mono font-bold text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-2 mt-2">
                  {[20, 50, 100, 200].map((val) => (
                    <button
                      key={val}
                      type="button"
                      disabled={balance < val}
                      onClick={() => handleQuickAmount(val)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        numAmount === val
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Channel Tabs */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-2">
                  Select Payout Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setPayoutType('upi');
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      payoutType === 'upi'
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI ID / VPA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setPayoutType('bank');
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      payoutType === 'bank'
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Destination inputs */}
              {payoutType === 'upi' ? (
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Enter UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. student@okhdfcbank or 9876543210@paytm"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Instant payout supported: Google Pay, PhonePe, Paytm, BHIM UPI
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Beneficiary Account Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Account holder's full name"
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="e.g. 123456789012"
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-medium text-black focus:outline-none focus:border-black uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || balance <= 0 || numAmount <= 0}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{isProcessing ? 'Processing Payout...' : `Confirm & Withdraw ₹${numAmount}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
