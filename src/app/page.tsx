'use client';

import { v4 as uuidv4 } from 'uuid';
import Chat from '@/components/chat/Chat';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const router = useRouter();
  const [threadId] = useState(uuidv4());
  
  // Function to handle when user starts a chat
  const handleStartChat = () => {
    // Navigate to the chat page with the threadId
    router.push(`/chat/${threadId}`);
  };
  
  return (
    <Chat 
      threadId={threadId} 
      initialMessages={[]} 
      onMessageSubmit={handleStartChat} 
    />
  );
}
