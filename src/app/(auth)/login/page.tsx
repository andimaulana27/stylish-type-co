// src/app/(auth)/login/page.tsx
import { Metadata } from 'next';
import LoginClientPage from './LoginClientPage'; // Impor komponen client yang baru

// Di sini kita bisa mengekspor metadata dengan aman
export const metadata: Metadata = {
  title: 'Login or Create Account | Timeless Type',
  description: 'Sign in to your Timeless Type account to access your purchased fonts and manage your subscription, or create a new account to start your creative journey.',
};

// Halaman ini sekarang adalah Server Component
export default function LoginPage() {
  // Ia hanya me-render komponen client
  return <LoginClientPage />;
}