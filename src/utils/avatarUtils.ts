/**
 * Utility functions for user avatars and initials formatting
 */

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'VR';
  const cleanName = name.trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return 'VR';
  
  if (words.length === 1) {
    const single = words[0];
    if (single.length >= 2) {
      return single.slice(0, 2).toUpperCase();
    }
    return single.charAt(0).toUpperCase();
  }
  
  const firstLetter = words[0].charAt(0).toUpperCase();
  const lastLetter = words[words.length - 1].charAt(0).toUpperCase();
  return `${firstLetter}${lastLetter}`;
}

export function getAvatarColorClasses(name?: string): { bg: string; text: string; border: string } {
  if (!name) {
    return {
      bg: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
      text: 'text-white',
      border: 'border-indigo-300'
    };
  }

  const palettes = [
    { bg: 'bg-gradient-to-br from-indigo-500 to-indigo-700', text: 'text-white', border: 'border-indigo-300' },
    { bg: 'bg-gradient-to-br from-purple-500 to-indigo-600', text: 'text-white', border: 'border-purple-300' },
    { bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', text: 'text-white', border: 'border-blue-300' },
    { bg: 'bg-gradient-to-br from-teal-500 to-emerald-700', text: 'text-white', border: 'border-teal-300' },
    { bg: 'bg-gradient-to-br from-rose-500 to-pink-600', text: 'text-white', border: 'border-rose-300' },
    { bg: 'bg-gradient-to-br from-amber-500 to-orange-600', text: 'text-white', border: 'border-amber-300' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

export function compressProfileImage(file: File, maxDimension = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const srcData = event.target?.result as string;
      if (!srcData) {
        reject(new Error('Empty image result'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image data'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = img.width;
          const height = img.height;

          const cropSize = Math.min(width, height);
          const startX = (width - cropSize) / 2;
          const startY = (height - cropSize) / 2;

          const targetSize = Math.min(cropSize, maxDimension);
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(srcData);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, startX, startY, cropSize, cropSize, 0, 0, targetSize, targetSize);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          resolve(srcData);
        }
      };
      img.src = srcData;
    };
    reader.readAsDataURL(file);
  });
}
