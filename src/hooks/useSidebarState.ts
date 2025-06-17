import { useSidebar } from '@/components/ui/sidebar';

// The SidebarProvider component already handles cookie persistence
// This hook just provides a simpler interface to the sidebar state
export function useSidebarState() {
  const { state, setOpen } = useSidebar();
  
  // The SidebarProvider already handles setting the cookie
  // We just need to call its setOpen function
  return {
    isOpen: state === 'expanded',
    setOpen: setOpen,
    toggle: () => setOpen(state !== 'expanded')
  };
}