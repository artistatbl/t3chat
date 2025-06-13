import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Home from '@/app/page'
import Settings from '../settings/page';
import AccountSettings from '../settings/account/page';
import AppearanceSettings from '../settings/appearance/page';
import ModelsSettings from '../settings/models/page';
import ApiKeySettings from '../settings/apikey/page';
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/settings/appearance" element={<AppearanceSettings />} />
        <Route path="/settings/models" element={<ModelsSettings />} />
        <Route path="/settings/apikey" element={<ApiKeySettings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}