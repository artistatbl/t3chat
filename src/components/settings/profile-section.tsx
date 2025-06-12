'use client';

import { useUser } from '@clerk/nextjs';

export function ProfileSection() {
  const { user, isLoaded } = useUser();
  
  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-800 animate-pulse" />
        <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-1" />
        <div className="h-4 w-48 bg-gray-800 rounded animate-pulse mb-4" />
        <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }
  
  const name = user?.fullName || user?.firstName || user?.username || 'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const avatarUrl = user?.imageUrl;
  
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl text-white">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <h2 className="text-xl font-semibold mb-1">{name}</h2>
      <p className="text-sm text-gray-400 mb-4">{email}</p>
    </div>
  );
}