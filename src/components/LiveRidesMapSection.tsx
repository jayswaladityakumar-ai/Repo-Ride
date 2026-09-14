import React, { useState, useMemo } from 'react';
import { Ride } from '../types';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Layers,
  Info,
  ShieldCheck
} from 'lucide-react';

interface LiveRidesMapSectionProps {
  rides: Ride[];
  onJoinRide: (ride: Ride) => void;
  onTrackRide: (ride: Ride) => void;
}

export interface CampusAutoPath {
  id: string;
  code: string;
  name: string;
  color: string;
  badgeBg: string;
  description: string;
  fare: string;
  operatingHours: string;
  frequency: string;
  totalAutos: number;
  stops: {
    name: string;
    locationId: string;
    isTransferHub?: boolean;
    description?: string;
  }[];
  assignedRides: Ride[];
}

export const LiveRidesMapSection: React.FC<LiveRidesMapSectionProps> = ({
  rides,
  onJoinRide,
  onTrackRide
}) => {
  const [selectedPathId, setSelectedPathId] = useState<string>('path-openaudi');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const OPEN_AUDI_MAPS_URL = 'https://maps.app.goo.gl/9mhLf4ZKg2RzUr2F9';

  const autoPaths: CampusAutoPath[] = useMemo(() => [
    {
      id: 'path-openaudi',
      code: 'PATH A1',
      name: 'Central Spine & Open Audi Road',
      color: '#10b981',
      badgeBg: 'bg-emerald-600 text-white',
      description: 'The primary central north-south campus arterial road traversing Open Audi Road (GPS: 31.255228, 75.704727), connecting Main Gate, UniMall, Central Library, and Cricket Stadium.',
      fare: '₹10 / seat (Fixed Campus Fare)',
      operatingHours: '6:00 AM - 10:30 PM',
      frequency: 'Every 2-3 mins',
      totalAutos: 8,
      stops: [
        { name: 'Main Gate (GT Road Highway)', locationId: 'loc-maingate', description: 'Primary university entrance & drop point' },
        { name: 'UniMall & Food Court', locationId: 'loc-unimall', description: 'Main commercial center, dining & student hub' },
        { 
          name: 'Open Audi Road Transfer Hub', 
          locationId: 'loc-openaudi', 
          isTransferHub: true,
          description: 'Key junction between Unipolis & UniMall; transfer to BH & Law Gate'
        },
        { name: 'Central Library & Admin Block', locationId: 'loc-library', description: 'Academic central tower & administrative offices' },
        { name: 'Cricket Ground & Sports Stadium', locationId: 'loc-cricket', description: 'Northern campus boundary & athletics grounds' }
      ],
      assignedRides: rides.filter(r => 
        r.routeStops.some(s => s.toLowerCase().includes('open audi') || s.toLowerCase().includes('unimall') || s.toLowerCase().includes('main gate'))
      )
    },
    {
      id: 'path-bh',
      code: 'PATH A2',
      name: 'Boys Hostels Ring (BH 1 to BH 13)',
      color: '#3b82f6',
      badgeBg: 'bg-blue-600 text-white',
      description: 'High-capacity western loop connecting Main Gate and Open Audi Road to the Boys Hostel residential complex (BH-1 through BH-13).',
      fare: '₹10 / seat (Fixed Campus Fare)',
      operatingHours: '6:00 AM - 11:00 PM',
      frequency: 'Every 3-4 mins',
      totalAutos: 7,
      stops: [
        { name: 'Main Gate (GT Road)', locationId: 'loc-maingate', description: 'Main entrance pickup point' },
        { 
          name: 'Open Audi Road Junction', 
          locationId: 'loc-openaudi', 
          isTransferHub: true, 
          description: 'Central connector for hostel shuttles'
        },
        { name: 'Baldev Raj Mittal Unipolis', locationId: 'loc-unipolis', description: 'Amphitheater & event center' },
        { name: 'Boys Hostel Complex (BH 1-13)', locationId: 'loc-bh', description: 'Major residential sector for male students' }
      ],
      assignedRides: rides.filter(r => 
        r.pickup.id === 'loc-bh' || r.destination.id === 'loc-bh' ||
        r.routeStops.some(s => s.toLowerCase().includes('bh') || s.toLowerCase().includes('boys hostel'))
      )
    },
    {
      id: 'path-gh',
      code: 'PATH A3',
      name: 'Girls Hostels Boulevard (GH 1 to GH 13)',
      color: '#ec4899',
      badgeBg: 'bg-pink-600 text-white',
      description: 'Dedicated eastern campus pathway linking Main Gate, UniMall, and UniHospital with the Girls Hostel residential complex (GH-1 through GH-13).',
      fare: '₹10 / seat (Fixed Campus Fare)',
      operatingHours: '6:00 AM - 10:00 PM',
      frequency: 'Every 3 mins',
      totalAutos: 6,
      stops: [
        { name: 'Main Gate (GT Road)', locationId: 'loc-maingate', description: 'Main security check & drop point' },
        { name: 'UniMall & Shopping Complex', locationId: 'loc-unimall', description: 'Retail stores, salon, pharmacy & food court' },
        { name: 'Girls Hostel Complex (GH 1-13)', locationId: 'loc-gh', description: 'Residential hostels with dedicated security turnstiles' },
        { name: 'Mittal School of Business (Block 38)', locationId: 'loc-block38', description: 'Management studies' }
      ],
      assignedRides: rides.filter(r => 
        r.pickup.id === 'loc-gh' || r.destination.id === 'loc-gh' ||
        r.routeStops.some(s => s.toLowerCase().includes('gh') || s.toLowerCase().includes('girls hostel'))
      )
    }
  ], [rides]);

  const activePath = autoPaths.find(p => p.id === selectedPathId) || autoPaths[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            <span>Campus Auto Transit Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-2.5">
            <span>Campus Auto Paths & Routes</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Official operational corridors, stops, timetable frequencies, and verified e-rickshaws serving Lovely Professional University.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href={OPEN_AUDI_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-indigo-600 border border-slate-300 hover:border-indigo-300 shadow-xs transition-all group"
            title="Open verified Open Audi Road location in Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
            <span>Open Audi Road (31.255228, 75.704727)</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
          </a>

          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Transfer Hub Info</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedPathId('all')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            selectedPathId === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Paths Overview</span>
        </button>

        {autoPaths.map((p) => {
          const isSelected = selectedPathId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPathId(p.id)}
              className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span>{p.code}: {p.name.split('(')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {selectedPathId !== 'all' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${activePath.badgeBg}`}>
                    {activePath.code}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operating Now
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activePath.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {activePath.description}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {activePath.fare}
                </span>
                <span className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {activePath.operatingHours}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activePath.stops.map((stop, index) => {
                  const isOpenAudi = stop.isTransferHub || stop.locationId === 'loc-openaudi';

                  return (
                    <div
                      key={index}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isOpenAudi
                          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/60 shadow-xs'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOpenAudi 
                              ? 'bg-amber-500 text-slate-950 font-black' 
                              : 'bg-white border border-slate-300 text-slate-700'
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold truncate ${isOpenAudi ? 'text-amber-950 font-black' : 'text-slate-900'}`}>
                            {stop.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {stop.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative border border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                    Verified Google Maps Location
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    LPU Open Audi Road
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Open Audi Road is the central arterial corridor of the LPU campus. Multiple auto routes pass and transfer students right at this junction between UniMall and Unipolis.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={OPEN_AUDI_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm text-center flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
