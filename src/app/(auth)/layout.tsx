import React from "react";

type Props = {children: React.ReactNode}

// export const metadata = constructMetadata();


const Layout = ({children}: Props) => {
  return (
    <main className="h-screen w-screen flex items-center bg-[#191317]  justify-center p-6">

        {children}

    </main>
  )
}

export default Layout