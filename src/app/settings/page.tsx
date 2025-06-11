'use client';

import APIKeyForm from '@/components/global/APIKeyForm';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <section className="flex w-full h-full">
      <Link
        href="/chat"
        className={buttonVariants({
          variant: 'default',
          className: 'w-fit fixed top-10 left-40 z-10',
        })}
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Chat
      </Link>
      <div className="flex items-center justify-center w-full h-full pt-24 pb-44 mx-auto">
        <APIKeyForm />
      </div>
    </section>
  );
}