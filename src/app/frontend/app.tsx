import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Home from '@/app/page'
import SettingsPage from '../settings/SettingsPage';
import Thread from '../chat/[threadId]/page';
import SignIn from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import SignUp from "@/app/(auth)/sign-up/[[...sign-up]]/page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="chat/:id" element={<Thread />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/settings/:tab?" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}