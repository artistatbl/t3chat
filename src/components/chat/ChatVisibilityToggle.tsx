'use client';

import { useState } from 'react';
import { Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

interface ChatVisibilityToggleProps {
  chatUuid: string;
  userId: string;
  initialIsPublic: boolean;
  className?: string;
}

export default function ChatVisibilityToggle({ 
  chatUuid, 
  userId, 
  initialIsPublic, 
  className 
}: ChatVisibilityToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isLoading, setIsLoading] = useState(false);
  
  const updateChatVisibility = useMutation(api.chats.updateChatVisibility);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      const newVisibility = !isPublic;
      await updateChatVisibility({ 
        uuid: chatUuid, 
        userId, 
        isPublic: newVisibility 
      });
      setIsPublic(newVisibility);
      toast.success(`Chat is now ${newVisibility ? 'public' : 'private'}`);
    } catch (error) {
      toast.error('Failed to update chat visibility');
      console.error('Error updating chat visibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            "h-6 w-6 p-0 hover:bg-accent transition-colors",
            isPublic ? "text-green-600 hover:text-green-700" : "text-gray-500 hover:text-gray-600",
            className
          )}
        >
          {isPublic ? <Globe size={14} /> : <Lock size={14} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isPublic ? "Make chat private" : "Make chat public"}</p>
      </TooltipContent>
    </Tooltip>
  );
}