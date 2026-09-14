import React from 'react';
import { 
  X, 
  Car, 
  Users, 
  ShieldCheck, 
  KeyRound, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  ArrowRightCircle, 
  HelpCircle,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RoleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole?: (role: 'driver' | 'student') => void;
}

export const RoleComparisonModal: React.FC<RoleComparisonModalProps> = ({
  isOpen,
  onClose,
  onSwitchRole
}) => {
  const { user, loginDemo } = useAuth();
  const currentRole = user?.accountType === 'driver' ? 'driver' : 'passenger';

  if (!isOpen) return null;

  const handleRoleSwitch = async (role: 'driver' | 'student') => {
    if (onSwitchRole) {
      onSwitchRole(role);
    } else {
      await loginDemo(role);
    }
    onClose();
  };

  const COMPARISON_POINTS = [
    {
      feature: 'Who It Is For',
      passenger: 'LPU Students & Campus Residents needing campus transport.',
      driver: 'Campus Auto-Rickshaw, E-Rickshaw, & Authorized Drivers.'
    },
    {
      feature: 'Registration Requirements',
      passenger: 'Full Name, LPU Reg No. (e.g., 12115892), Course, Hostel/Block, & Password.',
      driver: 'Full Name, Mobile Phone, Vehicle Type, & License Plate (e.g., PB 08 BX 4192). NO student ID or hostel needed.'
    },
    {
      feature: 'Login Method',
      passenger: 'LPU Email / Registration ID + Password.',
      driver: 'Phone Number + 6-digit Mobile OTP (No password required).'
    },
    {
      feature: '4-Digit Ride OTP Flow',
      passenger: 'RECEIVES a 4-digit Boarding OTP upon booking. Shows this OTP to the driver when boarding.',
      driver: 'ASKS passenger for their 4-digit OTP. Enters OTP into Driver Console to verify & collect ₹10 fare.'
    },
    {
      feature: 'VertoPay Wallet Capabilities',
      passenger: 'CAN RECHARGE via UPI / Google Pay / PhonePe. Debited ₹10 per verified ride.',
      driver: 'CANNOT ADD FUNDS. Only accumulates fares from verified rides. CAN WITHDRAW to Bank / UPI anytime.'
    },
    {
      feature: 'Primary Dashboard Interface',
      passenger: 'Search campus pickups/destinations (Hostels, UniMall, Main Gate), join rides, track live routes.',
      driver: 'Driver Console: Live student pickup requests, direct 4-digit OTP keypad, trip earnings, and withdraw button.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
        id="role-comparison-modal"
      >
        {/* Header */}
        <div className="bg-black text-white p-6 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Driver vs Passenger: What's the Difference?</h2>
              <p className="text-xs text-neutral-400">Understanding why each role has unique registration, login, and wallet flows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current active user status banner */}
        <div className="bg-neutral-100 p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-500 uppercase tracking-wider">Currently Logged In As:</span>
            <span className={`px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 ${
              currentRole === 'driver' 
                ? 'bg-black text-white' 
                : 'bg-neutral-800 text-white'
            }`}>
              {currentRole === 'driver' ? <Car className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              {user?.name} ({currentRole === 'driver' ? 'Driver PB 08 BX 4192' : 'Student BH-3'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Quick switch demo role:</span>
            {currentRole === 'driver' ? (
              <button
                onClick={() => handleRoleSwitch('student')}
                className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Switch to Student (Aarav)</span>
              </button>
            ) : (
              <button
                onClick={() => handleRoleSwitch('driver')}
                className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Switch to Driver (Gurpreet)</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passenger Role Summary Card */}
            <div className={`p-5 rounded-2xl border-2 transition-all ${
              currentRole === 'passenger' 
                ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10' 
                : 'border-neutral-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-black">Passenger (Student)</h3>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Ride Booker</span>
                  </div>
                </div>
                {currentRole === 'passenger' && (
                  <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-full">
                    Active Mode
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Student Auth:</strong> Registers with LPU Reg No, Course, & Hostel. Logs in with password.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Booking:</strong> Searches campus routes and books rides for fixed ₹10 fare.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>OTP Generation:</strong> App generates a 4-digit Boarding OTP to show the driver.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Wallet:</strong> Can recharge via UPI / Cards to pay ₹10 campus fare.</span>
                </li>
              </ul>
            </div>

            {/* Driver Role Summary Card */}
            <div className={`p-5 rounded-2xl border-2 transition-all ${
              currentRole === 'driver' 
                ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10' 
                : 'border-neutral-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-black">Campus Driver</h3>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Vehicle Operator</span>
                  </div>
                </div>
                {currentRole === 'driver' && (
                  <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-full">
                    Active Mode
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Driver Auth:</strong> Registers Vehicle Type & Plate Number. Logs in with <strong>Mobile OTP (no password)</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Console:</strong> Sees student pickup requests across campus & accepted trips.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>OTP Verification:</strong> Enters passenger's 4-digit OTP to instantly collect ₹10.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Wallet:</strong> Cannot add money. Withdraws received earnings to UPI / Bank.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-12 bg-neutral-900 text-white text-xs font-bold p-3">
              <div className="col-span-3">Feature / Flow</div>
              <div className="col-span-4 border-l border-neutral-700 pl-3">Passenger (Student)</div>
              <div className="col-span-5 border-l border-neutral-700 pl-3">Driver (Campus Auto)</div>
            </div>

            <div className="divide-y divide-neutral-200">
              {COMPARISON_POINTS.map((pt, idx) => (
                <div key={idx} className="grid grid-cols-12 p-3 text-xs gap-2 hover:bg-neutral-50 transition-colors">
                  <div className="col-span-3 font-bold text-black flex items-center">
                    {pt.feature}
                  </div>
                  <div className="col-span-4 text-neutral-700 border-l border-neutral-200 pl-3">
                    {pt.passenger}
                  </div>
                  <div className="col-span-5 text-neutral-800 font-medium border-l border-neutral-200 pl-3 bg-neutral-50/50 p-1 rounded-lg">
                    {pt.driver}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Takeaway Notice */}
          <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-2xl flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-black">Why are drivers exempt from LPU Student Registration & Passwords?</p>
              <p className="text-neutral-600 leading-relaxed">
                Campus auto-rickshaw and van drivers are external transport operators, not university students. Therefore, they do not possess LPU student registration numbers, academic courses, or hostel allocations. To ensure frictionless campus operations, drivers register with vehicle credentials and authenticate swiftly via verified mobile phone OTP.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-medium">
            REPORIDE Campus Transit • LPU Smart Mobility
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
};
