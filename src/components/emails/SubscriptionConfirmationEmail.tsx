// src/components/emails/SubscriptionConfirmationEmail.tsx
import React from 'react';

interface SubscriptionConfirmationEmailProps {
  userName: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
}

// === GAYA CSS BARU UNTUK TEMA TERANG & MODERN ===

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  width: '100%',
  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const mainTableStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  maxWidth: '600px',
  margin: '20px auto',
  overflow: 'hidden',
};

const contentContainerStyle: React.CSSProperties = {
  padding: '32px',
};

const bannerStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const headingStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '600',
  color: '#f47253',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const textStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const detailsContainerStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  textAlign: 'center' as const,
};

const detailsHeaderStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '16px'
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f47253',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '9999px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#6b7280',
  padding: '20px',
};

export const SubscriptionConfirmationEmail: React.FC<SubscriptionConfirmationEmailProps> = ({
  userName,
  planName,
  billingCycle,
  nextBillingDate,
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <body style={bodyStyle}>
      <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
        <tbody>
          <tr>
            <td style={{ padding: '20px 0' }} align="center">
              <table style={mainTableStyle} width="600" cellPadding="0" cellSpacing="0" border={0}>
                <tbody>
                  {/* === BANNER === */}
                  <tr>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${siteUrl}/EMAIL1.png`}
                        alt="Welcome to your subscription"
                        style={bannerStyle}
                      />
                    </td>
                  </tr>
                  {/* === KONTEN UTAMA === */}
                  <tr>
                    <td style={contentContainerStyle}>
                      <h1 style={headingStyle}>Welcome Aboard!</h1>
                      <p style={textStyle}>
                        Hi {userName}, your subscription is now active! You have unlimited access to our entire font library. Start creating something timeless.
                      </p>

                      <div style={{ textAlign: 'center' }}>
                        <a href={`${siteUrl}/product`} style={buttonStyle}>
                          Explore The Font Library
                        </a>
                      </div>
                      
                      <div style={detailsContainerStyle}>
                        <h2 style={detailsHeaderStyle}>Your Subscription Details</h2>
                        <p style={{ color: '#374151', margin: 0 }}>
                          You are now subscribed to the <strong style={{ color: '#111827' }}>{planName}</strong> plan ({billingCycle}).
                        </p>
                        <p style={{ color: '#374151', marginTop: '8px' }}>
                          Your plan will automatically renew on <strong style={{ color: '#111827' }}>{nextBillingDate}</strong>.
                        </p>
                        <p style={{ color: '#374151', marginTop: '24px', fontSize: '14px' }}>
                          You can manage your subscription anytime from your account dashboard.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* === FOOTER === */}
              <div style={footerStyle}>
                  <p>Your Invoice and End User License Agreement (EULA) are attached for your records.</p>
                  © {new Date().getFullYear()} Stylishtype.co. All Rights Reserved.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  );
};