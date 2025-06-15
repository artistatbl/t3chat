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
import { toast } from 'sonner';
import { useAPIKeyStore } from '@/app/stores/APIKeyStore';
import { useModelStore } from '@/app/stores/ModelStore';
import { getModelConfig, getAvailableModels } from '@/lib/models';
import { PROVIDER_CONFIG } from '@/lib/provider-config';
import { Badge } from '../ui/badge';

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
      <DialogContent className="sm:max-w-md bg-card border border-border shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {providerInfo.name} API Key Required
          </DialogTitle>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            You need to provide a {providerInfo.name} API key to use {selectedModel}. Your key will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Available Models Section */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">
              Available Models
            </div>
            <div className="flex gap-2 flex-wrap">
              {providerModels.map((model) => (
                <Badge 
                  key={model.id} 
                  variant={model.id === selectedModel ? "default" : "secondary"}
                  className="transition-all duration-200"
                >
                  {model.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* API Key Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor={provider} className="text-sm font-medium text-foreground">
                {providerInfo.name} API Key
                <span className="text-destructive ml-1">*</span>
              </label>
              
              <Input
                id={provider}
                placeholder={providerInfo.placeholder}
                {...register(provider)}
                className={`transition-all duration-200 ${
                  errors[provider] 
                    ? 'border-destructive focus:border-destructive' 
                    : 'border-input focus:border-ring'
                }`}
              />
              
              {errors[provider] && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
                  {errors[provider]?.message}
                </div>
              )}
            </div>
            
            {/* Create API Key Link */}
            <a
              href={providerInfo.createUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline underline-offset-4"
            >
              Don&lsquo;t have an API key? Create one here
            </a>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
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