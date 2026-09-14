import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { RepoRideLogo } from './RepoRideLogo';
import { UserAvatar } from './UserAvatar';
import { getInitials, compressProfileImage } from '../utils/avatarUtils';
import { VehicleType } from '../types';
import { RoleComparisonModal } from './RoleComparisonModal';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone,
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Upload,
  X,
  Car,
  KeyRound,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { 
    signIn, 
    signUp, 
    signInDriverWithOtp, 
    sendDriverOtp, 
    loginDemo, 
    error, 
    clearError 
  } = useAuth();
  
  const [activeMode, setActiveMode] = useState<'signin' | 'signup'>('signin');
  const [signInRole, setSignInRole] = useState<'passenger' | 'driver'>('passenger');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  // Student / Passenger Sign In State
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Driver Sign In State (Phone + OTP, No Password)
  const [driverSignInPhone, setDriverSignInPhone] = useState<string>('9876511223');
  const [driverSignInOtp, setDriverSignInOtp] = useState<string>('');
  const [isDriverSignInOtpSent, setIsDriverSignInOtpSent] = useState<boolean>(false);
  const [driverSignInOtpHint, setDriverSignInOtpHint] = useState<string | null>(null);
  const [isSendingDriverOtp, setIsSendingDriverOtp] = useState<boolean>(false);

  // Student / Passenger Sign Up State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    regNumber: '',
    course: 'B.Tech Computer Science & Engineering',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    blockOrHostel: 'BH-3',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    agreeTerms: true,
    accountType: 'passenger' as 'passenger' | 'driver'
  });

  // Driver Sign Up State (No LPU ID, No Reg No, No Hostel, No Password - OTP based)
  const [driverSignUpData, setDriverSignUpData] = useState<{
    name: string;
    phone: string;
    vehicleType: VehicleType;
    vehicleNumber: string;
    otp: string;
  }>({
    name: '',
    phone: '',
    vehicleType: 'Auto-Rickshaw',
    vehicleNumber: '',
    otp: ''
  });
  const [isDriverSignUpOtpSent, setIsDriverSignUpOtpSent] = useState<boolean>(false);
  const [driverSignUpOtpHint, setDriverSignUpOtpHint] = useState<string | null>(null);
  const [isSendingSignUpOtp, setIsSendingSignUpOtp] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setValidationError('Image size must be less than 8MB.');
      return;
    }

    setValidationError(null);
    try {
      const compressed = await compressProfileImage(file, 320, 0.85);
      setSignUpData((prev) => ({ ...prev, avatar: compressed }));
    } catch {
      setValidationError('Failed to process image. Please try another photo.');
    }
  };

  const handleRemovePhoto = () => {
    setSignUpData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const coursesList = [
    'B.Tech Computer Science & Engineering',
    'B.Tech Mechanical Engineering',
    'B.Tech Electronics & Communication',
    'B.Tech Civil Engineering',
    'B.Des Fashion & Product Design',
    'MBA - Mittal School of Business',
    'BBA / Commerce',
    'School of Law (BA LLB / BBA LLB)',
    'School of Agriculture & Bio-Sciences',
    'School of Pharmaceutical Sciences',
    'BCA / MCA Information Technology',
    'Day Scholar / Postgraduate Research'
  ];

  const residencesList = [
    'BH-1 (Boys Hostel 1)',
    'BH-2 (Boys Hostel 2)',
    'BH-3 (Boys Hostel 3)',
    'BH-4 (Boys Hostel 4)',
    'BH-5 (Boys Hostel 5)',
    'BH-6 (Boys Hostel 6)',
    'BH-7 (Boys Hostel 7)',
    'BH-8 (Boys Hostel 8)',
    'BH-9 (Boys Hostel 9)',
    'BH-10 to 13 Complex',
    'GH-1 (Girls Hostel 1)',
    'GH-2 (Girls Hostel 2)',
    'GH-3 (Girls Hostel 3)',
    'GH-4 (Girls Hostel 4)',
    'GH-5 (Girls Hostel 5)',
    'GH-6 (Girls Hostel 6)',
    'GH-7 to 13 Complex',
    'Law Gate PG / Market Area',
    'Maheshwari Colony / Phagwara Road',
    'Day Scholar (Jalandhar / Phagwara)'
  ];

  // Passenger Sign In (Email / Reg No + Password)
  const handlePassengerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!signInEmail.trim()) {
      setValidationError('Please enter your email address or registration number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(signInEmail.trim(), signInPassword);
    } catch {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Driver Send Sign-In OTP
  const handleSendDriverSignInOtp = async () => {
    setValidationError(null);
    clearError();
    const cleanPhone = driverSignInPhone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingDriverOtp(true);
    try {
      const res = await sendDriverOtp(cleanPhone);
      setIsDriverSignInOtpSent(true);
      setDriverSignInOtpHint(res.otp);
      setDriverSignInOtp(res.otp); // pre-populate for quick testing
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to send OTP.');
    } finally {
      setIsSendingDriverOtp(false);
    }
  };

  // Driver Sign In With OTP (No Password!)
  const handleDriverSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const cleanPhone = driverSignInPhone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit driver mobile number.');
      return;
    }

    if (!driverSignInOtp.trim()) {
      setValidationError('Please enter the 4-digit OTP sent to your mobile phone.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInDriverWithOtp(cleanPhone, driverSignInOtp.trim());
    } catch {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Passenger Sign Up (Student Profile with LPU ID, Reg Number, Hostel, Password)
  const handlePassengerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!signUpData.name.trim()) {
      setValidationError('Please enter your Full Name as per your LPU ID.');
      return;
    }
    if (!signUpData.regNumber.trim()) {
      setValidationError('Please enter your LPU Registration Number (e.g. 12104523).');
      return;
    }
    if (!signUpData.email.trim()) {
      setValidationError('Please enter your email address.');
      return;
    }
    if (!signUpData.password) {
      setValidationError('Please create a password for your account.');
      return;
    }
    if (signUpData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setValidationError('Passwords do not match. Please verify.');
      return;
    }
    if (!signUpData.agreeTerms) {
      setValidationError('Please agree to the campus transit policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
        regNumber: signUpData.regNumber,
        course: signUpData.course,
        phone: signUpData.phone || '+91 98000-00000',
        gender: signUpData.gender,
        blockOrHostel: signUpData.blockOrHostel,
        avatar: signUpData.avatar || '',
        accountType: 'passenger'
      });
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  // Driver Send Sign-Up OTP
  const handleSendDriverSignUpOtp = async () => {
    setValidationError(null);
    clearError();

    if (!driverSignUpData.name.trim()) {
      setValidationError('Please enter your driver full name.');
      return;
    }

    const cleanPhone = driverSignUpData.phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingSignUpOtp(true);
    try {
      const res = await sendDriverOtp(cleanPhone);
      setIsDriverSignUpOtpSent(true);
      setDriverSignUpOtpHint(res.otp);
      setDriverSignUpData((prev) => ({ ...prev, otp: res.otp }));
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to send OTP.');
    } finally {
      setIsSendingSignUpOtp(false);
    }
  };

  // Driver Sign Up With OTP (No Password, No LPU Reg Number, No Hostel)
  const handleDriverSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!driverSignUpData.name.trim()) {
      setValidationError('Please enter driver name.');
      return;
    }

    const cleanPhone = driverSignUpData.phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!driverSignUpData.otp.trim()) {
      setValidationError('Please click "Send OTP" and enter the 4-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInDriverWithOtp(cleanPhone, driverSignUpData.otp.trim(), {
        name: driverSignUpData.name.trim(),
        vehicleType: driverSignUpData.vehicleType,
        vehicleNumber: driverSignUpData.vehicleNumber.trim() || 'PB 08 BX 4192'
      });
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 text-neutral-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-xl mx-auto text-center space-y-3 z-10">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Campus Transit & Rideshare Portal</span>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="scale-110 sm:scale-125 py-2">
            <RepoRideLogo inverted />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
          Official campus carpooling, auto-sharing, and transit coordination. Students sign in with credentials; drivers login via phone OTP.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-xl mx-auto my-6 z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 text-neutral-900 overflow-hidden">
          
          {/* Tabs: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 p-1.5 bg-neutral-100 border-b border-neutral-200">
            <button
              type="button"
              id="tab-btn-signin"
              onClick={() => {
                setActiveMode('signin');
                setValidationError(null);
                clearError();
              }}
              className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition-all cursor-pointer text-center ${
                activeMode === 'signin'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-btn-signup"
              onClick={() => {
                setActiveMode('signup');
                setValidationError(null);
                clearError();
              }}
              className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition-all cursor-pointer text-center ${
                activeMode === 'signup'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* Error Message */}
            {(error || validationError) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {validationError || error}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValidationError(null);
                    clearError();
                  }}
                  className="text-rose-500 hover:text-rose-800 p-0.5 rounded-lg cursor-pointer"
                  title="Dismiss message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ============================================================ */}
            {/* SIGN IN TAB */}
            {/* ============================================================ */}
            {activeMode === 'signin' && (
              <div className="space-y-5">
                {/* Role Switcher: Passenger vs Driver */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                    <span>Select Login Account Type</span>
                    <span className="text-[11px] font-normal text-neutral-500">
                      {signInRole === 'driver' ? 'Phone OTP (No password)' : 'Email & Password'}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInRole('passenger');
                        setValidationError(null);
                        clearError();
                      }}
                      className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        signInRole === 'passenger'
                          ? 'bg-white text-black shadow-xs font-extrabold'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Passenger / Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInRole('driver');
                        setValidationError(null);
                        clearError();
                      }}
                      className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        signInRole === 'driver'
                          ? 'bg-black text-white shadow-xs font-extrabold'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Driver (OTP Login)</span>
                    </button>
                  </div>
                </div>

                {/* PASSENGER SIGN IN FORM */}
                {signInRole === 'passenger' && (
                  <form onSubmit={handlePassengerSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                        <span>Email Address or Reg Number</span>
                        <span className="text-[11px] font-normal text-neutral-400">e.g. 12115892 or student email</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          id="signin-email-input"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          placeholder="e.g. aarav.12115892@lpu.in or 12115892"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowHelpModal(true)}
                          className="text-[11px] text-neutral-800 hover:underline font-semibold cursor-pointer"
                        >
                          Need Help?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="signin-password-input"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="Enter your student password"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                        />
                        <span>Remember this device on campus</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      id="submit-signin-btn"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-black hover:bg-neutral-800 text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In as Passenger</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* DRIVER SIGN IN FORM (OTP ONLY - NO PASSWORD) */}
                {signInRole === 'driver' && (
                  <form onSubmit={handleDriverSignIn} className="space-y-4">
                    {/* Notice for drivers */}
                    <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-700 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-black">
                        <Smartphone className="w-4 h-4" />
                        <span>Driver OTP Login (No Password Required)</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        Drivers log in securely with their mobile number and a 4-digit OTP. No password or student ID is required.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                        <span>Driver Mobile Number</span>
                        <span className="text-[11px] text-neutral-500 font-mono">10 digits</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 text-xs font-mono font-bold">
                            +91
                          </div>
                          <input
                            type="tel"
                            id="driver-signin-phone-input"
                            value={driverSignInPhone}
                            onChange={(e) => setDriverSignInPhone(e.target.value)}
                            placeholder="e.g. 98765 11223"
                            maxLength={10}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendDriverSignInOtp}
                          disabled={isSendingDriverOtp}
                          className="px-4 py-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          {isSendingDriverOtp ? 'Sending...' : isDriverSignInOtpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      </div>
                    </div>

                    {/* OTP Input Field */}
                    {isDriverSignInOtpSent && (
                      <div className="space-y-2 animate-in fade-in">
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>OTP sent to +91 {driverSignInPhone}</span>
                          </span>
                          {driverSignInOtpHint && (
                            <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-900 text-[11px]">
                              Code: {driverSignInOtpHint}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                            <span>Enter 4-Digit OTP</span>
                            <span className="text-[11px] text-neutral-500 font-medium">Auto-filled for testing</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                              <KeyRound className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              id="driver-signin-otp-input"
                              maxLength={4}
                              value={driverSignInOtp}
                              onChange={(e) => setDriverSignInOtp(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="e.g. 1234"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm font-mono tracking-widest font-extrabold focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      id="submit-driver-signin-btn"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-black hover:bg-neutral-800 text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Verify OTP & Sign In as Driver</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-[11px] text-center text-neutral-500 pt-2 border-t border-neutral-100">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveMode('signup')}
                    className="font-bold text-black hover:underline cursor-pointer"
                  >
                    Register new account here
                  </button>
                </p>
              </div>
            )}

            {/* ============================================================ */}
            {/* SIGN UP TAB */}
            {/* ============================================================ */}
            {activeMode === 'signup' && (
              <div className="space-y-5">
                {/* Account Role Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Select Registration Role</label>
                  <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSignUpData({ ...signUpData, accountType: 'passenger' });
                        setValidationError(null);
                        clearError();
                      }}
                      className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                        signUpData.accountType === 'passenger'
                          ? 'bg-white text-black shadow-xs font-extrabold'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Passenger (Student)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignUpData({ ...signUpData, accountType: 'driver' });
                        setValidationError(null);
                        clearError();
                      }}
                      className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                        signUpData.accountType === 'driver'
                          ? 'bg-black text-white shadow-xs font-extrabold'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Driver (Vehicle Operator)</span>
                    </button>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* PASSENGER / STUDENT SIGN UP FORM */}
                {/* -------------------------------------------------------- */}
                {signUpData.accountType === 'passenger' && (
                  <form onSubmit={handlePassengerSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Full Name (as per LPU ID)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          id="signup-name-input"
                          value={signUpData.name}
                          onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Registration Number</label>
                        <input
                          type="text"
                          id="signup-reg-input"
                          value={signUpData.regNumber}
                          onChange={(e) => setSignUpData({ ...signUpData, regNumber: e.target.value })}
                          placeholder="e.g. 12104523"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Gender</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['Male', 'Female', 'Other'] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setSignUpData({ ...signUpData, gender: g })}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                                signUpData.gender === g
                                  ? 'bg-black text-white shadow-2xs'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                        <span>Email Address</span>
                        <span className="text-[10px] text-neutral-500 font-semibold">Any email works</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          id="signup-email-input"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          placeholder="e.g. name@gmail.com or student@lpu.in"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Academic Program</label>
                        <select
                          value={signUpData.course}
                          onChange={(e) => setSignUpData({ ...signUpData, course: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white"
                        >
                          {coursesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Hostel or Residence</label>
                        <select
                          value={signUpData.blockOrHostel}
                          onChange={(e) => setSignUpData({ ...signUpData, blockOrHostel: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white"
                        >
                          {residencesList.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          id="signup-phone-input"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                          placeholder="+91 98765-43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Create Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="signup-password-input"
                            value={signUpData.password}
                            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                            placeholder="At least 6 chars"
                            required
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="signup-confirmpass-input"
                            value={signUpData.confirmPassword}
                            onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                            placeholder="Re-enter password"
                            required
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-neutral-800 block">Profile Picture (Optional)</span>
                          <span className="text-[11px] text-neutral-500">Upload a photo or use your initials badge</span>
                        </div>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        id="signup-photo-upload-input"
                      />

                      <div className="flex items-center gap-3.5 p-2.5 bg-white rounded-xl border border-neutral-200">
                        <UserAvatar
                          name={signUpData.name || 'Verto Student'}
                          avatar={signUpData.avatar}
                          size="lg"
                        />

                        <div className="flex-1 min-w-0">
                          {signUpData.avatar ? (
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Custom Photo Selected
                              </span>
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                              >
                                Remove photo
                              </button>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs font-bold text-neutral-800 block">
                                Initials Badge: <span className="text-black font-mono font-black">{getInitials(signUpData.name || 'Verto Student')}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-xl text-black hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer shrink-0"
                          title="Choose photo file"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-600">
                        <input
                          type="checkbox"
                          checked={signUpData.agreeTerms}
                          onChange={(e) => setSignUpData({ ...signUpData, agreeTerms: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded text-black focus:ring-black border-neutral-300"
                        />
                        <span className="leading-snug text-[11px]">
                          I agree to the <strong>LPU Campus Transit Policy</strong>, fixed ₹10-₹15 campus fare regulations, and student co-rider safety terms.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      id="submit-signup-btn"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-black hover:bg-neutral-800 text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Complete Student Registration & Enter</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* DRIVER SIGN UP FORM (OTP ONLY - NO PASSWORD, NO LPU ID, NO HOSTEL) */}
                {/* -------------------------------------------------------- */}
                {signUpData.accountType === 'driver' && (
                  <form onSubmit={handleDriverSignUp} className="space-y-4">
                    {/* Notice for drivers */}
                    <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-700 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-black">
                        <Sparkles className="w-4 h-4" />
                        <span>Driver Quick Registration (Via Phone OTP)</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        Drivers are registered without student registration numbers, hostel blocks, or passwords. Authentication is handled exclusively via phone OTP.
                      </p>
                    </div>

                    {/* Driver Name (NOT "as per LPU ID") */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Driver Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          id="driver-signup-name-input"
                          value={driverSignUpData.name}
                          onChange={(e) => setDriverSignUpData({ ...driverSignUpData, name: e.target.value })}
                          placeholder="e.g. Gurpreet Singh"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Vehicle Type & Vehicle Number Plate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Vehicle Type</label>
                        <select
                          value={driverSignUpData.vehicleType}
                          onChange={(e) => setDriverSignUpData({ ...driverSignUpData, vehicleType: e.target.value as VehicleType })}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white font-medium"
                        >
                          <option value="Auto-Rickshaw">Auto-Rickshaw (3-Wheeler)</option>
                          <option value="E-Rickshaw">E-Rickshaw (Electric Campus)</option>
                          <option value="Shared Cab">Shared Cab (Maruti / Tata)</option>
                          <option value="Scooter/Bike">Scooter / Bike</option>
                          <option value="Car">Car (4-Seater)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-700">Vehicle Number Plate</label>
                        <input
                          type="text"
                          id="driver-signup-plate-input"
                          value={driverSignUpData.vehicleNumber}
                          onChange={(e) => setDriverSignUpData({ ...driverSignUpData, vehicleNumber: e.target.value })}
                          placeholder="e.g. PB 08 BX 4192"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all uppercase"
                        />
                      </div>
                    </div>

                    {/* Mobile Number & OTP Verification */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                        <span>Mobile Phone Number</span>
                        <span className="text-[11px] text-neutral-500 font-mono">10 digits</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 text-xs font-mono font-bold">
                            +91
                          </div>
                          <input
                            type="tel"
                            id="driver-signup-phone-input"
                            value={driverSignUpData.phone}
                            onChange={(e) => setDriverSignUpData({ ...driverSignUpData, phone: e.target.value })}
                            placeholder="98765 11223"
                            maxLength={10}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-xs sm:text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-black focus:bg-white transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendDriverSignUpOtp}
                          disabled={isSendingSignUpOtp}
                          className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          {isSendingSignUpOtp ? 'Sending...' : isDriverSignUpOtpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      </div>
                    </div>

                    {/* OTP Input for Driver Registration */}
                    {isDriverSignUpOtpSent && (
                      <div className="space-y-2 animate-in fade-in">
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>OTP sent to +91 {driverSignUpData.phone}</span>
                          </span>
                          {driverSignUpOtpHint && (
                            <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-900 text-[11px]">
                              Code: {driverSignUpOtpHint}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                            <span>Enter 4-Digit OTP</span>
                            <span className="text-[11px] text-neutral-500 font-medium">Auto-filled</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                              <KeyRound className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              id="driver-signup-otp-input"
                              maxLength={4}
                              value={driverSignUpData.otp}
                              onChange={(e) => setDriverSignUpData({ ...driverSignUpData, otp: e.target.value.replace(/[^0-9]/g, '') })}
                              placeholder="e.g. 1234"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 text-sm font-mono tracking-widest font-extrabold focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>By registering, you confirm you are an authorized campus vehicle operator.</span>
                    </div>

                    <button
                      type="submit"
                      id="submit-driver-signup-btn"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-black hover:bg-neutral-800 text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Verify OTP & Complete Driver Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-[11px] text-center text-neutral-500 pt-1 border-t border-neutral-100">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveMode('signin')}
                    className="font-bold text-black hover:underline cursor-pointer"
                  >
                    Sign in to your account
                  </button>
                </p>
              </div>
            )}

          </div>

          {/* Card Footer */}
          <div className="bg-neutral-50 p-4 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px]">Protected Campus Auth • OTP Verified</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">REPORIDE v2.0</span>
          </div>

        </div>
      </div>

      {/* Feature Badges */}
      <div className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-neutral-300 z-10 pt-2">
        <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs py-2 px-3 rounded-xl border border-white/10">
          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-200" />
          <span>Fixed ₹10 Campus Fare</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs py-2 px-3 rounded-xl border border-white/10">
          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-200" />
          <span>Driver OTP Login (No Password)</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xs py-2 px-3 rounded-xl border border-white/10">
          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-200" />
          <span>Instant Ride Transfer with OTP</span>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-neutral-900 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-black flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">Account Help</h3>
                  <span className="text-xs text-neutral-500">Sign In Assistance</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
              <p>
                <strong>Students / Passengers:</strong> Enter your LPU registration number or registered email and your password to sign in.
              </p>
              <p>
                <strong>Drivers:</strong> Click the "Driver (OTP Login)" tab. Enter your 10-digit mobile number, receive your 4-digit verification code, and sign in directly without a password or student ID.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 cursor-pointer"
            >
              Got it, return to Sign In
            </button>
          </div>
        </div>
      )}

      {/* Role Comparison Modal */}
      <RoleComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
      />

    </div>
  );
};
