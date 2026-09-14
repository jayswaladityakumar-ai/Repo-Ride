import React from 'react';
import { Ride } from '../types';
import { 
  X, 
  Car, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

interface TrackRideModalProps {
  ride: Ride | null;
  onClose: () => void;
}

export const TrackRideModal: React.FC<TrackRideModalProps> = ({
  ride,
  onClose
}) => {
  if (!ride) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xl shrink-0">
            {ride.vehicleType === 'E-Rickshaw' ? '🛺' : (ride.vehicleType === 'Auto-Rickshaw' ? '🚕' : '🚗')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Live Transit Tracking
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {ride.driver.name}'s {ride.vehicleType}
            </h2>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Auto Location:</span>
            <span className="font-extrabold text-emerald-400 bg-white/10 px-2.5 py-1 rounded-md">
              {ride.currentLocationName}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-slate-300">Origin:</span>
              <span className="font-bold text-white">{ride.pickup.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-300">Destination:</span>
              <span className="font-bold text-white">{ride.destination.name}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Est. Arrival Time:</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {ride.estimatedArrival} ({ride.departureTime})
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Route Stops & Milestones
          </h4>
          <div className="space-y-2">
            {ride.routeStops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                  {i + 1}
                </span>
                <span className="font-bold text-slate-800">{stop}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
          <a
            href={`tel:${ride.driver.phone}`}
            className="flex-1 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Driver ({ride.driver.phone})</span>
          </a>

          <a
            href="https://maps.app.goo.gl/9mhLf4ZKg2RzUr2F9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};
