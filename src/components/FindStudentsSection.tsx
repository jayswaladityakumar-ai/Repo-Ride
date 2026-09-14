import React, { useState, useMemo } from 'react';
import { Ride, StudentProfile } from '../types';
import { LPU_LOCATIONS } from '../data/lpuData';
import { findMatchingRides } from '../utils/rideMatching';
import { HostelSelector } from './HostelSelector';
import { CampusRidePolicyDetail } from './CampusRidePolicyDetail';
import { 
  Users, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Compass,
  PlusCircle
} from 'lucide-react';

interface FindStudentsSectionProps {
  rides: Ride[];
  onJoinRide: (ride: Ride) => void;
  onOpenCreateRide: () => void;
  currentUser?: StudentProfile;
}

export const FindStudentsSection: React.FC<FindStudentsSectionProps> = ({
  rides,
  onJoinRide,
  onOpenCreateRide,
  currentUser
}) => {
  const isDriver = currentUser?.accountType === 'driver';
  const [currentLocationId, setCurrentLocationId] = useState<string>('loc-maingate');
  const [currentHostelNo, setCurrentHostelNo] = useState<number>(1);
  const [targetDestinationId, setTargetDestinationId] = useState<string>('loc-unimall');
  const [targetHostelNo, setTargetHostelNo] = useState<number>(1);
  const [seatsNeeded, setSeatsNeeded] = useState<number>(1);
  const [maxWalkDistanceKm, setMaxWalkDistanceKm] = useState<number>(1.5);
  const [isGirlsOnlyFilter, setIsGirlsOnlyFilter] = useState<boolean>(false);

  const isCurrentHostel = currentLocationId === 'loc-bh' || currentLocationId === 'loc-gh';
  const currentHostelType = currentLocationId === 'loc-bh' ? 'BH' : 'GH';

  const isTargetHostel = targetDestinationId === 'loc-bh' || targetDestinationId === 'loc-gh';
  const targetHostelType = targetDestinationId === 'loc-bh' ? 'BH' : 'GH';

  const matchResults = useMemo(() => {
    return findMatchingRides(
      rides,
      currentLocationId,
      targetDestinationId,
      seatsNeeded,
      {
        maxDistanceKm: maxWalkDistanceKm,
        girlsOnlyOnly: isGirlsOnlyFilter
      }
    );
  }, [rides, currentLocationId, targetDestinationId, seatsNeeded, maxWalkDistanceKm, isGirlsOnlyFilter]);

  const selectedPickup = LPU_LOCATIONS.find(l => l.id === currentLocationId) || LPU_LOCATIONS[0];
  const selectedDest = LPU_LOCATIONS.find(l => l.id === targetDestinationId) || LPU_LOCATIONS[1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Campus Seat & Route Match</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Students Going Your Way
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect with LPU classmates who have already booked campus autos, e-rickshaws, or cabs and are looking to fill empty seats.
          </p>
        </div>

        {isDriver && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateRide}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Empty Seats</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-indigo-600" />
              Where are you right now?
            </label>
            <select
              value={currentLocationId}
              onChange={(e) => setCurrentLocationId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <optgroup label="Campus Gates & Hubs">
                {LPU_LOCATIONS.filter(l => l.category === 'Campus Gate' || l.category === 'Campus Hub').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Hostel Blocks">
                {LPU_LOCATIONS.filter(l => l.category === 'Hostel').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Academic & Sports">
                {LPU_LOCATIONS.filter(l => l.category === 'Academic Block' || l.category === 'Sports & Health').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </optgroup>
            </select>

            {isCurrentHostel && (
              <HostelSelector
                type={currentHostelType}
                value={currentHostelNo}
                onChange={setCurrentHostelNo}
                theme="indigo"
                label={`Current ${currentHostelType === 'BH' ? 'Boys Hostel' : 'Girls Hostel'} Number:`}
              />
            )}
          </div>

          <div className="hidden md:flex md:col-span-1 justify-center pt-8">
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              Where do you want to go?
            </label>
            <select
              value={targetDestinationId}
              onChange={(e) => setTargetDestinationId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <optgroup label="Campus Hubs & Gates">
                {LPU_LOCATIONS.filter(l => l.category === 'Campus Hub' || l.category === 'Campus Gate').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Hostel Blocks">
                {LPU_LOCATIONS.filter(l => l.category === 'Hostel').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Academic & Sports">
                {LPU_LOCATIONS.filter(l => l.category === 'Academic Block' || l.category === 'Sports & Health').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </optgroup>
            </select>

            {isTargetHostel && (
              <HostelSelector
                type={targetHostelType}
                value={targetHostelNo}
                onChange={setTargetHostelNo}
                theme="purple"
                label={`Destination ${targetHostelType === 'BH' ? 'Boys Hostel' : 'Girls Hostel'} Number:`}
              />
            )}
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Seats Needed
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSeatsNeeded(num)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    seatsNeeded === num
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} {num === 1 ? 'Seat' : 'Seats'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <CampusRidePolicyDetail />

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => setIsGirlsOnlyFilter(!isGirlsOnlyFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
              isGirlsOnlyFilter
                ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Show Girls-Only Poolings</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Matching Student Rides
          </h2>
          <p className="text-xs text-slate-500">
            Showing rides traveling towards {selectedDest.name} from near {selectedPickup.name}
          </p>
        </div>

        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          {matchResults.length} matches found
        </span>
      </div>

      {matchResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">No active students on this exact campus route right now</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create a ride or post your seats to let classmates join you!
          </p>
          <button
            onClick={onOpenCreateRide}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Ride on this Route</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchResults.map(({ ride, matchScore, matchReason }) => {
            const driverFirst = ride.driver.name.split(' ')[0];
            return (
              <div
                key={ride.id}
                id={`matched-ride-${ride.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {matchScore}% Route Match
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {matchReason}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {ride.availableSeats} open
                    </span>
                  </div>

                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 mb-4">
                    <div className="text-sm font-extrabold text-slate-900 leading-snug">
                      “{driverFirst} is going from {ride.pickup.name} → {ride.destination.name}”
                    </div>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <div className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {ride.availableSeats} seats available
                      </div>

                      <div className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {ride.departureTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-base shrink-0 shadow-2xs">
                      {ride.vehicleType === 'E-Rickshaw' ? '🛺' : (ride.vehicleType === 'Auto-Rickshaw' ? '🚕' : '🚗')}
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ride.driver.name}</span>
                        <span className="text-[11px] font-bold text-amber-600">★ {ride.driver.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {ride.vehicleType} • {ride.driver.course} • ({ride.driver.blockOrHostel || 'LPU'})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Vehicle: <span className="font-semibold text-slate-800">{ride.vehicleType}</span>
                  </div>

                  <button
                    type="button"
                    id={`find-students-join-btn-${ride.id}`}
                    onClick={() => onJoinRide(ride)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-98 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Join Ride</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
