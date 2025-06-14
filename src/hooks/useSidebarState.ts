import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function useSidebarState() {
  const { state, setOpen } = useSidebar();
  
  // Function to get cookie value
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null; // SSR check
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };
  
  // Function to set cookie value
  const setCookie = (value: boolean) => {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };
  
  // Load sidebar state from cookie on mount
  useEffect(() => {
    const sidebarState = getCookie(SIDEBAR_COOKIE_NAME);
    if (sidebarState !== null) {
      setOpen(sidebarState === 'true');
    }
  }, [setOpen]);
  
  // Enhanced setOpen function that also updates the cookie
  const setSidebarOpen = (value: boolean) => {
    setOpen(value);
    setCookie(value);
  };
  
  return {
    isOpen: state === 'expanded',
    setOpen: setSidebarOpen,
    toggle: () => setSidebarOpen(state !== 'expanded')
  };
}