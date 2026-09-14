import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../types';
import { UserAvatar } from './UserAvatar';
import { VertoPayWidget } from './VertoPayWidget';
import { getInitials, compressProfileImage } from '../utils/avatarUtils';
import { 
  ShieldCheck, 
  Star, 
  Phone, 
  Mail, 
  TrendingDown, 
  Leaf, 
  Edit3, 
  Car, 
  HeartHandshake, 
  LogOut, 
  Camera, 
  Upload, 
  Trash2, 
  Loader2 
} from 'lucide-react';

interface ProfileSectionProps {
  user: StudentProfile;
  onUpdateUser: (updated: StudentProfile) => Promise<void> | void;
  onSignOut?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  onUpdateUser,
  onSignOut
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<StudentProfile>(user);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Image file is too large. Please choose an image under 8MB.');
      return;
    }

    setPhotoError(null);
    setIsProcessingPhoto(true);

    try {
      const compressedAvatar = await compressProfileImage(file, 320, 0.85);
      setFormData((prev) => ({ ...prev, avatar: compressedAvatar }));

      if (!isEditing) {
        await onUpdateUser({
          ...user,
          avatar: compressedAvatar
        });
      }
    } catch (err: any) {
      setPhotoError(err?.message || 'Failed to process image. Please try another photo.');
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoError(null);
    setFormData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (!isEditing) {
      await onUpdateUser({
        ...user,
        avatar: ''
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateUser(formData);
      setIsEditing(false);
    } catch (err: any) {
      setPhotoError(err?.message || 'Failed to save changes');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        id="profile-photo-file-input"
      />
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/60 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                size="2xl"
                shape="rounded"
                showVerificationBadge={true}
                isVerified={user.verifiedStudent}
              />
              
              <button
                type="button"
                disabled={isProcessingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
                title="Change or upload profile photo"
              >
                {isProcessingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold">Edit Photo</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {user.accountType === 'driver' ? 'Verified Campus Driver' : 'Verified LPU Student'}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-900 text-white uppercase">
                  Role: {user.accountType || 'passenger'}
                </span>
              </div>

              {user.accountType === 'driver' ? (
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  {user.vehicleType || 'Auto-Rickshaw'} • <span className="font-mono">{user.vehicleNumber || 'PB 08'}</span>
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {user.course || 'Student'} • Batch {user.batch || '2024-2028'}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-500">
                {user.accountType === 'driver' ? (
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                    Phone: {user.phone}
                  </span>
                ) : (
                  <>
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                      ID: {user.regNumber}
                    </span>
                    {user.blockOrHostel && (
                      <>
                        <span>•</span>
                        <span>{user.blockOrHostel}</span>
                      </>
                    )}
                  </>
                )}
              </div>

              {photoError && !isEditing && (
                <p className="text-xs text-rose-600 font-medium pt-1">{photoError}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Update Student Profile</h3>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <label className="font-bold text-slate-800 text-xs block">Profile Picture</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <UserAvatar
                  name={formData.name || 'Student'}
                  avatar={formData.avatar}
                  size="xl"
                  shape="rounded"
                />

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={isProcessingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.avatar ? 'Change Photo' : 'Upload Student Photo'}</span>
                    </button>

                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove (Use Initials)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  {user.accountType === 'driver' ? 'Driver Full Name' : 'Full Student Name'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                  required
                />
              </div>

              {user.accountType === 'driver' ? (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Vehicle Type</label>
                    <select
                      value={formData.vehicleType || 'Auto-Rickshaw'}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                    >
                      <option value="Auto-Rickshaw">Auto-Rickshaw</option>
                      <option value="E-Rickshaw">E-Rickshaw</option>
                      <option value="Shared Cab">Shared Cab</option>
                      <option value="Scooter/Bike">Scooter/Bike</option>
                      <option value="Car">Car</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Vehicle Number Plate</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber || ''}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="e.g. PB 08 BX 4192"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Course & Department</label>
                    <input
                      type="text"
                      value={formData.course || ''}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Hostel / Location</label>
                    <input
                      type="text"
                      value={formData.blockOrHostel || ''}
                      onChange={(e) => setFormData({ ...formData, blockOrHostel: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setFormData(user);
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
              <span className="font-bold text-slate-800">{user.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <Mail className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">LPU Email</span>
              <span className="font-bold text-slate-800 truncate block max-w-[200px]">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <Star className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Rating</span>
              <span className="font-extrabold text-slate-800 text-sm">
                ★ {user.rating} <span className="text-slate-400 text-xs font-normal">({user.totalRides} ratings)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <VertoPayWidget variant="dashboard-banner" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Car className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Total Rides Shared</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{user.totalRides}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Total Money Saved</span>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1">₹{user.moneySaved}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-500">CO₂ Emissions Saved</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">34.2 kg</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Classmates Met</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">62</div>
        </div>
      </div>

      {onSignOut && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed In as {user.name}</span>
            </h4>
            <p className="text-xs text-slate-500">
              Registration No: <span className="font-mono font-semibold text-slate-700">{user.regNumber}</span> • {user.email}
            </p>
          </div>

          <button
            type="button"
            id="profile-signout-btn"
            onClick={onSignOut}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      )}
    </div>
  );
};
