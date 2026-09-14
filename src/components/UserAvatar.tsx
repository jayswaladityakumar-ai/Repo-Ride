import React, { useState } from 'react';
import { getInitials, getAvatarColorClasses } from '../utils/avatarUtils';
import { ShieldCheck } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  showVerificationBadge?: boolean;
  isVerified?: boolean;
  shape?: 'rounded' | 'circle' | 'square';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = '',
  showVerificationBadge = false,
  isVerified = false,
  shape = 'circle'
}) => {
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [avatar]);

  const initials = getInitials(name);
  const palette = getAvatarColorClasses(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs sm:text-sm',
    lg: 'w-12 h-12 text-sm sm:text-base',
    xl: 'w-16 h-16 text-lg sm:text-xl font-bold',
    '2xl': 'w-20 h-20 sm:w-24 sm:h-24 text-xl sm:text-2xl font-extrabold',
    custom: ''
  };

  const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    square: 'rounded-lg'
  };

  const hasValidPhoto = avatar && avatar.trim().length > 0 && !imageError;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {hasValidPhoto ? (
        <img
          src={avatar}
          alt={name || 'Student Profile'}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          className={`${size !== 'custom' ? sizeClasses[size] : ''} ${shapeClasses[shape]} object-cover border border-slate-200 shadow-2xs`}
        />
      ) : (
        <div
          className={`${size !== 'custom' ? sizeClasses[size] : ''} ${shapeClasses[shape]} ${palette.bg} ${palette.text} flex items-center justify-center font-bold tracking-wider select-none shadow-2xs border border-white/20`}
          title={name ? `${name} (${initials})` : 'Student'}
          aria-label={name ? `${name}'s initials avatar` : 'Student avatar'}
        >
          <span>{initials}</span>
        </div>
      )}

      {showVerificationBadge && isVerified && (
        <div
          className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 sm:p-1 rounded-full border-2 border-white shadow-xs"
          title="Official LPU Verified Student"
        >
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
      )}
    </div>
  );
};
