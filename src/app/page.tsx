'use client';

import { v4 as uuidv4 } from 'uuid';
import Chat from '@/components/chat/Chat';
import { useRouter } from 'next/navigation'; // Switch back to Next.js router
import { useState } from 'react';

export default function Page() {
  const router = useRouter(); // Use Next.js router
  const [threadId] = useState(uuidv4());
  
  // Function to handle when user starts a chat
  const handleStartChat = () => {
    router.push(`/chat/${threadId}`); // Use Next.js navigation
  };
  
  return (
    <Chat 
      threadId={threadId} 
      initialMessages={[]} 
      onMessageSubmit={handleStartChat} 
    />
  );
}
