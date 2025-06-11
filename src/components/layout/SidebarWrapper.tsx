"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/global/ChatSidebar";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export default function SidebarWrapper({ children }: SidebarWrapperProps) {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex-1 relative">
        {children}
      </div>
    </SidebarProvider>
  );
}