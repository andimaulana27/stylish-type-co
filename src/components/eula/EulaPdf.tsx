// src/components/eula/EulaPdf.tsx
// PERBAIKAN: Baris 'use client'; telah dihapus

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { type getEulaDataAction } from '@/app/actions/orderActions';

type ActionResponse = Awaited<ReturnType<typeof getEulaDataAction>>;
type EulaData = ActionResponse['data'];

interface EulaPdfProps {
  data: NonNullable<EulaData>;
}

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
});

const BORDER_COLOR = '#333333';
const VERTICAL_SPACING = 24;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 40,
    lineHeight: 1.4,
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
  },
  section: {
    paddingVertical: VERTICAL_SPACING,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  lastSection: {
    paddingVertical: VERTICAL_SPACING,
  },
  logo: {
    width: 300,
    height: 57,
    margin: '0 auto',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  introText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#D1D1D1',
    maxWidth: '85%',
    margin: '0 auto',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  detailRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  detailLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  detailValue: {
    width: '70%',
  },
  addressContainer: {
    flexDirection: 'column',
  },
  fontItemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  fontNameContainer: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  permittedUseContainer: {
    paddingTop: 12,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 2,
  }
});

export const EulaPdf = ({ data }: EulaPdfProps) => {
    if (!data) return null;
    
    const logoUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/logo-orange.png`;

    return (
        <Document title={`EULA - ${data.id.substring(0, 6).toUpperCase()}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    {/* PERBAIKAN: Hapus 'alt' dan tambahkan komentar ESLint */}
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image style={styles.logo} src={logoUrl} />
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.mainTitle}>End User License Agreement</Text>
                </View>

                <View style={{...styles.section, borderBottomWidth: 0}}>
                    <Text style={styles.introText}>
                        This End User License Agreement, including any supplemental terms (collectively, The “EULA”) is between you (an individual, company, or any other entity) and TimelessType.co and governs the usage of TimelessType.co’s product.
                    </Text>
                </View>
                
                <View style={styles.section}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>License Number</Text>
                        <Text style={styles.detailValue}>#{data.id.substring(0, 6).toUpperCase()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Enactment Date</Text>
                        <Text style={styles.detailValue}>{new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    </View>
                     <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Licensor</Text>
                        <View style={{...styles.detailValue, ...styles.addressContainer}}>
                            <Text>TimelessType.co</Text>
                            <Text>Jl. Yos Sudarso, Cirebon</Text>
                            <Text>Jawa Barat Indonesia 45111</Text>
                        </View>
                    </View>
                     <View style={styles.detailRowNoBorder}>
                        <Text style={styles.detailLabel}>Licensee</Text>
                        <View style={{...styles.detailValue, ...styles.addressContainer}}>
                           <Text>{data.profiles?.full_name}</Text>
                           {data.profiles?.street_address && <Text>{data.profiles.street_address}</Text>}
                           {data.profiles?.city && <Text>{data.profiles.city}</Text>}
                           {(data.profiles?.country || data.profiles?.postal_code) && (
                                <Text>
                                    {data.profiles.country}{data.profiles.country && data.profiles.postal_code ? ', ' : ''}{data.profiles.postal_code}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
                
                <View style={{...styles.lastSection, paddingTop: 12}}>
                    {data.eula_items && data.eula_items.map((item, index) => (
                        <View key={index} style={{...styles.fontItemContainer, borderBottomWidth: index === data.eula_items.length - 1 ? 0 : 1}} wrap={false}>
                            <View style={styles.fontNameContainer}>
                                <View style={styles.detailRowNoBorder}>
                                    <Text style={styles.detailLabel}>Product Name</Text>
                                    <Text style={styles.detailValue}>{item.productName} - {item.licenseName} License</Text>
                                </View>
                            </View>
                            <View style={styles.permittedUseContainer}>
                                <View style={styles.detailRowNoBorder}>
                                    <Text style={styles.detailLabel}>Permitted Use</Text>
                                    <View style={styles.detailValue}>
                                        {item.permittedUse.map((use, useIndex) => (
                                            <View key={useIndex} style={styles.listItem}>
                                                <Text style={styles.bulletPoint}>• </Text>
                                                <Text>{use}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};