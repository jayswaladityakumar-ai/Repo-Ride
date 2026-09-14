import React, { useState } from 'react';
import { Ride, MyBooking, StudentProfile } from '../types';
import { useWallet } from '../context/WalletContext';
import { 
  X, 
  Car, 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  PlusCircle,
  AlertTriangle,
  Ticket,
  ShieldCheck
} from 'lucide-react';

interface JoinRideModalProps {
  ride: Ride | null;
  currentUser: StudentProfile;
  onClose: () => void;
  onConfirmBooking: (booking: MyBooking) => void;
}

export const JoinRideModal: React.FC<JoinRideModalProps> = ({
  ride,
  currentUser,
  onClose,
  onConfirmBooking
}) => {
  if (!ride) return null;

  const { balance, deductFare, openRechargeModal, triggerNeonWarningToast } = useWallet();
  const [seatsToBook, setSeatsToBook] = useState<number>(1);
  const [pickupNote, setPickupNote] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const fareToDeduct = 10;
  const boardingOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (balance < fareToDeduct) {
      triggerNeonWarningToast(`Insufficient Balance in VertoPay! You need at least ₹${fareToDeduct}. Please recharge.`);
      return;
    }

    // Do not deduct yet! Payment is deducted only when passenger tells OTP to driver
    const newBooking: MyBooking = {
      id: `booking-${Date.now()}`,
      rideId: ride.id,
      ride: {
        ...ride,
        occupiedSeats: ride.occupiedSeats + seatsToBook,
        availableSeats: Math.max(0, ride.availableSeats - seatsToBook)
      },
      seatsBooked: seatsToBook,
      totalPrice: fareToDeduct,
      bookedAt: 'Just now',
      status: 'active',
      boardingOtp: boardingOtp,
      pickupNote: pickupNote || 'Waiting at pickup point',
      passengerId: currentUser.uid || currentUser.id,
      passengerName: currentUser.name,
      passengerPhone: currentUser.phone,
      driverId: ride.driver.uid || ride.driver.id,
      paymentStatus: 'pending_otp',
      coPassengers: [
        { name: `${ride.driver.name} (Driver)`, course: ride.driver.course, phone: ride.driver.phone },
        { name: `${currentUser.name} (You)`, course: currentUser.course, phone: currentUser.phone }
      ]
    };

    setIsSuccess(true);

    setTimeout(() => {
      onConfirmBooking(newBooking);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 relative border border-neutral-200 text-black">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-4 text-center space-y-5 animate-in fade-in">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-black bg-neutral-100 px-3 py-1 rounded-full border border-neutral-300">
                4-Digit Boarding OTP Generated
              </span>
              <h3 className="text-2xl font-black text-black pt-1">
                Seat Booked!
              </h3>
              <p className="text-xs text-neutral-600">
                Tell your 4-digit OTP to the driver upon boarding. ₹10 will be deducted only upon driver verification.
              </p>
            </div>

            <div className="bg-black text-white p-5 rounded-2xl border border-neutral-800 shadow-xl text-left space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-white" />
                  <span className="text-xs font-black tracking-wide text-white uppercase">REPORIDE Boarding Pass</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-800 text-white border border-neutral-700">
                  Pending OTP Verification (₹10)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">Driver</span>
                  <span className="font-bold text-white text-sm">{ride.driver.name}</span>
                  <span className="text-[11px] text-neutral-300 block">{ride.vehicleType}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">Your Boarding OTP</span>
                  <span className="text-3xl font-black font-mono text-white tracking-widest">
                    {boardingOtp}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-300">
                <span className="truncate max-w-[200px]">{ride.pickup.name} → {ride.destination.name}</span>
                <span className="font-semibold text-white">Departure: {ride.departureTime}</span>
              </div>
            </div>

            <div className="text-xs text-neutral-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Safe OTP escrow transfer • Money stays in wallet until verified</span>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-600 mb-1">
                <Car className="w-3.5 h-3.5" />
                <span>Confirm Ride Booking</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Join {ride.driver.name}'s Ride
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {ride.vehicleType} • {ride.distanceFromUserKm} km away from your location
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/80 border border-indigo-200 text-indigo-700 flex items-center justify-center text-base shrink-0">
                  {ride.vehicleType === 'E-Rickshaw' ? '🛺' : (ride.vehicleType === 'Auto-Rickshaw' ? '🚕' : '🚗')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{ride.driver.name}</h4>
                  <p className="text-[11px] text-slate-500">{ride.driver.course}</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs font-extrabold text-indigo-600">★ {ride.driver.rating}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-slate-500">From:</span>
                  <span className="font-bold text-slate-800 truncate">{ride.pickup.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="text-slate-500">To:</span>
                  <span className="font-bold text-slate-800 truncate">{ride.destination.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Departure: {ride.departureTime} (Est. Arrival {ride.estimatedArrival})</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Select Number of Seats (Max {ride.availableSeats} available)
                </label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(ride.availableSeats, 3) }).map((_, idx) => {
                    const count = idx + 1;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setSeatsToBook(count)}
                        className={`flex-1 py-2.5 rounded-xl font-bold border transition-all cursor-pointer ${
                          seatsToBook === count
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {count} {count === 1 ? 'Seat' : 'Seats'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pickup landmark or note for driver (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Waiting near Main Gate Nescafe"
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                balance < fareToDeduct
                  ? 'bg-rose-50/80 border-rose-200'
                  : 'bg-indigo-50/80 border-indigo-100'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block leading-tight">VertoPay Digital Wallet</span>
                      <span className="text-[10px] text-slate-500">Live Campus Pass Balance</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Current Balance</span>
                    <span className={`text-sm font-black font-mono ${
                      balance < fareToDeduct ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      ₹{balance}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Fare to Deduct:</span>
                  <span className="font-black text-slate-900 text-sm">₹{fareToDeduct}</span>
                </div>

                {balance < fareToDeduct ? (
                  <div className="pt-2 border-t border-rose-200 space-y-2">
                    <div className="flex items-start gap-2 text-rose-800 text-[11px] font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        Insufficient balance in VertoPay (₹{balance}). Minimum ₹10 required.
                      </span>
                    </div>

                    <button
                      type="button"
                      id="modal-recharge-wallet-btn"
                      onClick={() => openRechargeModal(50)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Recharge VertoPay via Mock UPI Now (+₹50)</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sufficient balance. ₹10 will be deducted on confirmation.</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-join-ride-btn"
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-white transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98 ${
                    balance < fareToDeduct
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  <span>{balance < fareToDeduct ? 'Pay & Book (Top Up First)' : 'Confirm & Deduct ₹10'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
