'use client';

import { useState, useMemo } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';
import { toast } from 'sonner';
import { useAPIKeyStore } from '@/app/stores/APIKeyStore';
import { useModelStore } from '@/app/stores/ModelStore';
import { getModelConfig, getAvailableModels } from '@/lib/models';
import { Badge } from '../ui/badge';

// Provider configurations
const PROVIDER_CONFIG = {
  google: {
    name: 'Google',
    placeholder: 'AIza...',
    createUrl: 'https://aistudio.google.com/apikey',
    models: ['Gemini 2.5 Flash', 'gemini-1.5-pro']
  },
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    createUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-4o', 'gpt-4-turbo']
  },
  openrouter: {
    name: 'OpenRouter',
    placeholder: 'sk-or-...',
    createUrl: 'https://openrouter.ai/keys',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'llama-3-70b', 'llama-3-8b', 'mistral-large', 'command-r-plus']
  }
};

interface APIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function APIKeyDialog({ open, onOpenChange, onSuccess }: APIKeyDialogProps) {
  const { setKeys } = useAPIKeyStore();
  const selectedModel = useModelStore((state) => state.selectedModel);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the provider for the selected model
  const modelConfig = useMemo(() => getModelConfig(selectedModel), [selectedModel]);
  const provider = modelConfig.provider;
  const providerInfo = PROVIDER_CONFIG[provider];

  // Create dynamic form schema based on provider
  const formSchema = useMemo(() => {
    return z.object({
      [provider]: z.string().trim().min(1, {
        message: `${providerInfo.name} API key is required to use ${selectedModel}`,
      }),
    });
  }, [provider, providerInfo.name, selectedModel]);

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      [provider]: '',
    } as FormValues,
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      setKeys(values);
      toast.success('API key saved successfully');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get models for this provider to show in badges
  const providerModels = useMemo(() => {
    return getAvailableModels().filter(model => {
      const config = getModelConfig(model.id);
      return config.provider === provider;
    });
  }, [provider]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {providerInfo.name} API Key Required
          </DialogTitle>
          <DialogDescription>
            You need to provide a {providerInfo.name} API key to use {selectedModel}. Your key will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={provider} className="text-sm font-medium">
              {providerInfo.name} API Key <span className="text-muted-foreground">(Required)</span>
            </label>
            
            <div className="flex gap-2 mb-2 flex-wrap">
              {providerModels.map((model) => (
                <Badge key={model.id} variant={model.id === selectedModel ? "default" : "secondary"}>
                  {model.name}
                </Badge>
              ))}
            </div>
            
            <Input
              id={provider}
              placeholder={providerInfo.placeholder}
              {...register(provider)}
              className={errors[provider] ? 'border-red-500' : ''}
            />
            
            <a
              href={providerInfo.createUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 inline w-fit hover:underline"
            >
              Create {providerInfo.name} API Key
            </a>
            
            {errors[provider] && (
              <p className="text-sm text-red-500">{errors[provider]?.message}</p>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save & Start Chatting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}