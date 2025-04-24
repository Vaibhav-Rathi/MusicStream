"use client";

import { signOut } from 'next-auth/react';

const baseUrl = process.env.NEXTAUTH_URL

export const logout = async () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  await signOut({ callbackUrl: baseUrl });
};