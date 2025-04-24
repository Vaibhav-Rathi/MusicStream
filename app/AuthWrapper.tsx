"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem('email', session.user.email);
    }
  }, [session]);

  return <>{children}</>;
}