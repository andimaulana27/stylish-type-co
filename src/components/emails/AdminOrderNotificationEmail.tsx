// src/components/emails/AdminOrderNotificationEmail.tsx
import React from 'react';

interface AdminOrderNotificationEmailProps {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  products: { 
    name: string; 
    license: string;
    imageUrl?: string; 
    slug?: string;
    type?: 'font' | 'bundle';
  }[];
  totalAmount: number;
}

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
  margin: '24px 0 16px 0',
};

const textStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  textAlign: 'center' as const,
};

const detailsContainerStyle: React.CSSProperties = {
  marginTop: '32px',
  paddingTop: '20px',
  borderTop: '1px solid #e5e7eb',
};

const detailsHeaderStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '16px',
};

const productRowStyle: React.CSSProperties = {
  padding: '16px 0',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
};

const productTitleLinkStyle: React.CSSProperties = {
    color: '#f47253',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
};

const productTitleStyle: React.CSSProperties = {
    color: '#f47253',
    fontWeight: 'bold',
    fontSize: '16px',
};

// --- PERBAIKAN DI SINI ---
// Menghapus 'borderTop' dari style ini untuk menghilangkan garis kedua.
const totalSectionStyle: React.CSSProperties = {
  marginTop: '24px',
  paddingTop: '16px',
  textAlign: 'right' as const,
};
// --- AKHIR PERBAIKAN ---

const totalTextStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#111827',
};

const brandColorStyle: React.CSSProperties = {
  color: '#f47253',
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

export const AdminOrderNotificationEmail: React.FC<AdminOrderNotificationEmailProps> = ({
  customerName,
  customerEmail,
  orderId,
  orderDate,
  products,
  totalAmount,
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
                        src={`${siteUrl}/EMAIL.jpg`}
                        alt="Notification Banner"
                        style={bannerStyle}
                      />
                    </td>
                  </tr>
                  {/* === KONTEN UTAMA === */}
                  <tr>
                    <td style={contentContainerStyle}>
                      <h1 style={headingStyle}>Great news: You just made a sale!</h1>
                      <p style={textStyle}>
                        An order has been placed on Stylish Type. Here are the details:
                      </p>

                      <div style={detailsContainerStyle}>
                        <h2 style={detailsHeaderStyle}>Customer & Order Information</h2>
                        <p style={{ color: '#374151', margin: '4px 0' }}><strong>Order ID:</strong> #{orderId.substring(0, 8).toUpperCase()}</p>
                        <p style={{ color: '#374151', margin: '4px 0' }}><strong>Customer:</strong> {customerName} ({customerEmail})</p>
                        <p style={{ color: '#374151', margin: '4px 0' }}><strong>Date:</strong> {orderDate}</p>
                      </div>

                      <div style={detailsContainerStyle}>
                        <h2 style={detailsHeaderStyle}>Products Purchased</h2>
                        <div>
                          {products.map((p, index) => (
                              <div key={index} style={productRowStyle}>
                                  {p.imageUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.imageUrl} alt={p.name} width="96" height="64" style={{ borderRadius: '2px', marginRight: '16px', objectFit: 'cover', aspectRatio: '3/2' }} />
                                  )}
                                  <div>
                                      {p.slug && p.type ? (
                                          <a href={`${siteUrl}/${p.type === 'font' ? 'product' : 'bundles'}/${p.slug}`} style={productTitleLinkStyle}>
                                            {p.name}
                                          </a>
                                      ) : (
                                          <strong style={productTitleStyle}>{p.name}</strong>
                                      )}
                                      <span style={{ fontSize: '12px', color: '#4b5563', display: 'block' }}>{p.license} License</span>
                                  </div>
                              </div>
                          ))}
                        </div>
                        
                        <div style={totalSectionStyle}>
                            <p style={totalTextStyle}>
                                Order Total: <span style={brandColorStyle}>${totalAmount.toFixed(2)}</span>
                            </p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <a href={`${siteUrl}/admin/orders`} style={buttonStyle}>
                          View All Orders
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* === FOOTER === */}
              <div style={footerStyle}>
                  This is an automated notification for Stylish Type administrators.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  );
};