import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function usePrivacySettings() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user data from Convex
  const userData = useQuery(
    api.users.getUser,
    user ? { clerkId: user.id } : "skip"
  );
  
  // Get the toggle mutation
  const togglePrivacy = useMutation(api.users.togglePrivacy);
  
  // Determine if personal info is hidden
  // Default to true during loading to ensure privacy by default
  const hidePersonalInfo = isLoading ? true : (userData?.hidePersonalInfo || false);
  
  // Update loading state when data arrives
  useEffect(() => {
    if (userData !== undefined) {
      setIsLoading(false);
    }
  }, [userData]);
  
  // Function to toggle privacy setting
  const setHidePersonalInfo = async (value: boolean) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await togglePrivacy({
        clerkId: user.id,
        hidePersonalInfo: value
      });
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    hidePersonalInfo,
    setHidePersonalInfo,
    isLoading
  };
}