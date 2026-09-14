import { CampusLocation, StudentProfile, Ride, MyBooking } from '../types';

export const LPU_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-maingate',
    name: 'LPU Main Gate (GT Road)',
    category: 'Campus Gate',
    isOffCampus: false,
    distanceFromMainGateKm: 0.0,
    x: 500,
    y: 520,
    description: 'Main entrance on NH-44 / GT Road, key e-rickshaw & auto hub'
  },
  {
    id: 'loc-lawgate',
    name: 'Law Gate (Back Gate Market)',
    category: 'Campus Gate',
    isOffCampus: false,
    distanceFromMainGateKm: 1.5,
    x: 220,
    y: 420,
    description: 'Popular student market, cafes, food stalls, and stationery'
  },
  {
    id: 'loc-openaudi',
    name: 'LPU Open Audi Road (Central Campus)',
    category: 'Campus Hub',
    isOffCampus: false,
    distanceFromMainGateKm: 0.6,
    x: 470,
    y: 315,
    description: 'Central campus heart on Open Audi Road (GPS: 31.255228° N, 75.704727° E) connecting UniMall, Unipolis & Academic blocks',
    gpsCoords: { lat: 31.255228, lng: 75.704727 },
    mapsUrl: 'https://maps.app.goo.gl/9mhLf4ZKg2RzUr2F9'
  },
  {
    id: 'loc-unimall',
    name: 'UniMall & Central Food Court',
    category: 'Campus Hub',
    isOffCampus: false,
    distanceFromMainGateKm: 0.5,
    x: 520,
    y: 360,
    description: 'Central campus retail, dining, Nescafe, Dominoes, and bank kiosks',
    gpsCoords: { lat: 31.2546, lng: 75.7041 }
  },
  {
    id: 'loc-library',
    name: 'Central Library & Admin Block',
    category: 'Campus Hub',
    isOffCampus: false,
    distanceFromMainGateKm: 0.7,
    x: 480,
    y: 280,
    description: 'Heart of academic zone, student resource center, central auditorium'
  },
  {
    id: 'loc-unipolis',
    name: 'Baldev Raj Mittal Unipolis',
    category: 'Campus Hub',
    isOffCampus: false,
    distanceFromMainGateKm: 0.6,
    x: 420,
    y: 330,
    description: 'Massive open-air auditorium for mega campus events and fests'
  },
  {
    id: 'loc-bh',
    name: 'Boys Hostel (BH)',
    category: 'Hostel',
    isOffCampus: false,
    distanceFromMainGateKm: 1.1,
    x: 320,
    y: 240,
    description: 'Boys residential complex (BH-1 through BH-13) near sports grounds',
    hostelType: 'BH'
  },
  {
    id: 'loc-gh',
    name: 'Girls Hostel (GH)',
    category: 'Hostel',
    isOffCampus: false,
    distanceFromMainGateKm: 0.8,
    x: 680,
    y: 260,
    description: 'Girls residential complex (GH-1 through GH-13) with biometric turnstiles',
    hostelType: 'GH'
  },
  {
    id: 'loc-block34',
    name: 'Block 34 (School of Computer Science)',
    category: 'Academic Block',
    isOffCampus: false,
    distanceFromMainGateKm: 0.9,
    x: 380,
    y: 170,
    description: 'Engineering & Technology labs, Apple iOS Dev Center'
  },
  {
    id: 'loc-block38',
    name: 'Block 38 (Mittal School of Business)',
    category: 'Academic Block',
    isOffCampus: false,
    distanceFromMainGateKm: 0.8,
    x: 580,
    y: 190,
    description: 'Management, Commerce, Economics & Humanities classrooms'
  },
  {
    id: 'loc-block55',
    name: 'Block 55 (Bio-Sciences & Agriculture)',
    category: 'Academic Block',
    isOffCampus: false,
    distanceFromMainGateKm: 1.3,
    x: 260,
    y: 140,
    description: 'Agriculture farm research, Biotechnology & Pharmacy departments'
  },
  {
    id: 'loc-sports',
    name: 'Shanti Devi Mittal Indoor Sports Arena',
    category: 'Sports & Health',
    isOffCampus: false,
    distanceFromMainGateKm: 1.2,
    x: 340,
    y: 350,
    description: 'Olympic-size swimming pool, badminton, basketball, and gym'
  },
  {
    id: 'loc-hospital',
    name: 'UniHospital & Health Center',
    category: 'Sports & Health',
    isOffCampus: false,
    distanceFromMainGateKm: 0.9,
    x: 650,
    y: 340,
    description: '24x7 emergency medical service and campus pharmacy'
  },
  {
    id: 'loc-cricket',
    name: 'LPU Cricket Ground & Central Park',
    category: 'Sports & Health',
    isOffCampus: false,
    distanceFromMainGateKm: 0.8,
    x: 480,
    y: 120,
    description: 'Turf cricket stadium, running track, and lush green lawns'
  }
];

export const CURRENT_USER: StudentProfile = {
  id: 'user-self',
  name: 'Demo Student 1',
  regNumber: '12115892',
  course: 'B.Tech Computer Science & Engineering',
  batch: '2022 - 2026',
  avatar: '',
  phone: '+91 98765-43210',
  email: 'aarav.12115892@lpu.in',
  rating: 4.9,
  totalRides: 48,
  moneySaved: 2840,
  verifiedStudent: true,
  blockOrHostel: 'BH-3, Room 412',
  gender: 'Male',
  accountType: 'passenger'
};

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-rahul',
    name: 'Demo Student 3',
    regNumber: '12204891',
    course: 'B.Tech Mechanical Engg',
    batch: '2022 - 2026',
    avatar: '',
    phone: '+91 98123-45678',
    email: 'rahul.12204891@lpu.in',
    rating: 4.8,
    totalRides: 34,
    moneySaved: 1950,
    verifiedStudent: true,
    blockOrHostel: 'BH-4',
    gender: 'Male',
    accountType: 'driver'
  },
  {
    id: 'student-simran',
    name: 'Demo Student 4',
    regNumber: '12108842',
    course: 'B.A. LL.B (Hons)',
    batch: '2021 - 2026',
    avatar: '',
    phone: '+91 98722-11445',
    email: 'simran.12108842@lpu.in',
    rating: 5.0,
    totalRides: 56,
    moneySaved: 3400,
    verifiedStudent: true,
    blockOrHostel: 'GH-2',
    gender: 'Female',
    accountType: 'driver'
  },
  {
    id: 'student-ananya',
    name: 'Demo Student 5',
    regNumber: '12314560',
    course: 'MBA Marketing',
    batch: '2023 - 2025',
    avatar: '',
    phone: '+91 97801-99881',
    email: 'ananya.12314560@lpu.in',
    rating: 4.9,
    totalRides: 29,
    moneySaved: 1680,
    verifiedStudent: true,
    blockOrHostel: 'GH-5',
    gender: 'Female',
    accountType: 'passenger'
  },
  {
    id: 'student-gurpreet',
    name: 'Gurpreet Singh',
    regNumber: '12019445',
    course: 'B.Tech IT',
    batch: '2021 - 2025',
    avatar: '',
    phone: '+91 94172-88229',
    email: 'gurpreet.12019445@lpu.in',
    rating: 4.7,
    totalRides: 42,
    moneySaved: 2310,
    verifiedStudent: true,
    blockOrHostel: 'BH-8',
    gender: 'Male',
    accountType: 'driver'
  },
  {
    id: 'student-rohit',
    name: 'Rohit Joshi',
    regNumber: '12211904',
    course: 'B.Design Fashion',
    batch: '2022 - 2026',
    avatar: '',
    phone: '+91 98884-33110',
    email: 'rohit.12211904@lpu.in',
    rating: 4.9,
    totalRides: 21,
    moneySaved: 1220,
    verifiedStudent: true,
    blockOrHostel: 'BH-3',
    gender: 'Male',
    accountType: 'passenger'
  },
  {
    id: 'student-priya',
    name: 'Priya Nambiar',
    regNumber: '12117732',
    course: 'B.Pharmacy',
    batch: '2022 - 2026',
    avatar: '',
    phone: '+91 95011-66778',
    email: 'priya.12117732@lpu.in',
    rating: 4.9,
    totalRides: 38,
    moneySaved: 2450,
    verifiedStudent: true,
    blockOrHostel: 'GH-6',
    gender: 'Female',
    accountType: 'driver'
  }
];

export const INITIAL_AVAILABLE_RIDES: Ride[] = [
  {
    id: 'ride-1',
    driver: INITIAL_STUDENTS[0],
    pickup: LPU_LOCATIONS[0],
    destination: {
      ...LPU_LOCATIONS[6],
      name: 'Boys Hostel (BH-4)'
    },
    currentLocationName: 'LPU Main Gate E-Rickshaw Bay',
    distanceFromUserKm: 0.3,
    totalSeats: 4,
    occupiedSeats: 2,
    availableSeats: 2,
    pricePerSeat: 15,
    departureTime: 'Leaving in 5 mins',
    estimatedArrival: '10:35 AM',
    vehicleType: 'E-Rickshaw',
    vehicleNumber: 'PB 09 ER 4812',
    status: 'active',
    routeStops: ['Main Gate (GT Road)', 'UniMall', 'Open Audi Road', 'Central Library', 'Boys Hostel (BH-4)'],
    isGirlsOnly: false,
    notes: 'Heading back to BH-4 from Main Gate via Open Audi Road corridor. 2 seats open.',
    bookedByStudentIds: ['student-rahul'],
    coordinates: {
      start: { x: 500, y: 520 },
      current: { x: 480, y: 440 },
      end: { x: 320, y: 240 }
    },
    roadWaypoints: [
      { x: 500, y: 520 },
      { x: 510, y: 410 },
      { x: 510, y: 360 },
      { x: 470, y: 315 },
      { x: 420, y: 330 },
      { x: 340, y: 350 },
      { x: 320, y: 240 }
    ],
    progressPercentage: 25
  },
  {
    id: 'ride-2',
    driver: INITIAL_STUDENTS[1],
    pickup: {
      ...LPU_LOCATIONS[7],
      name: 'Girls Hostel (GH-2)'
    },
    destination: LPU_LOCATIONS[8],
    currentLocationName: 'GH-2 Turnstile Gate',
    distanceFromUserKm: 0.4,
    totalSeats: 3,
    occupiedSeats: 2,
    availableSeats: 1,
    pricePerSeat: 10,
    departureTime: 'Leaving in 8 mins',
    estimatedArrival: '10:45 AM',
    vehicleType: 'E-Rickshaw',
    vehicleNumber: 'PB 08 CX 9042',
    status: 'active',
    routeStops: ['Girls Hostel (GH-2)', 'UniHospital', 'Open Audi Road', 'Central Library', 'Block 34 (CSE)'],
    isGirlsOnly: true,
    notes: 'Girls only sharing to Block 34 for morning lab session.',
    bookedByStudentIds: ['student-simran'],
    coordinates: {
      start: { x: 680, y: 260 },
      current: { x: 580, y: 240 },
      end: { x: 380, y: 170 }
    },
    progressPercentage: 35
  },
  {
    id: 'ride-3',
    driver: INITIAL_STUDENTS[3],
    pickup: LPU_LOCATIONS[1],
    destination: LPU_LOCATIONS[2],
    currentLocationName: 'Law Gate Auto Stand',
    distanceFromUserKm: 0.6,
    totalSeats: 3,
    occupiedSeats: 1,
    availableSeats: 2,
    pricePerSeat: 15,
    departureTime: 'Leaving in 10 mins',
    estimatedArrival: '10:55 AM',
    vehicleType: 'Auto-Rickshaw',
    vehicleNumber: 'PB 09 ER 1109',
    status: 'active',
    routeStops: ['Law Gate', 'Indoor Sports Arena', 'Unipolis', 'Open Audi Road', 'UniMall'],
    isGirlsOnly: false,
    notes: 'Going to UniMall for lunch via Open Audi Road, 2 empty seats!',
    bookedByStudentIds: ['student-gurpreet'],
    progressPercentage: 30
  },
  {
    id: 'ride-4',
    driver: {
      id: 'student-vikram',
      name: 'Vikramaditya Rao',
      regNumber: '12104523',
      course: 'B.Tech Aerospace Engg',
      batch: '2022 - 2026',
      avatar: '',
      phone: '+91 97791-23849',
      email: 'vikram.12104523@lpu.in',
      rating: 4.9,
      totalRides: 41,
      moneySaved: 2600,
      verifiedStudent: true,
      blockOrHostel: 'BH-1',
      gender: 'Male',
      accountType: 'driver'
    },
    pickup: {
      id: 'loc-openaudi',
      name: 'LPU Open Audi Road (Central Campus)',
      category: 'Campus Hub',
      isOffCampus: false,
      distanceFromMainGateKm: 0.6,
      x: 470,
      y: 315,
      description: 'Central campus heart on Open Audi Road (GPS: 31.255228, 75.704727)',
      gpsCoords: { lat: 31.255228, lng: 75.704727 },
      mapsUrl: 'https://maps.app.goo.gl/9mhLf4ZKg2RzUr2F9'
    },
    destination: {
      id: 'loc-block34',
      name: 'Block 34 (School of Computer Science)',
      category: 'Academic Block',
      isOffCampus: false,
      distanceFromMainGateKm: 0.9,
      x: 380,
      y: 170,
      description: 'Engineering & Technology labs, Apple iOS Dev Center'
    },
    currentLocationName: 'Open Audi Road Junction (31.255228, 75.704727)',
    distanceFromUserKm: 0.2,
    totalSeats: 3,
    occupiedSeats: 1,
    availableSeats: 2,
    pricePerSeat: 10,
    departureTime: 'Leaving now (Live on Campus Road)',
    estimatedArrival: '10:46 AM',
    vehicleType: 'E-Rickshaw',
    vehicleNumber: 'PB 09 ER 3125',
    status: 'active',
    routeStops: ['Open Audi Road (GPS: 31.255228, 75.704727)', 'Central Library Spine', 'Block 34 (CSE)'],
    isGirlsOnly: false,
    notes: 'Campus E-Rickshaw live on Open Audi Road corridor. Sharing to Block 34 labs!',
    bookedByStudentIds: ['student-vikram'],
    progressPercentage: 50
  }
];

export const INITIAL_USER_BOOKINGS: MyBooking[] = [
  {
    id: 'booking-active-1',
    rideId: 'ride-1',
    ride: INITIAL_AVAILABLE_RIDES[0],
    seatsBooked: 1,
    totalPrice: 15,
    bookedAt: 'Today, 10:15 AM',
    status: 'active',
    boardingOtp: '4892',
    pickupNote: 'Waiting near Main Gate SBI ATM kiosk',
    coPassengers: [
      { name: 'Demo Student 3 (Driver/Host)', course: 'B.Tech Mech', phone: '+91 98123-45678' },
      { name: 'Tanmay Saxena', course: 'BBA', phone: '+91 99144-88221' }
    ]
  },
  {
    id: 'booking-past-1',
    rideId: 'ride-hist-1',
    ride: {
      id: 'ride-hist-1',
      driver: INITIAL_STUDENTS[3],
      pickup: LPU_LOCATIONS[1],
      destination: LPU_LOCATIONS[3],
      currentLocationName: 'Completed',
      distanceFromUserKm: 0,
      totalSeats: 3,
      occupiedSeats: 3,
      availableSeats: 0,
      pricePerSeat: 15,
      departureTime: 'Yesterday, 4:30 PM',
      estimatedArrival: '4:45 PM',
      vehicleType: 'Auto-Rickshaw',
      vehicleNumber: 'PB 09 AC 7810',
      status: 'completed',
      routeStops: ['Law Gate', 'Indoor Sports Arena', 'Central Library'],
      bookedByStudentIds: ['user-self']
    },
    seatsBooked: 1,
    totalPrice: 15,
    bookedAt: 'Yesterday, 4:20 PM',
    status: 'completed',
    boardingOtp: '3391'
  }
];

export const POPULAR_DESTINATIONS = [
  {
    title: 'Open Audi Road (Central Spine)',
    category: 'Campus Road',
    distance: 'Heart of Campus (31.255228, 75.704727)',
    avgShareFare: '₹10 - ₹15 / seat',
    soloFare: '₹30',
    savings: 'Save ~₹20 per ride',
    icon: 'navigation',
    popularTimes: 'All-day student transit & lab rush',
    targetLocationId: 'loc-openaudi'
  },
  {
    title: 'UniMall & Food Court',
    category: 'Campus Hub',
    distance: 'Central Hub',
    avgShareFare: '₹10 - ₹15 / seat',
    soloFare: '₹30 - ₹40',
    savings: 'Save ~₹25 per trip',
    icon: 'utensils',
    popularTimes: 'Lunch (12 - 2 PM) & Evening (5 - 8 PM)',
    targetLocationId: 'loc-unimall'
  },
  {
    title: 'Law Gate (Back Gate Market)',
    category: 'Campus Gate',
    distance: '1.5 km across campus',
    avgShareFare: '₹15 - ₹20 / seat',
    soloFare: '₹40 - ₹50',
    savings: 'Save ~₹30 per trip',
    icon: 'map-pin',
    popularTimes: 'Evening food rush & weekend shopping',
    targetLocationId: 'loc-lawgate'
  },
  {
    title: 'Boys Hostels (BH-1 to BH-13)',
    category: 'Hostel Zone',
    distance: 'Residential Zone',
    avgShareFare: '₹10 - ₹15 / seat',
    soloFare: '₹30 - ₹40',
    savings: 'Save ~₹25 with roommates',
    icon: 'navigation',
    popularTimes: 'After 5 PM lectures & curfew return',
    targetLocationId: 'loc-bh'
  },
  {
    title: 'Girls Hostels (GH-1 to GH-13)',
    category: 'Hostel Zone',
    distance: 'Residential Complex',
    avgShareFare: '₹10 - ₹15 / seat',
    soloFare: '₹30 - ₹40',
    savings: 'Save ~₹25 per ride',
    icon: 'navigation',
    popularTimes: 'Post 4:30 PM classes & evening dining',
    targetLocationId: 'loc-gh'
  },
  {
    title: 'Central Library & Admin Block',
    category: 'Academic Hub',
    distance: 'Academic Zone',
    avgShareFare: '₹10 / seat',
    soloFare: '₹30',
    savings: 'Save ~₹20 per trip',
    icon: 'map-pin',
    popularTimes: 'Exam weeks & morning class hours',
    targetLocationId: 'loc-library'
  },
  {
    title: 'Block 34 (Computer Science & Engg)',
    category: 'Academic Block',
    distance: 'Engineering Zone',
    avgShareFare: '₹10 - ₹15 / seat',
    soloFare: '₹35',
    savings: 'Save ~₹20 to labs',
    icon: 'navigation',
    popularTimes: '8:30 AM & 1:30 PM lab rush',
    targetLocationId: 'loc-block34'
  },
  {
    title: 'Indoor Sports Arena & Pool',
    category: 'Sports & Health',
    distance: 'Athletics Zone',
    avgShareFare: '₹15 / seat',
    soloFare: '₹40',
    savings: 'Save ~₹25 for gym/swimming',
    icon: 'navigation',
    popularTimes: 'Morning (6 - 8 AM) & Evening (5 - 8 PM)',
    targetLocationId: 'loc-sports'
  },
  {
    title: 'LPU Main Gate (GT Road)',
    category: 'Campus Entry',
    distance: 'Main Entrance',
    avgShareFare: '₹10 - ₹15 / seat',
    soloFare: '₹35 - ₹45',
    savings: 'Save ~₹25 per ride',
    icon: 'navigation',
    popularTimes: 'Friday departures & Sunday return curfew',
    targetLocationId: 'loc-maingate'
  }
];
