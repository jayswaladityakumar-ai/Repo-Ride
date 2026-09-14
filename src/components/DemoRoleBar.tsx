import React, { useState } from 'react';
import { 
  Car, 
  Users, 
  HelpCircle, 
  ArrowRight, 
  KeyRound, 
  ShieldCheck, 
  Sparkles,
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleComparisonModal } from './RoleComparisonModal';
import { PageTab } from '../types';

interface DemoRoleBarProps {
  currentTab: PageTab;
  onNavigate: (tab: PageTab) => void;
}

export const DemoRoleBar: React.FC<DemoRoleBarProps> = ({ currentTab, onNavigate }) => {
  const { user, loginDemo } = useAuth();
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!user) return null;

  const isDriver = user.accountType === 'driver';

  const handleSwitchDemo = async (targetRole: 'driver' | 'student') => {
    setIsSwitching(true);
    try {
      await loginDemo(targetRole);
      if (targetRole === 'driver') {
        onNavigate('driver-dashboard');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <>
      <div 
        id="demo-role-status-bar"
        className={`border-b transition-all ${
          isDriver 
            ? 'bg-neutral-900 text-white border-neutral-800' 
            : 'bg-white text-black border-neutral-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            
            {/* Left: Role indicator badge & details */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full font-black text-[11px] tracking-wider uppercase flex items-center gap-1.5 shadow-xs ${
                isDriver 
                  ? 'bg-white text-black' 
                  : 'bg-black text-white'
              }`}>
                {isDriver ? <Car className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                {isDriver ? 'Driver Console Active' : 'Student Passenger Active'}
              </span>

              <div className="flex items-center gap-2 font-medium">
                <span className="font-bold">
                  {user.name}
                </span>
                <span className={`text-[11px] ${isDriver ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {isDriver 
                    ? `• Auto-Rickshaw (${user.vehicleNumber || 'PB 08 BX 4192'}) • Collects ₹10 with OTP` 
                    : `• LPU Reg: ${user.regNumber || '12115892'} (${user.blockOrHostel || 'BH-3'}) • Fixed ₹10 Rides`
                  }
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Compare Differences button */}
              <button
                type="button"
                id="btn-compare-roles"
                onClick={() => setIsComparisonOpen(true)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isDriver 
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700' 
                    : 'bg-neutral-100 hover:bg-neutral-200 text-black border-neutral-300'
                }`}
                title="View difference between Driver and Passenger"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>What's the difference?</span>
              </button>

              {/* Quick switch button */}
              {isDriver ? (
                <button
                  type="button"
                  id="btn-switch-to-student"
                  disabled={isSwitching}
                  onClick={() => handleSwitchDemo('student')}
                  className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Switch to Student Passenger Demo"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isSwitching ? 'Switching...' : 'Switch to Student (Aarav)'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-switch-to-driver"
                  disabled={isSwitching}
                  onClick={() => handleSwitchDemo('driver')}
                  className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Switch to Driver Demo"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isSwitching ? 'Switching...' : 'Switch to Driver (Gurpreet)'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <RoleComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSwitchRole={handleSwitchDemo}
      />
    </>
  );
};
