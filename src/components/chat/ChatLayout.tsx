import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { Outlet } from 'react-router';

export default function ChatLayout() {
  
  return (
    // Don't specify defaultOpen to let the SidebarProvider use the cookie value
    <SidebarProvider>
     <ChatSidebar />
      <div className="flex-1 relative">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
