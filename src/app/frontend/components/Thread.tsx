import Chat from '@/components/global/Chat';
import { useParams } from 'react-router';
import { UIMessage } from 'ai';

export default function Thread() {
  const { id } = useParams<{ id: string }>();
  const threadId = id || '';
  const initialMessages: UIMessage[] = [];

  return <Chat threadId={threadId} initialMessages={initialMessages} />;
}