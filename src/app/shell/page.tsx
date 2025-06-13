"use client";

import nextDynamic from "next/dynamic";

const App = nextDynamic(() => import("@/app/frontend/app"), { ssr: false });
export const dynamic = "force-dynamic";

export default function Shell() {
  return <App />;
}
