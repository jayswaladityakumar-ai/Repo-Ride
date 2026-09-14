import React, { useState } from 'react';
import { Ride, StudentProfile } from '../types';
import { LPU_LOCATIONS } from '../data/lpuData';
import { HostelSelector } from './HostelSelector';
import { 
  X, 
  Car, 
  MapPin, 
  Navigation, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface CreateRideModalProps {
  currentUser: StudentProfile;
  onClose: () => void;
  onCreateRide: (ride: Ride) => void;
}

export const CreateRideModal: React.FC<CreateRideModalProps> = ({
  currentUser,
  onClose,
  onCreateRide
}) => {
  const [pickupId, setPickupId] = useState<string>('loc-maingate');
  const [pickupHostelNo, setPickupHostelNo] = useState<number>(1);
  const [destinationId, setDestinationId] = useState<string>('loc-unimall');
  const [destHostelNo, setDestHostelNo] = useState<number>(1);
  const [vehicleType, setVehicleType] = useState<Ride['vehicleType']>('E-Rickshaw');
  const [totalSeats, setTotalSeats] = useState<number>(3);
  const [departureTime, setDepartureTime] = useState<string>('In 10 mins');
  const [isGirlsOnly, setIsGirlsOnly] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const isPickupHostel = pickupId === 'loc-bh' || pickupId === 'loc-gh';
  const pickupHostelType = pickupId === 'loc-bh' ? 'BH' : 'GH';

  const isDestHostel = destinationId === 'loc-bh' || destinationId === 'loc-gh';
  const destHostelType = destinationId === 'loc-bh' ? 'BH' : 'GH';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let pickupLocation = LPU_LOCATIONS.find(l => l.id === pickupId) || LPU_LOCATIONS[0];
    let destLocation = LPU_LOCATIONS.find(l => l.id === destinationId) || LPU_LOCATIONS[1];

    if (isPickupHostel) {
      pickupLocation = {
        ...pickupLocation,
        name: `${pickupHostelType === 'BH' ? 'Boys Hostel' : 'Girls Hostel'} ${pickupHostelNo} (BH-${pickupHostelNo})`
      };
    }

    if (isDestHostel) {
      destLocation = {
        ...destLocation,
        name: `${destHostelType === 'BH' ? 'Boys Hostel' : 'Girls Hostel'} ${destHostelNo} (BH-${destHostelNo})`
      };
    }

    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      driver: {
        ...currentUser
      },
      pickup: pickupLocation,
      destination: destLocation,
      departureTime: departureTime,
      estimatedArrival: 'In 20 mins',
      totalSeats: totalSeats,
      occupiedSeats: 1,
      availableSeats: totalSeats - 1,
      pricePerSeat: 10,
      vehicleType: vehicleType,
      isGirlsOnly: isGirlsOnly,
      status: 'upcoming',
      distanceFromUserKm: 0.1,
      currentLocationName: pickupLocation.name,
      routeStops: [pickupLocation.name, 'Open Audi Road Transfer Point', destLocation.name],
      bookedByStudentIds: [currentUser.id]
    };

    setIsSuccess(true);
    setTimeout(() => {
      onCreateRide(newRide);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Campus Ride Offered!
            </h3>
            <p className="text-xs text-slate-500">
              Your empty seats are live for fellow Vertos to book.
            </p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-600 mb-1">
                <Car className="w-3.5 h-3.5" />
                <span>Offer Empty Seats</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Create a Campus Ride Offer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Share your auto, e-rickshaw, or bike with fellow Vertos and split the fare evenly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                  Pickup Point
                </label>
                <select
                  value={pickupId}
                  onChange={(e) => setPickupId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <optgroup label="Hostel Blocks">
                    {LPU_LOCATIONS.filter(l => l.category === 'Hostel').map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Campus Gates & Hubs">
                    {LPU_LOCATIONS.filter(l => l.category === 'Campus Gate' || l.category === 'Campus Hub').map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Academic & Sports">
                    {LPU_LOCATIONS.filter(l => l.category === 'Academic Block' || l.category === 'Sports & Health').map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </optgroup>
                </select>

                {isPickupHostel && (
                  <HostelSelector
                    type={pickupHostelType}
                    value={pickupHostelNo}
                    onChange={setPickupHostelNo}
                    theme="indigo"
                    label={`Select ${pickupHostelType === 'BH' ? 'Boys Hostel' : 'Girls Hostel'} Number:`}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  Destination
                </label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <optgroup label="Campus Hubs & Gates">
                    {LPU_LOCATIONS.filter(l => l.category === 'Campus Hub' || l.category === 'Campus Gate').map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Hostel Blocks">
                    {LPU_LOCATIONS.filter(l => l.category === 'Hostel').map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Academic & Sports">
                    {LPU_LOCATIONS.filter(l => l.category === 'Academic Block' || l.category === 'Sports & Health').map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </optgroup>
                </select>

                {isDestHostel && (
                  <HostelSelector
                    type={destHostelType}
                    value={destHostelNo}
                    onChange={setDestHostelNo}
                    theme="purple"
                    label={`Select ${destHostelType === 'BH' ? 'Boys Hostel' : 'Girls Hostel'} Number:`}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="E-Rickshaw">E-Rickshaw (Electric)</option>
                    <option value="Auto-Rickshaw">Auto-Rickshaw</option>
                    <option value="Scooter/Bike">Scooter/Bike</option>
                    <option value="Shared Cab">Shared Cab</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Total Capacity
                  </label>
                  <select
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value={2}>2 Seats (1 Open)</option>
                    <option value={3}>3 Seats (2 Open)</option>
                    <option value={4}>4 Seats (3 Open)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Departure Schedule
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. In 10 mins / 5:30 PM after class"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGirlsOnly}
                    onChange={(e) => setIsGirlsOnly(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>Girls Only Pooling (Strictly for female students)</span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-create-ride-btn"
                  className="px-6 py-2.5 rounded-xl font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-98 flex items-center gap-2 cursor-pointer"
                >
                  <span>Publish Ride Offer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
