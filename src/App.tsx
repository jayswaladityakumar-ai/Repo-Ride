import React, { useState, useEffect } from 'react';
import { PageTab, Ride, MyBooking, StudentProfile, RideRequest } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { HomeSection } from './components/HomeSection';
import { AvailableRidesSection } from './components/AvailableRidesSection';
import { LiveRidesMapSection } from './components/LiveRidesMapSection';
import { FindStudentsSection } from './components/FindStudentsSection';
import { MyRidesSection } from './components/MyRidesSection';
import { ProfileSection } from './components/ProfileSection';
import { PassengerDashboard } from './components/PassengerDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { JoinRideModal } from './components/JoinRideModal';
import { CreateRideModal } from './components/CreateRideModal';
import { TrackRideModal } from './components/TrackRideModal';
import { StudentActiveRideModal } from './components/StudentActiveRideModal';
import { VertoPayRechargeModal } from './components/VertoPayRechargeModal';
import { DriverWithdrawModal } from './components/DriverWithdrawModal';
import { VertoPayToasts } from './components/VertoPayToasts';
import { Footer } from './components/Footer';
import { INITIAL_AVAILABLE_RIDES, INITIAL_USER_BOOKINGS, LPU_LOCATIONS } from './data/lpuData';
import { RideService } from './services/rideService';

const MainApp: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();
  const { 
    isRechargeModalOpen, 
    closeRechargeModal, 
    rechargePresetAmount,
    isWithdrawModalOpen,
    closeWithdrawModal
  } = useWallet();
  
  const [currentTab, setCurrentTab] = useState<PageTab>('home');
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  
  // Search / Preset filters
  const [searchPresetPickup, setSearchPresetPickup] = useState<string>('All');
  const [searchPresetDest, setSearchPresetDest] = useState<string>('All');
  const [searchPresetSeats, setSearchPresetSeats] = useState<number>(1);

  // Modals & Active student ride request
  const [selectedRideForJoin, setSelectedRideForJoin] = useState<Ride | null>(null);
  const [selectedRideForTrack, setSelectedRideForTrack] = useState<Ride | null>(null);
  const [isCreateRideOpen, setIsCreateRideOpen] = useState<boolean>(false);
  const [activeStudentRequest, setActiveStudentRequest] = useState<RideRequest | null>(null);
  const [isStudentRideModalOpen, setIsStudentRideModalOpen] = useState<boolean>(false);

  // Initialize and load data from Cloud Firestore database
  useEffect(() => {
    RideService.initSampleData(INITIAL_AVAILABLE_RIDES, INITIAL_USER_BOOKINGS);

    const unsubRides = RideService.subscribeToRides((cloudRides) => {
      if (cloudRides && cloudRides.length > 0) {
        setRides(cloudRides);
      } else {
        setRides(INITIAL_AVAILABLE_RIDES);
      }
    });

    const unsubBookings = RideService.subscribeToBookings((cloudBookings) => {
      setBookings(cloudBookings);
    });

    return () => {
      unsubRides();
      unsubBookings();
    };
  }, []);

  // Listen for the active student ride request in real-time
  useEffect(() => {
    if (!user || user.accountType === 'driver') {
      setActiveStudentRequest(null);
      return;
    }
    const studentId = user.uid || user.id;
    const unsub = RideService.listenToPassengerRequest(studentId, (req) => {
      setActiveStudentRequest(req);
      if (req && req.status === 'accepted') {
        setIsStudentRideModalOpen(true);
      }
    });
    return () => unsub();
  }, [user?.id, user?.uid, user?.accountType]);

  // Automatically switch tab when user role changes or logs in
  useEffect(() => {
    if (user?.accountType === 'driver') {
      setCurrentTab('driver-dashboard');
    } else if (user?.accountType === 'passenger') {
      setCurrentTab((prev) => (prev === 'driver-dashboard' ? 'home' : prev));
    }
  }, [user?.accountType, user?.id]);

  if (!user) {
    return <AuthPage />;
  }

  const handleSearchRidesFromHome = (pickupId: string, destId: string, seats: number) => {
    setSearchPresetPickup(pickupId);
    setSearchPresetDest(destId);
    setSearchPresetSeats(seats);
    setCurrentTab('book');
  };

  const handleInitializeRide = async (
    pickupId: string, 
    destId: string, 
    pickupHostelNo?: number, 
    destHostelNo?: number
  ) => {
    let pickupLoc = LPU_LOCATIONS.find((l) => l.id === pickupId) || LPU_LOCATIONS[0];
    let destLoc = LPU_LOCATIONS.find((l) => l.id === destId) || LPU_LOCATIONS[1];

    if (pickupId === 'loc-bh' || pickupId === 'loc-gh') {
      const type = pickupId === 'loc-bh' ? 'Boys Hostel' : 'Girls Hostel';
      pickupLoc = { ...pickupLoc, name: `${type} ${pickupHostelNo || 1} (BH-${pickupHostelNo || 1})` };
    }
    if (destId === 'loc-bh' || destId === 'loc-gh') {
      const type = destId === 'loc-bh' ? 'Boys Hostel' : 'Girls Hostel';
      destLoc = { ...destLoc, name: `${type} ${destHostelNo || 1} (BH-${destHostelNo || 1})` };
    }

    const now = Date.now();
    const boardingOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newReq: RideRequest = {
      id: `req_${now}_${user?.id || 'std'}`,
      passengerId: user?.uid || user?.id || 'std-1',
      passengerName: user?.name || 'LPU Student',
      passengerAvatar: user?.avatar,
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
      await RideService.createRideRequest(newReq);
      setActiveStudentRequest(newReq);
      setIsStudentRideModalOpen(true);
    } catch (err) {
      console.error('Failed to initialize ride request:', err);
    }
  };

  const handleConfirmBooking = (newBooking: MyBooking) => {
    RideService.addBooking(newBooking);
    setSelectedRideForJoin(null);
    setCurrentTab('my-rides');
  };

  const handleCreateRide = (newRide: Ride) => {
    RideService.addRide(newRide);
    setIsCreateRideOpen(false);
    setCurrentTab('book');
  };

  const handleCancelBooking = (bookingId: string) => {
    RideService.cancelBooking(bookingId);
  };

  const activeRidesCount = rides.filter(r => r.status === 'upcoming' || r.status === 'in-transit').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNavigate={setCurrentTab}
        currentUser={user}
        user={user}
        onOpenCreateRide={() => setIsCreateRideOpen(true)}
        activeRidesCount={activeRidesCount}
        myActiveBookingsCount={bookings.filter(b => b.status === 'active').length}
        activeBookingsCount={bookings.filter(b => b.status === 'active').length}
        onSignOut={signOut}
      />

      <main className="flex-1">
        {currentTab === 'home' && (
          user.accountType === 'driver' ? (
            <DriverDashboard currentUser={user} onOpenCreateRide={() => setIsCreateRideOpen(true)} />
          ) : (
            <HomeSection
              onSearchRides={handleSearchRidesFromHome}
              onNavigate={setCurrentTab}
              onOpenCreateRide={() => setIsCreateRideOpen(true)}
              onInitializeRide={handleInitializeRide}
              activeRidesCount={activeRidesCount}
            />
          )
        )}

        {currentTab === 'book' && (
          <AvailableRidesSection
            rides={rides}
            currentUser={user}
            onJoinRide={(ride) => setSelectedRideForJoin(ride)}
            onOpenCreateRide={() => setIsCreateRideOpen(true)}
            presetPickupId={searchPresetPickup}
            presetDestinationId={searchPresetDest}
            presetSeats={searchPresetSeats}
          />
        )}

        {currentTab === 'match' && (
          <FindStudentsSection
            rides={rides}
            currentUser={user}
            onJoinRide={(ride) => setSelectedRideForJoin(ride)}
            onOpenCreateRide={() => setIsCreateRideOpen(true)}
          />
        )}

        {currentTab === 'live' && (
          <LiveRidesMapSection
            rides={rides}
            onJoinRide={(ride) => setSelectedRideForJoin(ride)}
            onTrackRide={(ride) => setSelectedRideForTrack(ride)}
          />
        )}

        {currentTab === 'passenger-dashboard' && (
          <PassengerDashboard currentUser={user} />
        )}

        {currentTab === 'driver-dashboard' && (
          <DriverDashboard currentUser={user} onOpenCreateRide={() => setIsCreateRideOpen(true)} />
        )}

        {currentTab === 'my-rides' && (
          <MyRidesSection
            bookings={bookings}
            currentUser={user}
            onTrackRide={(ride) => setSelectedRideForTrack(ride)}
            onCancelBooking={handleCancelBooking}
            onNavigate={setCurrentTab}
            onOpenCreateRide={() => setIsCreateRideOpen(true)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileSection
            user={user}
            onUpdateUser={updateUser}
            onSignOut={signOut}
          />
        )}
      </main>

      <Footer onNavigate={setCurrentTab} />

      {/* Floating Active Ride Bar for Passengers */}
      {activeStudentRequest && 
        (activeStudentRequest.status === 'waiting' || activeStudentRequest.status === 'accepted') && 
        user.accountType !== 'driver' && (
          <button
            type="button"
            id="floating-active-ride-pill"
            onClick={() => setIsStudentRideModalOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white px-5 py-3 rounded-full shadow-2xl border-2 border-neutral-700 flex items-center gap-3.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold whitespace-nowrap">
              {activeStudentRequest.status === 'waiting'
                ? 'Ride Initialized • Tap to View OTP'
                : `🎉 Confirmed by ${activeStudentRequest.driverName || 'Driver'} • View OTP`}
            </span>
            <span className="font-mono font-black text-xs bg-neutral-800 text-white px-2.5 py-1 rounded-lg border border-neutral-600">
              OTP: {activeStudentRequest.otp}
            </span>
          </button>
      )}

      {/* Student Active Ride Modal (OTP & Driver Confirmation) */}
      {isStudentRideModalOpen && activeStudentRequest && (
        <StudentActiveRideModal
          request={activeStudentRequest}
          onClose={() => setIsStudentRideModalOpen(false)}
          onCancelRequest={async (reqId) => {
            await RideService.rejectRideRequest(reqId, 'passenger_cancel');
            setActiveStudentRequest(null);
            setIsStudentRideModalOpen(false);
          }}
        />
      )}

      {/* Modals & Global Toasts */}
      {selectedRideForJoin && (
        <JoinRideModal
          ride={selectedRideForJoin}
          currentUser={user}
          onClose={() => setSelectedRideForJoin(null)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {isCreateRideOpen && (
        <CreateRideModal
          currentUser={user}
          onClose={() => setIsCreateRideOpen(false)}
          onCreateRide={handleCreateRide}
        />
      )}

      {selectedRideForTrack && (
        <TrackRideModal
          ride={selectedRideForTrack}
          onClose={() => setSelectedRideForTrack(null)}
        />
      )}

      <VertoPayRechargeModal 
        isOpen={isRechargeModalOpen}
        onClose={closeRechargeModal}
        presetAmount={rechargePresetAmount}
      />
      <DriverWithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
      />
      <VertoPayToasts />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <MainApp />
      </WalletProvider>
    </AuthProvider>
  );
}
