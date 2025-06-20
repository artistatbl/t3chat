import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, Copy, RefreshCcw, SquarePen, GitBranch } from 'lucide-react';
import { UIMessage } from 'ai';
import { UseChatHelpers } from '@ai-sdk/react';
import { toast } from 'sonner';

interface MessageControlsProps {
  threadId: string;
  message: UIMessage;
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
  content: string;
  setMode?: Dispatch<SetStateAction<'view' | 'edit'>>;
  reload: () => void;
  stop: UseChatHelpers['stop'];
  onBranch?: (messageId: string) => void; 
}

export default function MessageControls({
  //threadId,
  message,
  setMessages,
  content,
  setMode,
  reload,
  stop,
  onBranch,
}: MessageControlsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleBranch = () => {
    if (onBranch) {
      onBranch(message.id);
    }
  };

  const handleRegenerate = async () => {
    stop();

    if (message.role === 'user') {
      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);
        if (index !== -1) {
          return [...messages.slice(0, index + 1)];
        }
        return messages;
      });
    } else {
      setMessages((messages) => {
        const index = messages.findIndex((m) => m.id === message.id);
        if (index !== -1) {
          return [...messages.slice(0, index)];
        }
        return messages;
      });
    }

    setTimeout(() => {
      reload();
    }, 0);
  };

  return (
    <div
      className={cn(
        'opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex gap-1',
        {
          'absolute mt-5 right-2': message.role === 'user',
        }
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {copied ? 'Copied!' : 'Copy message'}
        </TooltipContent>
      </Tooltip>
      
      {message.role === 'user' && setMode && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setMode('edit')}>
              <SquarePen className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Edit message
          </TooltipContent>
        </Tooltip>
      )}
      
      {onBranch && message.role === 'assistant' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBranch}
            >
              <GitBranch className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Create branch from this message
          </TooltipContent>
        </Tooltip>
      )}
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleRegenerate}>
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Regenerate response
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
