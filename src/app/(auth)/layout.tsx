// src/app/(auth)/layout.tsx
import AuthNavbar from '@/components/auth/AuthNavbar';
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-brand-dark-secondary min-h-screen flex flex-col">
      
      <AuthNavbar />

      <main className="w-full flex-grow flex flex-col items-center justify-center py-20 px-4">
        {children}
      </main>
      
      
    </div>
  );
}