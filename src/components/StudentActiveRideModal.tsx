import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Navigation, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { RideRequest } from '../types';
import { RideService } from '../services/rideService';

interface StudentActiveRideModalProps {
  request: RideRequest | null;
  onClose?: () => void;
  onCancelRequest?: (requestId: string) => void;
}

export const StudentActiveRideModal: React.FC<StudentActiveRideModalProps> = ({
  request,
  onClose,
  onCancelRequest
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  useEffect(() => {
    if (!request) return;

    const calcTime = () => {
      const now = Date.now();
      const expires = request.expiresAt || (request.createdAt + 5 * 60 * 1000);
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(remaining);
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [request?.expiresAt, request?.createdAt]);

  if (!request) return null;

  const isWaiting = request.status === 'waiting';
  const isAccepted = request.status === 'accepted';
  const isCompleted = request.status === 'completed';
  const isCancelled = request.status === 'cancelled';
  const isExpired = request.status === 'expired' || (isWaiting && timeLeft === 0);

  const otp = request.otp || '4821';
  const otpDigits = otp.split('');

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    if (!request) return;
    setIsCancelling(true);
    try {
      if (onCancelRequest) {
        onCancelRequest(request.id);
      } else {
        await RideService.rejectRideRequest(request.id, 'passenger_cancel');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in cursor-pointer"
      id="student-active-ride-modal"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-black overflow-hidden my-6 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - changes based on state */}
        <div className={`p-5 text-white flex items-center justify-between transition-colors ${
          isAccepted 
            ? 'bg-neutral-900 border-b border-neutral-800' 
            : isWaiting 
            ? 'bg-black border-b border-neutral-800' 
            : 'bg-neutral-800'
        }`}>
          <div className="flex items-center gap-3">
            {isWaiting && (
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </div>
            )}
            {isAccepted && (
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isWaiting && 'Ride Initialized • Looking for Driver'}
                {isAccepted && '🎉 Ride Confirmed by Driver!'}
                {isCompleted && 'Trip Completed & Verified'}
                {isExpired && 'No Driver Accepted in Time'}
              </h2>
              <p className="text-[11px] text-neutral-400 font-medium">
                {isWaiting && `Waiting for campus driver to accept (${formatCountdown(timeLeft)} left)`}
                {isAccepted && 'Driver is en route to your pickup location'}
                {isCompleted && '₹10 campus fare has been processed'}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              id="student-ride-modal-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* 1. STATE: WAITING FOR DRIVER */}
          {isWaiting && !isExpired && (
            <div className="space-y-5">
              {/* Radar pulse announcement */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm text-black">Searching Campus Drivers...</h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  Your ride request is live! All campus auto-rickshaws and vans near your hostel have been notified.
                </p>
              </div>

              {/* Prominent 4-Digit OTP Box */}
              <div className="bg-black text-white rounded-2xl p-5 border-2 border-neutral-800 space-y-3 shadow-lg text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Your 4-Digit Boarding OTP</span>
                </div>

                <div className="flex items-center justify-center gap-2.5 py-1">
                  {otpDigits.map((digit, i) => (
                    <div 
                      key={i}
                      className="w-12 h-14 bg-neutral-900 border-2 border-white rounded-xl flex items-center justify-center text-3xl font-mono font-black text-white shadow-inner"
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed max-w-xs mx-auto">
                  Tell this code to the driver upon boarding. Driver enters this OTP to verify and start the ride.
                </p>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied OTP' : 'Copy OTP'}</span>
                  </button>
                </div>
              </div>

              {/* Route Summary */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-neutral-500 font-bold uppercase tracking-wider text-[10px] pb-1 border-b border-neutral-200">
                  <span>Trip Details</span>
                  <span className="text-black font-black text-xs">Fixed ₹10 Campus Fare</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-black shrink-0" />
                  <span className="text-neutral-600">Pickup:</span>
                  <span className="font-bold text-black">{request.pickupName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-black shrink-0" />
                  <span className="text-neutral-600">Destination:</span>
                  <span className="font-bold text-black">{request.destinationName}</span>
                </div>
              </div>

              {/* Cancel Request Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="w-full py-2.5 text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer border border-neutral-300"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Ride Request'}
                </button>
              </div>
            </div>
          )}

          {/* 2. STATE: DRIVER ACCEPTED & CONFIRMED! */}
          {isAccepted && (
            <div className="space-y-5 animate-in slide-in-from-bottom-2">
              {/* Confirmed Banner */}
              <div className="bg-neutral-100 border border-neutral-300 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-black">Campus Driver On The Way</h3>
                  <p className="text-xs text-neutral-600">
                    Your ride is confirmed! Head to your pickup point at {request.pickupName}.
                  </p>
                </div>
              </div>

              {/* Driver & Vehicle Information Card */}
              <div className="bg-white rounded-2xl p-5 border-2 border-black shadow-md space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg border border-neutral-700">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-black">
                        {request.driverName || 'Gurpreet Singh'}
                      </h4>
                      <p className="text-xs text-neutral-600 font-medium">
                        {request.driverVehicle || 'Auto-Rickshaw'} • <strong className="text-black">{request.driverVehicleNumber || 'PB 08 BX 4192'}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Confirmed
                  </span>
                </div>

                {/* Call Driver Button */}
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={`tel:${request.driverPhone || '+910000000000'}`}
                    className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver ({request.driverPhone || '+91 98765-11223'})</span>
                  </a>
                </div>
              </div>

              {/* 4-Digit OTP Display for Driver Verification */}
              <div className="bg-black text-white rounded-2xl p-5 border-2 border-neutral-800 text-center space-y-3 shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Give This OTP to Driver Upon Boarding</span>
                </div>

                <div className="flex items-center justify-center gap-2.5 py-1">
                  {otpDigits.map((digit, i) => (
                    <div 
                      key={i}
                      className="w-12 h-14 bg-neutral-900 border-2 border-white rounded-xl flex items-center justify-center text-3xl font-mono font-black text-white shadow-inner"
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-neutral-300 max-w-xs mx-auto">
                  ₹10 campus fare will be deducted from your VertoPay wallet once driver {request.driverName?.split(' ')[0] || 'Gurpreet'} enters this code into the console.
                </p>
              </div>

              {/* Route Info */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500 font-bold uppercase text-[10px]">
                  <span>Route</span>
                  <span className="text-black">Fare: ₹10</span>
                </div>
                <div className="font-bold text-black flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{request.pickupName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{request.destinationName}</span>
                </div>
              </div>

              {/* Close / Minimize Action */}
              {onClose && (
                <div className="pt-1 text-center space-y-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl border border-neutral-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Close Window (Keep Ride Active)</span>
                  </button>
                  <p className="text-[11px] text-neutral-400">
                    You can reopen this details card anytime from the floating bar at the bottom of the screen.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. STATE: COMPLETED */}
          {isCompleted && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-black">Trip Completed & Verified!</h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Driver {request.driverName} verified your 4-digit OTP. ₹10 has been transferred from your VertoPay wallet.
              </p>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          )}

          {/* 4. STATE: EXPIRED */}
          {isExpired && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-neutral-100 border border-neutral-300 rounded-full flex items-center justify-center mx-auto text-black">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-black">No Campus Driver Accepted</h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Drivers were occupied or out of range. Your wallet was NOT charged. You can initialize a new ride or browse scheduled pool rides.
              </p>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
