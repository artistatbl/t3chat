'use client';

import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { memo } from 'react';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

type ProfileSectionProps = {
  className?: string;
};


export const ProfileSection = memo(function ProfileSection({ className }: ProfileSectionProps) {
  const { user, isLoaded } = useUser();
  const { hidePersonalInfo } = usePrivacySettings(); // Remove isLoading if not using it
  

  const name = user?.fullName || user?.firstName || user?.username || 'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const avatarUrl = user?.imageUrl;
  const initial = name.charAt(0).toUpperCase();
  

  if (!isLoaded) {
    return (
      <div className={cn("flex flex-col items-center mb-10", className)} aria-busy="true" aria-live="polite">
        <div className="w-36 h-36 rounded-full overflow-hidden mb-4 bg-zinc-800 animate-pulse blur-md" />
        <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse mb-1 blur-md" />
        <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mb-4 blur-md" />
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col items-center mb-8", className)}>
      <Avatar className="w-36 h-36 mb-4" aria-label={`Profile picture of ${name}`}>
        {avatarUrl ? (
          <AvatarImage 
            src={avatarUrl} 
            alt={`${name}'s profile picture`} 
            className={cn("object-cover", hidePersonalInfo ? "blur-md" : "")}
            loading="lazy"
          />
        ) : null}
        <AvatarFallback 
          className="bg-zinc-700 text-2xl text-white" 
          delayMs={600}
        >
          {initial}
        </AvatarFallback>
      </Avatar>
      <h2 className={cn("text-xl font-semibold mb-1", hidePersonalInfo ? "blur-md select-none" : "")}>
        {name}
      </h2>
      {email && (
        <p className={cn("text-sm text-gray-400 mb-4", hidePersonalInfo ? "blur-md select-none" : "")}>
          {email}
        </p>
      )}
    </div>
  );
});