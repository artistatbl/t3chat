'use client';

import { v4 as uuidv4 } from 'uuid';
import Chat from '@/components/chat/Chat';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

export default function Page() {
  const router = useRouter();
  const [threadId] = useState(uuidv4());
  const hasRedirected = useRef(false);
  
  const handleStartChat = () => {
    // This will be called after the AI response is complete
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(`/chat/${threadId}`);
    }
  };
  
  return (
    <Chat 
      threadId={threadId} 
      initialMessages={[]} 
      onMessageSubmit={handleStartChat} 
    />
  );
}
