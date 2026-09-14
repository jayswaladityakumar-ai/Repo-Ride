import React from 'react';

interface RepoRideIconProps {
  size?: number;
  className?: string;
}

export const RepoRideIcon: React.FC<RepoRideIconProps> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="REPORIDE Logo"
    >
      <defs>
        <linearGradient id="vrVGradient" x1="6" y1="6" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="50%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        <linearGradient id="vrRightArm" x1="24" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>

      <g>
        <path
          d="M 6 7 
             L 16.5 7 
             L 24 25.5 
             L 31.5 7 
             L 42 7 
             L 27.8 42 
             C 26.5 45.2, 21.5 45.2, 20.2 42 
             Z"
          fill="url(#vrVGradient)"
        />

        <path
          d="M 31.5 7 
             L 42 7 
             L 27.8 42 
             C 26.5 45.2, 24.8 44.5, 24 42.5 
             L 24 25.5 
             Z"
          fill="url(#vrRightArm)"
          opacity="0.9"
        />

        <line
          x1="13"
          y1="13"
          x2="16.5"
          y2="21"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="3 3"
          opacity="0.9"
        />
        <line
          x1="18"
          y1="25"
          x2="21.5"
          y2="33"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="3 3"
          opacity="0.9"
        />

        <line
          x1="35"
          y1="13"
          x2="31.5"
          y2="21"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="3 3"
          opacity="0.7"
        />
        <line
          x1="30"
          y1="25"
          x2="26.5"
          y2="33"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="3 3"
          opacity="0.7"
        />

        <g transform="translate(0, 1)">
          <path
            d="M 18.5 21 
               C 18.5 17.5, 20 16, 24 16 
               C 28 16, 29.5 17.5, 29.5 21 
               L 30.5 23.5 
               C 31 24.5, 30.5 25.5, 29.5 25.5 
               L 18.5 25.5 
               C 17.5 25.5, 17 24.5, 17.5 23.5 
               Z"
            fill="#FFFFFF"
          />

          <path
            d="M 20.2 20.2 
               C 20.5 17.8, 21.5 17.2, 24 17.2 
               C 26.5 17.2, 27.5 17.8, 27.8 20.2 
               Z"
            fill="#000000"
          />

          <circle cx="19.5" cy="24" r="1.1" fill="#FFFFFF" />
          <circle cx="28.5" cy="24" r="1.1" fill="#FFFFFF" />
        </g>

        <circle cx="24" cy="9.5" r="2.2" fill="#000000" stroke="#FFFFFF" strokeWidth="1" />
      </g>
    </svg>
  );
};

interface RepoRideLogoProps {
  size?: number;
  className?: string;
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const RepoRideLogo: React.FC<RepoRideLogoProps> = ({
  size = 36,
  className = '',
  showSubtitle = true,
  inverted = false
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105">
        <RepoRideIcon size={size} />
      </div>

      <div className="shrink-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${
              size >= 40 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
            } ${inverted ? 'text-white' : 'text-black'}`}
          >
            REPO<span className="text-black font-extrabold underline decoration-2 underline-offset-4">RIDE</span>
          </span>

          <span className="inline-block text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-md bg-black text-white border border-black shadow-2xs">
            Campus
          </span>
        </div>

        {showSubtitle && (
          <p
            className={`text-[10px] sm:text-[11px] font-medium tracking-normal mt-1 ${
              inverted ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Student Carpooling & Ride Pool
          </p>
        )}
      </div>
    </div>
  );
};
