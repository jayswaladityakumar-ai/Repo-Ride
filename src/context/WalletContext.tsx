import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletTransaction } from '../types';
import { useAuth } from './AuthContext';
import { RideService } from '../services/rideService';

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  canAffordFare: (amount?: number) => boolean;
  deductFare: (amount?: number, description?: string) => { success: boolean; message: string; remainingBalance: number };
  rechargeWallet: (amount: number, method?: string) => Promise<{ success: boolean; message: string }>;
  withdrawEarnings: (amount: number, method?: string, payoutAccount?: string) => Promise<{ success: boolean; message: string }>;
  isRechargeModalOpen: boolean;
  openRechargeModal: (presetAmount?: number) => void;
  closeRechargeModal: () => void;
  isWithdrawModalOpen: boolean;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  rechargePresetAmount?: number;
  neonWarningToast: string | null;
  triggerNeonWarningToast: (msg: string) => void;
  clearNeonWarningToast: () => void;
  successPaymentToast: string | null;
  triggerSuccessPaymentToast: (msg: string) => void;
  clearSuccessPaymentToast: () => void;
  isDriver: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isDriver = user?.accountType === 'driver';
  
  const [balance, setBalance] = useState<number>(50);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [rechargePresetAmount, setRechargePresetAmount] = useState<number | undefined>(undefined);
  const [neonWarningToast, setNeonWarningToast] = useState<string | null>(null);
  const [successPaymentToast, setSuccessPaymentToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id && !user?.uid) {
      setBalance(isDriver ? 0 : 50);
      setTransactions([]);
      return;
    }

    const uid = user.uid || user.id;
    const unsubscribe = RideService.listenToWallet(uid, (data) => {
      setBalance(data.balance);
      setTransactions(data.transactions);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, user?.id, isDriver]);

  const openRechargeModal = (presetAmount?: number) => {
    if (isDriver) {
      triggerNeonWarningToast("Drivers cannot add funds. Drivers can only withdraw received earnings.");
      return;
    }
    if (presetAmount) setRechargePresetAmount(presetAmount);
    setIsRechargeModalOpen(true);
  };

  const closeRechargeModal = () => {
    setIsRechargeModalOpen(false);
    setRechargePresetAmount(undefined);
  };

  const openWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
  };

  const triggerNeonWarningToast = (msg: string) => {
    setNeonWarningToast(msg);
    setTimeout(() => {
      setNeonWarningToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const clearNeonWarningToast = () => setNeonWarningToast(null);

  const triggerSuccessPaymentToast = (msg: string) => {
    setSuccessPaymentToast(msg);
    setTimeout(() => {
      setSuccessPaymentToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const clearSuccessPaymentToast = () => setSuccessPaymentToast(null);

  const canAffordFare = (amount: number = 10): boolean => {
    return balance >= amount;
  };

  const rechargeWallet = async (amount: number, method: string = 'UPI'): Promise<{ success: boolean; message: string }> => {
    if (isDriver) {
      const msg = "Drivers are not allowed to add funds. You can only withdraw amounts received from rides.";
      triggerNeonWarningToast(msg);
      return { success: false, message: msg };
    }

    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid amount' };
    }

    const newBalance = balance + amount;
    const refId = `UPI-${Date.now().toString().slice(-6)}`;
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount,
      description: `Wallet Top-Up via ${method}`,
      timestamp: new Date().toISOString(),
      method,
      status: 'success',
      referenceId: refId
    };

    setBalance(newBalance);
    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    if (user?.uid || user?.id) {
      const uid = user.uid || user.id;
      RideService.recordTransaction(uid, newTx, newBalance);
    }

    triggerSuccessPaymentToast(`Payment Successful! ₹${amount} added to your VertoPay Wallet.`);

    return {
      success: true,
      message: `Successfully added ₹${amount} via ${method}`
    };
  };

  const withdrawEarnings = async (
    amount: number, 
    method: string = 'UPI Payout', 
    payoutAccount: string = 'Personal UPI'
  ): Promise<{ success: boolean; message: string }> => {
    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid withdrawal amount' };
    }

    if (amount > balance) {
      triggerNeonWarningToast(`Cannot withdraw ₹${amount}. Current available balance is ₹${balance}`);
      return { success: false, message: `Insufficient balance. Available: ₹${balance}` };
    }

    const uid = user?.uid || user?.id || 'driver';
    const res = await RideService.withdrawDriverEarnings(uid, amount, method, payoutAccount);
    
    if (res.success) {
      const updatedBalance = balance - amount;
      setBalance(updatedBalance);
      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}-wth`,
        type: 'debit',
        amount,
        description: `Driver Withdrawal to ${payoutAccount}`,
        timestamp: new Date().toISOString(),
        method,
        status: 'success',
        referenceId: `WTH-${Date.now().toString().slice(-6)}`
      };
      setTransactions([newTx, ...transactions]);
      triggerSuccessPaymentToast(`Withdrawal Successful! ₹${amount} transferred to ${payoutAccount}.`);
    } else {
      triggerNeonWarningToast(res.message);
    }

    return res;
  };

  const deductFare = (amount: number = 10, description: string = 'Campus Ride Seat Booking'): { success: boolean; message: string; remainingBalance: number } => {
    if (balance < amount || balance < 10) {
      triggerNeonWarningToast('Insufficient Balance in VertoPay! Please top up via UPI.');
      return {
        success: false,
        message: 'Insufficient Balance in VertoPay! Please top up via UPI.',
        remainingBalance: balance
      };
    }

    const updatedBalance = Math.max(0, balance - amount);
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'debit',
      amount,
      description,
      timestamp: new Date().toISOString(),
      method: 'VertoPay Instant Auto Pass',
      status: 'success',
      referenceId: `VP-${Date.now().toString().slice(-6)}`
    };

    setBalance(updatedBalance);
    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    if (user?.uid || user?.id) {
      const uid = user.uid || user.id;
      RideService.recordTransaction(uid, newTx, updatedBalance);
    }

    return {
      success: true,
      message: 'Fare deducted successfully via VertoPay.',
      remainingBalance: updatedBalance
    };
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        canAffordFare,
        deductFare,
        rechargeWallet,
        withdrawEarnings,
        isRechargeModalOpen,
        openRechargeModal,
        closeRechargeModal,
        isWithdrawModalOpen,
        openWithdrawModal,
        closeWithdrawModal,
        rechargePresetAmount,
        neonWarningToast,
        triggerNeonWarningToast,
        clearNeonWarningToast,
        successPaymentToast,
        triggerSuccessPaymentToast,
        clearSuccessPaymentToast,
        isDriver
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
