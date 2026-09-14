import React, { useState, useEffect } from 'react';
import { StudentProfile, RideRequest, MyBooking } from '../types';
import { RideService } from '../services/rideService';
import { VertoPayWidget } from './VertoPayWidget';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  User, 
  KeyRound, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  Car,
  PlusCircle,
  Zap
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface DriverDashboardProps {
  currentUser: StudentProfile;
  onOpenCreateRide?: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ currentUser, onOpenCreateRide }) => {
  const { 
    balance, 
    openWithdrawModal, 
    triggerNeonWarningToast, 
    triggerSuccessPaymentToast 
  } = useWallet();

  const driverId = currentUser.uid || currentUser.id;

  const [availableRequests, setAvailableRequests] = useState<RideRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<RideRequest[]>([]);
  const [driverBookings, setDriverBookings] = useState<MyBooking[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // OTP Verification state for inline cards
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Global direct OTP box
  const [directOtp, setDirectOtp] = useState<string>('');
  const [isDirectVerifying, setIsDirectVerifying] = useState<boolean>(false);

  useEffect(() => {
    // 1. Listen to available on-demand requests
    const unsubAvailable = RideService.listenToAvailableRequests(driverId, (reqs) => {
      setAvailableRequests(reqs);
    });

    // 2. Listen to driver's accepted requests pending OTP
    const unsubAccepted = RideService.listenToDriverAcceptedRequests(driverId, (reqs) => {
      setAcceptedRequests(reqs);
    });

    // 3. Listen to campus pool bookings for this driver
    const unsubBookings = RideService.listenToDriverBookings(driverId, (bookings) => {
      setDriverBookings(bookings);
    });

    return () => {
      unsubAvailable();
      unsubAccepted();
      unsubBookings();
    };
  }, [driverId]);

  const handleAccept = async (request: RideRequest) => {
    setAcceptingId(request.id);
    try {
      const activeDriver = currentUser.name === 'Aarav Sharma' || currentUser.accountType !== 'driver'
        ? { ...currentUser, accountType: 'driver' as const, name: 'Gurpreet Singh', vehicleType: 'Auto-Rickshaw', vehicleNumber: 'PB 08 BX 4192', phone: '+91 98765-11223' }
        : currentUser;
      await RideService.acceptRideRequest(request.id, activeDriver);
      triggerSuccessPaymentToast(`Ride accepted from ${request.passengerName}! Ask for their 4-digit OTP to collect ₹10 upon boarding.`);
    } catch (err: any) {
      if (err.message?.includes('insufficient funds')) {
        triggerNeonWarningToast("The passenger does not have enough balance to pay for this ride.");
      } else if (err.message?.includes('no longer available')) {
        triggerNeonWarningToast("Sorry, this ride has already been accepted or expired.");
      } else {
        triggerNeonWarningToast("Failed to accept ride.");
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await RideService.rejectRideRequest(requestId, driverId);
    } catch (err) {
      console.error(err);
    }
  };

  // Verify OTP for an on-demand ride request
  const handleVerifyRequestOtp = async (request: RideRequest) => {
    const enteredOtp = (otpInputs[request.id] || '').trim();
    if (enteredOtp.length !== 4) {
      triggerNeonWarningToast("Please enter the passenger's 4-digit OTP.");
      return;
    }

    setVerifyingId(request.id);
    try {
      const res = await RideService.verifyRequestOtpAndPay(request.id, enteredOtp, currentUser);
      if (res.success) {
        triggerSuccessPaymentToast(res.message);
        setOtpInputs((prev) => {
          const updated = { ...prev };
          delete updated[request.id];
          return updated;
        });
      } else {
        triggerNeonWarningToast(res.message);
      }
    } catch (err: any) {
      triggerNeonWarningToast(err?.message || "Failed to verify OTP.");
    } finally {
      setVerifyingId(null);
    }
  };

  // Verify OTP for a scheduled pool booking
  const handleVerifyBookingOtp = async (booking: MyBooking) => {
    const enteredOtp = (otpInputs[booking.id] || '').trim();
    if (enteredOtp.length !== 4) {
      triggerNeonWarningToast("Please enter the passenger's 4-digit OTP.");
      return;
    }

    setVerifyingId(booking.id);
    try {
      const res = await RideService.verifyBookingOtpAndPay(booking.id, enteredOtp, currentUser);
      if (res.success) {
        triggerSuccessPaymentToast(res.message);
        setOtpInputs((prev) => {
          const updated = { ...prev };
          delete updated[booking.id];
          return updated;
        });
      } else {
        triggerNeonWarningToast(res.message);
      }
    } catch (err: any) {
      triggerNeonWarningToast(err?.message || "Failed to verify OTP.");
    } finally {
      setVerifyingId(null);
    }
  };

  // Direct OTP verification (matches any pending request or booking)
  const handleDirectOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = directOtp.trim();
    if (clean.length !== 4) {
      triggerNeonWarningToast("Please enter the 4-digit OTP provided by the passenger.");
      return;
    }

    setIsDirectVerifying(true);
    try {
      const res = await RideService.verifyAnyOtpAndPay(clean, currentUser);
      if (res.success) {
        triggerSuccessPaymentToast(res.message);
        setDirectOtp('');
      } else {
        triggerNeonWarningToast(res.message);
      }
    } catch (err: any) {
      triggerNeonWarningToast(err?.message || "Verification failed");
    } finally {
      setIsDirectVerifying(false);
    }
  };

  // Demo helper to simulate an incoming student ride request
  const handleCreateSampleRequest = async () => {
    const now = Date.now();
    const demoReq: RideRequest = {
      id: `req-sample-${now}`,
      passengerId: 'demo-student-aarav',
      passengerName: 'Aarav Sharma (BH-3)',
      pickupId: 'loc-bh',
      destinationId: 'loc-unimall',
      pickupName: 'Boys Hostel 3 (BH-3)',
      destinationName: 'UniMall Campus Center',
      status: 'waiting',
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000,
      rejectedBy: [],
      otp: '4821',
      paymentStatus: 'pending_otp'
    };
    await RideService.createRideRequest(demoReq);
    triggerSuccessPaymentToast("Demo student ride request created! Click 'Accept' to start trip.");
  };

  const formatTimeLeft = (expiresAt: number) => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pendingBookingsToVerify = driverBookings.filter(
    (b) => b.status === 'active' && b.paymentStatus !== 'paid'
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 text-black">
      {/* Driver Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            <Car className="w-3.5 h-3.5 text-black" />
            <span>Driver Portal • REPORIDE</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-black">Driver Dashboard</h1>
          <p className="text-neutral-600 text-sm mt-1">
            When a passenger boards, enter their 4-digit OTP to deduct their fare and credit it directly to your wallet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenCreateRide && (
            <button
              onClick={onOpenCreateRide}
              className="px-4 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Create & Offer Ride</span>
            </button>
          )}

          {/* Quick Driver Payout Card */}
          <div className="bg-black text-white p-4 rounded-2xl border border-neutral-800 shadow-md flex items-center gap-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block">
                Received Earnings
              </span>
              <span className="text-2xl font-mono font-black text-white">₹{balance}</span>
            </div>
            <button
              onClick={openWithdrawModal}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-priority Incoming Initialized Ride Alert */}
      {availableRequests.length > 0 && (
        <div className="bg-amber-50 border-2 border-black rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-black flex items-center gap-2">
                  <span>Someone has initialized a ride!</span>
                  <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                    {availableRequests.length} Waiting
                  </span>
                </h2>
                <p className="text-xs text-neutral-600">
                  Accept now to confirm the ride for the passenger and receive their ₹10 boarding OTP.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black bg-black text-white px-3 py-1 rounded-full">
              ₹10 Fixed Fare
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-4 border-2 border-neutral-900 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {req.passengerAvatar ? (
                        <img src={req.passengerAvatar} alt="Passenger" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        req.passengerName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-black">{req.passengerName}</h3>
                      <p className="text-[11px] text-neutral-500">LPU Student • Waiting for Driver</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                    {formatTimeLeft(req.expiresAt)} left
                  </span>
                </div>

                <div className="space-y-1 text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-black shrink-0" />
                    <span className="text-neutral-500">Pickup:</span>
                    <span className="font-bold text-black truncate">{req.pickupName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                    <span className="text-neutral-500">Destination:</span>
                    <span className="font-bold text-black truncate">{req.destinationName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAccept(req)}
                    disabled={acceptingId === req.id}
                    className="flex-1 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{acceptingId === req.id ? 'Accepting...' : 'Accept Ride (₹10)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl border border-neutral-300 transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver Wallet Constraint Notice */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-2xl p-4 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-black">Driver Wallet Rule:</p>
          <p className="text-neutral-600">
            Drivers cannot add money to this account. You only receive amounts when passengers provide their 4-digit OTP upon boarding. You can withdraw your total received earnings at any time to your UPI or bank account.
          </p>
        </div>
      </div>

      {/* Direct OTP Verifier Box */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black">
              <KeyRound className="w-4 h-4" />
              <span>Instant Passenger OTP Verification</span>
            </div>
            <h2 className="text-xl font-black text-black">Enter Passenger's 4-Digit OTP</h2>
            <p className="text-xs text-neutral-600">
              Ask your passenger for the 4-digit OTP on their screen. Verifying will immediately deduct ₹10 from their wallet and credit it to your account.
            </p>

            {/* Quick helper if any OTP is awaiting verification */}
            {acceptedRequests.length > 0 && (
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-neutral-500 font-semibold">Accepted Passengers:</span>
                {acceptedRequests.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setDirectOtp(r.otp || '4821')}
                    className="text-[11px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md font-mono font-bold text-black cursor-pointer flex items-center gap-1"
                    title="Click to autofill this OTP"
                  >
                    <span>{r.passengerName.split(' ')[0]}:</span>
                    <span className="underline">{r.otp || '4821'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleDirectOtpVerify} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              maxLength={4}
              value={directOtp}
              onChange={(e) => setDirectOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="4-digit OTP"
              className="w-36 px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-center font-mono font-black text-xl tracking-widest text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
            <button
              type="submit"
              disabled={isDirectVerifying || directOtp.length !== 4}
              className="px-6 py-3.5 bg-black hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isDirectVerifying ? 'Verifying...' : 'Verify & Collect ₹10'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Accepted Rides Awaiting Passenger OTP */}
      {(acceptedRequests.length > 0 || pendingBookingsToVerify.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-black" />
              <span>Boarding Passengers (Awaiting OTP Verification)</span>
              <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-bold">
                {acceptedRequests.length + pendingBookingsToVerify.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Accepted on-demand requests */}
            {acceptedRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-5 border-2 border-neutral-900 shadow-md space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center font-bold text-black">
                      {req.passengerAvatar ? (
                        <img src={req.passengerAvatar} alt="Passenger" className="w-full h-full object-cover rounded-full" />
                      ) : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-black">{req.passengerName}</h4>
                      <p className="text-[11px] text-neutral-500">Awaiting Passenger OTP Verification</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-neutral-100 text-black border border-neutral-300 font-mono font-bold text-xs rounded-full">
                    Fare: ₹10
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-black shrink-0" />
                    <span className="font-medium truncate">{req.pickupName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                    <span className="font-medium truncate">{req.destinationName}</span>
                  </div>
                </div>

                {/* Inline OTP input */}
                <div className="pt-2 border-t border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInputs[req.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtpInputs((prev) => ({ ...prev, [req.id]: val }));
                    }}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-center font-mono font-bold text-sm text-black focus:outline-none focus:border-black"
                  />
                  <button
                    onClick={() => handleVerifyRequestOtp(req)}
                    disabled={verifyingId === req.id || (otpInputs[req.id] || '').length !== 4}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    {verifyingId === req.id ? '...' : 'Verify & Collect ₹10'}
                  </button>
                </div>
              </div>
            ))}

            {/* Scheduled pool bookings */}
            {pendingBookingsToVerify.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl p-5 border-2 border-neutral-900 shadow-md space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center font-bold text-black">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-black">
                        {booking.passengerName || 'Campus Passenger'}
                      </h4>
                      <p className="text-[11px] text-neutral-500">Campus Auto Pool Passenger</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-neutral-100 text-black border border-neutral-300 font-mono font-bold text-xs rounded-full">
                    Fare: ₹{booking.totalPrice || 10}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-black shrink-0" />
                    <span className="font-medium truncate">{booking.ride.pickup.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                    <span className="font-medium truncate">{booking.ride.destination.name}</span>
                  </div>
                </div>

                {/* Inline OTP input */}
                <div className="pt-2 border-t border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInputs[booking.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtpInputs((prev) => ({ ...prev, [booking.id]: val }));
                    }}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-center font-mono font-bold text-sm text-black focus:outline-none focus:border-black"
                  />
                  <button
                    onClick={() => handleVerifyBookingOtp(booking)}
                    disabled={verifyingId === booking.id || (otpInputs[booking.id] || '').length !== 4}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    {verifyingId === booking.id ? '...' : `Verify & Collect ₹${booking.totalPrice || 10}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Ride Requests & Wallet Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <span>Available Student Requests</span>
              <span className="bg-neutral-100 text-black border border-neutral-300 px-2 py-0.5 rounded-full text-xs font-extrabold">
                {availableRequests.length}
              </span>
            </h2>
            <button
              type="button"
              onClick={handleCreateSampleRequest}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-black rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Simulate Student Pickup</span>
            </button>
          </div>

          {availableRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 shadow-xs space-y-3">
              <Clock className="w-12 h-12 text-neutral-300 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-black mb-1">No pending requests right now</h3>
                <p className="text-neutral-500 text-xs max-w-sm mx-auto">
                  Stay tuned. When campus passengers book a ride, requests will appear here immediately.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleCreateSampleRequest}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Create Demo Student Request (₹10 Fare)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {availableRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs hover:border-black transition-all flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-black font-bold overflow-hidden shrink-0 border border-neutral-200">
                        {req.passengerAvatar ? (
                          <img src={req.passengerAvatar} alt="Passenger" className="w-full h-full object-cover" />
                        ) : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-black">{req.passengerName}</p>
                        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-black" />
                          Expires in {formatTimeLeft(req.expiresAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <Navigation className="w-3.5 h-3.5 text-black shrink-0" />
                        <span className="font-medium">{req.pickupName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                        <span className="font-medium">{req.destinationName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between sm:w-36 shrink-0">
                    <div className="text-right mb-4 sm:mb-0">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">Ride Fare</p>
                      <p className="text-xl font-mono font-black text-black">₹10</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAccept(req)}
                        disabled={acceptingId === req.id}
                        className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {acceptingId === req.id ? 'Accepting...' : 'Accept Ride'}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={acceptingId === req.id}
                        className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <VertoPayWidget variant="compact" />

          {/* Driver Payout Card */}
          <div className="bg-neutral-900 text-white p-5 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Payout Ready
              </span>
              <span className="text-xs font-bold text-neutral-300">0% Commission</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-neutral-400">Withdrawable:</span>
              <span className="text-2xl font-mono font-black text-white">₹{balance}</span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Earnings accumulate here instantly after you verify each passenger's 4-digit OTP. 
            </p>

            <button
              onClick={openWithdrawModal}
              disabled={balance <= 0}
              className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw to Bank / UPI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
