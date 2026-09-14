import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, SignUpPayload, VehicleType } from '../types';
import { 
  getStoredSessionUser, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  updateStoredUserProfile,
  sendDriverOtp as sendDriverOtpService,
  verifyDriverOtpAndSignIn as verifyDriverOtpService,
  DEMO_STUDENT_MALE,
  DEMO_STUDENT_FEMALE,
  DEMO_DRIVER
} from '../services/authService';

interface AuthContextType {
  user: StudentProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signInDriverWithOtp: (
    phone: string, 
    otp: string, 
    registrationData?: { name: string; vehicleType?: VehicleType; vehicleNumber?: string }
  ) => Promise<void>;
  sendDriverOtp: (phone: string) => Promise<{ success: boolean; otp: string; message: string }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<StudentProfile>) => Promise<void>;
  loginDemo: (type: 'male' | 'female' | 'student' | 'driver') => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = getStoredSessionUser();
      if (stored) {
        setUser(stored);
      }
    } catch (e) {
      console.error('Error loading session user', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password?: string) => {
    setError(null);
    setLoading(true);
    try {
      const loggedIn = await signInWithEmail(email, password);
      setUser(loggedIn);
    } catch (err: any) {
      const msg = err?.message || 'Failed to sign in. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (payload: SignUpPayload) => {
    setError(null);
    setLoading(true);
    try {
      const created = await signUpWithEmail(payload);
      setUser(created);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create account. Please check your details.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInDriverWithOtp = async (
    phone: string, 
    otp: string, 
    registrationData?: { name: string; vehicleType?: VehicleType; vehicleNumber?: string }
  ) => {
    setError(null);
    setLoading(true);
    try {
      const loggedIn = await verifyDriverOtpService(phone, otp, registrationData);
      setUser(loggedIn);
    } catch (err: any) {
      const msg = err?.message || 'Failed to verify driver OTP.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendDriverOtp = async (phone: string) => {
    setError(null);
    try {
      return await sendDriverOtpService(phone);
    } catch (err: any) {
      const msg = err?.message || 'Failed to send OTP to driver mobile.';
      setError(msg);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<StudentProfile>) => {
    try {
      const updated = await updateStoredUserProfile(updates);
      setUser(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
      throw err;
    }
  };

  const loginDemo = async (type: 'male' | 'female' | 'student' | 'driver') => {
    if (type === 'driver') {
      setUser(DEMO_DRIVER);
      localStorage.setItem('vertoride_auth_user', JSON.stringify(DEMO_DRIVER));
      return;
    }
    const demo = type === 'male' || type === 'student' ? DEMO_STUDENT_MALE : DEMO_STUDENT_FEMALE;
    await signIn(demo.email, 'verto123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInDriverWithOtp,
        sendDriverOtp,
        signOut,
        updateUser,
        loginDemo,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
