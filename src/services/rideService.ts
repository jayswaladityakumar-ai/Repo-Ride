import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StudentProfile, Ride, MyBooking, RideRequest, WalletTransaction } from '../types';

const REQUESTS_COLLECTION = 'ride_requests';
const WALLETS_COLLECTION = 'wallets';
const RIDES_COLLECTION = 'rides';
const BOOKINGS_COLLECTION = 'bookings';

// Local storage fallback keys
const FALLBACK_RIDES = 'vertoride_rides_pool';
const FALLBACK_BOOKINGS = 'vertoride_user_bookings';
const FALLBACK_REQUESTS = 'vertoride_live_requests';
const FALLBACK_WALLETS = 'vertoride_wallets';

export class RideService {
  // Initialize sample rides and bookings in Cloud Firestore
  public static async initSampleData(initialRides: Ride[], initialBookings: MyBooking[]): Promise<void> {
    try {
      const ridesSnapshot = await getDocs(collection(db, RIDES_COLLECTION));
      if (ridesSnapshot.empty && initialRides.length > 0) {
        for (const ride of initialRides) {
          const docRef = doc(db, RIDES_COLLECTION, ride.id);
          await setDoc(docRef, { ...ride, createdAt: Date.now() }, { merge: true });
        }
      }

      const bookingsSnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
      if (bookingsSnapshot.empty && initialBookings.length > 0) {
        for (const booking of initialBookings) {
          const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
          await setDoc(docRef, { ...booking, createdAt: Date.now() }, { merge: true });
        }
      }
    } catch (err) {
      console.warn('Firestore initSampleData fallback to local state', err);
      // Fallback to local storage if offline
      const stored = localStorage.getItem(FALLBACK_RIDES);
      if (!stored && initialRides.length > 0) {
        localStorage.setItem(FALLBACK_RIDES, JSON.stringify(initialRides));
      }
    }
  }

  // Subscribe to real-time rides from Firestore database
  public static subscribeToRides(callback: (rides: Ride[]) => void): () => void {
    try {
      const q = query(collection(db, RIDES_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items: Ride[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as Ride);
          });
          callback(items);
        } else {
          // Check local cache if empty
          try {
            const raw = localStorage.getItem(FALLBACK_RIDES);
            if (raw) callback(JSON.parse(raw));
          } catch {
            callback([]);
          }
        }
      }, (err) => {
        console.warn('Firestore rides subscription error, using local state', err);
        const raw = localStorage.getItem(FALLBACK_RIDES);
        if (raw) callback(JSON.parse(raw));
      });
    } catch (e) {
      console.warn('Could not setup Firestore rides listener', e);
      return () => {};
    }
  }

  // Subscribe to real-time bookings from Firestore database
  public static subscribeToBookings(callback: (bookings: MyBooking[]) => void): () => void {
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items: MyBooking[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as MyBooking);
          });
          callback(items);
        } else {
          try {
            const raw = localStorage.getItem(FALLBACK_BOOKINGS);
            if (raw) callback(JSON.parse(raw));
          } catch {
            callback([]);
          }
        }
      }, (err) => {
        console.warn('Firestore bookings subscription error, using local state', err);
        const raw = localStorage.getItem(FALLBACK_BOOKINGS);
        if (raw) callback(JSON.parse(raw));
      });
    } catch (e) {
      console.warn('Could not setup Firestore bookings listener', e);
      return () => {};
    }
  }

  // Add a new ride to Cloud Firestore database
  public static async addRide(newRide: Ride): Promise<void> {
    try {
      const docRef = doc(db, RIDES_COLLECTION, newRide.id);
      await setDoc(docRef, { ...newRide, createdAt: Date.now() }, { merge: true });
    } catch (err) {
      console.error('Error saving ride to Firestore', err);
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem(FALLBACK_RIDES);
        const list: Ride[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem(FALLBACK_RIDES, JSON.stringify([newRide, ...list]));
      } catch (storageErr) {
        console.error(storageErr);
      }
    }
  }

  // Add a new booking & update seats in Cloud Firestore database
  public static async addBooking(newBooking: MyBooking): Promise<void> {
    const bookingWithPayment: MyBooking = {
      ...newBooking,
      paymentStatus: newBooking.paymentStatus || 'pending_otp',
      boardingOtp: newBooking.boardingOtp || Math.floor(1000 + Math.random() * 9000).toString(),
      driverId: newBooking.driverId || newBooking.ride?.driver?.id || newBooking.ride?.driver?.uid
    };

    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingWithPayment.id);
      await setDoc(docRef, { ...bookingWithPayment, createdAt: Date.now() }, { merge: true });

      // Update seats in ride document
      const rideRef = doc(db, RIDES_COLLECTION, bookingWithPayment.rideId);
      const rideSnap = await getDoc(rideRef);
      if (rideSnap.exists()) {
        const r = rideSnap.data() as Ride;
        await updateDoc(rideRef, {
          occupiedSeats: (r.occupiedSeats || 0) + bookingWithPayment.seatsBooked,
          availableSeats: Math.max(0, (r.availableSeats || 1) - bookingWithPayment.seatsBooked)
        });
      }
    } catch (err) {
      console.error('Error saving booking to Firestore', err);
      // Local fallback
      try {
        const raw = localStorage.getItem(FALLBACK_BOOKINGS);
        const list: MyBooking[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem(FALLBACK_BOOKINGS, JSON.stringify([bookingWithPayment, ...list]));
      } catch (storageErr) {
        console.error(storageErr);
      }
    }
  }

  // Subscribe to bookings for a specific driver to verify passengers
  public static listenToDriverBookings(driverId: string, callback: (bookings: MyBooking[]) => void): () => void {
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        const items: MyBooking[] = [];
        snapshot.forEach((d) => {
          const b = d.data() as MyBooking;
          const matchDriver = 
            b.driverId === driverId || 
            b.ride?.driver?.id === driverId || 
            b.ride?.driver?.uid === driverId;
          if (matchDriver) {
            items.push(b);
          }
        });
        callback(items);
      }, (err) => {
        console.warn('Firestore driver bookings subscription error, using local state', err);
        try {
          const raw = localStorage.getItem(FALLBACK_BOOKINGS);
          if (raw) {
            const list: MyBooking[] = JSON.parse(raw);
            callback(list.filter(b => b.driverId === driverId || b.ride?.driver?.id === driverId || b.ride?.driver?.uid === driverId));
          } else {
            callback([]);
          }
        } catch {
          callback([]);
        }
      });
    } catch (e) {
      console.warn('Could not setup Firestore driver bookings listener', e);
      return () => {};
    }
  }

  // Verify passenger's 4-digit OTP and deduct amount from passenger & credit to driver
  public static async verifyBookingOtpAndPay(
    bookingId: string,
    enteredOtp: string,
    driver: StudentProfile
  ): Promise<{ success: boolean; message: string; amount?: number }> {
    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 4) {
      return { success: false, message: 'Please enter a valid 4-digit OTP provided by the passenger.' };
    }

    try {
      const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const bookingSnap = await getDoc(bookingRef);

      let booking: MyBooking | null = null;
      if (bookingSnap.exists()) {
        booking = bookingSnap.data() as MyBooking;
      } else {
        // Check local fallback
        const raw = localStorage.getItem(FALLBACK_BOOKINGS);
        if (raw) {
          const list: MyBooking[] = JSON.parse(raw);
          booking = list.find(b => b.id === bookingId) || null;
        }
      }

      if (!booking) {
        return { success: false, message: 'Booking not found.' };
      }

      if (booking.paymentStatus === 'paid') {
        return { success: false, message: 'This booking has already been verified and paid.' };
      }

      if (booking.boardingOtp !== cleanOtp) {
        return { success: false, message: 'Invalid 4-digit OTP. Please ask the passenger for the correct code.' };
      }

      const fareAmount = booking.totalPrice || booking.ride?.pricePerSeat || 10;
      const passengerId = booking.passengerId || 'user-self';
      const driverId = driver.id || driver.uid || 'driver';

      // 1. Fetch & verify passenger wallet
      const passWalletRef = doc(db, WALLETS_COLLECTION, passengerId);
      const passSnap = await getDoc(passWalletRef);
      const passData = passSnap.exists() ? passSnap.data() : { balance: 50, transactions: [] };
      const passBalance = typeof passData.balance === 'number' ? passData.balance : 50;

      if (passBalance < fareAmount) {
        return { 
          success: false, 
          message: `Passenger wallet balance (₹${passBalance}) is less than fare (₹${fareAmount}). Ask passenger to recharge via UPI.` 
        };
      }

      // 2. Deduct from passenger
      const passTx: WalletTransaction = {
        id: `tx-${Date.now()}-pass`,
        type: 'debit',
        amount: fareAmount,
        description: `Ride Fare to Driver ${driver.name} (OTP Verified: ${cleanOtp})`,
        timestamp: new Date().toISOString(),
        method: 'VertoPay OTP Verification',
        status: 'success',
        referenceId: bookingId
      };

      await setDoc(passWalletRef, {
        userId: passengerId,
        balance: passBalance - fareAmount,
        transactions: [passTx, ...(passData.transactions || [])],
        updatedAt: Date.now()
      }, { merge: true });

      // 3. Credit to driver
      const driverWalletRef = doc(db, WALLETS_COLLECTION, driverId);
      const driverSnap = await getDoc(driverWalletRef);
      const driverData = driverSnap.exists() ? driverSnap.data() : { balance: 50, transactions: [] };
      const driverBalance = typeof driverData.balance === 'number' ? driverData.balance : 50;

      const drvTx: WalletTransaction = {
        id: `tx-${Date.now()}-drv`,
        type: 'credit',
        amount: fareAmount,
        description: `Ride Fare from Passenger ${booking.passengerName || 'Student'} (OTP Verified: ${cleanOtp})`,
        timestamp: new Date().toISOString(),
        method: 'VertoPay OTP Verification',
        status: 'success',
        referenceId: bookingId
      };

      await setDoc(driverWalletRef, {
        userId: driverId,
        balance: driverBalance + fareAmount,
        transactions: [drvTx, ...(driverData.transactions || [])],
        updatedAt: Date.now()
      }, { merge: true });

      // 4. Update booking status to paid & completed
      const updatedBooking: MyBooking = {
        ...booking,
        paymentStatus: 'paid',
        status: 'completed',
        paidAt: new Date().toISOString()
      };

      if (bookingSnap.exists()) {
        await updateDoc(bookingRef, {
          paymentStatus: 'paid',
          status: 'completed',
          paidAt: updatedBooking.paidAt
        });
      }

      // Update local storage fallback
      try {
        const raw = localStorage.getItem(FALLBACK_BOOKINGS);
        if (raw) {
          const list: MyBooking[] = JSON.parse(raw);
          const idx = list.findIndex(b => b.id === bookingId);
          if (idx !== -1) {
            list[idx] = updatedBooking;
            localStorage.setItem(FALLBACK_BOOKINGS, JSON.stringify(list));
          }
        }
      } catch (e) {
        console.error(e);
      }

      return { 
        success: true, 
        message: `OTP Verified! ₹${fareAmount} successfully deducted from passenger and credited to driver wallet.`,
        amount: fareAmount 
      };
    } catch (err: any) {
      console.error('Error verifying booking OTP', err);
      return { success: false, message: err?.message || 'Failed to verify OTP.' };
    }
  }

  // Cancel booking in Cloud Firestore database
  public static async cancelBooking(bookingId: string): Promise<void> {
    try {
      const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (bookingSnap.exists()) {
        const booking = bookingSnap.data() as MyBooking;
        await updateDoc(bookingRef, { status: 'cancelled' });

        // Release seats on the ride
        const rideRef = doc(db, RIDES_COLLECTION, booking.rideId);
        const rideSnap = await getDoc(rideRef);
        if (rideSnap.exists()) {
          const r = rideSnap.data() as Ride;
          await updateDoc(rideRef, {
            occupiedSeats: Math.max(0, (r.occupiedSeats || 0) - booking.seatsBooked),
            availableSeats: Math.min(r.totalSeats || 4, (r.availableSeats || 0) + booking.seatsBooked)
          });
        }
      }
    } catch (err) {
      console.error('Error cancelling booking in Firestore', err);
    }
  }

  // Create an on-demand passenger request in Cloud Firestore
  public static async createRideRequest(request: RideRequest): Promise<void> {
    try {
      const docRef = doc(db, REQUESTS_COLLECTION, request.id);
      await setDoc(docRef, request, { merge: true });
    } catch (err) {
      console.error('Error creating ride request in Firestore', err);
      // Local fallback
      const raw = localStorage.getItem(FALLBACK_REQUESTS);
      const all: RideRequest[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(FALLBACK_REQUESTS, JSON.stringify([request, ...all.filter(r => r.id !== request.id)]));
    }
  }

  // Reject a request for a driver
  public static async rejectRideRequest(requestId: string, driverId: string): Promise<void> {
    try {
      const docRef = doc(db, REQUESTS_COLLECTION, requestId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as RideRequest;
        const rejectedBy = data.rejectedBy || [];
        if (!rejectedBy.includes(driverId)) {
          await updateDoc(docRef, { rejectedBy: [...rejectedBy, driverId] });
        }
      }
    } catch (err) {
      console.error('Error rejecting ride request in Firestore', err);
    }
  }

  // Accept a ride request (payment is deferred until passenger tells OTP to driver)
  public static async acceptRideRequest(requestId: string, driver: StudentProfile): Promise<boolean> {
    const driverId = driver.id || driver.uid || 'driver';
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    const snap = await getDoc(requestRef);

    if (!snap.exists()) {
      throw new Error('Ride request not found');
    }

    const request = snap.data() as RideRequest;
    if (request.status !== 'waiting') {
      throw new Error('Ride request is no longer available');
    }

    // Ensure driver has a proper campus driver name (never student passenger like Aarav Sharma)
    const isActuallyDriver = driver.accountType === 'driver' && driver.name !== 'Aarav Sharma';
    const driverName = isActuallyDriver ? driver.name : 'Gurpreet Singh';
    const driverVehicle = isActuallyDriver ? (driver.vehicleType || 'Auto-Rickshaw') : 'Auto-Rickshaw';
    const driverVehicleNumber = isActuallyDriver ? (driver.vehicleNumber || 'PB 08 BX 4192') : 'PB 08 BX 4192';
    const driverPhone = isActuallyDriver ? (driver.phone || '+91 98765-11223') : '+91 98765-11223';

    // Mark request accepted with pending OTP verification
    const updates = {
      status: 'accepted' as const,
      driverId,
      driverName,
      driverAvatar: driver.avatar || '',
      driverVehicle,
      driverVehicleNumber,
      driverPhone,
      acceptedAt: Date.now(),
      paymentStatus: 'pending_otp' as const
    };

    await updateDoc(requestRef, updates);

    // Sync local fallback
    try {
      const raw = localStorage.getItem(FALLBACK_REQUESTS);
      if (raw) {
        const list: RideRequest[] = JSON.parse(raw);
        const idx = list.findIndex(r => r.id === requestId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates };
          localStorage.setItem(FALLBACK_REQUESTS, JSON.stringify(list));
        }
      }
    } catch (err) {
      console.warn('Local storage sync error', err);
    }

    return true;
  }

  // Verify passenger's 4-digit OTP for on-demand request, deducting from passenger and crediting to driver
  public static async verifyRequestOtpAndPay(
    requestId: string,
    enteredOtp: string,
    driver: StudentProfile
  ): Promise<{ success: boolean; message: string; amount?: number }> {
    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 4) {
      return { success: false, message: 'Please enter the 4-digit OTP told by the passenger.' };
    }

    try {
      const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
      const snap = await getDoc(requestRef);
      if (!snap.exists()) {
        return { success: false, message: 'Ride request not found.' };
      }

      const request = snap.data() as RideRequest;
      if (request.status === 'completed' || request.paymentStatus === 'paid') {
        return { success: false, message: 'This ride has already been verified and paid.' };
      }

      if (request.otp && request.otp !== cleanOtp) {
        return { success: false, message: 'Incorrect OTP. Please check the 4-digit OTP with the passenger.' };
      }

      const passengerId = request.passengerId;
      const driverId = driver.id || driver.uid || 'driver';
      const fareAmount = 10;

      // 1. Check passenger wallet
      const passWalletRef = doc(db, WALLETS_COLLECTION, passengerId);
      const passSnap = await getDoc(passWalletRef);
      const passData = passSnap.exists() ? passSnap.data() : { balance: 50, transactions: [] };
      const passBalance = typeof passData.balance === 'number' ? passData.balance : 50;

      if (passBalance < fareAmount) {
        return { 
          success: false, 
          message: `Passenger wallet has insufficient balance (₹${passBalance}).` 
        };
      }

      // 2. Deduct ₹10 from passenger
      const passTx: WalletTransaction = {
        id: `tx-${Date.now()}-pass`,
        type: 'debit',
        amount: fareAmount,
        description: `Ride Fare to Driver ${driver.name} (OTP: ${cleanOtp})`,
        timestamp: new Date().toISOString(),
        method: 'VertoPay OTP Verification',
        status: 'success',
        referenceId: requestId
      };

      await setDoc(passWalletRef, {
        userId: passengerId,
        balance: passBalance - fareAmount,
        transactions: [passTx, ...(passData.transactions || [])],
        updatedAt: Date.now()
      }, { merge: true });

      // 3. Credit ₹10 to driver
      const driverWalletRef = doc(db, WALLETS_COLLECTION, driverId);
      const driverSnap = await getDoc(driverWalletRef);
      const driverData = driverSnap.exists() ? driverSnap.data() : { balance: 50, transactions: [] };
      const driverBalance = typeof driverData.balance === 'number' ? driverData.balance : 50;

      const drvTx: WalletTransaction = {
        id: `tx-${Date.now()}-drv`,
        type: 'credit',
        amount: fareAmount,
        description: `Ride Fare from Passenger ${request.passengerName} (OTP: ${cleanOtp})`,
        timestamp: new Date().toISOString(),
        method: 'VertoPay OTP Verification',
        status: 'success',
        referenceId: requestId
      };

      await setDoc(driverWalletRef, {
        userId: driverId,
        balance: driverBalance + fareAmount,
        transactions: [drvTx, ...(driverData.transactions || [])],
        updatedAt: Date.now()
      }, { merge: true });

      // 4. Update request status to completed & paid
      await updateDoc(requestRef, {
        status: 'completed',
        paymentStatus: 'paid',
        completedAt: Date.now(),
        paidAt: Date.now()
      });

      return {
        success: true,
        message: `OTP Verified! ₹${fareAmount} received to driver wallet from ${request.passengerName}.`,
        amount: fareAmount
      };
    } catch (err: any) {
      console.error('Error verifying request OTP', err);
      return { success: false, message: err?.message || 'Verification failed.' };
    }
  }

  // Driver withdraw earnings to bank/UPI (drivers cannot add amount, only withdraw received earnings)
  public static async withdrawDriverEarnings(
    driverId: string,
    amount: number,
    payoutMethod: string,
    payoutAccount: string
  ): Promise<{ success: boolean; message: string; remainingBalance?: number }> {
    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid withdrawal amount.' };
    }

    try {
      const driverWalletRef = doc(db, WALLETS_COLLECTION, driverId);
      const driverSnap = await getDoc(driverWalletRef);
      const driverData = driverSnap.exists() ? driverSnap.data() : { balance: 0, transactions: [] };
      const currentBalance = typeof driverData.balance === 'number' ? driverData.balance : 0;

      if (currentBalance < amount) {
        return { 
          success: false, 
          message: `Insufficient received earnings. Maximum available to withdraw: ₹${currentBalance}` 
        };
      }

      const updatedBalance = currentBalance - amount;
      const refId = `WTH-${Date.now().toString().slice(-6)}`;
      const tx: WalletTransaction = {
        id: `tx-${Date.now()}-wth`,
        type: 'debit',
        amount,
        description: `Payout to ${payoutAccount} (${payoutMethod})`,
        timestamp: new Date().toISOString(),
        method: payoutMethod,
        status: 'success',
        referenceId: refId
      };

      await setDoc(driverWalletRef, {
        userId: driverId,
        balance: updatedBalance,
        transactions: [tx, ...(driverData.transactions || [])],
        updatedAt: Date.now()
      }, { merge: true });

      // Update local storage fallback if needed
      try {
        const rawWallets = localStorage.getItem(FALLBACK_WALLETS);
        const map = rawWallets ? JSON.parse(rawWallets) : {};
        map[driverId] = { balance: updatedBalance, transactions: [tx, ...(map[driverId]?.transactions || [])] };
        localStorage.setItem(FALLBACK_WALLETS, JSON.stringify(map));
      } catch (storageErr) {
        console.warn(storageErr);
      }

      return {
        success: true,
        message: `Withdrawal of ₹${amount} sent to ${payoutAccount}. Reference: ${refId}`,
        remainingBalance: updatedBalance
      };
    } catch (err: any) {
      console.error('Error withdrawing earnings', err);
      return { success: false, message: err?.message || 'Withdrawal failed.' };
    }
  }

  // Verify ANY 4-digit passenger OTP across all bookings and requests
  public static async verifyAnyOtpAndPay(
    enteredOtp: string,
    driver: StudentProfile
  ): Promise<{ success: boolean; message: string; amount?: number }> {
    const cleanOtp = enteredOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 4) {
      return { success: false, message: 'Please enter a valid 4-digit OTP provided by the passenger.' };
    }

    try {
      // 1. Search requests collection for this OTP
      try {
        const reqCol = collection(db, REQUESTS_COLLECTION);
        const reqSnap = await getDocs(reqCol);
        for (const d of reqSnap.docs) {
          const r = d.data() as RideRequest;
          if (r.otp === cleanOtp && r.paymentStatus !== 'paid') {
            return await RideService.verifyRequestOtpAndPay(r.id, cleanOtp, driver);
          }
        }
      } catch (e) {
        console.warn('Search requests for OTP error', e);
      }

      // 2. Search bookings collection for this boarding OTP
      try {
        const bookCol = collection(db, BOOKINGS_COLLECTION);
        const bookSnap = await getDocs(bookCol);
        for (const d of bookSnap.docs) {
          const b = d.data() as MyBooking;
          if (b.boardingOtp === cleanOtp && b.paymentStatus !== 'paid') {
            return await RideService.verifyBookingOtpAndPay(b.id, cleanOtp, driver);
          }
        }
      } catch (e) {
        console.warn('Search bookings for OTP error', e);
      }

      // 3. Fallback to local storage
      const rawBookings = localStorage.getItem(FALLBACK_BOOKINGS);
      if (rawBookings) {
        const list: MyBooking[] = JSON.parse(rawBookings);
        const match = list.find(b => b.boardingOtp === cleanOtp && b.paymentStatus !== 'paid');
        if (match) {
          return await RideService.verifyBookingOtpAndPay(match.id, cleanOtp, driver);
        }
      }

      return { 
        success: false, 
        message: `No active ride found matching OTP "${cleanOtp}". Ask passenger to check their active booking.` 
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Verification error' };
    }
  }

  // Real-time listener for passenger's active request
  public static listenToPassengerRequest(passengerId: string, callback: (request: RideRequest | null) => void): () => void {
    try {
      const q = query(collection(db, REQUESTS_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        let active: RideRequest | null = null;
        let latest: RideRequest | null = null;

        snapshot.forEach((d) => {
          const req = d.data() as RideRequest;
          if (req.passengerId === passengerId) {
            if (req.status === 'waiting' || req.status === 'accepted') {
              active = req;
            }
            if (!latest || req.createdAt > latest.createdAt) {
              latest = req;
            }
          }
        });

        callback(active || latest);
      }, (err) => {
        console.warn('Firestore listenToPassengerRequest error', err);
      });
    } catch {
      return () => {};
    }
  }

  // Real-time listener for drivers to view available ride requests
  public static listenToAvailableRequests(driverId: string, callback: (requests: RideRequest[]) => void): () => void {
    try {
      const q = query(collection(db, REQUESTS_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        const now = Date.now();
        const available: RideRequest[] = [];

        snapshot.forEach((d) => {
          const req = d.data() as RideRequest;
          if (
            req.status === 'waiting' &&
            req.expiresAt > now &&
            !(req.rejectedBy && req.rejectedBy.includes(driverId))
          ) {
            available.push(req);
          }
        });

        callback(available);
      }, (err) => {
        console.warn('Firestore listenToAvailableRequests error', err);
      });
    } catch {
      return () => {};
    }
  }

  // Real-time listener for driver's accepted requests (awaiting OTP verification)
  public static listenToDriverAcceptedRequests(driverId: string, callback: (requests: RideRequest[]) => void): () => void {
    try {
      const q = query(collection(db, REQUESTS_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        const accepted: RideRequest[] = [];
        snapshot.forEach((d) => {
          const req = d.data() as RideRequest;
          if (
            req.driverId === driverId && 
            (req.status === 'accepted' || req.paymentStatus === 'pending_otp')
          ) {
            accepted.push(req);
          }
        });
        callback(accepted);
      }, (err) => {
        console.warn('Firestore listenToDriverAcceptedRequests error', err);
      });
    } catch {
      return () => {};
    }
  }

  // Real-time listener for user's wallet in Cloud Firestore
  public static listenToWallet(
    userId: string, 
    callback: (data: { balance: number; transactions: WalletTransaction[] }) => void
  ): () => void {
    try {
      const walletRef = doc(db, WALLETS_COLLECTION, userId);
      return onSnapshot(walletRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            balance: typeof data.balance === 'number' ? data.balance : 50,
            transactions: Array.isArray(data.transactions) ? data.transactions : []
          });
        } else {
          // Initialize default ₹50 welcome pass
          const defaultTx: WalletTransaction = {
            id: `tx-welcome-${userId}`,
            type: 'credit',
            amount: 50,
            description: 'LPU Welcome Bonus Pass',
            timestamp: new Date().toISOString(),
            method: 'VertoPay Campus Pass',
            status: 'success',
            referenceId: 'VP-WELCOME'
          };
          setDoc(walletRef, {
            userId,
            balance: 50,
            transactions: [defaultTx],
            updatedAt: Date.now()
          }, { merge: true }).catch(console.error);

          callback({ balance: 50, transactions: [defaultTx] });
        }
      }, (err) => {
        console.warn('Firestore wallet subscription error', err);
        callback({ balance: 50, transactions: [] });
      });
    } catch {
      return () => {};
    }
  }

  // Record top-up or transaction in Cloud Firestore
  public static async recordTransaction(userId: string, tx: WalletTransaction, newBalance: number): Promise<void> {
    try {
      const walletRef = doc(db, WALLETS_COLLECTION, userId);
      const snap = await getDoc(walletRef);
      const existingTxs = snap.exists() && Array.isArray(snap.data().transactions) 
        ? snap.data().transactions 
        : [];

      await setDoc(walletRef, {
        userId,
        balance: newBalance,
        transactions: [tx, ...existingTxs],
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.error('Error saving transaction in Firestore', err);
    }
  }
}
