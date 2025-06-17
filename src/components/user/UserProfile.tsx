'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRightToLine } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

export default function UserProfile() {
  const { user, isLoaded } = useUser();
  const { hidePersonalInfo } = usePrivacySettings(); // Remove isLoading if not using it

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="w-full h-auto p-3 flex items-center gap-3">
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse blur-md" />
        <div className="flex-1 text-left min-w-0">
          <div className="h-4 bg-muted rounded animate-pulse mb-1 blur-md" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4 blur-md" />
        </div>
      </div>
    );
  }

  // If no user is logged in, show login text
  if (!user) {
    return (
      <Link href="/sign-in" className="block">
        <Button
          variant="ghost"
          className="w-full h-auto p-4 flex items-center gap-3 hover:bg-secondary transition-colors"
        >
          <div className="flex-1 text-left min-w-0 flex items-center gap-2">
            <ArrowRightToLine className='h-4 w-4'/>
            <p className="text-sm font-medium truncate">
              Login
            </p>
          </div>
        </Button>
      </Link>
    );
  }

  const displayName = user.fullName || user.firstName || user.username || 'User';
  const displayImage = user.imageUrl;

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <Link href="/settings/account" className="block">
      <Button
        variant="ghost"
        className="w-full h-auto p-3 flex items-center gap-3 hover:bg-secondary transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={displayImage} 
            alt={displayName} 
            className={hidePersonalInfo ? "blur-md" : ""}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-left min-w-0">
          <p className={`text-sm font-medium truncate ${hidePersonalInfo ? "blur-md select-none" : ""}`}>
            {displayName}
          </p>
          {/* <p className="text-xs text-muted-foreground truncate">
            No plan 
          </p> */}
        </div>
      </Button>
    </Link>
  );
}