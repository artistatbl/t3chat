'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function UserProfile() {
  const { user, isLoaded } = useUser();

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="w-full h-auto p-3 flex items-center gap-3">
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 text-left min-w-0">
          <div className="h-4 bg-muted rounded animate-pulse mb-1" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  // If no user is logged in, don't render anything
  if (!user) {
    return null;
  }

  const displayName = user.fullName || user.firstName || user.username || 'User';
  const displayEmail = user.primaryEmailAddress?.emailAddress || '';
  const displayImage = user.imageUrl;

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <Link href="/settings" className="block">
      <Button
        variant="ghost"
        className="w-full h-auto p-3 flex items-center gap-3 hover:bg-secondary transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={displayImage} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium truncate">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {displayEmail}
          </p>
        </div>
        
        <Settings className="h-4 w-4 text-muted-foreground" />
      </Button>
    </Link>
  );
}