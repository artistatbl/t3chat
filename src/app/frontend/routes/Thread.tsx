import Chat from '@/components/global/Chat';
import { useParams } from 'react-router';


import { UIMessage } from 'ai';

export default function Thread() {
  const { id } = useParams();
  if (!id) throw new Error('Thread ID is required');



  const convertToUIMessages = (messages?: DBMessage[]) => {
    return messages?.map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts as UIMessage['parts'],
      content: message.content || '',
      createdAt: message.createdAt,
    }));
  };

  return (
    <Chat
      key={id}
      threadId={id}
      initialMessages={convertToUIMessages(messages) || []}
    />
  );
}
