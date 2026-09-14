import React, { useState, useEffect } from 'react';
import { StudentProfile, RideRequest } from '../types';
import { RideService } from '../services/rideService';
import { LPU_LOCATIONS } from '../data/lpuData';
import { VertoPayWidget } from './VertoPayWidget';
import { Navigation, MapPin, Clock, CheckCircle2, XCircle, Phone, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface PassengerDashboardProps {
  currentUser: StudentProfile;
}

export const PassengerDashboard: React.FC<PassengerDashboardProps> = ({ currentUser }) => {
  const { balance, triggerNeonWarningToast } = useWallet();
  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
  const [pickupId, setPickupId] = useState<string>('loc-maingate');
  const [destinationId, setDestinationId] = useState<string>('loc-unimall');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = RideService.listenToPassengerRequest(currentUser.uid || currentUser.id, (req) => {
      setActiveRequest(req);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!activeRequest || activeRequest.status !== 'waiting') return;
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, activeRequest.expiresAt - now);
      setTimeLeft(remaining);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeRequest]);

  const handleRequestRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (balance < 10) {
      triggerNeonWarningToast("Insufficient VertoPay balance. Please recharge at least ₹10.");
      return;
    }
    
    setIsSubmitting(true);
    const pickupLoc = LPU_LOCATIONS.find(l => l.id === pickupId);
    const destLoc = LPU_LOCATIONS.find(l => l.id === destinationId);
    
    if (!pickupLoc || !destLoc) {
      setIsSubmitting(false);
      return;
    }

    const now = Date.now();
    const boardingOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newRequest: RideRequest = {
      id: `req_${now}_${currentUser.uid || currentUser.id}`,
      passengerId: currentUser.uid || currentUser.id,
      passengerName: currentUser.name,
      passengerAvatar: currentUser.avatar,
      pickupId: pickupLoc.id,
      destinationId: destLoc.id,
      pickupName: pickupLoc.name,
      destinationName: destLoc.name,
      status: 'waiting',
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000,
      rejectedBy: [],
      otp: boardingOtp,
      paymentStatus: 'pending_otp'
    };

    try {
      await RideService.createRideRequest(newRequest);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Passenger Dashboard</h1>
        <p className="text-slate-600">Welcome back, {currentUser.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {activeRequest && activeRequest.status === 'waiting' && timeLeft > 0 && (
            <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-md space-y-5">
              <div className="flex items-center gap-3 text-black">
                <div className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-black">Looking for Nearby Campus Driver...</h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    Time remaining: {formatTime(timeLeft)} • Auto-rickshaws near your hostel are notified
                  </p>
                </div>
              </div>

              {/* Instant 4-Digit OTP Display */}
              <div className="bg-black text-white p-5 rounded-2xl border border-neutral-800 space-y-3 text-center">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 block">
                  Your 4-Digit Boarding OTP
                </span>
                <div className="flex items-center justify-center gap-2">
                  {(activeRequest.otp || '4821').split('').map((digit, i) => (
                    <span 
                      key={i} 
                      className="w-11 h-13 bg-neutral-900 border border-neutral-600 rounded-xl flex items-center justify-center text-2xl font-mono font-black text-white"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-300">
                  Keep this OTP ready. When a driver accepts and arrives, share this code to board.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <p><strong>Pickup:</strong> {activeRequest.pickupName}</p>
                <p><strong>Destination:</strong> {activeRequest.destinationName}</p>
                <p><strong>Fare:</strong> ₹10 (deducted only after OTP verification)</p>
              </div>
            </div>
          )}

          {activeRequest && activeRequest.status === 'waiting' && timeLeft === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 text-red-700 mb-2">
                <XCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg">No ride available</h3>
              </div>
              <p className="text-red-600 text-sm">No driver accepted your request within 5 minutes. You were not charged.</p>
              <button 
                onClick={() => setActiveRequest(null)}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-bold transition-all"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeRequest && activeRequest.status === 'accepted' && (
            <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-black">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">🎉 Ride Confirmed by Driver!</h3>
                    <p className="text-xs text-neutral-500">Your campus driver is on the way to {activeRequest.pickupName}.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded-full">
                    Confirmed
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveRequest(null)}
                    aria-label="Close confirmed ride view"
                    className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Driver & Vehicle Details */}
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-black">{activeRequest.driverName || 'Gurpreet Singh'}</h4>
                  <p className="text-xs text-neutral-600">
                    {activeRequest.driverVehicle || 'Auto-Rickshaw'} • <strong className="text-black">{activeRequest.driverVehicleNumber || 'PB 08 BX 4192'}</strong>
                  </p>
                </div>
                <a
                  href={`tel:${activeRequest.driverPhone || '+910000000000'}`}
                  className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Driver</span>
                </a>
              </div>

              {/* 4-Digit OTP display */}
              <div className="bg-black text-white p-5 rounded-2xl border border-neutral-800 space-y-2 text-center">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 block">
                  Tell this 4-Digit OTP to Driver upon Boarding
                </span>
                <span className="text-4xl font-mono font-black tracking-widest text-white block">
                  {activeRequest.otp || '----'}
                </span>
                <p className="text-[11px] text-neutral-300">
                  {activeRequest.paymentStatus === 'paid'
                    ? 'OTP Verified! ₹10 has been transferred to your driver.'
                    : '₹10 will be deducted from your VertoPay wallet only when driver verifies this OTP.'}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-neutral-600 pt-2 border-t border-neutral-200">
                <span>Route: <strong>{activeRequest.pickupName} → {activeRequest.destinationName}</strong></span>
                <span className="font-bold text-black">Fare: ₹10</span>
              </div>

              {activeRequest.paymentStatus === 'paid' && (
                <button 
                  onClick={() => setActiveRequest(null)}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close & Dismiss
                </button>
              )}
            </div>
          )}

          {(!activeRequest || ['completed', 'cancelled', 'expired'].includes(activeRequest.status) || (activeRequest.status === 'waiting' && timeLeft === 0)) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Book a Ride</h2>
              <form onSubmit={handleRequestRide} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                    Pickup Location
                  </label>
                  <select
                    value={pickupId}
                    onChange={(e) => setPickupId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    {LPU_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Destination
                  </label>
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    {LPU_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-indigo-900">Fixed Campus Fare</p>
                    <p className="text-xs text-indigo-700">Deducted on driver acceptance</p>
                  </div>
                  <p className="text-lg font-black text-indigo-700">₹10</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || pickupId === destinationId}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {isSubmitting ? 'Requesting...' : 'Request Ride'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <VertoPayWidget />
        </div>
      </div>
    </div>
  );
};
