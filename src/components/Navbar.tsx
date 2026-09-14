import React, { useState } from 'react';
import { PageTab, StudentProfile } from '../types';
import { RepoRideLogo } from './RepoRideLogo';
import { UserAvatar } from './UserAvatar';
import { VertoPayWidget } from './VertoPayWidget';
import { 
  Car, 
  MapPin, 
  Users, 
  CalendarCheck, 
  PlusCircle, 
  Menu, 
  X, 
  ShieldCheck, 
  Search, 
  Navigation,
  LogOut,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  currentTab: PageTab;
  onSelectTab?: (tab: PageTab) => void;
  onNavigate?: (tab: PageTab) => void;
  onOpenCreateRide?: () => void;
  activeRidesCount?: number;
  myActiveBookingsCount?: number;
  activeBookingsCount?: number;
  currentUser?: StudentProfile | null;
  user?: StudentProfile | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onNavigate,
  onOpenCreateRide = () => {},
  activeRidesCount = 0,
  myActiveBookingsCount,
  activeBookingsCount,
  currentUser,
  user,
  onSignOut
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeUser = currentUser || user || null;
  const activeBookings = myActiveBookingsCount ?? activeBookingsCount ?? 0;

  const isDriver = activeUser?.accountType === 'driver';
  const isPassenger = !activeUser?.accountType || activeUser?.accountType === 'passenger';

  const navItems: { id: PageTab; label: string; icon: React.ReactNode; badge?: number; isLive?: boolean }[] = isDriver ? [
    { id: 'driver-dashboard', label: 'Driver Console (OTP & Rides)', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'live', label: 'Campus Auto Paths', icon: <Navigation className="w-4 h-4" />, badge: 5 },
    { id: 'my-rides', label: 'Trip History', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'profile', label: 'Vehicle Profile', icon: <Car className="w-4 h-4" /> },
  ] : [
    { id: 'home', label: 'Dashboard', icon: <Car className="w-4 h-4" /> },
    { id: 'book', label: 'Find Rides', icon: <Search className="w-4 h-4" /> },
    { id: 'live', label: 'Auto Paths', icon: <Navigation className="w-4 h-4" />, badge: 5 },
    { id: 'my-rides', label: 'My Bookings & OTP', icon: <CalendarCheck className="w-4 h-4" />, badge: activeBookings },
    { id: 'profile', label: 'Student Profile', icon: <Users className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: PageTab) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(tab);
    } else if (typeof onNavigate === 'function') {
      onNavigate(tab);
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
      <div className="bg-black text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
        {isDriver ? (
          <span>
            🚖 <strong>Driver Mode:</strong> Vehicle: {activeUser?.vehicleType || 'Auto-Rickshaw'} ({activeUser?.vehicleNumber || 'PB 08 BX 4192'}) • Collect Fares via 4-Digit Passenger OTP
          </span>
        ) : (
          <span>
            Official Campus Student Ride Pool • Verified Student IDs only • Fixed ₹10 Campus Fare
          </span>
        )}
        <span className="hidden md:inline text-neutral-400">| Emergency Security: 01824-444444</span>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full gap-2 sm:gap-4">
          
          <div 
            onClick={() => handleNavClick(isDriver ? 'driver-dashboard' : 'home')}
            className="cursor-pointer select-none group shrink-0"
            id="brand-logo-btn"
            title={isDriver ? "Go to Driver Console" : "Go to Dashboard"}
          >
            <RepoRideLogo size={38} showSubtitle={true} />
          </div>

          <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 shrink-0 mx-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 2xl:px-3.5 2xl:py-2 rounded-lg text-xs 2xl:text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'text-black bg-neutral-100 border border-neutral-300 shadow-xs'
                      : 'text-slate-600 hover:text-black hover:bg-slate-100/70'
                  }`}
                >
                  <span className={isActive ? 'text-black' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>

                  {item.isLive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                    </span>
                  )}

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 text-[10px] 2xl:text-[11px] px-1.5 py-0.2 rounded-full font-bold bg-black text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden xl:flex items-center gap-2.5 2xl:gap-3 shrink-0 ml-auto">
            <div 
              id="firestore-cloud-db-badge"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700"
              title="Cloud Firestore Database Connected"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Cloud DB Live</span>
            </div>

            <VertoPayWidget variant="topbar-pill" />

            {isDriver && (
              <button
                id="header-create-ride-btn"
                onClick={onOpenCreateRide}
                className="flex items-center gap-1.5 2xl:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs 2xl:text-sm font-bold px-3.5 2xl:px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Ride</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200/80">
              <button
                id="header-profile-quick-pill"
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2 pl-1.5 pr-2.5 2xl:pl-2 2xl:pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-black hover:bg-slate-50 transition-all cursor-pointer text-left shrink-0"
                title={isDriver ? "View Driver & Vehicle Profile" : "View Student Profile"}
              >
                <UserAvatar
                  name={activeUser?.name}
                  avatar={activeUser?.avatar}
                  size="sm"
                />
                <div className="hidden 2xl:block leading-tight">
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-[110px]">
                    {activeUser?.name || (isDriver ? 'Driver' : 'Verto Student')}
                  </span>
                  <span className="text-[10px] text-neutral-600 font-semibold block truncate max-w-[110px]">
                    {isDriver ? `🚖 ${activeUser?.vehicleNumber || 'Auto Driver'}` : `★ ${activeUser?.rating?.toFixed(1) || '5.0'} Verified`}
                  </span>
                </div>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  id="header-signout-btn"
                  onClick={onSignOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  title="Sign Out of REPORIDE"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 xl:hidden shrink-0 ml-auto">
            <VertoPayWidget variant="topbar-pill" />

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 focus:outline-hidden transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="pb-1">
            <VertoPayWidget variant="compact" />
          </div>

          {isDriver && (
            <button
              id="mobile-drawer-create-ride-btn"
              onClick={() => {
                onOpenCreateRide();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create / Offer a Ride</span>
            </button>
          )}

          <div className="space-y-1 pt-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-indigo-700 bg-indigo-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-indigo-600' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isLive && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    )}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100">
            {activeUser && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
                  title="View Profile"
                >
                  <UserAvatar
                    name={activeUser.name}
                    avatar={activeUser.avatar}
                    size="md"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {activeUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {isDriver ? `${activeUser.vehicleType || 'Auto-Rickshaw'} • ${activeUser.vehicleNumber || 'PB 08 BX 4192'}` : `${activeUser.regNumber} • ${activeUser.blockOrHostel || 'Hostel'}`}
                    </span>
                  </div>
                </button>

                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-100 bg-rose-50 border border-rose-200 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
