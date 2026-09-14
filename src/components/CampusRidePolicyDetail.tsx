import React from 'react';
import { Info } from 'lucide-react';

interface CampusRidePolicyDetailProps {
  className?: string;
}

export const CampusRidePolicyDetail: React.FC<CampusRidePolicyDetailProps> = ({ className = '' }) => {
  return (
    <div
      id="campus-ride-policy-detail"
      className={`mt-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 space-y-1 ${className}`}
    >
      <div className="flex items-center gap-2 font-bold text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>Campus Ride Fare Policy & Guidelines:</span>
      </div>
      <p className="text-slate-600 leading-relaxed pl-6 text-[11px]">
        Standard campus ride-sharing fare is nominal (<strong>₹10 to ₹15 per student</strong> for e-rickshaws and autos traveling between campus gates, academic blocks, and hostel blocks BH/GH 1–13). Fares are split equally among co-passengers upon boarding. Zero surge pricing or booking fees.
      </p>
    </div>
  );
};
