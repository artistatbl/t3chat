# T3Chat Additional Features

## Privacy Settings

T3Chat includes comprehensive privacy controls that allow users to manage how their personal information is displayed throughout the application.

### Key Features

- **Personal Information Protection**: Option to blur profile pictures and email addresses
- **Global Settings**: Privacy choices apply consistently across the entire application
- **Immediate Effect**: Changes take effect instantly without requiring page refresh

### Implementation

The privacy settings are implemented through a dedicated settings page:

```typescript
export function PrivacySettings() {
  const { hidePersonalInfo, setHidePersonalInfo, isLoading } = usePrivacySettings();

  const handleToggle = async () => {
    const newValue = !hidePersonalInfo;
    await setHidePersonalInfo(newValue);
    toast.success(`Personal information is now ${newValue ? 'hidden' : 'visible'}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control how your personal information is displayed throughout the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 mr-4">
            <Label htmlFor="hide-personal-info">Hide Personal Information</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, your profile picture and email will be blurred across the application.
            </p>
          </div>
          <Switch
            id="hide-personal-info"
            checked={hidePersonalInfo}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

## Message Components

The messaging system in T3Chat provides a rich communication experience with support for various content types.

### Key Features

- **Markdown Support**: Format messages with headings, lists, code blocks, and more
- **Code Highlighting**: Proper syntax highlighting for code snippets
- **Message Controls**: Options to edit, copy, and branch from existing messages
- **Attachment Display**: Integrated display of file attachments within messages

### Implementation

Messages are rendered using a dedicated component that handles various message types and states:

```typescript
function PureMessage({
  threadId,
  message,
  setMessages,
  reload,
  isStreaming,
  registerRef,
  stop,
  onBranch,
}) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [selectedImage, setSelectedImage] = useState<{url: string; name: string} | null>(null);
  
  // Extract attachments from the message if they exist
  const attachments = (message as UIMessage & { attachments?: Array<{ name: string; url: string; type: string }> }).attachments || [];
  const hasAttachments = attachments.length > 0;

  // Component rendering logic...
}
```

## Real-time Synchronization

T3Chat leverages Convex for real-time data synchronization, ensuring a seamless multi-device experience.

### Key Features

- **Instant Updates**: Messages appear in real-time across all connected devices
- **Offline Support**: Continue using the app even when temporarily offline
- **Automatic Reconnection**: Seamlessly reconnect when connectivity is restored
- **Data Persistence**: All conversations are securely stored for future reference

### Implementation

The application uses Convex hooks to manage real-time data:

```typescript
export function useConvexChat(threadId: string) {
  const { user } = useUser();
  const createChat = useMutation(api.chats.createChat);
  const createMessage = useMutation(api.messages.createMessage);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  
  // Fix: Only call the query when threadId is valid
  const getChat = useQuery(
    api.chats.getChatByUuid, 
    threadId ? { uuid: threadId } : "skip"
  );
  
  const getMessages = useQuery(
    api.messages.getMessagesByChat, 
    threadId ? { chatId: threadId } : "skip"
  );

  // Function implementations...

  return {
    saveUserMessage,
    saveAssistantMessage,
    saveChatTitle,
    createChatWithTitle,
    chat: getChat,
    messages: getMessages,
  };
}
```

## Chat Navigation

T3Chat provides intuitive navigation between messages and conversations.

### Key Features

- **Message References**: Ability to reference and scroll to specific messages
- **Navigator Toggle**: Show/hide the message navigator interface
- **Smooth Scrolling**: Animated scrolling to referenced messages

### Implementation

The chat navigation is implemented through a custom hook:

```typescript
export const useChatNavigator = () => {
  const [isNavigatorVisible, setIsNavigatorVisible] = useState(false);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerRef = useCallback((id: string, ref: HTMLDivElement | null) => {
    messageRefs.current[id] = ref;
  }, []);

  const scrollToMessage = useCallback((id: string) => {
    const ref = messageRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleToggleNavigator = useCallback(() => {
    setIsNavigatorVisible((prev) => !prev);
  }, []);

  const closeNavigator = useCallback(() => {
    setIsNavigatorVisible(false);
  }, []);

  return {
    isNavigatorVisible,
    handleToggleNavigator,
    closeNavigator,
    registerRef,
    scrollToMessage,
  };
};
```