import React from 'react';
import { Building } from 'lucide-react';

interface HostelSelectorProps {
  type: 'BH' | 'GH';
  value: number; // 1 to 13
  onChange: (hostelNum: number) => void;
  label?: string;
  theme?: 'indigo' | 'purple' | 'slate';
}

export const HostelSelector: React.FC<HostelSelectorProps> = ({
  type,
  value,
  onChange,
  label,
  theme = 'indigo'
}) => {
  const isBH = type === 'BH';
  const prefix = isBH ? 'BH' : 'GH';
  const fullName = isBH ? 'Boys Hostel' : 'Girls Hostel';

  const themeClasses = {
    indigo: {
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200',
      badge: 'bg-indigo-600 text-white',
      pillActive: 'bg-indigo-600 text-white shadow-xs',
      pillInactive: 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-100/50'
    },
    purple: {
      bg: 'bg-purple-50/80',
      border: 'border-purple-200',
      badge: 'bg-purple-600 text-white',
      pillActive: 'bg-purple-600 text-white shadow-xs',
      pillInactive: 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100/50'
    },
    slate: {
      bg: 'bg-slate-100/80',
      border: 'border-slate-300',
      badge: 'bg-slate-800 text-white',
      pillActive: 'bg-slate-800 text-white shadow-xs',
      pillInactive: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-200'
    }
  }[theme];

  return (
    <div className={`mt-2.5 p-3 rounded-2xl ${themeClasses.bg} border ${themeClasses.border} space-y-2 animate-in fade-in slide-in-from-top-1`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>{label || `Select ${fullName} Number (1 to 13):`}</span>
        </div>
        <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-md ${themeClasses.badge}`}>
          {prefix}-{value}
        </span>
      </div>

      <div className="pt-0.5">
        <div className="flex flex-wrap items-center gap-1">
          {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                id={`hostel-quick-${prefix}-${num}`}
                onClick={() => onChange(num)}
                className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected ? themeClasses.pillActive : themeClasses.pillInactive
                }`}
              >
                {prefix}-{num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
