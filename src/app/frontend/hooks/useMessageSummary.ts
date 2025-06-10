import { useCompletion } from '@ai-sdk/react';
import { useAPIKeyStore } from '@/app/frontend/stores/APIKeyStore';
import { toast } from 'sonner';

// interface MessageSummaryPayload {
//   title: string;
//   isTitle?: boolean;
//   messageId: string;
//   threadId: string;
// }

export const useMessageSummary = () => {


  const { complete, isLoading } = useCompletion({

  });

  return {
    complete,
    isLoading,
  };
};
