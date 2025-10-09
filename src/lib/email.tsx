// src/lib/email.tsx
'use server';

import { Resend } from 'resend';
import { ReactElement } from 'react';
import { Readable } from 'stream';
import { renderToStream } from '@react-pdf/renderer';

import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { AdminOrderNotificationEmail } from '@/components/emails/AdminOrderNotificationEmail';
import { SubscriptionConfirmationEmail } from '@/components/emails/SubscriptionConfirmationEmail';

import { type CartItem } from '@/context/UIContext';
import { type Tables } from '@/lib/database.types';
import { getInvoiceDataAction, getEulaDataAction } from '@/app/actions/orderActions';
import { getDownloadUrlAction } from '@/app/actions/userActions';

import { InvoicePdf } from '@/components/invoice/InvoicePdf';
import { EulaPdf } from '@/components/eula/EulaPdf';

const resend = new Resend(process.env.RESEND_API_KEY);

type User = Tables<'profiles'>;
type Order = Tables<'orders'>;
type Plan = Tables<'subscription_plans'>;

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

const generatePdfBuffer = async (reactElement: ReactElement): Promise<Buffer> => {
  const pdfStream = await renderToStream(reactElement) as Readable;
  const buffer = await streamToBuffer(pdfStream);
  return buffer;
};

// --- FUNGSI DIPERBARUI DI SINI ---
export const sendOrderConfirmationEmail = async (
  user: User,
  order: Order,
  items: CartItem[]
) => {
  try {
    // Menambahkan slug, type, imageUrl, price, dan quantity
    const productsForEmail = await Promise.all(
      items.map(async (item) => {
        const { success, url } = await getDownloadUrlAction(item.productId, item.type);
        return {
          name: item.name,
          license: item.license.name,
          downloadUrl: (success && url) ? url : undefined,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
          slug: item.slug, // <-- DITAMBAHKAN
          type: item.type, // <-- DITAMBAHKAN
        };
      })
    );

    const { data: invoiceDataResult } = await getInvoiceDataAction(order.id);
    const { data: eulaDataResult } = await getEulaDataAction(order.id);

    const attachments = [];

    if (invoiceDataResult) {
        const invoiceBuffer = await generatePdfBuffer(<InvoicePdf data={invoiceDataResult} />);
        attachments.push({
            filename: `Invoice-${order.id.substring(0, 8).toUpperCase()}.pdf`,
            content: invoiceBuffer,
        });
    }

    if (eulaDataResult) {
        const eulaBuffer = await generatePdfBuffer(<EulaPdf data={eulaDataResult} />);
        attachments.push({
            filename: `EULA-${order.id.substring(0, 8).toUpperCase()}.pdf`,
            content: eulaBuffer,
        });
    }
    
    const orderDateFormatted = new Date(order.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const sendToUser = resend.emails.send({
      from: 'Timeless Type <support@timelesstype.co>',
      to: [user.email!],
      subject: `Your Timeless Type Order #${order.id.substring(0, 8).toUpperCase()}`,
      react: OrderConfirmationEmail({
        userName: user.full_name || 'Designer',
        orderId: order.id,
        orderDate: orderDateFormatted,
        products: productsForEmail,
        totalAmount: order.total_amount,
      }),
      attachments: attachments,
    });

    const sendToAdmin = resend.emails.send({
        from: 'Timeless Type Notification <support@timelesstype.co>',
        to: ['timelesstypestudio@gmail.com'],
        subject: `[New Order] - #${order.id.substring(0, 8).toUpperCase()} from ${user.full_name}`,
        react: AdminOrderNotificationEmail({
            customerName: user.full_name || 'N/A',
            customerEmail: user.email || 'N/A',
            orderId: order.id,
            orderDate: orderDateFormatted,
            totalAmount: order.total_amount,
            products: productsForEmail, // Mengirim data lengkap ke email admin juga
        }),
        attachments: attachments,
    });

    const [userEmailResult, adminEmailResult] = await Promise.all([sendToUser, sendToAdmin]);

    if (userEmailResult.error) {
      console.error('Resend API Error (User Email):', userEmailResult.error);
    }
    if (adminEmailResult.error) {
      console.error('Resend API Error (Admin Email):', adminEmailResult.error);
    }
    
    if (userEmailResult.error) {
        return { error: 'Failed to send confirmation email to user.' };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred while sending the email.';
    return { error: message };
  }
};
// --- AKHIR PERUBAHAN ---


export const sendSubscriptionConfirmationEmail = async (
  user: User,
  order: Order,
  plan: Plan,
  billingCycle: 'monthly' | 'yearly',
  nextBillingDate: string
) => {
  try {
    const { data: invoiceDataResult } = await getInvoiceDataAction(order.id);
    const { data: eulaDataResult } = await getEulaDataAction(order.id);

    const attachments = [];

    if (invoiceDataResult) {
      const invoiceBuffer = await generatePdfBuffer(<InvoicePdf data={invoiceDataResult} />);
      attachments.push({
        filename: `Invoice-SUB-${order.id.substring(0, 6).toUpperCase()}.pdf`,
        content: invoiceBuffer,
      });
    }

    if (eulaDataResult) {
      const eulaBuffer = await generatePdfBuffer(<EulaPdf data={eulaDataResult} />);
      attachments.push({
        filename: `EULA-SUB-${order.id.substring(0, 6).toUpperCase()}.pdf`,
        content: eulaBuffer,
      });
    }

    const nextBillingDateFormatted = new Date(nextBillingDate).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    const sendToUser = resend.emails.send({
      from: 'Timeless Type <support@timelesstype.co>',
      to: [user.email!],
      subject: `Welcome to Your ${plan.name} Subscription!`,
      react: SubscriptionConfirmationEmail({
        userName: user.full_name || 'Designer',
        planName: plan.name,
        billingCycle: billingCycle,
        nextBillingDate: nextBillingDateFormatted,
      }),
      attachments: attachments,
    });

    const sendToAdmin = resend.emails.send({
      from: 'Timeless Type Notification <support@timelesstype.co>',
      to: ['timelesstypestudio@gmail.com'],
      subject: `[New Subscription] - ${plan.name} by ${user.full_name}`,
      react: AdminOrderNotificationEmail({
          customerName: user.full_name || 'N/A',
          customerEmail: user.email || 'N/A',
          orderId: order.id,
          orderDate: new Date(order.created_at).toLocaleDateString(),
          totalAmount: order.total_amount,
          products: [{ name: `${plan.name} (${billingCycle})`, license: 'Subscription', imageUrl: '' }],
      }),
      attachments: attachments,
    });
    
    await Promise.all([sendToUser, sendToAdmin]);

    return { success: true };

  } catch (error) {
    console.error('Error in sendSubscriptionConfirmationEmail:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { error: message };
  }
};