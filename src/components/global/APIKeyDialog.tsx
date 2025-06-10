'use client';

import { useState } from 'react';
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
import { useAPIKeyStore } from '@/app/frontend/stores/APIKeyStore';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  google: z.string().trim().min(1, {
    message: 'Google API key is required to start chatting',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface APIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function APIKeyDialog({ open, onOpenChange, onSuccess }: APIKeyDialogProps) {
  const { setKeys } = useAPIKeyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      google: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      setKeys(values);
      toast.success('API key saved successfully');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch{
      toast.error('Failed to save API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <DialogTitle>Add API Key to Start Chatting</DialogTitle>
          </div>
          <DialogDescription>
            You need to provide an API key to start chatting with AI models. Your key is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="google" className="text-sm font-medium">
              Google API Key <span className="text-muted-foreground">(Required)</span>
            </label>
            
            <div className="flex gap-2 mb-2">
              <Badge>Gemini 2.5 Flash</Badge>
              <Badge>Gemini 2.5 Pro</Badge>
            </div>
            
            <Input
              id="google"
              placeholder="AIza..."
              {...register('google')}
              className={errors.google ? 'border-red-500' : ''}
            />
            
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              className="text-sm text-blue-500 inline w-fit"
            >
              Create Google API Key
            </a>
            
            {errors.google && (
              <p className="text-sm text-red-500">{errors.google.message}</p>
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