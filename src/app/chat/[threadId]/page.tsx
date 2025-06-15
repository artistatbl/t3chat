'use client';

import Chat from '@/components/chat/Chat';
import { UIMessage } from 'ai';
import { useParams } from 'next/navigation';

export default function ChatThreadPage() {
  const params = useParams();
  const threadId = params?.threadId as string || ''; // Next.js params are named by segment
  const initialMessages: UIMessage[] = [];

  return (
    <Chat threadId={threadId} initialMessages={initialMessages} />
  );
}
