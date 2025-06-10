'use client';

import Chat from '@/components/global/Chat';
import { useSearchParams } from 'next/navigation';
import { UIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/global/ChatSidebar';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get('thread') || uuidv4();

  // You can load initial messages here if needed
  const initialMessages: UIMessage[] = [];

  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex-1 relative">
        <Chat threadId={threadId} initialMessages={initialMessages} />
      </div>
    </SidebarProvider>
  );
}