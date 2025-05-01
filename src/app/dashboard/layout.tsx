"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  
  // Handle loading state
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    redirect('/login');
  }
  
  return <AppLayout>{children}</AppLayout>;
}
