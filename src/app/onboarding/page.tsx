"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingPage from '@/components/pages/Onboarding';

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  
  // If user is not logged in, redirect to login
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  return <OnboardingPage />;
}
