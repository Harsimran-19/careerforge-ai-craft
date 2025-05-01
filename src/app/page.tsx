import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Import the landing page component
import Index from '@/components/pages/Index';

export default function HomePage() {
  // Check if user is authenticated - this is a server component so we can check cookies directly
  const hasSession = cookies().has('session');
  
  // If user is authenticated, redirect to dashboard
  if (hasSession) {
    redirect('/dashboard');
  }
  
  // Otherwise render the landing page
  return <Index />;
}
