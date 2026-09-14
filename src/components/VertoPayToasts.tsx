import React from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  X, 
  ArrowRight 
} from 'lucide-react';

export const VertoPayToasts: React.FC = () => {
  const { 
    neonWarningToast, 
    clearNeonWarningToast, 
    successPaymentToast, 
    clearSuccessPaymentToast,
    openRechargeModal,
    balance
  } = useWallet();

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {neonWarningToast && (
        <div 
          id="vertopay-neon-red-warning-toast"
          className="pointer-events-auto p-4 rounded-2xl bg-slate-950 text-white border-2 border-rose-500/90 shadow-[0_0_25px_rgba(244,63,94,0.6)] backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-300 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/30 rounded-full blur-2xl animate-pulse" />
          
          <div className="relative z-10 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500 text-rose-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-bounce">
              <AlertTriangle className="w-5 h-5 text-rose-300" />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800">
                  Payment Blocked
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  Balance: ₹{balance}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-white leading-tight">
                {neonWarningToast}
              </h4>
              
              <p className="text-[11px] text-slate-300">
                Minimum ₹10 is required in your VertoPay wallet for automatic campus pass deduction.
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  id="toast-quick-recharge-btn"
                  onClick={() => {
                    clearNeonWarningToast();
                    openRechargeModal(50);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/40 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Recharge via UPI Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                
                <button
                  type="button"
                  onClick={clearNeonWarningToast}
                  className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={clearNeonWarningToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {successPaymentToast && (
        <div 
          id="vertopay-success-payment-toast"
          className="pointer-events-auto p-4 rounded-2xl bg-slate-950 text-white border border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.4)] backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-300 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                VertoPay Verified
              </span>
              <span className="text-[11px] font-mono text-emerald-300 font-bold">
                Balance: ₹{balance}
              </span>
            </div>
            <p className="text-xs font-bold text-white">
              {successPaymentToast}
            </p>
          </div>

          <button
            type="button"
            onClick={clearSuccessPaymentToast}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
