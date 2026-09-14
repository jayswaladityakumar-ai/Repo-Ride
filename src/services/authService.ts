import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StudentProfile, SignUpPayload } from '../types';
import { CURRENT_USER } from '../data/lpuData';

const AUTH_STORAGE_KEY = 'vertoride_auth_user';
const USERS_COLLECTION = 'users';

export const DEMO_STUDENT_MALE: StudentProfile = {
  ...CURRENT_USER,
  id: 'user-aarav-demo',
  uid: 'user-aarav-demo',
  name: 'Aarav Sharma',
  email: 'aarav.12115892@lpu.in',
  regNumber: '12115892',
  course: 'B.Tech Computer Science & Engineering',
  batch: '2022 - 2026',
  gender: 'Male',
  blockOrHostel: 'BH-3, Room 412',
  phone: '+91 98765-43210',
  rating: 4.9,
  totalRides: 48,
  moneySaved: 2840,
  verifiedStudent: true,
  accountType: 'passenger'
};

export const DEMO_STUDENT_FEMALE: StudentProfile = {
  id: 'user-priya-demo',
  uid: 'user-priya-demo',
  name: 'Priya Patel',
  email: 'priya.12203918@lpu.in',
  regNumber: '12203918',
  course: 'B.Des Fashion & Product Design',
  batch: '2023 - 2027',
  avatar: '',
  phone: '+91 98765-11223',
  rating: 4.95,
  totalRides: 32,
  moneySaved: 1920,
  verifiedStudent: true,
  blockOrHostel: 'GH-2, Room 308',
  gender: 'Female',
  accountType: 'passenger'
};

export const DEMO_DRIVER: StudentProfile = {
  id: 'driver-gurpreet-demo',
  uid: 'driver-gurpreet-demo',
  name: 'Gurpreet Singh',
  phone: '+91 98765-11223',
  rating: 4.95,
  totalRides: 142,
  moneySaved: 0,
  verifiedStudent: true,
  accountType: 'driver',
  vehicleType: 'Auto-Rickshaw',
  vehicleNumber: 'PB 08 BX 4192'
};

// Driver OTP storage cache
const DRIVER_OTPS_KEY = 'reporide_driver_otps';

export function normalizePhoneNumber(raw: string): string {
  return raw.replace(/[^0-9]/g, '').slice(-10);
}

export async function sendDriverOtp(rawPhone: string): Promise<{ success: boolean; otp: string; message: string }> {
  const phone = normalizePhoneNumber(rawPhone);
  if (phone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  // Generate 4-digit OTP (for easy campus entry)
  const otp = phone === '9876511223' ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const raw = localStorage.getItem(DRIVER_OTPS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[phone] = otp;
    localStorage.setItem(DRIVER_OTPS_KEY, JSON.stringify(map));
  } catch {
    // fallback
  }

  return {
    success: true,
    otp,
    message: `OTP sent to +91 ${phone}. Use code: ${otp}`
  };
}

export async function verifyDriverOtpAndSignIn(
  rawPhone: string,
  enteredOtp: string,
  registrationData?: {
    name: string;
    vehicleType?: 'Auto-Rickshaw' | 'E-Rickshaw' | 'Shared Cab' | 'Scooter/Bike' | 'Car';
    vehicleNumber?: string;
  }
): Promise<StudentProfile> {
  const phone = normalizePhoneNumber(rawPhone);
  if (phone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  const cleanOtp = enteredOtp.trim();
  if (!cleanOtp) {
    throw new Error('Please enter the 4-digit OTP sent to your phone.');
  }

  // Check OTP validity
  let expectedOtp = '1234';
  try {
    const raw = localStorage.getItem(DRIVER_OTPS_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map[phone]) {
        expectedOtp = map[phone];
      }
    }
  } catch {
    // ignore
  }

  if (cleanOtp !== expectedOtp && cleanOtp !== '1234') {
    throw new Error('Invalid OTP. Please check the 4-digit code and try again.');
  }

  // Check if driver is the demo driver
  if (phone === '9876511223') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_DRIVER));
    try {
      await setDoc(doc(db, USERS_COLLECTION, DEMO_DRIVER.id), DEMO_DRIVER, { merge: true });
    } catch {
      // ignore
    }
    return DEMO_DRIVER;
  }

  const driverId = `driver_${phone}`;

  // Check if driver profile exists in Firestore database
  let driverProfile: StudentProfile | null = null;
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, driverId));
    if (docSnap.exists()) {
      driverProfile = docSnap.data() as StudentProfile;
    }
  } catch (err) {
    console.warn('Firestore driver fetch warning', err);
  }

  // Check local storage driver cache
  if (!driverProfile) {
    try {
      const raw = localStorage.getItem('reporide_drivers_map');
      if (raw) {
        const map = JSON.parse(raw);
        if (map[phone]) {
          driverProfile = map[phone];
        }
      }
    } catch {
      // ignore
    }
  }

  // If driver doesn't exist yet, register them without student fields or password
  if (!driverProfile) {
    driverProfile = {
      id: driverId,
      uid: driverId,
      name: registrationData?.name?.trim() || `Driver (${phone.slice(-4)})`,
      phone: `+91 ${phone}`,
      accountType: 'driver',
      vehicleType: registrationData?.vehicleType || 'Auto-Rickshaw',
      vehicleNumber: registrationData?.vehicleNumber?.trim() || 'PB 08',
      rating: 5.0,
      totalRides: 0,
      moneySaved: 0,
      verifiedStudent: true
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, USERS_COLLECTION, driverId), driverProfile, { merge: true });
    } catch (err) {
      console.warn('Firestore driver save warning', err);
    }

    // Save locally
    try {
      const raw = localStorage.getItem('reporide_drivers_map');
      const map = raw ? JSON.parse(raw) : {};
      map[phone] = driverProfile;
      localStorage.setItem('reporide_drivers_map', JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(driverProfile));
  return driverProfile;
}

function generateUserId(email: string): string {
  const sanitized = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `user_${sanitized}`;
}

export async function signInWithEmail(email: string, password?: string): Promise<StudentProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password ? password.trim() : '';

  // Check demo accounts
  if (cleanEmail === DEMO_STUDENT_FEMALE.email.toLowerCase() || cleanEmail.includes('priya')) {
    if (cleanPassword && cleanPassword !== 'verto123' && cleanPassword.length < 6) {
      throw new Error('Incorrect password for demo account. Use any password or verto123.');
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_STUDENT_FEMALE));
    try {
      await setDoc(doc(db, USERS_COLLECTION, DEMO_STUDENT_FEMALE.id), DEMO_STUDENT_FEMALE, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning', e);
    }
    return DEMO_STUDENT_FEMALE;
  }
  
  if (cleanEmail === DEMO_STUDENT_MALE.email.toLowerCase() || cleanEmail.includes('aarav') || cleanEmail.includes('12115892')) {
    if (cleanPassword && cleanPassword !== 'verto123' && cleanPassword.length < 6) {
      throw new Error('Incorrect password for demo account. Use any password or verto123.');
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_STUDENT_MALE));
    try {
      await setDoc(doc(db, USERS_COLLECTION, DEMO_STUDENT_MALE.id), DEMO_STUDENT_MALE, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning', e);
    }
    return DEMO_STUDENT_MALE;
  }

  const userId = generateUserId(cleanEmail);

  // Check if profile exists in Firestore database
  let profile: StudentProfile | null = null;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      profile = snap.data() as StudentProfile;
    }
  } catch (err) {
    console.warn('Firestore user fetch error', err);
  }

  // Fallback to local storage registered users list
  if (!profile) {
    try {
      const rawAll = localStorage.getItem('vertoride_registered_users');
      if (rawAll) {
        const usersMap = JSON.parse(rawAll);
        if (usersMap[cleanEmail]) {
          profile = usersMap[cleanEmail];
        }
      }
    } catch (e) {
      console.warn('Local storage user search error', e);
    }
  }

  if (!profile) {
    throw new Error('Account not found with this email or ID. Please register a new student account first.');
  }

  // Verify password if profile has one stored
  if (profile.password && cleanPassword && profile.password !== cleanPassword) {
    throw new Error('Incorrect password. Please verify your password and try again.');
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export async function signUpWithEmail(payload: SignUpPayload): Promise<StudentProfile> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const userId = generateUserId(cleanEmail);
  
  const newProfile: StudentProfile = {
    id: userId,
    uid: userId,
    name: payload.name.trim() || 'Verto Student',
    email: cleanEmail,
    password: payload.password || '',
    regNumber: payload.regNumber.trim() || `${Math.floor(12100000 + Math.random() * 899999)}`,
    course: payload.course?.trim() || 'B.Tech CSE',
    batch: '2024 - 2028',
    avatar: payload.avatar?.trim() || '',
    phone: payload.phone?.trim() || '+91 98000-00000',
    rating: 5.0,
    totalRides: 0,
    moneySaved: 0,
    verifiedStudent: true,
    blockOrHostel: payload.blockOrHostel || (payload.gender === 'Female' ? 'GH-1' : 'BH-1'),
    gender: payload.gender || 'Male',
    accountType: payload.accountType || 'passenger'
  };

  // Persist directly to Cloud Firestore database
  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), newProfile, { merge: true });
  } catch (err) {
    console.warn('Error saving new profile to Firestore', err);
  }

  // Also save in local registered users map for backup offline login
  try {
    const rawAll = localStorage.getItem('vertoride_registered_users');
    const usersMap = rawAll ? JSON.parse(rawAll) : {};
    usersMap[cleanEmail] = newProfile;
    localStorage.setItem('vertoride_registered_users', JSON.stringify(usersMap));
  } catch (e) {
    console.warn('Local storage registration backup error', e);
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
  return newProfile;
}

export async function signOutUser(): Promise<void> {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredSessionUser(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed: StudentProfile = JSON.parse(raw);
    
    if (parsed && parsed.avatar && parsed.avatar.includes('images.unsplash.com')) {
      parsed.avatar = '';
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
    }
    
    return parsed;
  } catch (e) {
    console.error('Failed to parse auth user', e);
    return null;
  }
}

export async function updateStoredUserProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
  const current = getStoredSessionUser() || DEMO_STUDENT_MALE;
  const updated: StudentProfile = {
    ...current,
    ...updates
  };

  // Update in Cloud Firestore database
  const userId = updated.id || updated.uid;
  if (userId) {
    try {
      await setDoc(doc(db, USERS_COLLECTION, userId), updated, { merge: true });
    } catch (err) {
      console.warn('Failed to update Firestore profile doc', err);
    }
  }

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  } catch (storageErr) {
    console.error('Failed to update session storage', storageErr);
    throw new Error('Storage limit reached. Please select a smaller photo.');
  }

  return updated;
}
