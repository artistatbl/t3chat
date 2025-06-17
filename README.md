# T3Chat - Modern AI Chat Application

A full-stack, real-time AI chat application built with the Jstack, featuring multiple AI providers, advanced chat management, and a modern user interface.

## 🚀 Features

### 🤖 AI Integration
- **Multiple AI Providers**: Support for OpenAI, Google Gemini, Anthropic Claude, and OpenRouter
- **Model Selection**: Choose from 13+ AI models including:
  - GPT-4o, GPT-4 Turbo
  - Claude 3 Opus, Sonnet, Haiku
  - Gemini 1.5 Pro, Gemini 2.5 Flash
  - Llama 3 (70B, 8B)
  - Deepseek R1, Deepseek V3
  - Mistral Large, Command R+
- **Streaming Responses**: Real-time AI response streaming
- **Multimodal Support**: Text and file attachments

### 💬 Chat Management
- **Real-time Messaging**: Instant message delivery with Convex
- **Chat History**: Persistent chat storage and retrieval
- **Chat Organization**: 
  - Pinned chats for quick access
  - Automatic grouping by time (Today, Yesterday, Last Week, etc.)
  - Search and filter capabilities
- **Chat Branching**: Create conversation branches from any message
- **Chat Deletion**: Remove unwanted conversations
- **Title Editing**: Rename chats with double-click

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI with Tailwind CSS
- **Dark/Light Theme**: Toggle between themes
- **Sidebar Navigation**: Collapsible chat history sidebar
- **Welcome Screen**: Interactive onboarding with suggestion tabs
- **Message Controls**: Copy, regenerate, edit, and branch messages
- **Command Palette**: Quick actions with keyboard shortcuts
- **Auto-resizing Input**: Smart textarea that grows with content

### 🔐 Authentication & User Management
- **Clerk Authentication**: Secure user authentication
- **User Profiles**: Customizable user information
- **Session Management**: Persistent login state
- **User Settings**: Personalized preferences

### 📁 File Handling
- **File Uploads**: Support for various file types
- **Attachment Management**: View and manage uploaded files
- **Image Support**: Display images in chat

### ⚡ Performance & Developer Experience
- **Real-time Database**: Convex for instant data synchronization
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand for client-side state
- **API Routes**: tRPC-like API with jstack
- **Hot Reload**: Fast development with Turbopack

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend & Database
- **Convex** - Real-time backend-as-a-service
- **Clerk** - Authentication and user management
- **tRPC/jstack** - Type-safe API layer

### AI & ML
- **Vercel AI SDK** - AI integration framework
- **OpenAI SDK** - GPT models integration
- **Google AI SDK** - Gemini models
- **OpenRouter** - Multiple AI provider access

### State Management
- **Zustand** - Lightweight state management
- **React Query/SWR** - Server state management
- **React Hook Form** - Form state management

### UI Components
- **shadcn/ui** - Pre-built component library
- **React Markdown** - Markdown rendering
- **Shiki** - Syntax highlighting
- **KaTeX** - Math equation rendering
- **Sonner** - Toast notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/pnpm/yarn
- Convex account
- Clerk account
- AI provider API keys (OpenAI, Google, etc.)


### Environment Variables
Create a `.env` file in the root directory and add the following:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=dev:
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_ISSUER=
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=
UPLOADTHING_TOKEN=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
# To chat to the ai you need you know key: These are save locally in your browser
# You can get them from the ai provider you want to use
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

### Installation

To run "T3chat" Clone locally, you'll need to follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/artistatbl/t3chat
   cd t3chat
   ```

2. **Install dependencies:**
   We use `pnpm` for package management.
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/artistatbl/t3chat/issues) on GitHub.
