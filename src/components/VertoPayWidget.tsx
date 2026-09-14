import React from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Wallet, 
  PlusCircle, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface VertoPayWidgetProps {
  variant?: 'glassmorphic-card' | 'topbar-pill' | 'dashboard-banner' | 'compact';
  className?: string;
  onOpenRecharge?: () => void;
  onOpenWithdraw?: () => void;
}

export const VertoPayWidget: React.FC<VertoPayWidgetProps> = ({
  variant = 'glassmorphic-card',
  className = '',
  onOpenRecharge,
  onOpenWithdraw
}) => {
  const { balance, openRechargeModal, openWithdrawModal, isDriver } = useWallet();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDriver) {
      if (onOpenWithdraw) {
        onOpenWithdraw();
      } else {
        openWithdrawModal();
      }
    } else {
      if (onOpenRecharge) {
        onOpenRecharge();
      } else {
        openRechargeModal();
      }
    }
  };

  if (variant === 'topbar-pill') {
    return (
      <button
        type="button"
        id="vertopay-topbar-widget"
        onClick={handleClick}
        className={`relative flex items-center justify-center w-9 h-9 xl:w-10 xl:h-10 rounded-xl bg-black hover:bg-neutral-800 text-white border border-neutral-700 shadow-xs active:scale-95 transition-all cursor-pointer group shrink-0 ${className}`}
        title={isDriver ? `Driver Received Earnings: ₹${balance} • Click to Withdraw` : `Passenger Wallet: ₹${balance} • Click to Recharge`}
        aria-label={isDriver ? `Driver Earnings: ₹${balance}` : `VertoPay Balance: ₹${balance}`}
      >
        <Wallet className="w-4 h-4 xl:w-4.5 xl:h-4.5 text-white group-hover:scale-110 transition-transform" />
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-neutral-900 border border-neutral-500 text-white text-[9px] font-black font-mono rounded-full leading-none shadow-xs">
          ₹{balance}
        </span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        id="vertopay-compact-widget"
        className={`flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
              {isDriver ? 'Received Earnings' : 'VertoPay Balance'}
            </span>
            <span className="text-base font-black text-black font-mono">
              ₹{balance}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {isDriver ? (
            <>
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Recharge</span>
            </>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'dashboard-banner') {
    return (
      <div 
        id="vertopay-dashboard-banner"
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-black text-white border border-neutral-800 shadow-xl ${className}`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-white" />
                {isDriver ? 'Driver Received Earnings' : 'VertoPay Campus Wallet'}
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">REPORIDE Secure Payments</span>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-sm text-neutral-400 font-semibold">
                {isDriver ? 'Total Received Balance:' : 'Available Balance:'}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                ₹{balance}
              </span>
            </div>
            
            <p className="text-xs text-neutral-400 max-w-md">
              {isDriver 
                ? 'Earnings from completed rides are automatically credited to your driver wallet upon passenger OTP verification. Withdraw directly to your bank account or UPI.'
                : 'Safe cashless campus rides. When you board, share your 4-digit OTP with the driver to verify and deduct your fare.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:self-center shrink-0">
            <button
              type="button"
              id="vertopay-banner-action-btn"
              onClick={handleClick}
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-black text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isDriver ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-black" />
                  <span>Withdraw Earnings</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>Recharge Wallet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="vertopay-wallet-widget"
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white border border-neutral-200 shadow-md ${className}`}
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
            <Wallet className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-black bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-300">
                {isDriver ? 'Driver Earnings' : 'VertoPay Wallet'}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">Instant Pass</span>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs text-neutral-600 font-semibold">
                {isDriver ? 'Received Balance:' : 'Current Balance:'}
              </span>
              <span className="text-2xl font-black text-black tracking-tight font-mono">
                ₹{balance}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="vertopay-action-wallet-btn"
            onClick={handleClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 active:scale-98 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {isDriver ? (
              <>
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw to Bank/UPI</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Recharge Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
