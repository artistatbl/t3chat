import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex-1 relative">
        {children}
      </div>
    </SidebarProvider>
  );
}
