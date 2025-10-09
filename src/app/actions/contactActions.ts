// src/app/actions/contactActions.ts
'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import ContactFormEmail from '@/components/emails/ContactFormEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// Skema validasi menggunakan Zod
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  subject: z.string().min(3, 'Subject is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

// --- PERBAIKAN 1: Tentukan tipe state yang lebih spesifik daripada 'any' ---
type State = {
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  } | null;
  message: string;
  success?: boolean;
};

// Server Action untuk mengirim email
export async function sendContactEmailAction(prevState: State, formData: FormData) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  // Jika validasi gagal, kembalikan error
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    // --- PERBAIKAN 3: Hapus variabel 'data' yang tidak digunakan ---
    const { error } = await resend.emails.send({
      from: 'Contact Form <support@timelesstype.co>',
      to: ['support@timelesstype.co'],
      // --- PERBAIKAN 2: Ubah 'reply_to' menjadi 'replyTo' (camelCase) ---
      replyTo: email,
      subject: `[Contact Form] - ${subject}`,
      react: ContactFormEmail({
        name,
        email,
        subject,
        message,
      }),
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { message: 'Failed to send message. Please try again later.', errors: null };
    }

    return { message: 'Your message has been sent successfully!', errors: null, success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { message: 'An unexpected error occurred.', errors: null };
  }
}