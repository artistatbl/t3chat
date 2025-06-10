"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("@/app/frontend/app"), { ssr: false });

export default function Shell() {
  return <App />;
}