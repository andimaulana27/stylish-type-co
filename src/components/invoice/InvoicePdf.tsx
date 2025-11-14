// src/components/invoice/InvoicePdf.tsx
// PERBAIKAN: Baris 'use client'; telah dihapus

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { type getInvoiceDataAction } from '@/app/actions/orderActions';

type ActionResponse = Awaited<ReturnType<typeof getInvoiceDataAction>>;
type InvoiceData = ActionResponse['data'];

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 40,
    lineHeight: 1.4,
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logo: {
    width: 180,
  },
  companyDetails: {
    textAlign: 'right',
    fontSize: 9,
    color: '#D1D1D1',
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20, 
    marginBottom: 20,
  },
  billTo: {
    width: '60%',
  },
  billToLabel: {
    fontSize: 8,
    color: '#AAAAAA',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  billToName: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  billToAddress: {
      fontSize: 9,
      color: '#D1D1D1',
      marginTop: 1,
  },
  dateContainer: {
    width: '30%',
    textAlign: 'right',
  },
  date: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderItem: { width: '70%', fontWeight: 'bold' },
  tableHeaderOther: { width: '15%', textAlign: 'right', fontWeight: 'bold' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  tableColItem: { width: '70%' },
  tableColOther: { width: '15%', textAlign: 'right' },
  itemMain: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  itemSecondary: {
    fontSize: 10,
    color: '#CCCCCC',
    marginTop: 2,
  },
  licenseDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingLeft: 10,
  },
  licenseColumn: {
    width: '50%',
  },
  licenseItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 8,
    fontSize: 8,
    color: '#CCCCCC',
  },
  licenseText: {
    fontSize: 8,
    color: '#CCCCCC',
  },
  summary: {
    marginTop: 20,
    width: '35%',
    marginLeft: 'auto',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    color: '#CCCCCC',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#444444',
    marginTop: 8,
    paddingTop: 8,
    fontWeight: 'bold',
    fontSize: 12,
  },
  brandColor: {
    color: '#CD9A51',
  }
});

export const InvoicePdf = ({ data }: { data: InvoiceData }) => {
    if (!data) return null;

    const profile = data.profiles;
    const items = data.order_items || [];
    const logoUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/logo-stylish.png`;

    const splitFeatures = (features: string[]) => {
      const mid = Math.ceil(features.length / 2);
      return { 
        firstCol: features.slice(0, mid),
        secondCol: features.slice(mid)
      };
    };

    const renderHeader = () => (
      <View style={styles.header} fixed>
          <View style={styles.logoContainer}>
              {/* PERBAIKAN: Hapus 'alt' dan tambahkan komentar ESLint */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image style={styles.logo} src={logoUrl} />
          </View>
          <View style={styles.companyDetails}>
              <Text style={{fontWeight: 'bold', color: '#FFFFFF'}}>TimelessType.co</Text>
              <Text>Jl. Yos Sudarso</Text>
              <Text>Cangkol Utara - Cirebon</Text>
              <Text>Jawa Barat Indonesia 45111</Text>
          </View>
      </View>
    );

    return (
        <Document title={`Invoice #${data.id.substring(0, 8).toUpperCase()}`}>
            <Page size="A4" style={styles.page}>
                {renderHeader()}
                
                <View>
                  <View style={styles.addressSection}>
                      <View style={styles.billTo}>
                          <Text style={styles.billToLabel}>INVOICE TO:</Text>
                          <Text style={styles.billToName}>{profile?.full_name}</Text>
                          <Text style={styles.billToAddress}>{profile?.street_address}</Text>
                          <Text style={styles.billToAddress}>{`${profile?.city || ''}, ${profile?.postal_code || ''}`.trim()}</Text>
                          <Text style={styles.billToAddress}>{profile?.country}</Text>
                          <Text style={styles.billToAddress}>{profile?.email}</Text>
                      </View>
                      <View style={styles.dateContainer}>
                          <Text style={styles.date}>{new Date(data.created_at).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                          })}</Text>
                      </View>
                  </View>

                  <Text style={styles.invoiceTitle}>INVOICE #{data.id.substring(0, 8).toUpperCase()}</Text>

                  <View style={styles.table}>
                      <View style={styles.tableHeader}>
                          <Text style={styles.tableHeaderItem}>Item</Text>
                          <Text style={styles.tableHeaderOther}>Quantity</Text>
                          <Text style={styles.tableHeaderOther}>Total</Text>
                      </View>
                      {items.map((item, index) => {
                        const licenseFeatures = (item.licenses && 'allowed' in item.licenses && Array.isArray(item.licenses.allowed))
                          ? item.licenses.allowed
                          : [];
                        const { firstCol, secondCol } = splitFeatures(licenseFeatures);

                        return (
                          <View key={index} style={styles.tableRow} wrap={false}>
                              <View style={styles.tableColItem}>
                                  <Text style={styles.itemMain}>{(item.fonts?.name || item.bundles?.name)}</Text>
                                  <Text style={styles.itemSecondary}>{item.licenses?.name} License</Text>
                                  {licenseFeatures.length > 0 && (
                                    <View style={styles.licenseDetailsContainer}>
                                      <View style={styles.licenseColumn}>
                                        {firstCol.map((feature, i) => (
                                          <View key={i} style={styles.licenseItem}>
                                            <Text style={styles.bulletPoint}>•</Text>
                                            <Text style={styles.licenseText}>{feature}</Text>
                                          </View>
                                        ))}
                                      </View>
                                      <View style={styles.licenseColumn}>
                                        {secondCol.map((feature, i) => (
                                          <View key={i} style={styles.licenseItem}>
                                            <Text style={styles.bulletPoint}>•</Text>
                                            <Text style={styles.licenseText}>{feature}</Text>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  )}
                              </View>
                              <Text style={styles.tableColOther}>1</Text>
                              <Text style={styles.tableColOther}>${item.price.toFixed(2)}</Text>
                          </View>
                        )
                      })}
                  </View>

                  <View style={styles.summary}>
                      <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Subtotal</Text>
                          <Text>${data.total_amount.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryTotal]}>
                          <Text>TOTAL</Text>
                          <Text style={styles.brandColor}>${data.total_amount.toFixed(2)}</Text>
                      </View>
                  </View>
                </View>

            </Page>
        </Document>
    );
};