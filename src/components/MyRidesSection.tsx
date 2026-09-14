import React, { useState } from 'react';
import { MyBooking, Ride, PageTab, StudentProfile } from '../types';
import { 
  CalendarCheck, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  Receipt, 
  Eye,
  Trash2
} from 'lucide-react';

interface MyRidesSectionProps {
  bookings: MyBooking[];
  onTrackRide: (ride: Ride) => void;
  onCancelBooking: (bookingId: string) => void;
  onNavigate: (tab: PageTab) => void;
  onOpenCreateRide: () => void;
  currentUser?: StudentProfile;
}

export const MyRidesSection: React.FC<MyRidesSectionProps> = ({
  bookings,
  onTrackRide,
  onCancelBooking,
  onNavigate,
  onOpenCreateRide,
  currentUser
}) => {
  const isDriver = currentUser?.accountType === 'driver';
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming' | 'completed' | 'cancelled'>('active');
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<MyBooking | null>(null);

  const activeBookings = bookings.filter(b => b.status === 'active');
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const displayedBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Campus Rides
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your currently active trip, upcoming shared rides, and past journey receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('book')}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            Find Ride
          </button>
          {isDriver && (
            <button
              onClick={onOpenCreateRide}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              + Create Ride
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'active', label: 'Currently Active', count: activeBookings.length, isPulse: activeBookings.length > 0 },
          { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
          { id: 'completed', label: 'Completed', count: completedBookings.length },
          { id: 'cancelled', label: 'Cancelled', count: cancelledBookings.length },
          { id: 'all', label: 'All History', count: bookings.length },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.isPulse && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeBookings.length > 0 && activeTab !== 'completed' && activeTab !== 'cancelled' && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                  Currently Active Ride
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {activeBookings[0].ride.pickup.name} → {activeBookings[0].ride.destination.name}
                </h2>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-4 self-start md:self-auto backdrop-blur-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-300 block">4-Digit Boarding OTP</span>
                <span className="text-2xl font-mono font-black text-white tracking-widest">
                  {activeBookings[0].boardingOtp}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  {activeBookings[0].paymentStatus === 'paid' ? 'Paid to Driver' : 'Tell driver to deduct ₹' + activeBookings[0].totalPrice}
                </span>
              </div>
              <ShieldCheck className="w-7 h-7 text-white opacity-90 shrink-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <span className="text-[11px] font-bold uppercase text-indigo-300 block">
                Driver & Vehicle
              </span>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center text-xl shrink-0">
                  {activeBookings[0].ride.vehicleType === 'E-Rickshaw' ? '🛺' : (activeBookings[0].ride.vehicleType === 'Auto-Rickshaw' ? '🚕' : '🚗')}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{activeBookings[0].ride.driver.name}</h4>
                  <p className="text-xs text-slate-300">{activeBookings[0].ride.driver.course}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Driver Phone:</span>
                <a
                  href={`tel:${activeBookings[0].ride.driver.phone}`}
                  className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {activeBookings[0].ride.driver.phone}
                </a>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <span className="text-[11px] font-bold uppercase text-indigo-300 block">
                Live Status & Route
              </span>
              
              <div>
                <span className="text-xs text-slate-400 block">Current Location:</span>
                <span className="font-bold text-sm text-white">
                  {activeBookings[0].ride.currentLocationName}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Est. Arrival:</span>
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeBookings[0].ride.estimatedArrival}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <span className="text-[11px] font-bold uppercase text-indigo-300 block">
                Your Booking & Fare
              </span>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Seats Reserved:</span>
                <span className="font-bold text-white text-sm">{activeBookings[0].seatsBooked} Seat</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Total Share Fare:</span>
                <span className="font-extrabold text-emerald-400 text-lg">₹{activeBookings[0].totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTrackRide(activeBookings[0].ride)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Track Live Ride</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onCancelBooking(activeBookings[0].id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-rose-600 hover:text-white text-slate-300 border border-white/20 transition-all cursor-pointer"
              >
                Cancel Ride
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          {activeTab === 'all' ? 'All Bookings History' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Rides`}
        </h3>

        {displayedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto space-y-3">
            <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No rides found in this tab</h4>
            <p className="text-xs text-slate-500">
              Ready to travel around campus?
            </p>
            <button
              onClick={() => onNavigate('book')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Book a Ride Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedBookings.map((b) => {
              const isPast = b.status === 'completed';
              const isActive = b.status === 'active';
              const isUpcoming = b.status === 'upcoming';

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border p-5 transition-all space-y-3 relative ${
                    isActive ? 'border-indigo-300 ring-1 ring-indigo-500/20 shadow-xs' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isUpcoming ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        isPast ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {b.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium ml-2">{b.bookedAt}</span>
                    </div>

                    <span className="font-extrabold text-sm text-indigo-700">₹{b.totalPrice}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800 truncate">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span className="truncate">{b.ride.pickup.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-slate-800 truncate">
                      <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                      <span className="truncate">{b.ride.destination.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{b.ride.driver.name}</span>
                    </div>

                    <span>{b.seatsBooked} {b.seatsBooked === 1 ? 'seat' : 'seats'}</span>
                  </div>

                  {b.boardingOtp && (
                    <div className="p-2.5 bg-neutral-100 rounded-xl flex items-center justify-between border border-neutral-200">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-500 block">Boarding OTP</span>
                        <span className="font-mono font-black text-sm text-black tracking-widest">{b.boardingOtp}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        b.paymentStatus === 'paid'
                          ? 'bg-black text-white'
                          : 'bg-white text-neutral-800 border border-neutral-300'
                      }`}>
                        {b.paymentStatus === 'paid' ? 'Paid to Driver' : 'Give OTP to Driver'}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptBooking(b)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>

                    {(isActive || isUpcoming) && (
                      <button
                        type="button"
                        onClick={() => onCancelBooking(b.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedReceiptBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900">Ride Booking Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceiptBooking(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs text-slate-600 border border-slate-100">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedReceiptBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Boarding OTP:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">{selectedReceiptBooking.boardingOtp}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <p><strong>From:</strong> {selectedReceiptBooking.ride.pickup.name}</p>
                <p><strong>To:</strong> {selectedReceiptBooking.ride.destination.name}</p>
                <p><strong>Driver:</strong> {selectedReceiptBooking.ride.driver.name}</p>
                <p><strong>Fare:</strong> <strong>₹{selectedReceiptBooking.totalPrice}</strong></p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedReceiptBooking(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
