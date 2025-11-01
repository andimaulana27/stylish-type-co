// src/app/actions/newsletterActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
import { Resend } from 'resend';
import { NewsletterEmail } from '@/components/emails/NewsletterEmail'; // <-- PERUBAHAN 1: Import template baru

const resend = new Resend(process.env.RESEND_API_KEY); // Inisialisasi Resend

// Tipe data gabungan untuk subscriber
export type CombinedSubscriber = {
  id: string; // Gunakan email sebagai ID unik jika dari profiles, atau ID asli jika dari newsletter_subscribers
  email: string;
  name: string | null; // Nama hanya ada untuk registered users
  created_at: string;
  category: 'Registered User' | 'Anonymous Subscriber';
  source_id: string; // ID asli dari tabel source (profiles.id atau newsletter_subscribers.id)
  source_table: 'profiles' | 'newsletter_subscribers'; // Untuk membedakan saat menghapus
};

const createSupabaseActionClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
        remove(name: string, options: CookieOptions) { cookieStore.set(name, '', options); },
      },
    }
  );
};

export async function subscribeToAction(formData: FormData) {
  // Fungsi ini tetap sama, tidak ada perubahan
  const supabase = createSupabaseActionClient();
    const email = String(formData.get('email'));

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: 'Please provide a valid email address.' };
    }

    try {
        // Cek apakah email sudah terdaftar
        const { data: existingSubscriber, error: selectError } = await supabase
            .from('newsletter_subscribers')
            .select('email')
            .eq('email', email)
            .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not rows found
            throw selectError;
        }

        if (existingSubscriber) {
            return { error: 'This email is already subscribed!' };
        }

        // Jika belum ada, masukkan email baru
        const { error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert({ email });

        if (insertError) throw insertError;

        revalidatePath('/admin/newsletter');
        return { success: true };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

// Fungsi getCombinedSubscribersAction tetap sama, tidak ada perubahan
export async function getCombinedSubscribersAction(options: {
  page: number;
  limit: number;
  searchTerm?: string;
  category?: 'All' | 'Registered User' | 'Anonymous Subscriber';
}) {
  const { page, limit, searchTerm, category = 'All' } = options;
  const supabase = createSupabaseActionClient();
  const start = (page - 1) * limit;

  try {
    let combinedList: CombinedSubscriber[] = [];
    let totalCount = 0;

    // 1. Ambil Registered Users (profiles) jika filter mengizinkan
    if (category === 'All' || category === 'Registered User') {
      let profileQuery = supabase
        .from('profiles')
        .select('id, email, full_name, created_at', { count: 'exact' })
        .not('email', 'is', null); // Hanya ambil user dengan email

      if (searchTerm) {
        profileQuery = profileQuery.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data: profilesData, count: profilesCount, error: profilesError } = await profileQuery;
      if (profilesError) throw profilesError;

      if (profilesData) {
        combinedList.push(...profilesData.map(p => ({
          id: p.email!, // Gunakan email sebagai ID sementara untuk unique key di list (bisa disesuaikan)
          email: p.email!,
          name: p.full_name,
          created_at: p.created_at,
          category: 'Registered User' as const,
          source_id: p.id,
          source_table: 'profiles' as const,
        })));
        if (category === 'Registered User') totalCount = profilesCount || 0;
      }
    }

    // 2. Ambil Anonymous Subscribers (newsletter_subscribers) jika filter mengizinkan
    if (category === 'All' || category === 'Anonymous Subscriber') {
      let newsletterQuery = supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact' });

      if (searchTerm) {
        newsletterQuery = newsletterQuery.ilike('email', `%${searchTerm}%`);
      }

      const { data: newsletterData, count: newsletterCount, error: newsletterError } = await newsletterQuery;
      if (newsletterError) throw newsletterError;

      if (newsletterData) {
        combinedList.push(...newsletterData.map(n => ({
          id: n.id, // Gunakan ID asli
          email: n.email,
          name: null,
          created_at: n.created_at,
          category: 'Anonymous Subscriber' as const,
          source_id: n.id,
          source_table: 'newsletter_subscribers' as const,
        })));
        if (category === 'Anonymous Subscriber') totalCount = newsletterCount || 0;
      }
    }

    // Jika filter 'All', total count adalah jumlah keduanya
    if (category === 'All') {
        // Kita perlu query count terpisah untuk 'All' jika ada search term
        const { count: countProfiles } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).not('email', 'is', null).or(searchTerm ? `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%` : '');
        const { count: countNewsletters } = await supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).ilike(searchTerm ? 'email' : '', searchTerm ? `%${searchTerm}%` : '');
        totalCount = (countProfiles || 0) + (countNewsletters || 0);
    }


    // Urutkan berdasarkan tanggal dibuat (descending)
    combinedList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Terapkan paginasi
    const paginatedList = combinedList.slice(start, start + limit);

    return { data: paginatedList, count: totalCount, error: null };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { data: [], count: 0, error: message };
  }
}

// Fungsi deleteSubscriberAction tetap sama, tidak ada perubahan
export async function deleteSubscriberAction(sourceId: string, sourceTable: 'profiles' | 'newsletter_subscribers') {
  const supabase = createSupabaseActionClient();

  // Hanya izinkan penghapusan dari tabel newsletter_subscribers melalui action ini
  if (sourceTable !== 'newsletter_subscribers') {
    return { error: 'Registered users cannot be deleted from this interface.' };
  }

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', sourceId); // Hapus berdasarkan source_id

    if (error) throw error;
    revalidatePath('/admin/newsletter');
    return { success: 'Anonymous subscriber removed successfully!' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message };
  }
}

// --- FUNGSI DIPERBARUI: Mengirim Newsletter ---
export async function sendNewsletterAction(
  subject: string,
  htmlContent: string, // Nama parameter tetap sama (berisi HTML dari editor)
  recipients: {
    type: 'all' | 'category' | 'list';
    category?: 'Registered User' | 'Anonymous Subscriber';
    emails?: string[];
  }
): Promise<{ success?: string; error?: string }> {
  const supabase = createSupabaseActionClient();
  let targetEmails: string[] = [];

  try {
    // Logic untuk mendapatkan targetEmails tetap sama
    if (recipients.type === 'list' && recipients.emails) {
      targetEmails = recipients.emails;
    } else {
      // Ambil email berdasarkan tipe 'all' atau 'category'
      if (recipients.type === 'all' || recipients.category === 'Registered User') {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('email')
          .not('email', 'is', null);
        if (profilesError) throw profilesError;
        targetEmails.push(...(profiles?.map(p => p.email).filter(Boolean) as string[] || []));
      }
      if (recipients.type === 'all' || recipients.category === 'Anonymous Subscriber') {
        const { data: newsletters, error: newslettersError } = await supabase
          .from('newsletter_subscribers')
          .select('email');
        if (newslettersError) throw newslettersError;
        targetEmails.push(...(newsletters?.map(n => n.email).filter(Boolean) as string[] || []));
      }
      // Pastikan email unik
      targetEmails = [...new Set(targetEmails)];
    }

    if (targetEmails.length === 0) {
      return { error: 'No recipients found for the selected criteria.' };
    }

    // --- PERUBAHAN 2: Gunakan template email baru ---
    const { error } = await resend.emails.send({
      from: 'stylish Type Newsletter <marketing@stylishtype.co>', // Ganti dengan email Anda
      to: 'noreply@stylishtype.co', // Alamat 'to' utama (tidak terlihat oleh penerima)
      bcc: targetEmails, // Kirim ke semua target via BCC
      subject: subject,
      react: NewsletterEmail({ htmlContent }), // <-- Menggunakan komponen React baru
    });
    // --- AKHIR PERUBAHAN ---

    if (error) {
      console.error("Resend Error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: `Newsletter sent successfully to ${targetEmails.length} recipient(s).` };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred while sending newsletter.';
    console.error("Send Newsletter Error:", message);
    return { error: message };
  }
}