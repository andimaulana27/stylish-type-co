// src/components/emails/OrderConfirmationEmail.tsx
import React from 'react';

interface OrderConfirmationEmailProps {
  userName: string;
  orderId: string;
  orderDate: string;
  totalAmount: number;
  products: { 
    name: string; 
    license: string;
    downloadUrl?: string;
    quantity: number;
    price: number;
    imageUrl: string;
    slug: string;
    type: 'font' | 'bundle';
  }[];
}

// === GAYA CSS DIPERBARUI DENGAN STRUKTUR TABEL ===

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

const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '8px',
};

const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
};

const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'left' as const,
    padding: '8px',
    color: '#6b7280',
    fontSize: '12px',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e5e7eb',
};

const tableCellStyle: React.CSSProperties = {
    padding: '16px 8px',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'middle',
};

const downloadButtonStyle: React.CSSProperties = {
    backgroundColor: '#f47253',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '9999px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '12px',
    display: 'inline-block',
    textAlign: 'center' as const,
};

const noteStyle: React.CSSProperties = {
    marginTop: '24px',
    fontSize: '12px',
    color: '#4b5563',
    lineHeight: '1.5',
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
};

const accountLinkStyle: React.CSSProperties = {
    color: '#f47253',
    fontWeight: 'bold',
    textDecoration: 'none',
};

const summaryRowStyle: React.CSSProperties = {
    padding: '10px 8px',
    fontSize: '14px',
};

const productTitleLinkStyle: React.CSSProperties = {
    color: '#f47253',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
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

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  userName,
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
                        alt="Thank you for your purchase"
                        style={bannerStyle}
                      />
                    </td>
                  </tr>
                  {/* === KONTEN UTAMA === */}
                  <tr>
                    <td style={contentContainerStyle}>
                      <h1 style={headingStyle}>Thanks for shopping with us</h1>
                      <p style={textStyle}>
                        Hi {userName}, we&apos;ve finished processing your order. You can find your downloads and order details below.
                      </p>
                      
                      <h2 style={sectionHeaderStyle}>Downloads</h2>
                      <table style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={{...tableHeaderStyle, width: '65%'}}>Product</th>
                            <th style={{...tableHeaderStyle, width: '35%', textAlign: 'center'}}>Download</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p, index) => (
                            <tr key={index}>
                              <td style={tableCellStyle}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.imageUrl} alt={p.name} width="96" height="64" style={{ borderRadius: '2px', marginRight: '16px', objectFit: 'cover', aspectRatio: '3/2' }} />
                                    <div>
                                        <a href={`${siteUrl}/${p.type === 'font' ? 'fonts' : 'bundles'}/${p.slug}`} style={productTitleLinkStyle}>
                                            {p.name}
                                        </a>
                                        <span style={{ fontSize: '12px', color: '#4b5563', display: 'block' }}>{p.license} License</span>
                                    </div>
                                </div>
                              </td>
                              <td style={{...tableCellStyle, textAlign: 'center'}}>
                                <a href={p.downloadUrl} style={downloadButtonStyle}>
                                  Download
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div style={noteStyle}>
                        <strong>NOTE:</strong> The attached PDF files contain the Invoice and Official EULA Document. Your transaction history and permanent download links are always available on your{' '}
                        <a href={`${siteUrl}/account/my-fonts`} style={accountLinkStyle}>Customer Account Page</a>.
                      </div>

                      <div style={{marginTop: '40px'}}>
                        <h2 style={sectionHeaderStyle}>Order #{orderId.substring(0, 8).toUpperCase()} ({orderDate})</h2>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={{...tableHeaderStyle, width: '60%'}}>Product</th>
                                    <th style={{...tableHeaderStyle, width: '20%', textAlign: 'center'}}>Quantity</th>
                                    <th style={{...tableHeaderStyle, width: '20%', textAlign: 'right'}}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p, index) => (
                                    <tr key={index}>
                                        <td style={tableCellStyle}>{p.name} - {p.license}</td>
                                        <td style={{...tableCellStyle, textAlign: 'center'}}>{p.quantity}</td>
                                        <td style={{...tableCellStyle, textAlign: 'right'}}>${p.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2} style={{...summaryRowStyle, textAlign: 'right', fontWeight: 'bold'}}>Subtotal</td>
                                    <td style={{...summaryRowStyle, textAlign: 'right'}}>${totalAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} style={{...summaryRowStyle, textAlign: 'right', fontWeight: 'bold'}}>Payment method</td>
                                    <td style={{...summaryRowStyle, textAlign: 'right'}}>PayPal</td>
                                </tr>
                                <tr style={{fontWeight: 'bold', color: '#111827', fontSize: '16px'}}>
                                    <td colSpan={2} style={{padding: '12px 8px', textAlign: 'right', borderTop: '2px solid #e5e7eb'}}>Total</td>
                                    <td style={{padding: '12px 8px', textAlign: 'right', color: '#f47253', borderTop: '2px solid #e5e7eb'}}>${totalAmount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* === FOOTER === */}
              <div style={footerStyle}>
                  <p>Your Invoice and End User License Agreement (EULA) are attached for your records.</p>
                  © {new Date().getFullYear()} Timelesstype.co. All Rights Reserved.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  );
};