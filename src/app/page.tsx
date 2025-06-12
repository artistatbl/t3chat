'use client';

import { v4 as uuidv4 } from 'uuid';
import Chat from '@/components/chat/Chat';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';

export default function Page() {
  const router = useRouter();
  const [threadId] = useState(uuidv4());
  
  // Function to handle when user starts a chat
  const handleStartChat = () => {
    router.push(`/chat/${threadId}`);
  };
  
  return (
    <ChatLayout>
      <Chat 
        threadId={threadId} 
        initialMessages={[]} 
        onMessageSubmit={handleStartChat} 
      />
    </ChatLayout>
  );
}
