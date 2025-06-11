import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import ChatLayout from './ChatLayout';
import { v4 as uuidv4 } from 'uuid';
import Chat from '@/components/global/Chat';
import Settings from '../settings/page';
import Thread from './components/Thread';
import SignIn from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import SignUp from "@/app/(auth)/sign-up/[[...sign-up]]/page";

// Home component that creates a new chat
function Home() {
  return <Chat threadId={uuidv4()} initialMessages={[]} />;
}

export default function ClientRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatLayout />}>
          <Route index element={<Home />} />
          <Route path="chat" element={<Navigate to="/" replace />} />
          <Route path="chat/:id" element={<Thread />} />
        </Route>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<p>Not found</p>} />
      </Routes>
    </BrowserRouter>
  );
}