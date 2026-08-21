'use client';

import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  // Extract initials (e.g. "Carlos Santos" -> "CS", "João Silva" -> "JS", "Admin Yggdron" -> "AN")
  const parts = name.trim().split(' ');
  let initials = parts[0]?.substring(0, 1) || 'N';
  if (parts.length > 1) {
    initials += parts[parts.length - 1]?.substring(0, 1) || '';
  }
  initials = initials.toUpperCase();

  const sizeClasses = {
    sm: 'w-5 h-5 text-[9px]',
    md: 'w-6 h-6 text-[10px]',
    lg: 'w-8 h-8 text-xs font-bold',
  };

  return (
    <div
      className={`rounded bg-slate-800 border border-slate-700 text-[#1A281E] dark:text-slate-200 font-mono flex items-center justify-center font-bold tracking-tighter shrink-0 select-none ${sizeClasses[size]} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};
