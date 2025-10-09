// src/app/actions/authActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const next = String(formData.get('next')) || '/account';
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && data.session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    
    revalidatePath('/', 'layout');

    let redirectUrl: string;
    
    const userRole = profile?.role || '';
    if (userRole === 'admin') {
      redirectUrl = '/admin/dashboard';
    } else if (userRole === 'blogger') {
      redirectUrl = '/admin/blog';
    } else if (userRole === 'uploader') {
      redirectUrl = '/admin/products/fonts';
    } else {
      redirectUrl = next;
    }
    
    return { success: true, redirectUrl, session: data.session };
  }

  return { error: 'An unknown error occurred.' };
}

export async function registerAction(formData: FormData) {
  const fullName = String(formData.get('fullName'));
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  // --- PERBAIKAN: Pastikan 'next' selalu mengarah ke '/account' setelah verifikasi
  const next = '/account'; 
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // --- PERBAIKAN: URL redirect sudah benar, memastikan 'next' ter-encode ---
      emailRedirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: fullName, 
      }
    },
  });

  if (signUpError) {
    if (signUpError.message.includes('User already registered')) {
        return { error: 'This email address is already in use. Please try to log in.' };
    }
    return { error: signUpError.message };
  }

  if (signUpData.user && signUpData.user.identities?.length === 0) {
    return { error: 'This email is already registered. Please try logging in.' };
  }
  
  return { success: true };
}

export async function signInWithGoogleAction() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    return { error: error.message };
  }
}

export async function logoutAction() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}

export async function resendVerificationEmailAction(email: string) {
  if (!email) {
    return { error: 'Email address is required.' };
  }
  
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );

  const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes('rate limit')) {
      return { error: 'You have requested this too recently. Please wait a moment.' };
    }
    return { error: error.message };
  }

  return { success: 'Verification email sent again.' };
}