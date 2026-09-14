import React, { useState, useMemo } from 'react';
import { Ride, StudentProfile } from '../types';
import { LPU_LOCATIONS } from '../data/lpuData';
import { HostelSelector } from './HostelSelector';
import { CampusRidePolicyDetail } from './CampusRidePolicyDetail';
import { VertoPayWidget } from './VertoPayWidget';
import { 
  Search, 
  MapPin, 
  Clock, 
  Car, 
  ShieldCheck, 
  ArrowRight, 
  X
} from 'lucide-react';

interface AvailableRidesSectionProps {
  rides: Ride[];
  onJoinRide: (ride: Ride) => void;
  onOpenCreateRide: () => void;
  currentUser?: StudentProfile;
  presetPickupId?: string;
  presetDestinationId?: string;
  presetSeats?: number;
}

export const AvailableRidesSection: React.FC<AvailableRidesSectionProps> = ({
  rides,
  onJoinRide,
  onOpenCreateRide,
  currentUser,
  presetDestinationId,
  presetSeats
}) => {
  const isDriver = currentUser?.accountType === 'driver';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [destinationFilter, setDestinationFilter] = useState<string>(presetDestinationId || 'All');
  const [destHostelNumber, setDestHostelNumber] = useState<number>(1);
  const [availableSeatsFilter, setAvailableSeatsFilter] = useState<number>(presetSeats || 1);
  const [maxDistanceFilter, setMaxDistanceFilter] = useState<number>(10);
  const [locationCategoryFilter, setLocationCategoryFilter] = useState<string>('All');
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');
  const [girlsOnlyOnly, setGirlsOnlyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'distance' | 'departure' | 'seats'>('distance');

  const isDestHostel = destinationFilter === 'loc-bh' || destinationFilter === 'loc-gh';
  const destHostelType = destinationFilter === 'loc-bh' ? 'BH' : 'GH';

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      if (ride.status === 'completed' || ride.status === 'cancelled') return false;

      if (ride.availableSeats < availableSeatsFilter) return false;

      if (ride.distanceFromUserKm > maxDistanceFilter) return false;

      if (destinationFilter !== 'All') {
        if (destinationFilter === 'loc-bh') {
          const matchesBH = ride.destination.name.toLowerCase().includes('boys hostel') ||
                            ride.destination.name.toLowerCase().includes('bh');
          if (!matchesBH) return false;
        } else if (destinationFilter === 'loc-gh') {
          const matchesGH = ride.destination.name.toLowerCase().includes('girls hostel') ||
                            ride.destination.name.toLowerCase().includes('gh');
          if (!matchesGH) return false;
        } else {
          const targetLoc = LPU_LOCATIONS.find(l => l.id === destinationFilter);
          const filterTerm = targetLoc ? targetLoc.name.toLowerCase() : destinationFilter.toLowerCase();
          const matchesDest = ride.destination.id === destinationFilter ||
                              ride.destination.name.toLowerCase().includes(filterTerm);
          const matchesStop = ride.routeStops.some(s => s.toLowerCase().includes(filterTerm));
          if (!matchesDest && !matchesStop) return false;
        }
      }

      if (locationCategoryFilter !== 'All') {
        if (locationCategoryFilter === 'Hostels' && ride.pickup.category !== 'Hostel') return false;
        if (locationCategoryFilter === 'Campus Gates' && ride.pickup.category !== 'Campus Gate') return false;
        if (locationCategoryFilter === 'Campus Hubs' && ride.pickup.category !== 'Campus Hub') return false;
        if (locationCategoryFilter === 'Academic Blocks' && ride.pickup.category !== 'Academic Block') return false;
      }

      if (vehicleFilter !== 'All' && ride.vehicleType !== vehicleFilter) {
        return false;
      }

      if (girlsOnlyOnly && !ride.isGirlsOnly) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          ride.driver.name.toLowerCase().includes(q) ||
          ride.pickup.name.toLowerCase().includes(q) ||
          ride.destination.name.toLowerCase().includes(q) ||
          ride.currentLocationName.toLowerCase().includes(q) ||
          ride.routeStops.some(s => s.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'distance') return a.distanceFromUserKm - b.distanceFromUserKm;
      if (sortBy === 'seats') return b.availableSeats - a.availableSeats;
      return a.departureTime.localeCompare(b.departureTime);
    });
  }, [
    rides, 
    availableSeatsFilter, 
    maxDistanceFilter, 
    destinationFilter, 
    locationCategoryFilter, 
    vehicleFilter, 
    girlsOnlyOnly, 
    searchQuery, 
    sortBy
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setDestinationFilter('All');
    setAvailableSeatsFilter(1);
    setMaxDistanceFilter(50);
    setLocationCategoryFilter('All');
    setVehicleFilter('All');
    setGirlsOnlyOnly(false);
  };

  const hasActiveFilters = searchQuery !== '' || destinationFilter !== 'All' || availableSeatsFilter > 1 || maxDistanceFilter < 50 || locationCategoryFilter !== 'All' || vehicleFilter !== 'All' || girlsOnlyOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Car className="w-3.5 h-3.5" />
            <span>Campus Ride Pool</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Available Campus Rides
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified LPU student rides with open seats across campus gates, academic blocks, and hostel blocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <VertoPayWidget variant="topbar-pill" />
          
          {isDriver && (
            <button
              onClick={onOpenCreateRide}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer whitespace-nowrap"
            >
              <span>+ Create Ride</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, gate, stop, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-4">
            <select
              id="filter-destination-select"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Campus Destinations</option>
              <optgroup label="Hostel Blocks">
                <option value="loc-bh">Boys Hostel (BH 1–13)</option>
                <option value="loc-gh">Girls Hostel (GH 1–13)</option>
              </optgroup>
              <optgroup label="Campus Hubs & Gates">
                <option value="loc-unimall">UniMall & Central Food Court</option>
                <option value="loc-maingate">LPU Main Gate (GT Road)</option>
                <option value="loc-lawgate">Law Gate (Back Gate)</option>
                <option value="loc-library">Central Library & Admin Block</option>
              </optgroup>
              <optgroup label="Academic & Sports">
                <option value="loc-block34">Block 34 (Computer Science)</option>
                <option value="loc-block38">Block 38 (Business School)</option>
                <option value="loc-sports">Indoor Sports Arena</option>
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              id="filter-seats-select"
              value={availableSeatsFilter}
              onChange={(e) => setAvailableSeatsFilter(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value={1}>1+ Seat Open</option>
              <option value={2}>2+ Seats Open</option>
              <option value={3}>3+ Seats Open</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="distance">Nearest to me</option>
              <option value="seats">Most seats open</option>
              <option value="departure">Departure time</option>
            </select>
          </div>
        </div>

        {isDestHostel && (
          <HostelSelector
            type={destHostelType}
            value={destHostelNumber}
            onChange={setDestHostelNumber}
            label={`Filter by ${destHostelType === 'BH' ? 'Boys Hostel' : 'Girls Hostel'} Number (1 to 13):`}
            theme="purple"
          />
        )}

        <CampusRidePolicyDetail />

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Within:</span>
              <button
                type="button"
                onClick={() => setMaxDistanceFilter(0.8)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  maxDistanceFilter === 0.8 ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                0.8 km
              </button>
              <button
                type="button"
                onClick={() => setMaxDistanceFilter(1.5)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  maxDistanceFilter === 1.5 ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                1.5 km
              </button>
              <button
                type="button"
                onClick={() => setMaxDistanceFilter(10)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  maxDistanceFilter === 10 ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Entire Campus
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Vehicles</option>
                <option value="E-Rickshaw">E-Rickshaw</option>
                <option value="Auto-Rickshaw">Auto-Rickshaw</option>
                <option value="Scooter/Bike">Scooter/Bike</option>
                <option value="Shared Cab">Shared Cab</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setGirlsOnlyOnly(!girlsOnlyOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                girlsOnlyOnly
                  ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Girls Only Ride</span>
            </button>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-slate-400 hover:text-slate-600 font-medium underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong>{filteredRides.length}</strong> available campus student rides</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Real-time availability
        </span>
      </div>

      {filteredRides.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No rides match your exact campus filters</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your search criteria or create your own ride offer.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
            {isDriver && (
              <button
                onClick={onOpenCreateRide}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
              >
                + Create This Ride
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRides.map((ride) => (
            <div
              key={ride.id}
              id={`ride-card-${ride.id}`}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {ride.vehicleType}
                    </span>
                    {ride.isGirlsOnly && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Girls Only
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {ride.availableSeats} {ride.availableSeats === 1 ? 'seat open' : 'seats open'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-base shrink-0">
                    {ride.vehicleType === 'E-Rickshaw' ? '🛺' : (ride.vehicleType === 'Auto-Rickshaw' ? '🚕' : '🚗')}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{ride.driver.name}</h4>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md shrink-0">
                        ★ {ride.driver.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {ride.vehicleType} • {ride.driver.course}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pickup</span>
                      <span className="font-bold text-slate-800">{ride.pickup.name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Destination</span>
                      <span className="font-bold text-slate-800">{ride.destination.name}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 text-xs mb-4 space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-500 font-medium">Estimated Arrival:</span>
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {ride.estimatedArrival} ({ride.departureTime})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  id={`join-ride-btn-${ride.id}`}
                  onClick={() => onJoinRide(ride)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Join Ride</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
