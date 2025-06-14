// 'use client';

// import Chat from '@/components/chat/Chat';
// import { UIMessage } from 'ai';
// import { useParams } from 'next/navigation';

// export default function ChatThreadPage() {
//   const params = useParams();
//   const threadId = params?.threadId as string || ''; // Next.js params are named by segment
//   const initialMessages: UIMessage[] = [];

//   return (
//     <Chat threadId={threadId} initialMessages={initialMessages} />
//   );
// }



'use client';

import Chat from '@/components/chat/Chat';
import { UIMessage } from 'ai';
import { useParams } from 'react-router';

export default function ChatThreadPage() {
  const { id } = useParams(); // Get the id parameter from the URL
  const threadId = id || ''; // Use the id from the URL
  const initialMessages: UIMessage[] = [];

  return (
    <Chat threadId={threadId} initialMessages={initialMessages} />
  );
}