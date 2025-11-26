// src/components/emails/NewsletterEmail.tsx
import React from 'react';

interface NewsletterEmailProps {
  htmlContent: string; // Konten HTML dari editor
}

// --- Style CSS disalin dari OrderConfirmationEmail.tsx ---
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
  color: '#f47253', // Warna aksen Anda
  textAlign: 'center' as const,
  margin: '16px 0',
};

// Pastikan gaya teks ini sesuai dengan kebutuhan newsletter
const textStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  textAlign: 'left' as const, // Diubah ke left untuk konten utama
  marginBottom: '32px',
};

// Anda mungkin perlu menambahkan gaya lain dari OrderConfirmationEmail jika diperlukan
// seperti buttonStyle, sectionHeaderStyle, dll., jika Anda ingin elemen statis
// dalam template newsletter ini.

const footerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#6b7280',
  padding: '20px',
};
// --- Akhir Salinan Style ---

export const NewsletterEmail: React.FC<NewsletterEmailProps> = ({
  htmlContent,
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
                        src={`${siteUrl}/EMAIL1.png`} // Pastikan path banner ini benar
                        alt="Timeless Type Newsletter"
                        style={bannerStyle}
                      />
                    </td>
                  </tr>
                  {/* === KONTEN UTAMA === */}
                  <tr>
                    <td style={contentContainerStyle}>
                      {/* Konten dinamis dari editor akan dirender di sini */}
                      <div
                        style={textStyle}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                      />

                      {/* Contoh jika Anda ingin menambahkan tombol Call to Action statis: */}
                      {/*
                      <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <a href={`${siteUrl}/fonts`} style={{
                              display: 'inline-block',
                              backgroundColor: '#f47253',
                              color: '#ffffff',
                              padding: '14px 28px',
                              borderRadius: '9999px',
                              textDecoration: 'none',
                              fontWeight: '600',
                              fontSize: '16px',
                              textAlign: 'center' as const,
                         }}>
                          Explore Fonts
                        </a>
                      </div>
                      */}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* === FOOTER === */}
              <div style={footerStyle}>
                  {/* Idealnya, tambahkan link unsubscribe di sini */}
                  <p>Anda menerima email ini karena Anda berlangganan newsletter kami.</p>
                  © {new Date().getFullYear()} Timelesstype.co. All Rights Reserved.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  );
};

// Export default diperlukan jika Anda mengimpor tanpa {}
export default NewsletterEmail;