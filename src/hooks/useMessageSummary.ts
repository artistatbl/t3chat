import { useState } from 'react';
import { useAPIKeyStore } from '@/app/stores/APIKeyStore';
import { useModelStore } from '@/app/stores/ModelStore';
import { client } from '@/lib/client';
import { toast } from 'sonner';

export const useMessageSummary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const getKey = useAPIKeyStore((state) => state.getKey);
  const selectedModel = useModelStore((state) => state.selectedModel);
  const modelConfig = useModelStore((state) => state.getModelConfig());

  const complete = async (prompt: string, options?: { body?: { threadId?: string; messageId?: string; isTitle?: boolean } }) => {
    setIsLoading(true);
    try {
      const apiKey = getKey(modelConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const response = await client.completion.complete.$post({
        prompt,
        model: selectedModel,
        threadId: options?.body?.threadId,
        messageId: options?.body?.messageId,
        isTitle: options?.body?.isTitle,
      }, {
        headers: {
          [modelConfig.headerKey]: apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as { error: string }).error || 'Failed to generate completion');
      }

      const result = await response.json();
      if ('error' in result) {
        throw new Error(result.error);
      }
      return result.text;
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Failed to generate response');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    complete,
    isLoading,
  };
};
