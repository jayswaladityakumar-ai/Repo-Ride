export type VehicleType = 'Auto-Rickshaw' | 'E-Rickshaw' | 'Shared Cab' | 'Scooter/Bike' | 'Car';

export type RideStatus = 'active' | 'upcoming' | 'completed' | 'cancelled';

export interface CampusLocation {
  id: string;
  name: string;
  category: 'Campus Gate' | 'Hostel' | 'Academic Block' | 'Campus Hub' | 'Sports & Health';
  isOffCampus: boolean;
  distanceFromMainGateKm: number; // in km
  x: number; // relative map coordinate 0-1000
  y: number; // relative map coordinate 0-600
  description?: string;
  hostelType?: 'BH' | 'GH';
  gpsCoords?: { lat: number; lng: number };
  mapsUrl?: string;
}

export interface StudentProfile {
  id: string;
  uid?: string;
  name: string;
  regNumber?: string; // for students: e.g. "12115892", optional for drivers
  course?: string; // for students: e.g. "B.Tech CSE", optional for drivers
  batch?: string; // e.g. "2022-2026", optional for drivers
  avatar?: string;
  phone: string;
  email?: string;
  password?: string;
  rating: number;
  totalRides: number;
  moneySaved: number;
  verifiedStudent: boolean;
  blockOrHostel?: string; // optional for drivers
  gender?: 'Male' | 'Female' | 'Other';
  walletBalance?: number;
  accountType?: 'passenger' | 'driver';
  vehicleType?: VehicleType;
  vehicleNumber?: string;
}

export interface SignUpPayload {
  name: string;
  email?: string;
  password?: string;
  regNumber?: string;
  course?: string;
  phone: string;
  gender?: 'Male' | 'Female' | 'Other';
  blockOrHostel?: string;
  avatar?: string;
  accountType: 'passenger' | 'driver';
  vehicleType?: VehicleType;
  vehicleNumber?: string;
}

export type RideRequestStatus = 'waiting' | 'accepted' | 'expired' | 'completed' | 'cancelled';

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerAvatar?: string;
  pickupId: string;
  destinationId: string;
  pickupName: string;
  destinationName: string;
  status: RideRequestStatus;
  createdAt: number;
  expiresAt: number;
  acceptedAt?: number;
  completedAt?: number;
  driverId?: string;
  driverName?: string;
  driverAvatar?: string;
  driverVehicle?: string;
  driverVehicleNumber?: string;
  driverPhone?: string;
  rejectedBy: string[]; // List of driverIds who rejected this request
  otp?: string; // 4-digit OTP to tell driver
  paymentStatus?: 'pending_otp' | 'paid';
  paidAt?: number;
}

export type AuthUser = StudentProfile;

export interface Ride {
  id: string;
  driver: StudentProfile;
  pickup: CampusLocation;
  destination: CampusLocation;
  currentLocationName: string;
  distanceFromUserKm: number; // e.g. 0.8 km
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  pricePerSeat: number; // in INR e.g. 10 or 15
  departureTime: string; // e.g. "10:30 AM"
  estimatedArrival: string; // e.g. "11:00 AM"
  vehicleType: VehicleType;
  vehicleNumber?: string;
  status: RideStatus;
  routeStops: string[];
  isGirlsOnly?: boolean;
  notes?: string;
  bookedByStudentIds: string[];
  coordinates?: {
    current: { x: number; y: number };
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  roadWaypoints?: { x: number; y: number }[];
  progressPercentage?: number; // 0 to 100
}

export interface MyBooking {
  id: string;
  rideId: string;
  ride: Ride;
  seatsBooked: number;
  totalPrice: number;
  bookedAt: string;
  status: RideStatus;
  boardingOtp: string; // 4-digit OTP
  pickupNote?: string;
  coPassengers?: { name: string; course: string; phone: string }[];
  passengerId?: string;
  passengerName?: string;
  passengerPhone?: string;
  driverId?: string;
  paymentStatus?: 'pending_otp' | 'paid' | 'refunded';
  paidAt?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
  method?: string;
  status?: 'success' | 'pending' | 'failed';
  referenceId?: string;
}

export type PageTab = 'home' | 'book' | 'match' | 'find-students' | 'live' | 'passenger-dashboard' | 'driver-dashboard' | 'my-rides' | 'profile';
